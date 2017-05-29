import { StoreChannelObject, StoreChannelObjectMetaData } from '../../../../../';
import { Observable, Cancelable, Cache } from 'spica';
import { open, close, destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { DataStore } from './channel/data';
import { AccessStore } from './channel/access';
import { ExpiryStore } from './channel/expiry';
import { noop } from '../../../../lib/noop';

const cache = new Map<string, ChannelStore<string, StoreChannelObject<string>>>();

export class ChannelStore<K extends string, V extends StoreChannelObject<K>> {
  constructor(
    public readonly name: string,
    attrs: string[],
    destroy: (err: DOMException | DOMError, event: Event | null) => boolean,
    private readonly size: number,
    private readonly expiry: number,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: IndexedDB: Specified channel ${name} is already created.`);
    void cache.set(name, this);
    void this.cancelable.listeners.add(() =>
      void cache.delete(name));
    void open(name, {
      make(db) {
        return DataStore.configure().make(db)
            && AccessStore.configure().make(db)
            && ExpiryStore.configure().make(db);
      },
      verify(db) {
        return DataStore.configure().verify(db)
            && AccessStore.configure().verify(db)
            && ExpiryStore.configure().verify(db);
      },
      destroy(err, ev) {
        return DataStore.configure().destroy(err, ev)
            && AccessStore.configure().destroy(err, ev)
            && ExpiryStore.configure().destroy(err, ev)
            && destroy(err, ev);
      }
    });
    this.schema = new Schema<K, V>(this, attrs, this.ages);
    void this.cancelable.listeners.add(() =>
      void this.schema.close());
    void this.cancelable.listeners
      .add(event.on([name, IDBEventType.destroy], () =>
        cache.get(name) === this &&
        void this.schema.rebuild()));
    if (size < Infinity) {
      const keys = new Cache<K>(this.size, k =>
        void this.delete(k));
      void this.events_.load.monitor([], ({ key, type }) =>
        type === ChannelStore.EventType.delete
          ? void keys.delete(key)
          : void keys.put(key));
      void this.events_.save.monitor([], ({ key, type }) =>
        type === ChannelStore.EventType.delete
          ? void keys.delete(key)
          : void keys.put(key));
      const limit = () =>
        cache.get(name) === this &&
        void this.recent(Infinity, (ks, err) => {
          if (cache.get(name) !== this) return;
          if (err) return void setTimeout(limit, 1000);
          return void ks
            .reverse()
            .forEach(k =>
              void keys.put(k));
        });
      void limit();
    }
  }
  private cancelable = new Cancelable<void>();
  private readonly schema: Schema<K, V>;
  public readonly events_ = {
    load: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
    save: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
  };
  public readonly events = {
    load: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
    save: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
    loss: new Observable<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>()
  };
  public sync(keys: K[], cb: (errs: [K, DOMException | DOMError][]) => any = noop): void {
    return this.schema.data.sync(keys, cb);
  }
  public fetch(key: K, cb: (err?: DOMException | DOMError) => any = noop): void {
    return this.schema.data.fetch(key, cb);
  }
  public transaction(key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any): void {
    return this.schema.data.transaction(key, cb, complete);
  }
  public has(key: K): boolean {
    return this.schema.data.has(key);
  }
  public meta(key: K): StoreChannelObjectMetaData<K> {
    return this.schema.data.meta(key);
  }
  public get(key: K): V {
    return this.schema.data.get(key);
  }
  public add(record: DataStore.Record<K, V>): void {
    return this.schema.data.add(record);
  }
  public delete(key: K): void {
    return this.schema.data.delete(key);
  }
  private readonly ages = new Map<K, number>();
  public expire(key: K, expiry: number = this.expiry): void {
    assert(expiry > 0);
    if (expiry === Infinity) return;
    return void this.ages.set(key, expiry);
  }
  public recent(limit: number, cb: (keys: K[], err: DOMException | DOMError | null) => any): void {
    const keys: K[] = [];
    return void this.schema.access.cursor(
      null,
      AccessStore.fields.date,
      'prev',
      'readonly',
      (cursor, err): void => {
        if (!cursor) return void cb(keys, err);
        if (--limit < 0) return;
        void keys.push(cursor.primaryKey);
        void cursor.continue();
      });
  }
  public close(): void {
    void this.cancelable.cancel();
    return void close(this.name);
  }
  public destroy(): void {
    void this.cancelable.cancel();
    return void destroy(this.name);
  }
}
export namespace ChannelStore {
  export import Event = DataStore.Event;
  export import EventType = DataStore.EventType;
  export import Record = DataStore.Record;
}

class Schema<K extends string, V extends StoreChannelObject<K>> {
  constructor(
    private readonly store_: ChannelStore<K, V>,
    private readonly attrs_: string[],
    private readonly expiries_: Map<K, number>
  ) {
    void this.build();
  }
  private cancelable_ = new Cancelable<void>();
  private build(): void {
    const keys = this.data ? this.data.keys() : [];

    this.data = new DataStore<K, V>(this.store_.name, this.attrs_);
    this.access = new AccessStore<K>(this.store_.name, this.data.events_.access);
    this.expire = new ExpiryStore<K>(this.store_.name, this.store_, this.data.events_.access, this.expiries_, this.cancelable_);
    void this.cancelable_.listeners
      .add(this.store_.events_.load.relay(this.data.events.load))
      .add(this.store_.events_.save.relay(this.data.events.save))
      .add(this.store_.events.load.relay(this.data.events.load))
      .add(this.store_.events.save.relay(this.data.events.save))
      .add(this.store_.events.loss.relay(this.data.events.loss));

    void this.data.sync(keys);
  }
  public rebuild(): void {
    void this.close();
    void this.build();
  }
  public data: DataStore<K, V>;
  public access: AccessStore<K>;
  public expire: ExpiryStore<K>;
  public close(): void {
    void this.cancelable_.cancel();
    this.cancelable_ = new Cancelable<void>();
  }
}
