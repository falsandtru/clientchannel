import { Infinity, Promise, setTimeout } from 'spica/global';
import { StoreChannel } from '../../../../../';
import { Observer } from '../../../../../observer';
import { open, Listen, close, destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { DAO, Prop } from '../../dao/api';
import { DataStore } from './channel/data';
import { AccessStore } from './channel/access';
import { ExpiryStore } from './channel/expiry';
import { Channel, ChannelMessage } from '../../broadcast/channel';
import { Ownership } from '../../ownership/channel';
import { StorageChannel } from '../../webstorage/api';
import { Observation } from 'spica/observer';
import { Cancellation } from 'spica/cancellation';
import { AtomicPromise } from 'spica/promise';

declare global {
  interface ChannelMessageTypeMap<K extends string> {
    save: SaveMessage<K>;
  }
}

class SaveMessage<K extends string> extends ChannelMessage<K> {
  constructor(
    public override readonly key: K,
  ) {
    super(key, 'save');
  }
}

const cache = new Set<string>();

export class ChannelStore<K extends keyof M & string, V extends ChannelStore.Value<K>, M extends object = Record<K, V>> {
  constructor(
    public readonly name: string,
    destroy: (reason: unknown, event?: Event) => boolean,
    private readonly age: number,
    private readonly capacity: number,
    private readonly debug = false,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Store channel "${name}" is already open.`);
    cache.add(name);
    this.cancellation.register(() =>
      void cache.delete(name));

    this.stores = new Stores<K, V>(this, this.ownership, this.capacity, open(name, {
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
    // NOTE: Deleting databases on devtools won't trigger the `destroy` event
    // but `indexedDB.deleteDatabase()` triggers the event as expected.
    this.cancellation.register(idbEventStream.on([name, IDBEventType.destroy], () =>
      void this.stores.rebuild()));
    this.cancellation.register(() =>
      void this.stores.close());

    this.cancellation.register(() =>
      void this.ownership.close());

    this.cancellation.register(() =>
      void this.channel.close());
    this.cancellation.register(this.channel.listen('save', ({ key }) =>
      void this.load(key)));

    this.events_.save.monitor([], ({ key }) =>
      void this.channel.post(new SaveMessage(key)));

    if (this.capacity === Infinity) return;

    this.events_.load.monitor([], ({ key, type }) => {
      if (type === ChannelStore.EventType.delete) {
        this.keys.delete(key);
      }
      else if (!this.keys.has(key)) {
        this.keys.add(key);
        this.stores.access.load(key);
      }
    });
    this.events_.save.monitor([], ({ key, type }) => {
      if (type === ChannelStore.EventType.delete) {
        this.keys.delete(key);
      }
      else if (!this.keys.has(key)) {
        this.keys.add(key);
        this.stores.access.load(key);
        this.keys.size > this.capacity && this.stores.access.schedule(100);
      }
    });
  }
  private readonly cancellation = new Cancellation();
  private readonly stores: Stores<K, V>;
  private readonly channel = new Channel<K>(this.name, this.debug);
  private readonly ownership = new Ownership<string>(this.channel);
  private readonly keys = new Set<K>();
  public lock = false;
  protected get alive(): boolean {
    return this.cancellation.alive;
  }
  public readonly events_ = {
    load: new Observation<[K, Prop<V> | '', ChannelStore.EventType], ChannelStore.Event<K, Prop<V> | ''>, void>(),
    save: new Observation<[K, Prop<V> | '', ChannelStore.EventType], ChannelStore.Event<K, Prop<V> | ''>, void>(),
  } as const;
  public readonly events = {
    load: new Observation<[K, Prop<M[K]> | '', ChannelStore.EventType], ChannelStore.Event<K, Prop<M[K]> | ''>, void>({ limit: Infinity }) as
      Observer<{ [L in K]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K]>,
    save: new Observation<[K, Prop<M[K]> | '', ChannelStore.EventType], ChannelStore.Event<K, Prop<M[K]> | ''>, void>({ limit: Infinity }) as
      Observer<{ [L in K]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K]>,
    loss: new Observation<[K, Prop<M[K]> | '', ChannelStore.EventType], ChannelStore.Event<K, Prop<M[K]> | ''>, void>({ limit: Infinity }) as
      Observer<{ [L in K]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K]>,
  } as const;
  protected ensureAliveness(): void {
    if (!this.alive) throw new Error(`ClientChannel: Store channel "${this.name}" is already closed.`);
  }
  public sync(keys: readonly K[], timeout?: number): Promise<PromiseSettledResult<K>[]> {
    this.ensureAliveness();
    const cancellation = timeout === void 0
      ? void 0
      : new Cancellation();
    cancellation && setTimeout(cancellation.cancel, timeout);
    return Promise.resolve(AtomicPromise.allSettled(
      keys.map(key =>
        new Promise<K>((resolve, reject) =>
          void this.load(key, error =>
            error
              ? void reject(error)
              : void resolve(key),
            cancellation)))));
  }
  public load(key: K, cb?: (error: DOMException | Error | null) => void, cancellation?: Cancellation): void {
    this.ensureAliveness();
    return this.stores.data.load(key, cb, cancellation);
  }
  public has(key: K): boolean {
    this.ensureAliveness();
    return this.stores.data.has(key);
  }
  public meta(key: K): ChannelStore.ValueMetaData<K> {
    this.ensureAliveness();
    return this.stores.data.meta(key);
  }
  public get(key: K): Partial<V> {
    this.ensureAliveness();
    this.log(key);
    return this.stores.data.get(key);
  }
  public add(record: DataStore.Record<K, V>): void {
    assert(record.type === DataStore.EventType.put);
    this.ensureAliveness();
    const key = record.key;
    this.stores.data.add(record);
    this.log(key);
  }
  public delete(key: K): void {
    this.ensureAliveness();
    this.stores.data.delete(key);
    this.stores.access.set(key, false);
  }
  public clean(key: K): void {
    this.ensureAliveness();
    this.stores.data.clean(key);
  }
  protected log(key: K): void {
    assert(this.alive);
    if (!this.alive) return;
    this.stores.access.set(key);
    this.stores.expiry.set(key, this.ages.get(key) ?? this.age);
  }
  private readonly ages = new Map<K, number>();
  public expire(key: K, age: number = this.age): void {
    assert(age > 0);
    this.ensureAliveness();
    this.ages.set(key, age);
  }
  public recent(timeout?: number): Promise<K[]>;
  public recent(cb?: (key: K, keys: readonly K[]) => boolean | void, timeout?: number): Promise<K[]>;
  public recent(cb?: number | ((key: K, keys: readonly K[]) => boolean | void), timeout?: number): Promise<K[]> {
    if (typeof cb === 'number') return this.recent(void 0, cb);
    this.ensureAliveness();
    return this.stores.access.recent(cb, timeout);
  }
  public close(): void {
    this.cancellation.cancel();
    return void close(this.name);
  }
  public destroy(): void {
    this.ensureAliveness();
    this.cancellation.cancel();
    return void destroy(this.name);
  }
}
export namespace ChannelStore {
  export import Config = StoreChannel.Config;
  export interface Value<K extends string = string> {
    readonly [Value.meta]: ValueMetaData<K>;
    readonly [Value.id]: number;
    readonly [Value.key]: K;
    readonly [Value.date]: number;
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[StorageChannel.EventType, P], StorageChannel.Event<this, P>, void]; }[Prop<this>]>;
  }
  export namespace Value {
    export const meta: typeof DAO.meta = DAO.meta;
    export const id: typeof DAO.id = DAO.id;
    export const key: typeof DAO.key = DAO.key;
    export const date: typeof DAO.date = DAO.date;
    export const event: typeof DAO.event = DAO.event;
  }
  export import ValueMetaData = StoreChannel.ValueMetaData;
  export import Event = DataStore.Event;
  export import EventType = DataStore.EventType;
  export import Record = DataStore.Record;
}

class Stores<K extends string, V extends ChannelStore.Value<K>> {
  constructor(
    private readonly store: ChannelStore<K, V>,
    private readonly ownership: Ownership<string>,
    private readonly capacity: number,
    private readonly listen: Listen,
  ) {
    this.build();
  }
  private cancellation = new Cancellation();
  private build(): void {
    assert(this.cancellation.alive);
    const keys = this.data ? this.data.keys() : [];

    this.access = new AccessStore<K>(this.store, this.cancellation, this.ownership, this.listen, this.capacity);
    this.expiry = new ExpiryStore<K>(this.store, this.cancellation, this.ownership, this.listen);
    this.data = new DataStore<K, V>(this.listen, {
      stores: [this.access.name, this.expiry.name],
      delete: (key, tx) => {
        tx.objectStore(this.access.name).delete(key);
        tx.objectStore(this.expiry.name).delete(key);
      },
    });

    this.cancellation.register(() => this.data.close());
    this.cancellation.register(() => this.access.close());
    this.cancellation.register(() => this.expiry.close());

    this.cancellation.register(this.store.events_.load.relay(this.data.events.load));
    this.cancellation.register(this.store.events_.save.relay(this.data.events.save));
    // @ts-expect-error
    this.cancellation.register(this.store.events.load.relay(this.data.events.load));
    // @ts-expect-error
    this.cancellation.register(this.store.events.save.relay(this.data.events.save));
    // @ts-expect-error
    this.cancellation.register(this.store.events.loss.relay(this.data.events.loss));

    this.store.sync(keys);
  }
  public rebuild(): void {
    this.close();
    this.cancellation = new Cancellation();
    this.build();
  }
  public data!: DataStore<K, V>;
  public access!: AccessStore<K>;
  public expiry!: ExpiryStore<K>;
  public close(): void {
    this.cancellation.cancel();
  }
}
