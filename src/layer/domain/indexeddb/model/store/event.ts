import {LocalSocketObjectMetaData} from 'localsocket';
import {Supervisor, Observable, Set, Map, sqid, concat} from 'arch-stream';
import {open, Config, Access, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../../../infrastructure/indexeddb/api';
import {IdNumber, KeyString, IDBValue, EventValue as IEventValue} from '../types';
import {assign} from '../../../lib/assign';
import {noop} from '../../../../../lib/noop';

export enum EventType {
  put,
  delete,
  snapshot
}

export class EventValue {
}

abstract class EventRecord<T extends EventValue> {
  constructor(
    id: IdNumber,
    key: KeyString,
    value: T,
    date: number,
    type: EventType
  ) {
    if (typeof this.id === 'number' && this.id > 0 === false || this.id !== void 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event id: ${this.id}`);
    this.type = EventType[type];
    if (typeof this.type !== 'string' || EventType[this.type] === void 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event type: ${this.type}`);
    this.key = key;
    if (typeof this.key !== 'string') throw new TypeError(`LocalSocket: EventRecord: Invalid event key: ${this.key}`);
    this.value = value;
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`LocalSocket: EventRecord: Invalid event value: ${this.value}`);
    this.date = date;
    if (typeof this.date !== 'number' || this.date >= 0 === false) throw new TypeError(`LocalSocket: EventRecord: Invalid event date: ${this.date}`);
    // put -> string, delete or snapshot -> empty string
    this.attr = this.type === EventType[EventType.put]
      ? Object.keys(value).reduce((r, p) => p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r, '')
      : '';
    if (typeof this.attr !== 'string') throw new TypeError(`LocalSocket: EventRecord: Invalid event attr: ${this.key}`);
    if (this.type === EventType[EventType.put] && this.attr.length === 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
    if (this.type !== EventType[EventType.put] && this.attr.length !== 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);

    switch (type) {
      case EventType.put: {
        this.value = value = <T>assign(new EventValue(), <EventValue>{ [this.attr]: value[this.attr] });
        return;
      }
      case EventType.snapshot: {
        this.value = value = <T>assign(new EventValue(), value);
        return;
      }
      case EventType.delete:
      default: {
        this.value = value = <T>new EventValue();
        return;
      }
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${type}`);
  }
  public id: IdNumber;
  public type: string;
  public key: KeyString;
  public attr: string;
  public value: T;
  public date: number;
}
export class UnsavedEventRecord<T extends EventValue> extends EventRecord<T> {
  private EVENT_RECORD: T;
  constructor(
    key: KeyString,
    value: T,
    type: EventType = EventType.put,
    date: number = Date.now()
  ) {
    super(void 0, key, value, date, type);
    // must not have id property
    if (this.id !== void 0 || 'id' in this) throw new TypeError(`LocalSocket: UnsavedEventRecord: Invalid event id: ${this.id}`);
    //void Object.freeze(this);
  }
}
export class SavedEventRecord<T extends EventValue> extends EventRecord<T> {
  private EVENT_RECORD: T;
  constructor(
    public id: IdNumber,
    key: KeyString,
    value: T,
    date: number,
    type: EventType
  ) {
    super(id, key, value, date, type);
    if (this.id > 0 === false) throw new TypeError(`LocalSocket: SavedEventRecord: Invalid event id: ${this.id}`);
    void Object.freeze(this);
  }
}

export enum ESEventType {
  put,
  delete,
  snapshot,
  get
}

export class ESEvent {
  constructor(
    public type: ESEventType,
    public id: IdNumber,
    public key: KeyString,
    public attr: string
  ) {
    void Object.freeze(this);
  }
}

const STORE_FIELDS = {
  id: 'id',
  key: 'key',
  type: 'type',
  attr: 'attr',
  value: 'value',
  date: 'date',
  surrogateKeyDateField: 'key+date'
};

export abstract class AbstractEventStore<T extends EventValue> {
  public static configure(name: string): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(name)
          ? db.transaction(name).objectStore(name)
          : db.createObjectStore(name, {
            keyPath: STORE_FIELDS.id,
            autoIncrement: true
          });
        if (!store.indexNames.contains(STORE_FIELDS.id)) {
          void store.createIndex(STORE_FIELDS.id, STORE_FIELDS.id, { unique: true });
        }
        if (!store.indexNames.contains(STORE_FIELDS.key)) {
          void store.createIndex(STORE_FIELDS.key, STORE_FIELDS.key);
        }
        if (!store.indexNames.contains(STORE_FIELDS.type)) {
          void store.createIndex(STORE_FIELDS.type, STORE_FIELDS.type);
        }
        if (!store.indexNames.contains(STORE_FIELDS.attr)) {
          void store.createIndex(STORE_FIELDS.attr, STORE_FIELDS.attr);
        }
        if (!store.indexNames.contains(STORE_FIELDS.value)) {
          void store.createIndex(STORE_FIELDS.value, STORE_FIELDS.value);
        }
        if (!store.indexNames.contains(STORE_FIELDS.date)) {
          void store.createIndex(STORE_FIELDS.date, STORE_FIELDS.date);
        }
        if (!store.indexNames.contains(STORE_FIELDS.surrogateKeyDateField)) {
          void store.createIndex(STORE_FIELDS.surrogateKeyDateField, [STORE_FIELDS.key, STORE_FIELDS.date]);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(name)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.id)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.key)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.type)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.attr)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.value)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.date)
            && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.surrogateKeyDateField);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    protected access: Access,
    public name: string
  ) {
    const lastNotifiedIdSet = new Set<KeyString, IdNumber>((o, n) => n > o ? n : o);
    const lastUpdatedDateSet = new Set<KeyString, number>((o, n) => n > o ? n : o);
    void this.cache.events.exec
      .monitor([], ([_, sub]) => {
        const event = sub(void 0);
        assert(event instanceof UnsavedEventRecord || event instanceof SavedEventRecord);
        if (event instanceof SavedEventRecord === false) return void lastUpdatedDateSet.add(event.key, event.date);
        const isNewMaxId = (): boolean =>
          !lastNotifiedIdSet.has(event.key)
          || event.id > lastNotifiedIdSet.get(event.key);
        const isNewMaxDate = (): boolean =>
          !lastUpdatedDateSet.has(event.key)
          || event.date > lastUpdatedDateSet.get(event.key)
          // must not overwrite unsaved new event by saved old event
          && event.date > this.cache.cast([event.key], void 0).filter(e => e !== event).reduce((date, e) => e.date > date ? e.date : date, 0);
        if (isNewMaxId() && isNewMaxDate()) {
          void lastNotifiedIdSet.add(event.key, event.id);
          void lastUpdatedDateSet.add(event.key, event.date);
          void this.events.load.emit([event.key, event.attr, event.type], new ESEvent(ESEventType[event.type], event.id, event.key, event.attr));
        }
        else {
          void lastNotifiedIdSet.add(event.key, event.id);
          void lastUpdatedDateSet.add(event.key, event.date);
        }
      });
  }
  protected cache = new Supervisor<string, void, UnsavedEventRecord<T> | SavedEventRecord<T>>();
  public events = {
    sync: new Observable<string, ESEvent, void>(),
    load: new Observable<string, ESEvent, void>(),
    save: new Observable<string, ESEvent, void>(),
    loss: new Observable<string, ESEvent, void>(),
    access: new Observable<string, ESEvent, void>()
  };
  private syncedKeyMap = new Map<KeyString, boolean>();
  protected sync(key: KeyString): void {
    // sync only when first loading or after request faild
    return this.syncedKeyMap.has(key)
      ? void this.syncedKeyMap.get(key)
      : void this.syncedKeyMap.set(key, !!void this.update(key));
  }
  public update(key: KeyString): void {
    const head = this.head(key);
    const savedEvents: SavedEventRecord<T>[] = [];
    void this.cursor(key, STORE_FIELDS.key, IDBCursorDirection.prev, IDBTransaction.readonly, (cursor, err) => {
      if (err) {
        if (this.syncedKeyMap.get(key) === false) {
          void this.syncedKeyMap.delete(key);
        }
        return;
      }
      if (!cursor || (<SavedEventRecord<T>>cursor.value).id <= head) {
        // register latest events
        void savedEvents
          // remove overridable event
          .reduceRight<SavedEventRecord<T>[]>((acc, e) => acc.some(({attr}) => attr === e.attr) ? acc : concat([e], acc), [])
          .reduce<SavedEventRecord<T>[]>((acc, e) => {
            switch (EventType[e.type]) {
              case EventType.put: {
                return concat([e], acc);
              }
              default: {
                return [e];
              }
            }
          }, [])
          .reduce((_, e) => {
            void this.cache
              .terminate([e.key, e.attr, sqid(e.id)]);
            void this.cache
              .register([e.key, e.attr, sqid(e.id)], _ => e);
          }, void 0);
        void this.cache.cast([key], void 0);
        if (this.syncedKeyMap.get(key) !== true) {
          void this.syncedKeyMap.set(key, true);
          void this.events.sync.emit([key], new ESEvent(ESEventType.snapshot, this.head(key), key, ''));
        }
        if (savedEvents.length > this.snapshotCycle) {
          void this.snapshot(key);
        }
        return;
      }
      const event: SavedEventRecord<T> = cursor.value;
      if (this.cache.refs([event.key, event.attr, sqid(event.id)]).length > 0) return;
      void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.date, EventType[event.type]));
      if (event.type !== EventType[EventType.put]) return;
      void cursor.continue();
    });
  }
  protected heads(cb: (heads: SavedEventRecord<T>[], err: DOMError) => any): void {
    const heads: SavedEventRecord<T>[] = [];
    void this.cursor(null, STORE_FIELDS.key, IDBCursorDirection.prevunique, IDBTransaction.readonly, (cursor, err) => {
      if (!cursor) return void cb(heads, err);
      const event: SavedEventRecord<T> = cursor.value;
      void heads.push(new SavedEventRecord(event.id, event.key, event.value, event.date, EventType[event.type]));
      void cursor.continue();
    });
  }
  public head(key: KeyString): IdNumber {
    return this.cache.cast([key], void 0)
      .reduce((id, e) => e.id > id ? e.id : id, IdNumber(0));
  }
  public meta(key: KeyString): LocalSocketObjectMetaData {
    return Object.freeze(
      assign(
        <LocalSocketObjectMetaData>{
          id: 0
        },
        this.cache.cast([key], void 0)
          .reduce((m, e) =>
            e.date > m.date ? assign(m, e) : m
          , assign({}, new UnsavedEventRecord(key, <T>new EventValue(), EventType.delete, 0))
        )
      )
    );
  }
  // in cache
  public has(key: KeyString): boolean {
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e).type !== EventType[EventType.delete];
  }
  public get(key: KeyString): T {
    void this.sync(key);
    void this.events.access
      .emit([key], new ESEvent(ESEventType.get, IdNumber(0), key, ''));
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e)
      .value;
  }
  public add(event: UnsavedEventRecord<T>): this {
    void this.events.access
      .emit([event.key, event.attr, event.type], new ESEvent(ESEventType[event.type], IdNumber(0), event.key, event.attr));
    if (event instanceof UnsavedEventRecord === false) throw new Error(`LocalSocket: Cannot add a saved event: ${JSON.stringify(event)}`);
    void this.sync(event.key);
    const id = sqid();
    void this.cache
      .register([event.key, event.attr, sqid(0), id], _ => event);
    // update max date
    void this.cache
      .cast([event.key, event.attr, sqid(0), id], void 0);
    void this.access(db => {
      if (this.cache.refs([event.key, event.attr, sqid(0)]).length === 0) return;
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const req = tx
        .objectStore(this.name)
        .add(event);
      tx.oncomplete = _ => {
        assert(req.result > 0);
        const savedEvent = new SavedEventRecord(IdNumber(<number>req.result), event.key, event.value, event.date, EventType[event.type]);
        void this.cache
          .terminate([savedEvent.key, savedEvent.attr, sqid(0), id]);
        void this.cache
          .register([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], _ => savedEvent);
        void this.events.save
          .emit([savedEvent.key, savedEvent.attr, savedEvent.type], new ESEvent(ESEventType[savedEvent.type], savedEvent.id, savedEvent.key, savedEvent.attr));
        // emit update event
        void this.cache
          .cast([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], void 0);
        if (this.cache.refs([event.key]).filter(([, sub]) => sub(void 0) instanceof SavedEventRecord).length > this.snapshotCycle) {
          void this.snapshot(event.key);
        }
      };
      tx.onerror = tx.onabort = _ => {
        void setTimeout(() => {
          if (this.cache.refs([event.key, event.attr, sqid(0), id]).length === 0) return;
          void this.events.loss.emit([event.key, event.attr, event.type], new ESEvent(ESEventType[event.type], event.id, event.key, event.attr));
        }, 1e3);
      };
    });
    return this;
  }
  public delete(key: KeyString): this {
    void setTimeout((): void => void this.clean(Infinity, key), 10);
    return this.add(new UnsavedEventRecord(key, <T>new EventValue(), EventType.delete));
  }
  protected snapshotCycle = 10;
  //protected snapshotLimit = 1;
  protected snapshotJobState = new Map<KeyString, boolean>();
  protected snapshot(key: KeyString): void {
    if (this.snapshotJobState.get(key)) return;
    void this.snapshotJobState.set(key, true);
    void this.access(db => {
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const store = tx.objectStore(this.name);
      const req = store
        .index(STORE_FIELDS.key)
        .openCursor(<any>key, IDBCursorDirection.prev);
      const savedEvents: SavedEventRecord<T>[] = [];
      req.onsuccess = _ => {
        const cursor: IDBCursorWithValue = req.result;
        if (cursor) {
          const event: SavedEventRecord<T> = cursor.value;
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.date, EventType[event.type]));
        }
        if (!cursor || EventType[(<EventRecord<T>>cursor.value).type] !== EventType.put) {
          if (savedEvents.length < this.snapshotCycle) return;
          const event = compose(savedEvents).reduce(e => e);
          void this.clean(Infinity, key);
          if (event instanceof SavedEventRecord) return;
          switch (event.type) {
            case EventType[EventType.snapshot]: {
              // snapshot's date must not be after unsaved event's date.
              return void store.add(new UnsavedEventRecord(event.key, event.value, EventType[event.type], savedEvents.reduce((date, e) => e.date > date ? e.date : date, 0)));
            }
            case EventType[EventType.delete]: {
              return void 0;
            }
          }
          throw new TypeError(`LocalSocket: Invalid event type: ${event.type}`);
        }
        void cursor.continue();
      };
      tx.oncomplete = _ => {
        void this.snapshotJobState.set(key, false);
        void this.update(key);
      };
      tx.onerror = tx.onabort = _ => {
        void this.snapshotJobState.set(key, false);
      };
    });
  }
  public keys(cb: (keys: KeyString[], err: DOMError) => any): void {
    void this.heads((heads, err) => void cb(heads.map(({key}) => key), err));
  }
  public clean(until: number = Infinity, key?: KeyString): void {
    const removedEvents: SavedEventRecord<T>[] = [];
    const cleanStateMap = new Map<KeyString, boolean>();
    void this.cursor(
      key ? IDBKeyRange.bound([key, 0], [key, until]) : IDBKeyRange.upperBound(until),
      key ? STORE_FIELDS.surrogateKeyDateField : STORE_FIELDS.date,
      IDBCursorDirection.prev,
      IDBTransaction.readwrite,
      (cursor, err) => {
        if (!cursor) return void removedEvents.reduce((_, event) => void this.cache.terminate([event.key, event.attr, sqid(event.id)]), void 0);
        const event: SavedEventRecord<T> = cursor.value;
        switch (event.type) {
          case EventType[EventType.put]: {
            void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
            break;
          }
          case EventType[EventType.snapshot]: {
            if (!cleanStateMap.get(event.key)) {
              void cleanStateMap.set(event.key, true);
              void cursor.continue();
              return;
            }
            break;
          }
          case EventType[EventType.delete]: {
            void cleanStateMap.set(event.key, true);
            break;
          }
          default: {
            void cleanStateMap.set(event.key, true);
            break;
          }
        }
        if (cleanStateMap.get(event.key)) {
          void cursor.delete();
          void removedEvents.unshift(event);
        }
        void cursor.continue();
      }
    );
  }
  public cursor(query: any, index: string, direction: string, mode: string, cb: (cursor: IDBCursorWithValue, error: DOMError) => any): void {
    void this.access(db => {
      const tx = db
        .transaction(this.name, mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      req.onsuccess = _ => req.result && cb(req.result, req.error);
      tx.oncomplete = _ => void cb(null, tx.error);;
      tx.onerror = tx.onabort = _ => void cb(null, tx.error);
    });
  }
}

// input order must be asc
export function compose<T extends EventValue>(events: (UnsavedEventRecord<T> | SavedEventRecord<T>)[]): (UnsavedEventRecord<T> | SavedEventRecord<T>)[] {
  type E = UnsavedEventRecord<T> | SavedEventRecord<T>;
  return group(events)
    .map(events => events.reduceRight(compose, new UnsavedEventRecord(KeyString(''), <T>new EventValue(), EventType.delete)));

  function group(events: E[]): E[][] {
    return events
      .map<[E, number]>((e, i) => [e, i])
      .sort(([a, ai], [b, bi]) => indexedDB.cmp(a.key, b.key) || b.date - a.date || bi - ai)
      .reduceRight<E[][]>(([head, ...tail], [event]) => {
        assert(event instanceof UnsavedEventRecord || event instanceof SavedEventRecord);
        const prev = head[0];
        if (!prev) return [[event]];
        return prev.key === event.key
          ? concat([concat([event], head)], tail)
          : concat([[event]], concat([head], tail));
      }, [[]]);
  }
  function compose(target: E, source: E): E {
    assert(target instanceof UnsavedEventRecord || target instanceof SavedEventRecord);
    assert(source instanceof UnsavedEventRecord || source instanceof SavedEventRecord);
    switch (source.type) {
      case EventType[EventType.put]: {
        return source.value[source.attr] !== void 0
          ? new UnsavedEventRecord(source.key, assign(new EventValue(), target.value, source.value), EventType.snapshot)
          : new UnsavedEventRecord(
            source.key,
            Object.keys(target.value)
              .reduce((value, prop) => {
                if (prop === source.attr) return value;
                value[prop] = target[prop];
                return value;
              }, <T>new EventValue())
            , EventType.snapshot
          );
      }
      case EventType[EventType.snapshot]: {
        return source;
      }
      case EventType[EventType.delete]: {
        return source;
      }
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${source.type}`);
  }
}