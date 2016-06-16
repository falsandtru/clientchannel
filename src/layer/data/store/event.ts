import {Supervisor, Observable, sqid, assign, clone, concat} from 'spica';
import {listen, Config, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../infrastructure/indexeddb/api';
import {IdNumber, KeyString} from '../constraint/types';
import {EventRecordFields, UnsavedEventRecord, SavedEventRecord} from '../schema/event';
import * as Schema from '../schema/event';
import {noop} from '../../../lib/noop';

export abstract class EventStore<T extends EventStore.Value> {
  public static fields = Object.freeze(EventRecordFields);
  public static configure(name: string): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(name)
          ? db.transaction(name).objectStore(name)
          : db.createObjectStore(name, {
            keyPath: EventRecordFields.id,
            autoIncrement: true
          });
        if (!store.indexNames.contains(EventRecordFields.id)) {
          void store.createIndex(EventRecordFields.id, EventRecordFields.id, { unique: true });
        }
        if (!store.indexNames.contains(EventRecordFields.key)) {
          void store.createIndex(EventRecordFields.key, EventRecordFields.key);
        }
        if (!store.indexNames.contains(EventRecordFields.type)) {
          void store.createIndex(EventRecordFields.type, EventRecordFields.type);
        }
        if (!store.indexNames.contains(EventRecordFields.attr)) {
          void store.createIndex(EventRecordFields.attr, EventRecordFields.attr);
        }
        if (!store.indexNames.contains(EventRecordFields.value)) {
          void store.createIndex(EventRecordFields.value, EventRecordFields.value);
        }
        if (!store.indexNames.contains(EventRecordFields.date)) {
          void store.createIndex(EventRecordFields.date, EventRecordFields.date);
        }
        if (!store.indexNames.contains(EventRecordFields.surrogateKeyDateField)) {
          void store.createIndex(EventRecordFields.surrogateKeyDateField, [EventRecordFields.key, EventRecordFields.date]);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(name)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.id)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.key)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.type)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.attr)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.value)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.date)
            && db.transaction(name).objectStore(name).indexNames.contains(EventRecordFields.surrogateKeyDateField);
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
    const lastNotifiedIdSet = new Map<KeyString, IdNumber>();
    const lastUpdatedDateSet = new Map<KeyString, number>();
    void this.cache.events.exec
      .monitor(<any>[], ([, sub]) => {
        const event = sub(void 0);
        assert(event instanceof UnsavedEventRecord || event instanceof SavedEventRecord);
        if (event instanceof SavedEventRecord === false) return void 0;
        const isNewMaxId = (): boolean =>
          !lastNotifiedIdSet.has(event.key)
          || event.id > lastNotifiedIdSet.get(event.key);
        const isNewMaxDate = (): boolean =>
          !lastUpdatedDateSet.has(event.key)
          || event.date > lastUpdatedDateSet.get(event.key)
          // must not overwrite unsaved new event by saved old event
          && event.date > this.cache.cast([event.key], void 0).filter(e => e !== event).reduce((date, e) => e.date > date ? e.date : date, 0);
        if (isNewMaxId() && isNewMaxDate()) {
          void lastNotifiedIdSet.set(event.key, event.id);
          void lastUpdatedDateSet.set(event.key, event.date);
          void this.events.load.emit([event.key, event.attr, event.type], new EventStore.Event(event.type, event.id, event.key, event.attr));
        }
      });
    void this.cache.events.exec
      .monitor(<any>[], ([, sub]) => {
        const event = sub(void 0);
        if (!lastNotifiedIdSet.has(event.key) || lastNotifiedIdSet.get(event.key) < event.id) {
          void lastNotifiedIdSet.set(event.key, event.id);
        }
        if (!lastUpdatedDateSet.has(event.key) || lastUpdatedDateSet.get(event.key) < event.date) {
          void lastUpdatedDateSet.set(event.key, event.date);
        }
      });
  }
  protected cache = new class extends Supervisor<[KeyString] | [KeyString, string] | [KeyString, string, string], void, UnsavedEventRecord<T> | SavedEventRecord<T>> { }();
  public events = {
    load: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, EventStore.EventType], EventStore.Event, void>(),
    save: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, EventStore.EventType], EventStore.Event, void>(),
    loss: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, EventStore.EventType], EventStore.Event, void>(),
  };
  public events_ = {
    access: new Observable<[KeyString] | [KeyString, string] | [KeyString, string, InternalEventType], InternalEvent, void>()
  };
  protected syncState = new Map<KeyString, boolean>();
  protected syncWaits = new Observable<[KeyString], DOMError, any>();
  public sync(keys: KeyString[], cb: (errs: [KeyString, DOMError | Error][]) => any = noop, timeout = 0): void {
    return void keys
      .map<Promise<[KeyString, DOMError | Error]>>(key => {
        switch (this.syncState.get(key)) {
          case true: {
            return new Promise<[KeyString, DOMError | Error]>(resolve => void resolve([key, null]));
          }
          case false: {
            return cb === noop
              ? new Promise<[KeyString, DOMError | Error]>(resolve => void resolve([key, null]))
              : new Promise<[KeyString, DOMError | Error]>(resolve => void (
                timeout > 0 ? void (void this.get(key), void setTimeout(() => resolve([key, new Error()]))) : void 0,
                void this.syncWaits.once([key], err => void resolve([key, err]))));
          }
          default: {
            void this.update(key);
            return cb === noop
              ? new Promise<[KeyString, DOMError | Error]>(resolve => void resolve([key, null]))
              : new Promise<[KeyString, DOMError | Error]>(resolve => void (
                timeout > 0 ? void (void this.get(key), void setTimeout(() => resolve([key, new Error()]))) : void 0,
                void this.syncWaits.once([key], err => void resolve([key, err]))));
          }
        }
      })
      .reduce<Promise<[KeyString, DOMError | Error][]>>((ps, p) => ps.then(es => p.then(e => es.concat([e]))), new Promise<[KeyString, DOMError][]>(resolve => void resolve([])))
      .then(es => void cb(es.filter(e => !!e[1])));
  }
  public update(key: KeyString): void {
    const latest = this.meta(key);
    const savedEvents: SavedEventRecord<T>[] = [];
    void this.syncState.set(key, this.syncState.get(key) === true);
    return void this.cursor(key, EventRecordFields.key, IDBCursorDirection.prev, IDBTransaction.readonly, (cursor, err) => {
      if (err) return void this.syncWaits.emit([key], err);
      if (!cursor || (<SavedEventRecord<T>>cursor.value).id <= latest.id) {
        if (compose(savedEvents).reduce(e => e).type === EventStore.EventType.delete) {
          void this.clean(Infinity, key);
        }
        else {
          // register latest events
          void savedEvents
            // remove overridable event
            .reduceRight<SavedEventRecord<T>[]>((acc, e) => acc.some(({attr}) => attr === e.attr) ? acc : concat([e], acc), [])
            .reduce<SavedEventRecord<T>[]>((acc, e) => {
              switch (e.type) {
                case EventStore.EventType.put: {
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
      if (event.type !== EventStore.EventType.put) return;
      void cursor.continue();
    });
  }
  public meta(key: KeyString): MetaData {
    const events = this.cache.cast([key], void 0);
    return Object.freeze(
      clone(
        <MetaData>{
          id: events.reduce((id, e) => e.id > id ? e.id : id, 0),
          date: 0
        },
        compose(events).reduce(e => e),
        <MetaData>{
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
      .reduce(e => e).type !== EventStore.EventType.delete;
  }
  public get(key: KeyString): T {
    void this.sync([key]);
    void this.events_.access
      .emit([key], new InternalEvent(InternalEventType.query, IdNumber(0), key, ''));
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e)
      .value;
  }
  public add(event: UnsavedEventRecord<T>): void {
    void this.events_.access
      .emit([event.key, event.attr, event.type], new InternalEvent(event.type, IdNumber(0), event.key, event.attr));
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
          .emit([savedEvent.key, savedEvent.attr, savedEvent.type], new EventStore.Event(savedEvent.type, savedEvent.id, savedEvent.key, savedEvent.attr));
        // emit update event
        void this.cache
          .cast([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], void 0);
        if (this.cache.refs([event.key]).filter(([, sub]) => sub(void 0) instanceof SavedEventRecord).length > this.snapshotCycle) {
          void this.snapshot(event.key);
        }
        else if (savedEvent.type === EventStore.EventType.delete) {
          void this.clean(Infinity, savedEvent.key);
        }
      };
      tx.onerror = tx.onabort = _ => {
        void setTimeout(() => {
          if (this.cache.refs([event.key, event.attr, sqid(0), id]).length === 0) return;
          void this.events.loss.emit([event.key, event.attr, event.type], new EventStore.Event(event.type, event.id, event.key, event.attr));
        }, 1e3);
      };
    });
  }
  public delete(key: KeyString): void {
    return void this.add(new UnsavedEventRecord(key, <T>new EventStore.Value(), EventStore.EventType.delete));
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
        .index(EventRecordFields.key)
        .openCursor(<any>key, IDBCursorDirection.prev);
      const savedEvents: SavedEventRecord<T>[] = [];
      req.onsuccess = _ => {
        const cursor: IDBCursorWithValue = req.result;
        if (cursor) {
          const event: SavedEventRecord<T> = cursor.value;
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
        }
        if (!cursor || (<SavedEventRecord<T>>cursor.value).type !== EventStore.EventType.put) {
          assert(this.snapshotCycle > 0);
          if (savedEvents.length < this.snapshotCycle) return;
          void this.clean(Infinity, key);
          const composedEvent = compose(savedEvents).reduce(e => e);
          if (composedEvent instanceof SavedEventRecord) return;
          switch (composedEvent.type) {
            case EventStore.EventType.snapshot: {
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
            case EventStore.EventType.delete: {
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
      key ? EventRecordFields.surrogateKeyDateField : EventRecordFields.date,
      IDBCursorDirection.prev,
      IDBTransaction.readwrite,
      (cursor, err) => {
        if (!cursor) return void removedEvents.reduce((_, event) => void this.cache.terminate([event.key, event.attr, sqid(event.id)]), void 0);
        const event: SavedEventRecord<T> = cursor.value;
        switch (event.type) {
          case EventStore.EventType.put: {
            void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
            break;
          }
          case EventStore.EventType.snapshot: {
            if (!cleanStateMap.get(event.key)) {
              void cleanStateMap.set(event.key, true);
              void cursor.continue();
              return;
            }
            break;
          }
          case EventStore.EventType.delete: {
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
  public cursor(query: any, index: string, direction: IDBCursorDirection, mode: IDBTransaction, cb: (cursor: IDBCursorWithValue, error: DOMError) => any): void {
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
export namespace EventStore {
  export type EventType = Schema.EventType;
  export const EventType = Schema.EventType;
  export class Event {
    constructor(
      public type: EventType,
      public id: IdNumber,
      public key: KeyString,
      public attr: string
    ) {
      void Object.freeze(this);
    }
  }
  export class Record<T extends Value> extends UnsavedEventRecord<T> { }
  export class Value extends Schema.EventValue {
  }
}
export {
  UnsavedEventRecord,
  SavedEventRecord
}

type InternalEventType = EventStore.EventType | 'query';
const InternalEventType = {
  put: <'put'>'put',
  delete: <'delete'>'delete',
  snapshot: <'snapshot'>'snapshot',
  query: <'query'>'query'
};
class InternalEvent {
  constructor(
    public type: InternalEventType,
    public id: IdNumber,
    public key: KeyString,
    public attr: string
  ) {
    void Object.freeze(this);
  }
}

interface MetaData {
  id: number;
  key: string;
  date: number;
}

// input order must be asc
export function compose<T extends EventStore.Value>(events: (UnsavedEventRecord<T> | SavedEventRecord<T>)[]): (UnsavedEventRecord<T> | SavedEventRecord<T>)[] {
  type E = UnsavedEventRecord<T> | SavedEventRecord<T>;
  return group(events)
    .map(events => events.reduceRight(compose, new UnsavedEventRecord(KeyString(''), <T>new EventStore.Value(), EventStore.EventType.delete, 0)));

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
      case EventStore.EventType.put: {
        return source.value[source.attr] !== void 0
          ? new UnsavedEventRecord(source.key, assign(new EventStore.Value(), target.value, source.value), EventStore.EventType.snapshot)
          : new UnsavedEventRecord(
            source.key,
            Object.keys(target.value)
              .reduce((value, prop) => {
                if (prop === source.attr) return value;
                value[prop] = target[prop];
                return value;
              }, <T>new EventStore.Value())
            , EventStore.EventType.snapshot
          );
      }
      case EventStore.EventType.snapshot: {
        return source;
      }
      case EventStore.EventType.delete: {
        return source;
      }
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${source.type}`);
  }
}
