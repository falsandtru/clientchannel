import { Map, indexedDB } from 'spica/global';
import { max, ObjectAssign, ObjectCreate } from 'spica/alias';
import { Listen, Config, IDBKeyRange } from '../../infrastructure/indexeddb/api';
import { EventId, makeEventId } from './identifier';
import { EventRecordType, UnstoredEventRecord, StoredEventRecord, LoadedEventRecord, SavedEventRecord, EventRecordValue } from './event';
import { Prop, hasBinary } from '../database/value';
import { Observation } from 'spica/observer';
import { Cancellation } from 'spica/cancellation';
import { tick } from 'spica/clock';
import { concat } from 'spica/concat';
import { causeAsyncException } from 'spica/exception';

namespace EventStoreSchema {
  export const id = 'id';
  export const key = 'key';
  //export const type = 'type';
  //export const prop = 'prop';
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
          store.createIndex(EventStoreSchema.id, EventStoreSchema.id, { unique: true });
        }
        if (!store.indexNames.contains(EventStoreSchema.key)) {
          store.createIndex(EventStoreSchema.key, EventStoreSchema.key);
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
    private readonly listen: Listen,
    private readonly relation?: {
      readonly stores: string[];
      delete(key: K, tx: IDBTransaction): void;
    },
  ) {
    // Clean events.
    this.events.load
      .monitor([], event => {
        switch (event.type) {
          case EventStore.EventType.Delete:
          case EventStore.EventType.Snapshot:
            clean(event);
        }
      });
    this.events.save
      .monitor([], event => {
        switch (event.type) {
          case EventStore.EventType.Delete:
          case EventStore.EventType.Snapshot:
            this.clean(event.key);
            clean(event);
        }
      });
    const clean = (event: EventStore.Event<K, Prop<V> | ''>) => {
      for (const ev of this.memory.reflect([event.key])) {
        0 < ev.id && ev.id < event.id && this.memory.off([ev.key, ev.prop, true, ev.id]);
      }
    };
  }
  private alive = true;
  private readonly memory = new Observation<[K, Prop<V> | '', boolean, number], void, UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>>({ limit: 1, cleanup: true });
  private readonly status = {
    store: this,
    ids: new Map<K, EventId>(),
    dates: new Map<K, number>(),
    update(event: UnstoredEventRecord<K, V> | LoadedEventRecord<K, V> | SavedEventRecord<K, V>): void {
      this.dates.set(event.key, max(event.date, this.dates.get(event.key) || 0))
      this.ids.set(event.key, makeEventId(max(event.id, this.ids.get(event.key) || 0)));
      if (event instanceof LoadedEventRecord) {
        return void this.store.events.load
          .emit([event.key, event.prop, event.type], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
      }
      if (event instanceof SavedEventRecord) {
        return void this.store.events.save
          .emit([event.key, event.prop, event.type], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
      }
    },
  } as const;
  public readonly events = {
    load: new Observation<[K, Prop<V> | '', EventStore.EventType], EventStore.Event<K, Prop<V> | ''>, void>(),
    save: new Observation<[K, Prop<V> | '', EventStore.EventType], EventStore.Event<K, Prop<V> | ''>, void>(),
    loss: new Observation<[K, Prop<V> | '', EventStore.EventType], EventStore.Event<K, Prop<V> | ''>, void>(),
    clear: new Observation<[K], undefined, void>(),
  } as const;
  private tx: {
    rw?: IDBTransaction;
    rwc: number;
  } = {
    rwc: 0,
  };
  private get txrw(): IDBTransaction | undefined {
    if (++this.tx.rwc < 25 || !this.tx.rw) return;
    const tx = this.tx.rw;
    this.tx.rwc = 0;
    this.tx.rw = void 0;
    tx.commit();
    return this.tx.rw;
  }
  private set txrw(tx: IDBTransaction | undefined) {
    assert(tx = tx!);
    assert(tx.mode === 'readwrite');
    assert.deepStrictEqual([...tx.objectStoreNames], [this.name]);
    if (this.tx.rw === tx) return;
    this.tx.rwc = 0;
    this.tx.rw = tx;
    const clear = () => {
      if (this.tx.rw !== tx) return;
      this.tx.rw = void 0;
    };
    this.tx.rw.addEventListener('abort', clear);
    this.tx.rw.addEventListener('error', clear);
    this.tx.rw.addEventListener('complete', clear);
    tick(clear);
  }
  public transact(
    cache: (db: IDBDatabase) => IDBTransaction | undefined,
    success: (tx: IDBTransaction) => void,
    failure: (reason: unknown) => void,
    tx = this.txrw,
  ): void {
    return tx
      ? void success(tx)
      : void this.listen(db => {
          const tx = cache(db);
          return tx
            ? void success(this.txrw = tx)
            : void failure(new Error('Session is already closed.'));
        }, failure);
  }
  public load(key: K, cb?: (error: DOMException | Error | null) => void, cancellation?: Cancellation): void {
    if (!this.alive) return void cb?.(new Error('Session is already closed.'));
    const events: LoadedEventRecord<K, V>[] = [];
    return void this.listen(db => {
      if (!this.alive) return void cb?.(new Error('Session is already closed.'));
      if (cancellation?.isCancelled) return void cb?.(new Error('Request is cancelled.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = tx
        .objectStore(this.name)
        .index(EventStoreSchema.key)
        .openCursor(key, 'prev');
      req.addEventListener('success', () => {
        const cursor = req.result;
        if (!cursor) return;
        let event: LoadedEventRecord<K, V>;
        try {
          event = new LoadedEventRecord<K, V>(cursor.value);
        }
        catch (reason) {
          causeAsyncException(reason);
          cursor.delete();
          return void cursor.continue();
        }
        if (event!.id < this.meta(key).id) return;
        assert(event = event!);
        events.unshift(event);
        if (event.type !== EventStore.EventType.Put) return;
        cursor.continue();
      });
      tx.addEventListener('complete', () => {
        // Remove overridable events.
        for (const [, event] of new Map(events.map(ev => [ev.prop, ev]))) {
          this.memory
            .off([event.key, event.prop, event.id > 0, event.id]);
          this.memory
            .on([event.key, event.prop, event.id > 0, event.id], () => event);
          this.status.update(event);
        }
        try {
          cb?.(req.error);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        if (events.length >= this.snapshotCycle) {
          this.snapshot(key);
        }
      });
      tx.addEventListener('complete', () =>
        void cancellation?.close());
      tx.addEventListener('error', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error)));
      tx.addEventListener('abort', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error)));
      cancellation?.register(() =>
        void tx.abort());
    }, () => void cb?.(new Error('Request has failed.')));
  }
  public keys(): K[] {
    return this.memory.reflect([])
      .reduce<K[]>((keys, ev) =>
        keys.at(-1) !== ev.key
          ? concat(keys, [ev.key])
          : keys
      , [])
      .sort();
  }
  public has(key: K): boolean {
    return compose(key, this.memory.reflect([key])).type !== EventStore.EventType.Delete;
  }
  public meta(key: K): MetaData<K> {
    const events = this.memory.reflect([key]);
    return {
      key: key,
      id: events.reduce((id, ev) => (
        ev.id > id ? ev.id : id
      ), 0),
      date: events.reduce((date, ev) => (
        ev.date > date ? ev.date : date
      ), 0),
    };
  }
  public get(key: K): Partial<V> {
    return ObjectAssign(ObjectCreate(null), compose(key, this.memory.reflect([key])).value);
  }
  private counter = 0;
  public add(event: UnstoredEventRecord<K, V>, tx?: IDBTransaction): void {
    assert(event instanceof UnstoredEventRecord);
    assert(event.type === EventStore.EventType.Snapshot ? tx : true);
    if (!this.alive) return;
    const revert = this.memory
      .on([event.key, event.prop, false, ++this.counter], () => event);
    this.status.update(event);
    const active = (): boolean =>
      this.memory.reflect([event.key, event.prop, false])
        .includes(event);
    const loss = () =>
      void this.events.loss.emit([event.key, event.prop, event.type], new EventStore.Event(event.type, makeEventId(0), event.key, event.prop, event.date));
    return void this.transact(
      db =>
        this.alive
          ? db.transaction(this.name, 'readwrite')
          : void 0,
      tx => {
        if (!active()) return;
        const req = tx
          .objectStore(this.name)
          .add(record(event));
        const ev = event;
        tx.addEventListener('complete', () => {
          assert(req.result > 0);
          revert();
          const event = new SavedEventRecord(makeEventId(req.result as number), ev.key, ev.value, ev.type, ev.date);
          this.memory
            .off([event.key, event.prop, true, event.id]);
          this.memory
            .on([event.key, event.prop, true, event.id], () => event);
          this.status.update(event);
          const events = this.memory.reflect([event.key])
            .filter(ev => ev.id > 0);
          if (events.length >= this.snapshotCycle ||
              events.filter(event => hasBinary(event.value)).length >= 3) {
            this.snapshot(event.key);
          }
        });
        const fail = () => { void revert() || active() && loss(); };
        tx.addEventListener('error', fail);
        tx.addEventListener('abort', fail);
        tx.commit();
      },
      () => { void revert() || active() && loss(); },
      tx);
  }
  public delete(key: K): void {
    return void this.add(new UnstoredEventRecord<K, V>(key, new EventStore.Value(), EventStore.EventType.Delete));
  }
  private readonly snapshotCycle: number = 9;
  private snapshot(key: K): void {
    if (!this.alive) return;
    return void this.transact(
      db =>
        this.alive
          ? db.transaction(this.name, 'readwrite')
          : void 0,
      tx => {
        if (!this.has(key) || this.meta(key).id === 0) return;
        const store = tx.objectStore(this.name);
        const req = store
          .index(EventStoreSchema.key)
          .openCursor(key, 'prev');
        const events: StoredEventRecord<K, V>[] = [];
        req.addEventListener('success', (): void => {
          const cursor = req.result;
          if (cursor) {
            try {
              const event = new LoadedEventRecord<K, V>(cursor.value);
              events.unshift(event);
            }
            catch (reason) {
              causeAsyncException(reason);
              cursor.delete();
            }
            return void cursor.continue();
          }
          else {
            if (events.length <= 1) return;
            if (events.at(-1)!.type === EventStore.EventType.Snapshot) return;
            const event = compose(key, events);
            if (event.id > 0) return;
            switch (event.type) {
              case EventStore.EventType.Snapshot:
                // Snapshot's date must not be later than unsaved event's date.
                return void this.add(
                  new UnstoredEventRecord(
                    event.key,
                    event.value,
                    event.type,
                    events.reduce((date, ev) => ev.date > date ? ev.date : date, 0)),
                  tx);
              case EventStore.EventType.Delete:
                return void tx.commit();
              case EventStore.EventType.Put:
              default:
                throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${event.type}`);
            }
            assert(false);
          }
        });
      },
      () => void 0);
  }
  public clean(key: K): void {
    if (!this.alive) return;
    const events: StoredEventRecord<K, V>[] = [];
    let deletion = false;
    let clear: boolean;
    return void this.cursor(
      IDBKeyRange.only(key), EventStoreSchema.key, 'prev', 'readwrite', this.relation?.stores ?? [],
      (error, cursor, tx) => {
        if (!this.alive) return;
        if (error) return;
        if (cursor) {
          let event: LoadedEventRecord<K, V>;
          try {
            event = new LoadedEventRecord<K, V>(cursor.value);
          }
          catch (reason) {
            causeAsyncException(reason);
            cursor.delete();
          }
          assert(event = event!);
          switch (event.type) {
            case EventStore.EventType.Put:
              clear ??= false;
              if (deletion) break;
              return void cursor.continue();
            case EventStore.EventType.Snapshot:
              clear ??= false;
              if (deletion) break;
              deletion = true;
              return void cursor.continue();
            case EventStore.EventType.Delete:
              clear ??= true;
              deletion = true;
              break;
          }
          events.unshift(event);
          cursor.delete();
          assert(deletion);
          return void cursor.continue();
        }
        else if(tx) {
          if (clear && this.memory.reflect([key]).every(ev => ev.id > 0)) {
            this.relation?.delete(key, tx);
          }
          return;
        }
        else if (events.length > 0) {
          for (const event of events) {
            this.memory
              .off([event.key, event.prop, true, event.id]);
          }
          for (const event of this.memory.reflect([key]).filter(ev => 0 < ev.id && ev.id < events.at(-1)!.id)) {
            this.memory
              .off([event.key, event.prop, true, event.id]);
          }
          assert(this.events.clear.reflect([key]));
          return;
        }
      });
  }
  public cursor(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, stores: string[],
    cb: (error: DOMException | Error | null, cursor: IDBCursorWithValue | null, tx: IDBTransaction | null) => void,
  ): void {
    if (!this.alive) return void cb(new Error('Session is already closed.'), null, null);
    return void this.listen(db => {
      if (!this.alive) return void cb(new Error('Session is already closed.'), null, null);
      const tx = db.transaction([this.name, ...stores], mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      req.addEventListener('success', () => {
        const cursor = req.result;
        if (cursor) {
          try {
            cb(req.error, cursor, tx);
          }
          catch (reason) {
            cursor.delete();
            causeAsyncException(reason);
          }
          return;
        }
        else {
          cb(tx.error || req.error, null, tx);
          mode === 'readwrite' && tx.commit();
          return;
        }
      });
      tx.addEventListener('complete', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('error', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('abort ', () =>
        void cb(tx.error || req.error, null, null));
    }, () => void cb(new Error('Request has failed.'), null, null));
  }
  public close(): void {
    this.alive = false;
  }
}
export namespace EventStore {
  export class Event<K extends string, P extends string> {
    private readonly EVENT!: K;
    constructor(
      public readonly type: EventType,
      public readonly id: EventId,
      public readonly key: K,
      public readonly prop: P,
      public readonly date: number,
    ) {
      this.EVENT;
      assert(Object.freeze(this));
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

export function record<K extends string, V extends EventRecordValue>(event: UnstoredEventRecord<K, V>): Omit<typeof event, 'id'> {
  const record = { ...event };
  assert(record.id === 0);
  // @ts-expect-error
  delete record.id;

  return record;
}

export function compose<K extends string, V extends EventStore.Value>(
  key: K,
  events: Array<UnstoredEventRecord<K, V> | StoredEventRecord<K, V>>,
): UnstoredEventRecord<K, V> | StoredEventRecord<K, V> {
  assert(events.every(event => event.key === key));
  assert(events.every(event => event instanceof UnstoredEventRecord || event instanceof StoredEventRecord));
  type E = UnstoredEventRecord<K, V> | StoredEventRecord<K, V>;
  return group(events)
    .map(events =>
      events
        .reduceRight(compose, new UnstoredEventRecord<K, V>(key, new EventStore.Value(), EventStore.EventType.Delete, 0)))
    .reduce(ev => ev);

  function group(events: E[]): E[][] {
    return events
      .map<[E, number]>((ev, i) => [ev, i])
      .sort(([a, ai], [b, bi]) => void 0
        || indexedDB.cmp(a.key, b.key)
        || b.date - a.date
        || b.id > 0 && a.id > 0 && b.id - a.id
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
      case EventStore.EventType.Put:
        assert(source.prop !== '');
        return new UnstoredEventRecord<K, V>(
          source.key,
          new EventStore.Value(target.value, {
            [source.prop]: source.value[source.prop as Prop<V>]
          }),
          EventStore.EventType.Snapshot);
      case EventStore.EventType.Snapshot:
        return source;
      case EventStore.EventType.Delete:
        return source;
    }
    throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${source}`);
  }
}
