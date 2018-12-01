import { StoreChannelObject } from '../../../../';
import { DiffStruct } from 'spica/type';
import { Observation } from 'spica/observation';
import { Cancellation } from 'spica/cancellation';
import { tick } from 'spica/clock';
import { sqid } from 'spica/sqid';
import { concat } from 'spica/concat';
import { causeAsyncException } from 'spica/exception';
import { Listen, Config, IDBKeyRange } from '../../infrastructure/indexeddb/api';
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
    protected readonly name: string,
    protected readonly attrs: string[],
    private readonly listen: Listen,
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
  private readonly memory = new Observation<[] | [K] | [K, keyof V | ''] | [K, keyof V | '', string] | [K, keyof V | '', string, string], void, UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>>();
  public readonly events = Object.freeze({
    load: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, EventStore.EventType], EventStore.Event<K, V>, void>(),
    save: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, EventStore.EventType], EventStore.Event<K, V>, void>(),
    loss: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, EventStore.EventType], EventStore.Event<K, V>, void>(),
    clean: new Observation<[K], boolean, void>(),
  });
  private readonly events_ = Object.freeze({
    memory: new Observation<[K] | [K, keyof V | ''] | [K, keyof V | '', string], UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>, void>({ limit: Infinity }),
  });
  private tx_: {
    rw?: IDBTransaction;
    rwc: number;
  } = {
    rwc: 0,
  };
  private get txrw(): IDBTransaction | undefined {
    if (++this.tx_.rwc > 25) {
      this.tx_.rwc = 0;
      this.tx_.rw = void 0;
      return;
    }
    return this.tx_.rw;
  }
  private set txrw(tx: IDBTransaction | undefined) {
    if (!tx) return;
    assert(tx.mode === 'readwrite');
    if (this.tx_.rw && this.tx_.rw === tx) return;
    this.tx_.rwc = 0;
    this.tx_.rw = tx;
    void tick(() => this.tx_.rw = void 0);
  }
  public fetch(key: K, cb: (error: DOMException | DOMError | Error | null) => void = noop, cancellation = new Cancellation()): void {
    const events: LoadedEventRecord<K, V>[] = [];
    return void this.listen(db => {
      if (cancellation.canceled) return void cb(new Error('Cancelled.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = tx
        .objectStore(this.name)
        .index(EventStoreSchema.key)
        .openCursor(key, 'prev');
      const proc = (cursor: IDBCursorWithValue | null, error: DOMException | DOMError | Error | null): void => {
        if (error) return;
        if (!cursor || new LoadedEventRecord<K, V>(cursor.value).date < this.meta(key).date) {
          // register latest events
          void [
            ...events
              // remove overridable event
              .reduceRight<LoadedEventRecord<K, V>[]>((es, e) =>
                es.length === 0 || es[0].type === EventStore.EventType.put
                  ? concat(es, [e])
                  : es
              , [])
              .reduceRight<Map<string, LoadedEventRecord<K, V>>>((dict, e) =>
                dict.set(e.attr, e)
              , new Map())
              .values()
          ]
            .sort((a, b) => a.date - b.date || a.id - b.id)
            .forEach(e => (
              void this.memory
                .off([e.key, e.attr, sqid(e.id)]),
              void this.memory
                .on([e.key, e.attr, sqid(e.id)], () => e),
              void this.events_.memory
                .emit([e.key, e.attr, sqid(e.id)], e)));
          try {
            void cb(req.error);
          }
          catch (reason) {
            void causeAsyncException(reason);
          }
          if (events.length >= this.snapshotCycle) {
            void this.snapshot(key);
          }
          return;
        }
        else {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          if (this.memory.refs([event.key, event.attr, sqid(event.id)]).length > 0) return void proc(null, error);
          try {
            void events.unshift(event);
          }
          catch (reason) {
            void tx.objectStore(this.name).delete(cursor.primaryKey);
            void causeAsyncException(reason);
          }
          if (event.type !== EventStore.EventType.put) return void proc(null, error);
          return void cursor.continue();
        }
      };
      void req.addEventListener('success', () =>
        void proc(req.result, req.error));
      void tx.addEventListener('complete', () =>
        void cancellation.close());
      void tx.addEventListener('error', () => (
        void cancellation.close(),
        void cb(tx.error || req.error)));
      void tx.addEventListener('abort', () => (
        void cancellation.close(),
        void cb(tx.error || req.error)));
      void cancellation.register(() =>
        events.length === 0 && void tx.abort());
    }, () => void cb(new Error('Access has failed.')));
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
    return Object.assign(Object.create(null), compose(key, this.attrs, this.memory.reflect([key])).value);
  }
  public add(event: UnstoredEventRecord<K, V>, tx?: IDBTransaction): void {
    assert(event instanceof UnstoredEventRecord);
    assert(event.type === EventStore.EventType.snapshot ? tx : true);
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
              .off([key as K, attr as keyof V, id as string]),
            void this.events_.memory
              .off([key as K, attr as keyof V, id as string])));
        break;
      }
    }
    const clean = this.memory
      .on([event.key, event.attr, sqid(0), sqid()], () => event);
    void this.events_.memory
      .emit([event.key, event.attr, sqid(0)], event);
    const loss = () =>
      void this.events.loss.emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, makeEventId(0), event.key, event.attr, event.date));
    return void this.listen(db => {
      tx = this.txrw = tx || this.txrw || db.transaction(this.name, 'readwrite');
      const active = (): boolean =>
        this.memory.refs([event.key, event.attr, sqid(0)])
          .some(({ listener }) => listener(void 0, [event.key, event.attr, sqid(0)]) === event);
      if (!active()) return;
      const req = tx
        .objectStore(this.name)
        .add(record(event));
      void tx.addEventListener('complete', () => {
        assert(req.result > 0);
        void clean();
        const savedEvent = new SavedEventRecord(makeEventId(req.result as number), event.key, event.value, event.type, event.date);
        void this.memory
          .off([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)]);
        void this.memory
          .on([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], () => savedEvent);
        void this.events_.memory
          .emit([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], savedEvent);
        const events: StoredEventRecord<K, V>[] = this.memory.refs([savedEvent.key])
          .map(({ listener }) =>
            listener(void 0, [savedEvent.key]) as UnstoredEventRecord<K, V> | StoredEventRecord<K, V>)
          .reduce<StoredEventRecord<K, V>[]>((es, e) =>
            e instanceof StoredEventRecord
              ? concat(es, [e])
              : es
          , []);
        if (events.length >= this.snapshotCycle || hasBinary(event.value)) {
          void this.snapshot(savedEvent.key);
        }
      });
      const fail = () => (
        void clean(),
        active()
          ? void loss()
          : void 0);
      void tx.addEventListener('error', fail);
      void tx.addEventListener('abort', fail);
    }, () => void clean() || void loss());
  }
  public delete(key: K): void {
    return void this.add(new UnstoredEventRecord<K, V>(key, new EventStore.Value(), EventStore.EventType.delete));
  }
  private readonly snapshotCycle: number = 9;
  private snapshot(key: K): void {
    return void this.listen(db => {
      if (!this.has(key) || this.meta(key).id === 0) return;
      const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);
      const req = store
        .index(EventStoreSchema.key)
        .openCursor(key, 'prev');
      const events: StoredEventRecord<K, V>[] = [];
      void req.addEventListener('success', (): void => {
        const cursor: IDBCursorWithValue | null = req.result;
        if (cursor) {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          try {
            void events.unshift(event);
          }
          catch (reason) {
            void cursor.delete();
            void causeAsyncException(reason);
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
      });
    });
  }
  public clean(key: K): void {
    const events: StoredEventRecord<K, V>[] = [];
    const cleanState = new Map<K, boolean>();
    const cleared = new Cancellation();
    return void this.cursor(
      IDBKeyRange.only(key),
      EventStoreSchema.key,
      'prev',
      'readwrite',
      (cursor, error) => {
        if (error) return;
        if (!cursor) {
          void events
            .reduce<void>((_, event) => (
              void this.memory
                .off([event.key, event.attr, sqid(event.id)]),
              void this.events_.memory
                .off([event.key, event.attr, sqid(event.id)]))
            , void 0);
          return void this.events.clean.emit([key], !cleared.canceled);
        }
        else {
          const event = new LoadedEventRecord<K, V>(cursor.value);
          switch (event.type) {
            case EventStore.EventType.put:
              void cleared.cancel();
              void cleanState.set(event.key, cleanState.get(event.key) || false);
              if (cleanState.get(event.key)) break;
              return void cursor.continue();
            case EventStore.EventType.snapshot:
              void cleared.cancel();
              if (cleanState.get(event.key)) break;
              void cleanState.set(event.key, true);
              return void cursor.continue();
            case EventStore.EventType.delete:
              void cleared.close();
              if (cleanState.get(event.key)) break;
              void cleanState.set(event.key, true);
              break;
          }
          void cursor.delete();
          void events.unshift(event);
          return void cursor.continue();
        }
      });
  }
  public cursor(query: any, index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, cb: (cursor: IDBCursorWithValue | null, error: DOMException | DOMError | Error | null) => void): void {
    return void this.listen(db => {
      const tx = db.transaction(this.name, mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      void req.addEventListener('success', () => {
        const cursor: IDBCursorWithValue | null = req.result;
        if (!cursor) return;
        void cb(cursor, req.error);
      });
      void tx.addEventListener('complete', () => void cb(null, tx.error || req.error));
      void tx.addEventListener('error', () => void cb(null, tx.error || req.error));
      void tx.addEventListener('abort ', () => void cb(null, tx.error || req.error));
    }, () => void cb(null, new Error('Access has failed.')));
  }
}
export namespace EventStore {
  export class Event<K extends string, V extends Value> {
    private readonly EVENT!: K;
    constructor(
      public readonly type: EventType,
      public readonly id: EventId,
      public readonly key: K,
      public readonly attr: Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>,
      public readonly date: number
    ) {
      this.EVENT;
      void Object.freeze(this);
    }
  }
  export import EventType = EventRecordType;
  export class Record<K extends string, V extends Value> extends UnstoredEventRecord<K, V> {
    constructor(
      key: K,
      value: Partial<V>,
    ) {
      super(key, value);
    }
  }
  export class Value extends EventRecordValue {
  }
}

interface MetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}

export function record(event: UnstoredEventRecord<any, any>): Readonly<Pick<typeof event, Exclude<keyof typeof event, 'id'>>> {
  const record = { ...event };
  assert(record.id === 0);
  delete record.id;
  return record;
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
      .sort(([a, ai], [b, bi]) => void 0
        || indexedDB.cmp(a.key, b.key)
        || b.date - a.date
        || b.id * a.id > 0 && b.id - a.id
        || bi - ai)
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
        assert(source.attr !== '');
        return new UnstoredEventRecord<K, V>(
          source.key,
          new EventStore.Value(target.value, {
            [source.attr]: source.value[source.attr as keyof V]
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
