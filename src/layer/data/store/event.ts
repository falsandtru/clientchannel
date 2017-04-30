import { Observable, Cancelable, Tick, sqid, assign, concat } from 'spica';
import { listen, Config, IDBKeyRange } from '../../infrastructure/indexeddb/api';
import { IdNumber } from '../constraint/types';
import { isValidPropertyName, isValidPropertyValue } from '../constraint/values';
import { EventRecordFields, EventType, EventValue, UnsavedEventRecord, SavedEventRecord } from '../schema/event';
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
    protected readonly name: string,
    protected readonly attrs: string[]
  ) {
    assert(this.attrs.every(isValidPropertyName));
    const states = new class {
      ids = new Map<K, IdNumber>();
      dates = new Map<K, number>();
      update(event: EventStore.Event<K, V>): void {
        void this.ids.set(event.key, IdNumber(Math.max(event.id, this.ids.get(event.key) || 0)));
        assert(event.date >= 0);
        void this.dates.set(event.key, Math.max(event.date, this.dates.get(event.key) || 0));
      }
    }();

    // dispatch events
    void this.events_.update
      .monitor([], (event): void => {
        if (event instanceof UnsavedEventRecord) return;
        assert(event instanceof SavedEventRecord);
        if (event.date <= states.dates.get(event.key)! && event.id <= states.ids.get(event.key)!) return;
        void this.events.load
          .emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, event.id, event.key, event.attr, event.date));
      });
    // update states
    void this.events_.update
      .monitor([], event =>
        void states.update(new EventStore.Event<K, V>(event.type, event.id, event.key, event.attr, event.date)));
    void this.events.load
      .monitor([], event =>
        void states.update(event));
    void this.events.save
      .monitor([], event =>
        void states.update(event));
    // clean records
    void this.events.save
      .monitor([], event => {
        switch (event.type) {
          case EventStore.Event.Type.delete:
          case EventStore.Event.Type.snapshot:
            void this.clean(event.key);
        }
      });
  }
  private readonly memory = new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', string], void, UnsavedEventRecord<K, V> | SavedEventRecord<K, V>>();
  public readonly events = {
    load: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.Event.Type], EventStore.Event<K, V>, void>(),
    save: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.Event.Type], EventStore.Event<K, V>, void>(),
    loss: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.Event.Type], EventStore.Event<K, V>, void>(),
  };
  public readonly events_ = {
    update: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', string], UnsavedEventRecord<K, V> | SavedEventRecord<K, V>, void>(),
    access: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', EventStore.InternalEvent.Type], EventStore.InternalEvent<K>, void>()
  };
  private update(key: K, attr?: string, id?: string): void {
    return typeof id === 'string' && typeof attr === 'string'
      ? void this.memory.emit([key, <keyof V>attr, id])
      : typeof attr === 'string'
        ? void this.memory.emit([key, <keyof V>attr])
        : void this.memory.emit([key]);
  }
  private readonly syncState = new Map<K, boolean>();
  private readonly syncWaits = new Observable<[K], DOMException | DOMError | void, any>();
  public sync(keys: K[], cb: (errs: [K, DOMException | DOMError][]) => any = noop): void {
    return void keys
      .map<Promise<[K, DOMException | DOMError] | void>>(key => {
        switch (this.syncState.get(key)) {
          case true:
            return Promise.resolve();
          case false:
            return new Promise<[K, DOMException | DOMError] | void>(resolve => void (
              void this.syncWaits.once([key], err => void resolve(err ? [key, err] : void 0))));
          default:
            return new Promise<[K, DOMException | DOMError] | void>(resolve => void (
              void this.syncWaits.once([key], err => void resolve(err ? [key, err] : void 0)),
              void this.fetch(key, err => void this.syncWaits.emit([key], err))));
        }
      })
      .reduce<Promise<([K, DOMException | DOMError] | void)[]>>((ps, p) => ps.then(es => p.then(e => es.concat([e]))), Promise.resolve<([K, DOMException | DOMError] | void)[]>([]))
      .then(es => void cb(<[K, DOMException | DOMError][]>es.filter(e => !!e)));
  }
  public fetch(key: K, cb: (err?: DOMException | DOMError) => any = noop, after: (tx: IDBTransaction, err?: DOMException | DOMError) => any = noop): void {
    void this.syncState.set(key, this.syncState.get(key) === true);
    const savedEvents: SavedEventRecord<K, V>[] = [];
    return void listen(this.database)(db => {
      const tx = db
        .transaction(this.name, after ? 'readwrite' : 'readonly');
      const req = tx
        .objectStore(this.name)
        .index(EventRecordFields.key)
        .openCursor(key, 'prev');
      const unbind = () => {
        req.onsuccess = tx.onerror = tx.onabort = <any>null;
      };
      const proc = (cursor: IDBCursorWithValue | null, err: DOMException | DOMError | null): void => {
        if (err) return (
          void cb(err),
          void unbind(),
          void after(tx, err));
        if (!cursor || (<SavedEventRecord<K, V>>cursor.value).date < this.meta(key).date) {
          // register latest events
          void Array.from(
            savedEvents
              // remove overridable event
              .reduceRight<SavedEventRecord<K, V>[]>((acc, e) =>
                acc.length === 0 || acc[0].type === EventStore.Event.Type.put
                  ? concat(acc, [e])
                  : acc
              , [])
              .reduceRight<Map<string, SavedEventRecord<K, V>>>((dict, e) =>
                dict.set(e.attr, e)
              , new Map())
              .values())
            .sort((a, b) => a.date - b.date || a.id - b.id)
            .forEach(e => {
              assert(this.memory.refs([e.key, e.attr, sqid(e.id)]).length === 0);
              assert(this.memory.refs([e.key, e.attr, sqid(e.id + 1)]).length === 0);
              void this.memory
                .on([e.key, e.attr, sqid(e.id)], () => e);
              void this.memory
                .once([e.key], () => { throw void this.events_.update.emit([e.key, e.attr, sqid(e.id)], e); });
            });
          void this.syncState.set(key, true);
          void cb();
          void unbind();
          void after(tx);
          void this.update(key);
          void this.events_.access
            .emit([key], new EventStore.InternalEvent(EventStore.InternalEvent.Type.query, IdNumber(0), key, ''));
          if (savedEvents.length >= this.snapshotCycle) {
            void this.snapshot(key);
          }
          return;
        }
        else {
          const event: SavedEventRecord<K, V> = cursor.value;
          if (this.memory.refs([event.key, event.attr, sqid(event.id)]).length > 0) return void proc(null, err);
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
          if (event.type !== EventStore.Event.Type.put) return void proc(null, err);
          return void cursor.continue();
        }
      };
      req.onsuccess = () => void proc(req.result, req.error);
      tx.onerror = tx.onabort = () => void cb(tx.error);
    });
  }
  private tx: IDBTransaction | void;
  public transaction(key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any): void {
    return void this.fetch(key, noop, (tx, err) => {
      try {
        if (err) throw err;
        this.tx = tx;
        void cb();
        void tx.addEventListener('complete', () => void complete());
        void tx.addEventListener('abort', () => void complete(tx.error));
        void tx.addEventListener('error', () => void complete(tx.error));
      }
      catch (e) {
        void tx.abort();
        void complete(e instanceof Error || e instanceof DOMError ? e : new Error());
      }
      finally {
        this.tx = void 0;
      }
    });
  }
  public keys(): K[] {
    return this.memory.reflect([])
      .reduce((keys, e) => keys.length === 0 || keys[keys.length - 1] !== e.key ? concat(keys, [e.key]) : keys, <K[]>[])
      .sort();
  }
  public meta(key: K): MetaData<K> {
    const events = this.memory.reflect([key]);
    return Object.freeze({
      key: key,
      id: events.reduce<number>((id, e) =>
        e.id > id ? e.id! : id, 0),
      date: events.reduce<number>((date, e) =>
        e.date > date ? e.date : date, 0)
    });
  }
  public has(key: K): boolean {
    return compose(key, this.attrs, this.memory.reflect([key])).type !== EventStore.Event.Type.delete;
  }
  public get(key: K): V {
    if (!this.syncState.get(key)) {
      void this.fetch(key);
    }
    void this.events_.access
      .emit([key], new EventStore.InternalEvent(EventStore.InternalEvent.Type.query, IdNumber(0), key, ''));
    return <V>compose(key, this.attrs, this.memory.reflect([key]))
      .value;
  }
  public add(event: UnsavedEventRecord<K, V>, tx: IDBTransaction | void = this.tx): void {
    assert(event.type === EventStore.Event.Type.snapshot ? tx : true);
    assert(!tx || tx.db.name === this.database && tx.mode === 'readwrite')
    void this.events_.access
      .emit([event.key, event.attr, event.type], new EventStore.InternalEvent(event.type, IdNumber(0), event.key, event.attr));
    if (!(event instanceof UnsavedEventRecord)) throw new Error(`ClientChannel: Cannot add a saved event: ${JSON.stringify(event)}`);
    if (!this.syncState.get(event.key)) {
      void this.fetch(event.key);
    }
    switch (event.type) {
      case EventStore.Event.Type.put: {
        void this.memory
          .off([event.key, event.attr, sqid(0)]);
        break;
      }
      case EventStore.Event.Type.delete:
      case EventStore.Event.Type.snapshot: {
        void this.memory
          .refs([event.key])
          .filter(([[, , id]]) => id === sqid(0))
          .reduce<Map<K, [K, keyof V, string]>>((m, [[key, attr, id]]) =>
            m.set(<K>key, [<K>key, <keyof V>attr, id])
          , new Map())
          .forEach(ns =>
            void this.memory.off(ns));
        break;
      }
    }
    const terminate = this.memory
      .on([event.key, event.attr, sqid(0), sqid()], () => event);
    void this.memory
      .once([event.key, event.attr, sqid(0)], () => { throw void this.events_.update.emit([event.key, event.attr, sqid(0)], event); });
    void this.update(event.key, event.attr, sqid(0));
    return void new Promise<void>((resolve, reject): void => {
      const cont = (tx: IDBTransaction): void => {
        const active = (): boolean =>
          this.memory.refs([event.key, event.attr, sqid(0)])
            .some(([, s]) => s(void 0) === event);
        if (!active()) return void resolve();
        const req = tx
          .objectStore(this.name)
          .add(adjust(event));
        assert(!tx.oncomplete);
        tx.oncomplete = () => {
          assert(req.result > 0);
          void terminate();
          const savedEvent = new SavedEventRecord(IdNumber(<number>req.result), event.key, event.value, event.type, event.date);
          void this.memory
            .on([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], () => savedEvent);
          void this.memory
            .once([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], () => { throw void this.events_.update.emit([savedEvent.key, savedEvent.attr, sqid(savedEvent.id)], savedEvent); });
          void this.events.save
            .emit([savedEvent.key, savedEvent.attr, savedEvent.type], new EventStore.Event<K, V>(savedEvent.type, savedEvent.id, savedEvent.key, savedEvent.attr, event.date));
          void this.update(savedEvent.key, savedEvent.attr, sqid(savedEvent.id));
          void resolve();
          if (this.memory.refs([savedEvent.key]).filter(([, sub]) => sub(void 0) instanceof SavedEventRecord).length >= this.snapshotCycle) {
            void this.snapshot(savedEvent.key);
          }
        };
        assert(!tx.onerror);
        assert(!tx.onabort);
        tx.onerror = tx.onabort = () =>
          active()
            ? void reject()
            : void resolve();
      };
      if (tx) return void cont(tx);
      const cancelable = new Cancelable<void>();
      void cancelable.listeners.add(reject);
      void Tick(() => (
        void setTimeout(cancelable.cancel, 1000),
        void listen(this.database)(db => (
          void cancelable.listeners.clear(),
          void cancelable.maybe(db)
            .fmap(db => void cont(db.transaction(this.name, 'readwrite')))
            .extract(() => void 0)))));
    })
      .catch(() =>
        void this.events.loss.emit([event.key, event.attr, event.type], new EventStore.Event<K, V>(event.type, IdNumber(0), event.key, event.attr, event.date)));
  }
  public delete(key: K): void {
    return void this.add(new UnsavedEventRecord<K, V>(key, new EventStore.Value(), EventStore.Event.Type.delete));
  }
  private readonly snapshotCycle: number = 9;
  private snapshot(key: K): void {
    return void listen(this.database)(db => {
      if (!this.syncState.get(key)) return;
      const tx = db.transaction(this.name, 'readwrite');
      const store = tx.objectStore(this.name);
      const req = store
        .index(EventRecordFields.key)
        .openCursor(key, 'prev');
      const savedEvents: SavedEventRecord<K, V>[] = [];
      req.onsuccess = (): void => {
        const cursor: IDBCursorWithValue | null = req.result;
        if (cursor) {
          const event: SavedEventRecord<K, V> = cursor.value;
          void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
        }
        if (!cursor) {
          assert(this.snapshotCycle > 0);
          if (savedEvents.length === 0) return;
          const composedEvent = compose(key, this.attrs, savedEvents);
          if (composedEvent instanceof SavedEventRecord) return;
          switch (composedEvent.type) {
            case EventStore.Event.Type.snapshot:
              // snapshot's date must not be later than unsaved event's date.
              return void this.add(
                new UnsavedEventRecord(
                  composedEvent.key,
                  composedEvent.value,
                  composedEvent.type,
                  savedEvents.reduce((date, e) => e.date > date ? e.date : date, 0)),
                tx);
            case EventStore.Event.Type.delete:
              return;
          }
          throw new TypeError(`ClientChannel: Invalid event type: ${composedEvent.type}`);
        }
        else {
          return void cursor.continue();
        }
      };
    });
  }
  private clean(key?: K): void {
    const removedEvents: SavedEventRecord<K, V>[] = [];
    const cleanState = new Map<K, boolean>();
    return void this.cursor(
      key ? IDBKeyRange.bound(key, key) : IDBKeyRange.upperBound(Infinity),
      key ? EventRecordFields.key : EventRecordFields.date,
      'prev',
      'readwrite',
      cursor => {
        if (!cursor) {
          return void removedEvents
            .reduce<void>((_, event) =>
              void this.memory.off([event.key, event.attr, sqid(event.id)])
            , void 0);
        }
        else {
          const event: SavedEventRecord<K, V> = cursor.value;
          switch (event.type) {
            case EventStore.Event.Type.put: {
              void cleanState.set(event.key, cleanState.get(event.key) || false);
              break;
            }
            case EventStore.Event.Type.snapshot: {
              if (!cleanState.get(event.key)) {
                void cleanState.set(event.key, true);
                void cursor.continue();
                return;
              }
              break;
            }
            case EventStore.Event.Type.delete: {
              void cleanState.set(event.key, true);
              break;
            }
          }
          if (cleanState.get(event.key)) {
            void cursor.delete();
            void removedEvents.unshift(event);
          }
          return void cursor.continue();
        }
      });
  }
  public cursor(query: any, index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, cb: (cursor: IDBCursorWithValue | null, error: DOMException | DOMError | null) => any): void {
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
      public readonly type: Event.Type,
      public readonly id: IdNumber,
      public readonly key: K,
      public readonly attr: keyof V | '',
      public readonly date: number
    ) {
      this.EVENT;
      void Object.freeze(this);
    }
  }
  export namespace Event {
    export import Type = EventType;
  }
  export class Record<K extends string, V extends Value> extends UnsavedEventRecord<K, V> { }
  export class Value extends EventValue {
  }
  export class InternalEvent<K extends string> {
    constructor(
      public readonly type: InternalEvent.Type,
      public readonly id: IdNumber,
      public readonly key: K,
      public readonly attr: string
    ) {
      void Object.freeze(this);
    }
  }
  export namespace InternalEvent {
    export const Type = {
      ...Event.Type,
      query: <'query'>'query'
    };
    export type Type = Event.Type | typeof Type.query;
  }
}
export {
  UnsavedEventRecord,
  SavedEventRecord
}

