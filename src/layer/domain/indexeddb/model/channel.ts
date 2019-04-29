import { StoreChannelObject, StoreChannelObjectMetaData } from '../../../../../';
import { Observation } from 'spica/observation';
import { Cancellation } from 'spica/cancellation';
import { AtomicPromise } from 'spica/promise';
import { DiffStruct } from 'spica/type';
import { Cache } from 'spica/cache';
import { open, Listen, close, destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { DataStore } from './channel/data';
import { AccessStore } from './channel/access';
import { ExpiryStore } from './channel/expiry';
import { Channel, ChannelMessage } from '../../broadcast/channel';
import { Ownership } from '../../ownership/channel';
import { noop } from '../../../../lib/noop';

declare global {
  interface ChannelMessageTypeMap<K extends string> {
    save: SaveMessage<K>;
  }
}

class SaveMessage<K extends string> extends ChannelMessage<K> {
  constructor(
    public readonly key: K,
  ) {
    super(key, 'save');
  }
}

const cache = new Set<string>();

export class ChannelStore<K extends string, V extends StoreChannelObject<K>> {
  constructor(
    public readonly name: string,
    attrs: string[],
    destroy: (reason: any, event?: Event) => boolean,
    private readonly age: number,
    private readonly size: number,
    private readonly debug: boolean = false,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Specified database channel "${name}" is already opened.`);
    void cache.add(name);
    void this.cancellation.register(() =>
      void cache.delete(name));

    this.schema = new Schema<K, V>(this, this.ownership, attrs, open(name, {
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
      destroy(reason, ev) {
        return DataStore.configure().destroy(reason, ev)
            && AccessStore.configure().destroy(reason, ev)
            && ExpiryStore.configure().destroy(reason, ev)
            && destroy(reason, ev);
      },
    }));
    void this.cancellation.register(idbEventStream.on([name, IDBEventType.destroy], () =>
      void this.schema.rebuild()));
    void this.cancellation.register(() =>
      void this.schema.close());

    void this.cancellation.register(this.channel.listen('save', ({ key }) => (
      void this.keys.delete(key) || void this.keys_.delete(key),
      void this.fetch(key))));
    void this.cancellation.register(() =>
      void this.channel.close());

    void this.events_.save.monitor([], ({ key }) =>
      void this.channel.post(new SaveMessage(key)));

    void this.events_.clean.monitor([], (cleared, [key]) => {
      if (!cleared) return;
      void this.ownership.take(`key:${key}`, 5 * 1000);
      void this.schema.access.delete(key);
      void this.schema.expire.delete(key);
    });

    if (!Number.isFinite(this.size)) return;

    void this.events_.load.monitor([], ({ key, type }) =>
      type === ChannelStore.EventType.delete
        ? void this.keys.delete(key) || void this.keys_.delete(key)
        : void this.keys.put(key));
    void this.events_.save.monitor([], ({ key, type }) =>
      type === ChannelStore.EventType.delete
        ? void this.keys.delete(key) || void this.keys_.delete(key)
        : void this.keys.put(key));

    const limit = () => {
      if (!Number.isFinite(size)) return;
      if (this.cancellation.canceled) return;
      void this.recent(Infinity, (ks, error) => {
        if (error) return void setTimeout(limit, 10 * 1000);
        for (const key of ks.reverse()) {
          void this.keys.put(key);
        }
      });
    };
    void limit();
  }
  private readonly cancellation = new Cancellation();
  private readonly schema: Schema<K, V>;
  private readonly keys_ = new Set<K>();
  private readonly channel = new Channel<K>(this.name, this.debug);
  private readonly ownership: Ownership<string> = new Ownership(this.channel);
  private readonly keys = new Cache<K>(this.size, (() => {
    void this.ownership.take('store', 0);
    const keys = this.keys_;
    let timer = 0;
    const resolve = (): void => {
      timer = 0;
      const since = Date.now();
      let count = 0;
      if (!this.ownership.take('store', 5 * 1000)) return;
      for (const key of keys) {
        if (this.cancellation.canceled) return void this.keys.clear(), void keys.clear();
        void keys.delete(key);
        if (timer > 0) return;
        if (this.keys.has(key)) continue;
        if (++count > 10) return void setTimeout(resolve, (Date.now() - since) * 3);
        if (!this.ownership.extend('store', 5 * 1000)) return;
        if (!this.ownership.take(`key:${key}`, 5 * 1000)) continue;
        void this.schema.expire.set(key, 0);
      }
    };
    return (key: K): void => {
      void keys.add(key);
      if (timer > 0) return;
      timer = setTimeout(resolve, 3 * 1000);
    };
  })(), { ignore: { delete: true } });
  public readonly events_ = Object.freeze({
    load: new Observation<[K] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | ''] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
    save: new Observation<[K] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | ''] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | '', ChannelStore.EventType], ChannelStore.Event<K, V>, void>(),
    clean: new Observation<[K], boolean, void>(),
  });
  public readonly events = Object.freeze({
    load: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, ChannelStore.EventType], ChannelStore.Event<K, V>, void>({ limit: Infinity }),
    save: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, ChannelStore.EventType], ChannelStore.Event<K, V>, void>({ limit: Infinity }),
    loss: new Observation<[K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, ChannelStore.EventType], ChannelStore.Event<K, V>, void>({ limit: Infinity }),
  });
  public sync(keys: K[], cb: (results: AtomicPromise<K>[]) => void = noop, timeout = Infinity): void {
    const cancellation = new Cancellation();
    if (Number.isFinite(timeout)) {
      void setTimeout(cancellation.cancel, timeout);
    }
    return void AtomicPromise.all(keys.map(key =>
      new AtomicPromise<[K, Error | DOMError | null]>(resolve =>
        void this.fetch(
          key,
          error =>
            void resolve([key, error]),
          cancellation))))
      .then(rs =>
        rs.map(([key, error]) =>
          error
            ? AtomicPromise.reject(error)
            : AtomicPromise.resolve(key)))
      .then(cb);
  }
  public fetch(key: K, cb: (error: DOMException | DOMError | Error | null) => void = noop, cancellation = new Cancellation()): void {
    void this.schema.access.fetch(key);
    return this.schema.data.fetch(key, cb, cancellation);
  }
  public has(key: K): boolean {
    return this.schema.data.has(key);
  }
  public meta(key: K): StoreChannelObjectMetaData<K> {
    return this.schema.data.meta(key);
  }
  public get(key: K): Partial<V> {
    void this.log(key);
    return this.schema.data.get(key);
  }
  public add(record: DataStore.Record<K, V>): void {
    assert(record.type === DataStore.EventType.put);
    const key = record.key;
    void this.log(key);
    void this.schema.data.add(record);
    void this.events_.save.once([record.key, record.attr, record.type], () => (
      void this.log(key)));
  }
  public delete(key: K): void {
    if (this.cancellation.canceled) return;
    void this.ownership.take(`key:${key}`, 5 * 1000);
    void this.log(key);
    void this.schema.data.delete(key);
  }
  protected log(key: K): void {
    if (this.meta(key).id > 0 && !this.has(key)) return;
    void this.schema.access.set(key);
    void this.schema.expire.set(key, this.ages.get(key) || this.age);
  }
  private readonly ages = new Map<K, number>();
  public expire(key: K, age: number = this.age): void {
    assert(age > 0);
    void this.ages.set(key, age);
    return void this.schema.expire.set(key, age);
  }
  public recent(limit: number, cb: (keys: K[], error: DOMException | DOMError | null) => void): void {
    return this.schema.access.recent(limit, cb);
  }
  public close(): void {
    void this.cancellation.cancel();
    return void close(this.name);
  }
  public destroy(): void {
    void this.cancellation.cancel();
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
    private readonly ownership_: Ownership<string>,
    private readonly attrs_: string[],
    private readonly listen_: Listen,
  ) {
    void this.build();
  }
  private cancellation_ = new Cancellation();
  private build(): void {
    const keys = this.data ? this.data.keys() : [];

    this.data = new DataStore<K, V>(this.attrs_, this.listen_);
    this.access = new AccessStore<K>(this.listen_);
    this.expire = new ExpiryStore<K>(this.store_, this.cancellation_, this.ownership_, this.listen_);

    void this.cancellation_.register(this.store_.events_.load.relay(this.data.events.load));
    void this.cancellation_.register(this.store_.events_.save.relay(this.data.events.save));
    void this.cancellation_.register(this.store_.events_.clean.relay(this.data.events.clean));
    void this.cancellation_.register(this.store_.events.load.relay(this.data.events.load));
    void this.cancellation_.register(this.store_.events.save.relay(this.data.events.save));
    void this.cancellation_.register(this.store_.events.loss.relay(this.data.events.loss));

    void this.store_.sync(keys);
  }
  public rebuild(): void {
    void this.close();
    void this.build();
  }
  public data!: DataStore<K, V>;
  public access!: AccessStore<K>;
  public expire!: ExpiryStore<K>;
  public close(): void {
    void this.cancellation_.cancel();
    this.cancellation_ = new Cancellation();
  }
}
