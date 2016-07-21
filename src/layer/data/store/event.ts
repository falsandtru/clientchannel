import { Supervisor, Observable, sqid, clone, concat } from 'spica';
import { listen, Config, IDBTransaction, IDBCursorDirection, IDBKeyRange } from '../../infrastructure/indexeddb/api';
import { IdNumber } from '../constraint/types';
import { EventRecordFields, UnsavedEventRecord, SavedEventRecord } from '../schema/event';
import * as Schema from '../schema/event';
import { noop } from '../../../lib/noop';

export abstract class EventStore<K extends string, V extends EventStore.Value> {
  public static readonly fields = Object.freeze(EventRecordFields);
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
    protected readonly database: string,
    protected readonly name: string
  ) {
    const lastNotifiedIdSet = new Map<K, IdNumber>();
    const lastUpdatedDateSet = new Map<K, number>();
    void this.cache.events.exec
      .monitor([], ([, sub]): void => {
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
          void this.events.load.emit([event.key, event.attr, event.type], new EventStore.Event(event.type, event.id || IdNumber(0), event.key, event.attr));
        }
      });
    void this.cache.events.exec
      .monitor([], ([, sub]) => {
        const event = sub(void 0);
        if (!lastNotifiedIdSet.has(event.key) || lastNotifiedIdSet.get(event.key) < event.id) {
          void lastNotifiedIdSet.set(event.key, event.id);
        }
        if (!lastUpdatedDateSet.has(event.key) || lastUpdatedDateSet.get(event.key) < event.date) {
          void lastUpdatedDateSet.set(event.key, event.date);
        }
      });
  }
  protected readonly cache = new class extends Supervisor<never[] | [K] | [K, string] | [K, string, string], void, UnsavedEventRecord<K, V> | SavedEventRecord<K, V>> { }();
  public readonly events = {
    load: new Observable<never[] | [K] | [K, string] | [K, string, EventStore.EventType], EventStore.Event<K>, void>(),
    save: new Observable<never[] | [K] | [K, string] | [K, string, EventStore.EventType], EventStore.Event<K>, void>(),
    loss: new Observable<never[] | [K] | [K, string] | [K, string, EventStore.EventType], EventStore.Event<K>, void>(),
  };
  public readonly events_ = {
    access: new Observable<never[] | [K] | [K, string] | [K, string, InternalEventType], InternalEvent<K>, void>()
  };
  protected readonly syncState = new Map<K, boolean>();
  protected readonly syncWaits = new Observable<[K], DOMError | null, any>();
  public sync(keys: K[], cb: (errs: [K, DOMError | Error | null][]) => any = noop, timeout = 0): void {
    return void keys
      .map<Promise<[K, DOMError | Error | null]>>(key => {
        switch (this.syncState.get(key)) {
          case true:
            return new Promise<[K, DOMError | Error | null]>(resolve => void resolve([key, null]));
          case false:
            return cb === noop
              ? new Promise<[K, DOMError | Error | null]>(resolve => void resolve([key, null]))
              : new Promise<[K, DOMError | Error | null]>(resolve => void (
                timeout > 0 ? void (void this.get(key), void setTimeout(() => resolve([key, new Error()]))) : void 0,
                void this.syncWaits.once([key], err => void resolve([key, err]))));
          default: {
            void this.update(key);
            return cb === noop
              ? new Promise<[K, DOMError | Error | null]>(resolve => void resolve([key, null]))
              : new Promise<[K, DOMError | Error | null]>(resolve => void (
                timeout > 0 ? void (void this.get(key), void setTimeout(() => resolve([key, new Error()]))) : void 0,
                void this.syncWaits.once([key], err => void resolve([key, err]))));
          }
        }
      })
      .reduce<Promise<[K, DOMError | Error | null][]>>((ps, p) => ps.then(es => p.then(e => es.concat([e]))), new Promise<[K, DOMError][]>(resolve => void resolve([])))
      .then(es => void cb(es.filter(e => !!e[1])));
  }
  public update(key: K): void {
    const latest = this.meta(key);
    const savedEvents: SavedEventRecord<K, V>[] = [];
    void this.syncState.set(key, this.syncState.get(key) === true);
    return void this.cursor(key, EventRecordFields.key, IDBCursorDirection.prev, IDBTransaction.readonly, (cursor, err): void => {
      if (err) return void this.syncWaits.emit([key], err);
      if (!cursor || (<SavedEventRecord<K, V>>cursor.value).id <= latest.id) {
        if (compose(savedEvents).reduce(e => e).type === EventStore.EventType.delete) {
          void this.clean(Infinity, key);
        }
        else {
          // register latest events
          void savedEvents
            // remove overridable event
            .reduceRight<SavedEventRecord<K, V>[]>((acc, e) => acc.some(({attr}) => attr === e.attr) ? acc : concat([e], acc), [])
            .reduce<SavedEventRecord<K, V>[]>((acc, e) => {
              switch (e.type) {
                case EventStore.EventType.put:
                  return concat([e], acc);
                default:
                  return [e];
              }
            }, [])
            .reduce<void>((_, e) => {
              void this.cache
                .terminate([e.key, e.attr, sqid(e.id)]);
              void this.cache
                .register([e.key, e.attr, sqid(e.id)], () => e);
            }, void 0);
          void this.cache.cast([key], void 0);
        }
        void this.syncState.set(key, true);
        void this.syncWaits.emit([key], null);
        if (savedEvents.length > this.snapshotCycle) {
          void this.snapshot(key);
        }
        return;
      }
      const event: SavedEventRecord<K, V> = cursor.value;
      if (this.cache.refs([event.key, event.attr, sqid(event.id)]).length > 0) return;
      void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
      if (event.type !== EventStore.EventType.put) return;
      void cursor.continue();
    });
  }
  public meta(key: K): MetaData<K> {
    const events = this.cache.cast([key], void 0);
    return Object.freeze(
      clone(
        <MetaData<K>>{
          id: events.reduce<number>((id, e) => e.id > id ? e.id! : id, 0),
          date: 0
        },
        <MetaData<K>>compose(events)
          .reduce(e => {
            assert(e.id > 0 || 'id' in e === false);
            return e;
          }),
        <MetaData<K>>{
          key: <string>key
        }
      )
    );
  }
  public keys(): K[] {
    return this.cache.cast([], void 0)
      .reduce((keys, e) => keys.length === 0 || keys[keys.length - 1] !== e.key ? concat(keys, [e.key]) : keys, <K[]>[])
      .sort();
  }
  public has(key: K): boolean {
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e).type !== EventStore.EventType.delete;
  }
  public get(key: K): V {
    void this.sync([key]);
    void this.events_.access
      .emit([key], new InternalEvent(InternalEventType.query, IdNumber(0), key, ''));
    return compose(this.cache.cast([key], void 0))
      .reduce(e => e)
      .value;
  }
  public add(event: UnsavedEventRecord<K, V>): void {
    void this.events_.access
      .emit([event.key, event.attr, event.type], new InternalEvent(event.type, IdNumber(0), event.key, event.attr));
    if (event instanceof UnsavedEventRecord === false) throw new Error(`LocalSocket: Cannot add a saved event: ${JSON.stringify(event)}`);
    void this.sync([event.key]);
    const id = sqid();
    void this.cache
      .register([event.key, event.attr, sqid(0), id], () => event);
    // update max date
    void this.cache
      .cast([event.key, event.attr, sqid(0), id], void 0);
    return void listen(this.database)(db => {
      if (this.cache.refs([event.key, event.attr, sqid(0)]).length === 0) return;
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const req = tx
        .objectStore(this.name)
        .add(Object.assign({}, event));
      tx.oncomplete = () => {
        assert(req.result > 0);
        const savedEvent = new SavedEventRecord(IdNumber(<number>req.result), event.key, event.value, event.type, event.date);
        void this.cache
          .terminate([savedEvent.key, savedEvent.attr, sqid(0), id]);
        void this.cache
          .register([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], () => savedEvent);
        void this.events.save
          .emit([savedEvent.key, savedEvent.attr, savedEvent.type], new EventStore.Event(savedEvent.type, savedEvent.id, savedEvent.key, savedEvent.attr));
        // emit update event
        void this.cache
          .cast([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], void 0);
        if (this.cache.refs([savedEvent.key]).filter(([, sub]) => sub(void 0) instanceof SavedEventRecord).length > this.snapshotCycle) {
          void this.snapshot(savedEvent.key);
        }
        else if (savedEvent.type === EventStore.EventType.delete) {
          void this.clean(Infinity, savedEvent.key);
        }
      };
      tx.onerror = tx.onabort = () =>
        void setTimeout(() => {
          if (this.cache.refs([event.key, event.attr, sqid(0), id]).length === 0) return;
          void this.events.loss.emit([event.key, event.attr, event.type], new EventStore.Event(event.type, IdNumber(0), event.key, event.attr));
        }, 1e3);
    });
  }
  public delete(key: K): void {
    return void this.add(new UnsavedEventRecord(key, <V>new EventStore.Value(), EventStore.EventType.delete));
  }
  protected readonly snapshotCycle = 10;
  //protected readonly snapshotLimit = 1;
  protected readonly snapshotJobState = new Map<K, boolean>();
  protected snapshot(key: K): void {
    if (this.snapshotJobState.get(key)) return;
    void this.snapshotJobState.set(key, true);
    return void listen(this.database)(db => {
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const store = tx.objectStore(this.name);
      const req = store
        .index(EventRecordFields.key)
        .openCursor(key, IDBCursorDirection.prev);
      const savedEvents: SavedEventRecord<K, V>[] = [];
      req.onsuccess = (): void => {
        const cursor: IDBCursorWithValue = req.result;
        if (cursor) {
          const event: SavedEventRecord<K, V> = cursor.value;
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
        }
        if (!cursor || (<SavedEventRecord<K, V>>cursor.value).type !== EventStore.EventType.put) {
          assert(this.snapshotCycle > 0);
          if (savedEvents.length < this.snapshotCycle) return;
          void this.clean(Infinity, key);
          const composedEvent = compose(savedEvents).reduce(e => e);
          if (composedEvent instanceof SavedEventRecord) return;
          switch (composedEvent.type) {
            case EventStore.EventType.snapshot:
              // snapshot's date must not be after unsaved event's date.
              return void store.add(
                new UnsavedEventRecord(
                  composedEvent.key,
                  composedEvent.value,
                  composedEvent.type,
                  savedEvents.reduce((date, e) => e.date > date ? e.date : date, 0)));
            case EventStore.EventType.delete:
              return void 0;
          }
          throw new TypeError(`LocalSocket: Invalid event type: ${composedEvent.type}`);
        }
        void cursor.continue();
      };
      tx.oncomplete = () => (
        void this.snapshotJobState.set(key, false),
        void this.update(key));
      tx.onerror = tx.onabort = () =>
        void this.snapshotJobState.set(key, false);
    });
  }
  protected clean(until: number = Infinity, key?: K): void {
    const removedEvents: SavedEventRecord<K, V>[] = [];
    const cleanStateMap = new Map<K, boolean>();
    return void this.cursor(
      key ? IDBKeyRange.bound([key, 0], [key, until]) : IDBKeyRange.upperBound(until),
      key ? EventRecordFields.surrogateKeyDateField : EventRecordFields.date,
      IDBCursorDirection.prev,
      IDBTransaction.readwrite,
      (cursor): void => {
        if (!cursor) return void removedEvents.reduce<void>((_, event) => void this.cache.terminate([event.key, event.attr, sqid(event.id)]), void 0);
        const event: SavedEventRecord<K, V> = cursor.value;
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
        }
        if (cleanStateMap.get(event.key)) {
          void cursor.delete();
          void removedEvents.unshift(event);
        }
        void cursor.continue();
      });
  }
  public cursor(query: any, index: string, direction: IDBCursorDirection, mode: IDBTransaction, cb: (cursor: IDBCursorWithValue | null, error: DOMError) => any): void {
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
      req.onsuccess = () => req.result && cb(req.result, req.error);
      tx.oncomplete = () => void cb(null, tx.error);;
      tx.onerror = tx.onabort = () => void cb(null, tx.error);
    });
  }
}
export namespace EventStore {
  export type EventType = Schema.EventType;
  export const EventType = Schema.EventType;
  export class Event<K extends string> {
    constructor(
      public readonly type: EventType,
      public readonly id: IdNumber,
      public readonly key: K,
      public readonly attr: string
    ) {
      void Object.freeze(this);
    }
  }
  export class Record<K extends string, V extends Value> extends UnsavedEventRecord<K, V> { }
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
class InternalEvent<K extends string> {
  constructor(
    public readonly type: InternalEventType,
    public readonly id: IdNumber,
    public readonly key: K,
    public readonly attr: string
  ) {
    void Object.freeze(this);
  }
}

interface MetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}

// input order must be asc
export function compose<K extends string, V extends EventStore.Value>(events: (UnsavedEventRecord<K, V> | SavedEventRecord<K, V>)[]): (UnsavedEventRecord<K, V> | SavedEventRecord<K, V>)[] {
  type E = UnsavedEventRecord<K, V> | SavedEventRecord<K, V>;
  return group(events)
    .map(events => events.reduceRight(compose, new UnsavedEventRecord(<K>'', <V>new EventStore.Value(), EventStore.EventType.delete, 0)));

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
      case EventStore.EventType.put:
        return source.value[source.attr] !== void 0
          ? new UnsavedEventRecord(source.key, Object.assign(new EventStore.Value(), target.value, source.value), EventStore.EventType.snapshot)
          : new UnsavedEventRecord(
            source.key,
            Object.keys(target.value)
              .reduce((value, prop) => {
                if (prop === source.attr) return value;
                value[prop] = target[prop];
                return value;
              }, <V>new EventStore.Value())
            , EventStore.EventType.snapshot);
      case EventStore.EventType.snapshot:
        return source;
      case EventStore.EventType.delete:
        return source;
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${source}`);
  }
}