interface MetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}

export function adjust(record: UnsavedEventRecord<any, any>): {} {
  const ret = { ...record };
  delete (<{ id: IdNumber; }>ret).id;
  return ret;
}

// input order must be asc
export function compose<K extends string, V extends EventStore.Value>(
  key: K,
  attrs: string[],
  events: Array<UnsavedEventRecord<K, V> | SavedEventRecord<K, V>>
): UnsavedEventRecord<K, V> | SavedEventRecord<K, V> {
  assert(attrs.every(isValidPropertyName));
  assert(events.every(e => e.key === key));
  type E = UnsavedEventRecord<K, V> | SavedEventRecord<K, V>;
  return group(events)
    .map(events =>
      events
        .reduceRight(compose, new UnsavedEventRecord<K, V>(key, new EventStore.Value(), EventStore.Event.Type.delete, 0)))
    .reduce(e => e);

  function group(events: E[]): E[][] {
    return events
      .map<[E, number]>((e, i) => [e, i])
      .sort(([a, ai], [b, bi]) => indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id - a.id || bi - ai)
      .reduceRight<E[][]>(([head, ...tail], [event]) => {
        assert(event instanceof UnsavedEventRecord || event instanceof SavedEventRecord);
        const prev = head[0];
        if (!prev) return [[event]];
        assert(prev.key === event.key);
        return prev.key === event.key
          ? concat([concat([event], head)], tail)
          : concat([[event]], concat([head], tail));
      }, [[]]);
  }
  function compose(target: E, source: E): E {
    assert(target instanceof UnsavedEventRecord || target instanceof SavedEventRecord);
    assert(source instanceof UnsavedEventRecord || source instanceof SavedEventRecord);
    switch (source.type) {
      case EventStore.Event.Type.put:
        return source.value[source.attr] !== void 0
          ? new UnsavedEventRecord<K, V>(
              source.key,
              assign(new EventStore.Value(), target.value, source.value),
              EventStore.Event.Type.snapshot)
          : new UnsavedEventRecord<K, V>(
              source.key,
              Object.keys(target.value)
                .filter(prop => attrs.indexOf(prop) !== -1)
                .filter(isValidPropertyValue(target))
                .reduce((value, prop) =>
                  (value[prop] = target[prop], value)
                , new EventStore.Value()),
              EventStore.Event.Type.snapshot);
      case EventStore.Event.Type.snapshot:
        return source;
      case EventStore.Event.Type.delete:
        return source;
    }
    throw new TypeError(`ClientChannel: Invalid event type: ${source}`);
  }
}
