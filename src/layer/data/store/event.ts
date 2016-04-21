import {LocalSocketObjectMetaData, LocalSocketEvent, LocalSocketEventType} from 'localsocket';
import {Supervisor, Observable, Set, Map, Message, sqid, assign, clone, concat} from 'arch-stream';
import {listen, Config, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../infrastructure/indexeddb/api';
import {IdNumber, KeyString} from '../constraint/types';
import {EventType, EventValue, EventRecord} from '../schema/event';
import {noop} from '../../../lib/noop';

export {
  EventType,
  EventValue
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
    type: EventType,
    date: number
  ) {
    super(id, key, value, date, type);
    if (this.id > 0 === false) throw new TypeError(`LocalSocket: SavedEventRecord: Invalid event id: ${this.id}`);
    void Object.freeze(this);
  }
}

export type ESEventType = LocalSocketEventType;
export const ESEventType = {
  put: <'put'>'put',
  delete: <'delete'>'delete',
  snapshot: <'snapshot'>'snapshot',
  query: <'query'>'query'
}

export class ESEvent implements LocalSocketEvent {
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
    protected database: string,
    protected name: string
  ) {
    const lastNotifiedIdSet = new Set<KeyString, IdNumber>((o, n) => n > o ? n : o);
    const lastUpdatedDateSet = new Set<KeyString, number>((o, n) => n > o ? n : o);
    void this.cache.events.exec
      .monitor(<any>[], ([_, sub]) => {
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
          void this.events.load.emit([event.key, event.attr, event.type], new ESEvent(event.type, event.id, event.key, event.attr));
        }
        else {
          void lastNotifiedIdSet.add(event.key, event.id);
          void lastUpdatedDateSet.add(event.key, event.date);
        }
      });
  }
  protected cache = new class extends Supervisor<[KeyString] | [KeyString, string] | [KeyString, string, string], void, UnsavedEventRecord<T> | SavedEventRecord<T>> { }();
  public events = {
    load: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, ESEventType], ESEvent, void>(),
    save: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, ESEventType], ESEvent, void>(),
    loss: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, ESEventType], ESEvent, void>(),
    access: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, ESEventType], ESEvent, void>()
  };
  protected syncState = new Map<KeyString, boolean>();
  protected syncWaits = new Observable<[KeyString], DOMError, any>();
  public sync(keys: KeyString[], cb: (errs?: DOMError[]) => any = noop): void {
    return void keys
      .reduce<PromiseLike<DOMError[]>>((msg, key) => {
        switch (this.syncState.get(key)) {
          case true: {
            return msg.then(a => concat(a, [<DOMError>void 0]));
          }
          case false: {
            if (cb === noop) return msg.then(a => concat(a, [<DOMError>void 0]));
            const job = new Message<DOMError[]>();
            void this.syncWaits.once([key], err => void job.send([err]));
            return msg.then(a => job.then(b => concat(a, b)));
          }
          default: {
            void this.update(key);
            if (cb === noop) return msg.then(a => concat(a, [<DOMError>void 0]));
            const job = new Message<DOMError[]>();
            void this.syncWaits.once([key], err => void job.send([err]));
            return msg.then(a => job.then(b => concat(a, b)));
          }
        }
      }, new Message<DOMError[]>().send([], true))
      .then(cb);
  }
  public update(key: KeyString): void {
    const latest = this.meta(key);
    const savedEvents: SavedEventRecord<T>[] = [];
    void this.syncState.set(key, this.syncState.get(key) === true);
    return void this.cursor(key, STORE_FIELDS.key, IDBCursorDirection.prev, IDBTransaction.readonly, (cursor, err) => {
      if (err) return void this.syncWaits.emit([key], err);
      if (!cursor || (<SavedEventRecord<T>>cursor.value).id <= latest.id) {
        if (compose(savedEvents).reduce(e => e).type === EventType.delete) {
          void this.clean(Infinity, key);
        }
        else {
          // register latest events
          void savedEvents
            // remove overridable event
            .reduceRight<SavedEventRecord<T>[]>((acc, e) => acc.some(({attr}) => attr === e.attr) ? acc : concat([e], acc), [])
            .reduce<SavedEventRecord<T>[]>((acc, e) => {
              switch (e.type) {
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
        }
        void this.syncState.set(key, true);
        void this.syncWaits.emit([key], void 0);
        if (savedEvents.length > this.snapshotCycle) {
          void this.snapshot(key);
        }
        return;
      }
      const event: SavedEventRecord<T> = cursor.value;
      if (this.cache.refs([event.key, event.attr, sqid(event.id)]).length > 0) return;
      void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
      if (event.type !== EventType.put) return;
      void cursor.continue();
    });
  }
  public meta(key: KeyString): LocalSocketObjectMetaData {
    const events = this.cache.cast([key], void 0);
    return Object.freeze(
      clone(
        <LocalSocketObjectMetaData>{
          id: events.reduce((id, e) => e.id > id ? e.id : id, 0),
          date: 0
        },
        compose(events).reduce(e => e),
        <LocalSocketObjectMetaData>{
          key: <string>key
        }
      )
    );
  }
  public keys(): KeyString[] {
    return this.cache.cast(<any>[], void 0)
      .reduce((keys, e) => keys.length === 0 || keys[keys.length - 1] !== e.key ? concat(keys, [e.key]) : keys, <KeyString[]>[])
      .sort();
  }
  public has(key: KeyString): boolean {
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e).type !== EventType.delete;
  }
  public get(key: KeyString): T {
    void this.sync([key]);
    void this.events.access
      .emit([key], new ESEvent(ESEventType.query, IdNumber(0), key, ''));
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e)
      .value;
  }
  public add(event: UnsavedEventRecord<T>): void {
    void this.events.access
      .emit([event.key, event.attr, event.type], new ESEvent(event.type, IdNumber(0), event.key, event.attr));
    if (event instanceof UnsavedEventRecord === false) throw new Error(`LocalSocket: Cannot add a saved event: ${JSON.stringify(event)}`);
    void this.sync([event.key]);
    const id = sqid();
    void this.cache
      .register([event.key, event.attr, sqid(0), id], _ => event);
    // update max date
    void this.cache
      .cast([event.key, event.attr, sqid(0), id], void 0);
    return void listen(this.database)(db => {
      if (this.cache.refs([event.key, event.attr, sqid(0)]).length === 0) return;
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const req = tx
        .objectStore(this.name)
        .add(event);
      tx.oncomplete = _ => {
        assert(req.result > 0);
        const savedEvent = new SavedEventRecord(IdNumber(<number>req.result), event.key, event.value, event.type, event.date);
        void this.cache
          .terminate([savedEvent.key, savedEvent.attr, sqid(0), id]);
        void this.cache
          .register([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], _ => savedEvent);
        void this.events.save
          .emit([savedEvent.key, savedEvent.attr, savedEvent.type], new ESEvent(savedEvent.type, savedEvent.id, savedEvent.key, savedEvent.attr));
        // emit update event
        void this.cache
          .cast([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], void 0);
        if (this.cache.refs([event.key]).filter(([, sub]) => sub(void 0) instanceof SavedEventRecord).length > this.snapshotCycle) {
          void this.snapshot(event.key);
        }
        else if (savedEvent.type === EventType.delete) {
          void this.clean(Infinity, savedEvent.key);
        }
      };
      tx.onerror = tx.onabort = _ => {
        void setTimeout(() => {
          if (this.cache.refs([event.key, event.attr, sqid(0), id]).length === 0) return;
          void this.events.loss.emit([event.key, event.attr, event.type], new ESEvent(event.type, event.id, event.key, event.attr));
        }, 1e3);
      };
    });
  }
  public delete(key: KeyString): void {
    return void this.add(new UnsavedEventRecord(key, <T>new EventValue(), EventType.delete));
  }
  protected snapshotCycle = 10;
  //protected snapshotLimit = 1;
  protected snapshotJobState = new Map<KeyString, boolean>();
  protected snapshot(key: KeyString): void {
    if (this.snapshotJobState.get(key)) return;
    void this.snapshotJobState.set(key, true);
    return void listen(this.database)(db => {
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
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
        }
        if (!cursor || (<EventRecord<T>>cursor.value).type !== EventType.put) {
          assert(this.snapshotCycle > 0);
          if (savedEvents.length < this.snapshotCycle) return;
          void this.clean(Infinity, key);
          const composedEvent = compose(savedEvents).reduce(e => e);
          if (composedEvent instanceof SavedEventRecord) return;
          switch (composedEvent.type) {
            case EventType.snapshot: {
              // snapshot's date must not be after unsaved event's date.
              return void store.add(
                new UnsavedEventRecord(
                  composedEvent.key,
                  composedEvent.value,
                  composedEvent.type,
                  savedEvents.reduce((date, e) => e.date > date ? e.date : date, 0)
                )
              );
            }
            case EventType.delete: {
              return void 0;
            }
          }
          throw new TypeError(`LocalSocket: Invalid event type: ${composedEvent.type}`);
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
  protected clean(until: number = Infinity, key?: KeyString): void {
    const removedEvents: SavedEventRecord<T>[] = [];
    const cleanStateMap = new Map<KeyString, boolean>();
    return void this.cursor(
      key ? IDBKeyRange.bound([key, 0], [key, until]) : IDBKeyRange.upperBound(until),
      key ? STORE_FIELDS.surrogateKeyDateField : STORE_FIELDS.date,
      IDBCursorDirection.prev,
      IDBTransaction.readwrite,
      (cursor, err) => {
        if (!cursor) return void removedEvents.reduce((_, event) => void this.cache.terminate([event.key, event.attr, sqid(event.id)]), void 0);
        const event: SavedEventRecord<T> = cursor.value;
        switch (event.type) {
          case EventType.put: {
            void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
            break;
          }
          case EventType.snapshot: {
            if (!cleanStateMap.get(event.key)) {
              void cleanStateMap.set(event.key, true);
              void cursor.continue();
              return;
            }
            break;
          }
          case EventType.delete: {
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
    return void listen(this.database)(db => {
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
    .map(events => events.reduceRight(compose, new UnsavedEventRecord(KeyString(''), <T>new EventValue(), EventType.delete, 0)));

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
      case EventType.put: {
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
      case EventType.snapshot: {
        return source;
      }
      case EventType.delete: {
        return source;
      }
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${source.type}`);
  }
}
