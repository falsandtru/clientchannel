import { Observation, Cancellation, tick, sqid, concat } from 'spica';
import { listen, Config, IDBKeyRange } from '../../infrastructure/indexeddb/api';
import { EventId, makeEventId } from './identifier';
import { EventRecordType, UnstoredEventRecord, StoredEventRecord, LoadedEventRecord, SavedEventRecord, EventRecordValue, isValidPropertyName } from './event';
import { hasBinary } from '../database/value';
import { noop } from '../../../lib/noop';

namespace EventStoreSchema {
  export const id = 'id';
  export const key = 'key';
  //export const type = 'type';
  //export const attr = 'attr';
  //export const value = 'value';
  //export const date = 'date';
  //export const surrogateKeyDateField = 'key+date';
}

export abstract class EventStore<K extends string, V extends EventStore.Value> {
  public static configure(name: string): Config {
    return {
      make(tx) {
        const store = tx.db.objectStoreNames.contains(name)
          ? tx.objectStore(name)
          : tx.db.createObjectStore(name, {
            keyPath: EventStoreSchema.id,
            autoIncrement: true
          });
        if (!store.indexNames.contains(EventStoreSchema.id)) {
          void store.createIndex(EventStoreSchema.id, EventStoreSchema.id, { unique: true });
        }
        if (!store.indexNames.contains(EventStoreSchema.key)) {
          void store.createIndex(EventStoreSchema.key, EventStoreSchema.key);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(name)
            && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.id)
            && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.key);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    protected readonly database: string,
    protected readonly name: string,
    protected readonly attrs: string[]
  ) {
    assert(this.attrs.every(isValidPropertyName));
    const states = new class {
      ids = new Map<K, EventId>();
      dates = new Map<K, number>();
      update(event: EventStore.Event<K, V>): void {
        void this.ids.set(event.key, makeEventId(Math.max(event.id, this.ids.get(event.key) || 0)));
        assert(event.date >= 0);
        void this.dates.set(event.key, Math.max(event.date, this.dates.get(event.key) || 0));
      }
    }();

    // dispatch events
    void this.events_.memory
      .monitor([], event => {
        if (event.date <= states.dates.get(event.key)! && event.id <= states.ids.get(event.key)!) return;
        if (event instanceof LoadedEventRecord) {
          return void this.events.load
            .emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, event.id, event.key, event.attr, event.date));
        }
        if (event instanceof SavedEventRecord) {
          return void this.events.save
            .emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, event.id, event.key, event.attr, event.date));
        }
        return;
      });
    // update states
    void this.events_.memory
      .monitor([], event =>
        void states.update(new EventStore.Event<K, V>(event.type, event.id, event.key, event.attr, event.date)));
    void this.events.load
      .monitor([], event =>
        void states.update(event));
    void this.events.save
      .monitor([], event =>
        void states.update(event));
    // clean events
    void this.events.save
      .monitor([], event => {
        switch (event.type) {
          case EventStore.EventType.delete:
          case EventStore.EventType.snapshot:
            void this.clean(event.key);
        }
      });
  }
  private readonly memory = new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', string], void, UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>>();
  public readonly events = Object.freeze({
    load: new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.EventType], EventStore.Event<K, V>, void>(),
    save: new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.EventType], EventStore.Event<K, V>, void>(),
    loss: new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.EventType], EventStore.Event<K, V>, void>(),
  });
  public readonly events_ = Object.freeze({
    memory: new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', string], UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>, void>(),
    access: new Observation<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.InternalEventType], EventStore.InternalEvent<K>, void>()
  });
  private readonly syncState = new Map<K, boolean>();
  private readonly syncWaits = new Observation<[K], DOMException | DOMError | void, any>();
  public sync(keys: K[], cb: (errs: [K, DOMException | DOMError][]) => void = noop): void {
    type SyncErrorInfo = [K, DOMException | DOMError];
    return void Promise.all(keys
      .map<Promise<SyncErrorInfo | void>>(key => {
        switch (this.syncState.get(key)) {
          case true:
            return Promise.resolve();
          case false:
            return new Promise<SyncErrorInfo | void>(resolve => void (
              void this.syncWaits.once([key], err => void resolve(err ? [key, err] : void 0))));
          default:
            return new Promise<SyncErrorInfo | void>(resolve => void (
              void this.syncWaits.once([key], err => void resolve(err ? [key, err] : void 0)),
              void this.fetch(key, err => void this.syncWaits.emit([key], err))));
        }
      }))
      .then(rs =>
        void cb(<SyncErrorInfo[]>rs.filter(r => r)));
  }
  public fetch(key: K, cb: (err?: DOMException | DOMError) => void = noop, after: (tx: IDBTransaction, err?: DOMException | DOMError) => void = noop): void {
    void this.syncState.set(key, this.syncState.get(key) === true);
    const events: LoadedEventRecord<K, V>[] = [];
    return void listen(this.database)(db => {
      const tx = db
        .transaction(this.name, after ? 'readwrite' : 'readonly');
      const req = tx
        .objectStore(this.name)
        .index(EventStoreSchema.key)
        .openCursor(key, 'prev');
      const unbind = () => {
        req.onsuccess = tx.onerror = tx.onabort = <any>null;
      };
      const proc = (cursor: IDBCursorWithValue | null, err: DOMException | DOMError | null): void => {
        if (err) return (
          void cb(err),
          void unbind(),
          void after(tx, err));
        if (!cursor || new LoadedEventRecord<K, V>(cursor.value).date < this.meta(key).date) {
          // register latest events
          void this.syncState.set(key, true);
          void Array.from(
            events
              // remove overridable event
              .reduceRight<LoadedEventRecord<K, V>[]>((es, e) =>
                es.length === 0 || es[0].type === EventStore.EventType.put
                  ? concat(es, [e])
                  : es
              , [])
              .reduceRight<Map<string, LoadedEventRecord<K, V>>>((dict, e) =>
                dict.set(e.attr, e)
              , new Map())
              .values())
            .sort((a, b) => a.date - b.date || a.id - b.id)
            .forEach(e => {
              assert(this.memory.refs([e.key, e.attr, sqid(e.id)]).length === 0);
              assert(this.memory.refs([e.key, e.attr, sqid(e.id + 1)]).length === 0);
              void this.memory
                .off([e.key, e.attr, sqid(e.id)]);
              void this.memory
                .on([e.key, e.attr, sqid(e.id)], () => e);
              void this.events_.memory
                .emit([e.key, e.attr, sqid(e.id)], e);
            });
          try {
            void cb();
          }
          catch (reason) {
            void new Promise((_, reject) =>
              void reject(reason));
          }
          void unbind();
          void after(tx);
          void this.events_.access
            .emit([key], new EventStore.InternalEvent(EventStore.InternalEventType.query, makeEventId(0), key, ''));
          if (events.length >= this.snapshotCycle) {
            void this.snapshot(key);
          }
          return;
        }
        else {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          if (this.memory.refs([event.key, event.attr, sqid(event.id)]).length > 0) return void proc(null, err);
          try {
            void events.unshift(event);
          }
          catch (err) {
            void tx.objectStore(this.name).delete(cursor.primaryKey);
            void new Promise((_, reject) =>
              void reject(err));
          }
          if (event.type !== EventStore.EventType.put) return void proc(null, err);
          return void cursor.continue();
        }
      };
      req.onsuccess = () => void proc(req.result, req.error);
      tx.onerror = tx.onabort = () => void cb(tx.error);
    });
  }
  public keys(): K[] {
    return this.memory.reflect([])
      .reduce<K[]>((keys, e) =>
        keys.length === 0 || keys[keys.length - 1] !== e.key
          ? concat(keys, [e.key])
          : keys
      , [])
      .sort();
  }
  public observes(key: K): boolean {
    return this.syncState.has(key);
  }
  public has(key: K): boolean {
    return compose(key, this.attrs, this.memory.reflect([key])).type !== EventStore.EventType.delete;
  }
  public meta(key: K): MetaData<K> {
    const events = this.memory.reflect([key]);
    return Object.freeze({
      key: key,
      id: events.reduce((id, e) => (
        e.id > id ? e.id : id
      ), 0),
      date: events.reduce((date, e) => (
        e.date > date ? e.date : date
      ), 0),
    });
  }
  public get(key: K): Partial<V> {
    if (!this.observes(key)) {
      void this.fetch(key);
    }
    void this.events_.access
      .emit([key], new EventStore.InternalEvent(EventStore.InternalEventType.query, makeEventId(0), key, ''));
    return Object.assign(Object.create(null), compose(key, this.attrs, this.memory.reflect([key])).value);
  }
  public add(event: UnstoredEventRecord<K, V>, tx?: IDBTransaction): void {
    assert(event instanceof UnstoredEventRecord);
    assert(event.type === EventStore.EventType.snapshot ? tx : true);
    assert(!tx || tx.db.name === this.database && tx.mode === 'readwrite')
    void this.events_.access
      .emit([event.key, event.attr, event.type], new EventStore.InternalEvent(event.type, makeEventId(0), event.key, event.attr));
    if (!this.observes(event.key)) {
      void this.fetch(event.key);
    }
    switch (event.type) {
      case EventStore.EventType.put: {
        void this.memory
          .off([event.key, event.attr, sqid(0)]);
        void this.events_.memory
          .off([event.key, event.attr, sqid(0)]);
        break;
      }
      case EventStore.EventType.delete:
      case EventStore.EventType.snapshot: {
        void this.memory
          .refs([event.key])
          .filter(({ namespace: [, , id] }) => id === sqid(0))
          .forEach(({ namespace: [key, attr, id] }) => (
            void this.memory
              .off([<K>key, <keyof V>attr, id]),
            void this.events_.memory
              .off([<K>key, <keyof V>attr, id])));
        break;
      }
    }
    const clean = this.memory
      .on([event.key, event.attr, sqid(0), sqid()], () => event);
    void this.events_.memory
      .emit([event.key, event.attr, sqid(0)], event);
    return void new Promise<void>((resolve, reject): void => {
      const cont = (tx: IDBTransaction): void => {
        const active = (): boolean =>
          this.memory.refs([event.key, event.attr, sqid(0)])
            .some(({ listener }) => listener(void 0, [event.key, event.attr, sqid(0)]) === event);
        if (!active()) return void resolve();
        const req = tx
          .objectStore(this.name)
          .add(adjust(event));
        const success = () => {
          assert(req.result > 0);
          void clean();
          const savedEvent = new SavedEventRecord(makeEventId(<number>req.result), event.key, event.value, event.type, event.date);
          void this.memory
            .off([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)]);
          void this.memory
            .on([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], () => savedEvent);
          void this.events_.memory
            .emit([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], savedEvent);
          void resolve();
          const events: StoredEventRecord<K, V>[] = this.memory.refs([savedEvent.key])
            .map(({ listener }) =>
              <UnstoredEventRecord<K, V> | StoredEventRecord<K, V>>listener(void 0, [savedEvent.key]))
            .reduce<StoredEventRecord<K, V>[]>((es, e) =>
              e instanceof StoredEventRecord
                ? concat(es, [e])
                : es
            , []);
          if (events.length >= this.snapshotCycle || hasBinary(<object>event.value)) {
            void this.snapshot(savedEvent.key);
          }
        };
        const fail = () => (
          active()
            ? void reject()
            : void resolve(),
          void clean());
        tx.addEventListener('complete', success);
        tx.addEventListener('error', fail);
        tx.addEventListener('abort', fail);
      };
      if (tx) return void cont(tx);
      const cancellation = new Cancellation();
      void cancellation.register(reject);
      void cancellation.register(clean);
      void tick(() => (
        void setTimeout(cancellation.cancel, 1000),
        void listen(this.database)(db => (
          void cancellation.close(),
          void cancellation.maybe(db)
            .fmap(db => void cont(db.transaction(this.name, 'readwrite')))
            .extract(() => void 0)))));
    })
      .catch(() =>
        void this.events.loss.emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, makeEventId(0), event.key, event.attr, event.date)));
  }
  public delete(key: K): void {
    return void this.add(new UnstoredEventRecord<K, V>(key, new EventStore.Value(), EventStore.EventType.delete));
  }
  private readonly snapshotCycle: number = 9;
  private snapshot(key: K): void {
    return void listen(this.database)(db => {
      if (!this.observes(key)) return;
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);
      const req = store
        .index(EventStoreSchema.key)
        .openCursor(key, 'prev');
      const events: StoredEventRecord<K, V>[] = [];
      req.onsuccess = (): void => {
        const cursor: IDBCursorWithValue | null = req.result;
        if (cursor) {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          try {
            void events.unshift(event);
          }
          catch (err) {
            void cursor.delete();
            void new Promise((_, reject) =>
              void reject(err));
          }
        }
        if (!cursor) {
          if (events.length === 0) return;
          const composedEvent = compose(key, this.attrs, events);
          if (composedEvent instanceof StoredEventRecord) return;
          switch (composedEvent.type) {
            case EventStore.EventType.snapshot:
              // snapshot's date must not be later than unsaved event's date.
              return void this.add(
                new UnstoredEventRecord(
                  composedEvent.key,
                  composedEvent.value,
                  composedEvent.type,
                  events.reduce((date, e) => e.date > date ? e.date : date, 0)),
                tx);
            case EventStore.EventType.delete:
              return;
          }
          throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${composedEvent.type}`);
        }
        else {
          return void cursor.continue();
        }
      };
    });
  }
  private clean(key: K): void {
    const events: StoredEventRecord<K, V>[] = [];
    const cleanState = new Map<K, boolean>();
    return void this.cursor(
      IDBKeyRange.bound(key, key),
      EventStoreSchema.key,
      'prev',
      'readwrite',
      cursor => {
        if (!cursor) {
          return void events
            .reduce<void>((_, event) => (
              void this.memory
                .off([event.key, event.attr, sqid(event.id)]),
              void this.events_.memory
                .off([event.key, event.attr, sqid(event.id)]))
            , void 0);
        }
        else {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          switch (event.type) {
            case EventStore.EventType.put: {
              void cleanState.set(event.key, cleanState.get(event.key) || false);
              break;
            }
            case EventStore.EventType.snapshot: {
              if (!cleanState.get(event.key)) {
                void cleanState.set(event.key, true);
                void cursor.continue();
                return;
              }
              break;
            }
            case EventStore.EventType.delete: {
              void cleanState.set(event.key, true);
              break;
            }
          }
          if (cleanState.get(event.key)) {
            void cursor.delete();
            void events.unshift(event);
          }
          return void cursor.continue();
        }
      });
  }
  public cursor(query: any, index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, cb: (cursor: IDBCursorWithValue | null, error: DOMException | DOMError | null) => void): void {
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
      req.onsuccess = () => req.result && void cb(req.result, req.error);
      tx.oncomplete = () => void cb(null, tx.error);
      tx.onerror = tx.onabort = () => void cb(null, tx.error);
    });
  }
}
export namespace EventStore {
  export class Event<K extends string, V extends Value> {
    private EVENT: K;
    constructor(
      public readonly type: EventType,
      public readonly id: EventId,
      public readonly key: K,
      public readonly attr: keyof V | '',
      public readonly date: number
    ) {
      this.EVENT;
      void Object.freeze(this);
    }
  }
  export import EventType = EventRecordType;
  export class Record<K extends string, V extends Value> extends UnstoredEventRecord<K, V> { }
  export class Value extends EventRecordValue {
  }
  export class InternalEvent<K extends string> {
    constructor(
      public readonly type: InternalEventType,
      public readonly id: EventId,
      public readonly key: K,
      public readonly attr: string
    ) {
      void Object.freeze(this);
    }
  }
  export const InternalEventType = {
    ...EventRecordType,
    query: <'query'>'query'
  };
  export type InternalEventType = EventType | typeof InternalEventType.query;
}

interface MetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}

export function adjust(event: UnstoredEventRecord<any, any>): {} {
  const ret = { ...event };
  delete (<{ id: EventId; }>ret).id;
  return ret;
}

// input order must be asc
export function compose<K extends string, V extends EventStore.Value>(
  key: K,
  attrs: string[],
  events: Array<UnstoredEventRecord<K, V> | StoredEventRecord<K, V>>,
): UnstoredEventRecord<K, V> | StoredEventRecord<K, V> {
  assert(attrs.every(isValidPropertyName));
  assert(events.every(event => event.key === key));
  assert(events.every(event => event instanceof UnstoredEventRecord || event instanceof StoredEventRecord));
  type E = UnstoredEventRecord<K, V> | StoredEventRecord<K, V>;
  return group(events)
    .map(events =>
      events
        .reduceRight(compose, new UnstoredEventRecord<K, V>(key, new EventStore.Value(), EventStore.EventType.delete, 0)))
    .reduce(e => e);

  function group(events: E[]): E[][] {
    return events
      .map<[E, number]>((e, i) => [e, i])
      .sort(([a, ai], [b, bi]) => indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id - a.id || bi - ai)
      .reduceRight<E[][]>(([head, ...tail], [event]) => {
        const prev = head[0];
        if (!prev) return [[event]];
        assert(prev.key === event.key);
        return prev.key === event.key
          ? concat([concat([event], head)], tail)
          : concat([[event]], concat([head], tail));
      }, [[]]);
  }
  function compose(target: E, source: E): E {
    switch (source.type) {
      case EventStore.EventType.put:
        return new UnstoredEventRecord<K, V>(
          source.key,
          new EventStore.Value(target.value, {
            [source.attr]: source.value[source.attr]
          }),
          EventStore.EventType.snapshot);
      case EventStore.EventType.snapshot:
        return source;
      case EventStore.EventType.delete:
        return source;
    }
    throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${source}`);
  }
}
