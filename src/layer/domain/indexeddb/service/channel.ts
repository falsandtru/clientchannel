import { StoreChannel as IStoreChannel } from '../../../../../';
import { K } from '../../../../../internal';
import { Prop } from '../../../data/database/value';
import { build } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';
import { Observation } from 'spica/observer';
import { throttle } from 'spica/throttle';
import { setRepeatTimer } from 'spica/timer';
import { equal } from 'spica/compare';

export class StoreChannel<M extends object> extends ChannelStore<K<M>, StoreChannel.Value<K<M>>, M> implements IStoreChannel<M> {
  constructor(
    name: string,
    {
      schemas,
      destroy = () => true,
      age = Infinity,
      keepalive = Infinity,
      capacity = Infinity,
      migrate,
      debug = false,
    }: StoreChannel.Config<M> & { debug?: boolean; },
  ) {
    super(name, destroy, age, capacity, () => {
      for (const [key, cancel] of this.timers) {
        this.timers.delete(key);
        cancel();
      }
    }, debug);

    this.schemas = schemas;
    this.keepalive = keepalive || Infinity;

    const update = (key: K<M>, prop: Prop<M[K<M>]> | ''): void => {
      const source = this.sources.get(key)! as M[K<M>];
      const memory = this.get(key)! as M[K<M>];
      const link = this.link$(key);
      assert(memory instanceof Object === false);
      const props = prop === ''
        ? Object.keys(memory as object) as Prop<M[K<M>]>[]
        : prop in (memory as object) ? [prop] : [];
      const changes = props
        .map(prop => {
          const newValue = memory[prop];
          const oldValue = source[prop];
          source[prop] = newValue;
          return {
            prop,
            newValue,
            oldValue,
          };
        })
        .filter(({ newValue, oldValue }) =>
          !equal(newValue, oldValue));
      if (changes.length === 0) return;
      migrate?.(link);
      for (const { prop, oldValue } of changes) {
        (source[StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<M[K<M>]>], StorageChannel.Event<M[K<M>]>, void>)
          .emit([StorageChannel.EventType.recv, prop], new StorageChannel.Event<M[K<M>]>(StorageChannel.EventType.recv, prop, memory[prop], oldValue));
      }
    };

    this.events$.load
      .monitor([], ({ key, prop, type }) => {
        if (!this.sources.has(key)) return;
        switch (type) {
          case StoreChannel.EventType.Put:
          case StoreChannel.EventType.Snapshot:
            return void update(key, prop);
          case StoreChannel.EventType.Delete:
            return;
        }
      });
  }
  private readonly schemas: { [L in K<M>]: (key: L) => M[L]; };
  private readonly keepalive: number;
  private readonly timers = new Map<K<M>, () => void>();
  private readonly sources = new Map<K<M>, Partial<M[K<M>]>>();
  private readonly links = new Map<K<M>, M[K<M>]>();
  private link$<L extends K<M>>(key: L): M[L] {
    if (this.links.has(key)) return this.links.get(key) as M[L];
    const source = this.get(key) as Partial<M[L]>;
    const link = build<M[L]>(
      Object.defineProperties(
        source as M[L] & object,
        {
          [StoreChannel.Value.meta]: {
            get: () => this.meta(key)
          },
          [StoreChannel.Value.id]: {
            get: () => this.meta(key).id
          },
          [StoreChannel.Value.key]: {
            get: () => this.meta(key).key
          },
          [StoreChannel.Value.date]: {
            get: () => this.meta(key).date
          },
          [StoreChannel.Value.event]: {
            value: new Observation<[StorageChannel.EventType, Prop<M[L]>], StorageChannel.Event<M[L]>, void>({ limit: Infinity })
          },
        }),
      (this.schemas[key] ?? this.schemas[''])(key) as M[L] & object,
      (prop, newValue, oldValue) => {
        if (!this.alive || this.sources.get(key) !== source) return;
        this.add(new StoreChannel.Record<L, StoreChannel.Value<L>>(key, { [prop]: newValue }));
        if (equal(newValue, oldValue)) return;
        (source[StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<M[L]>], StorageChannel.Event<M[L]>, void>)
          .emit([StorageChannel.EventType.send, prop], new StorageChannel.Event<M[L]>(StorageChannel.EventType.send, prop, newValue, oldValue));
      },
      throttle(100, () => {
        this.alive && this.sources.get(key) === source && this.log(key);
      }));
    this.sources.set(key, source);
    this.links.set(key, link);
    if (this.keepalive < Infinity) {
      this.timers.get(key)?.();
      this.timers.set(key, setRepeatTimer(this.keepalive, () => {
        assert(this.alive);
        assert(this.sources.get(key) === source);
        this.log(key);
      }));
    }
    return link;
  }
  public link<L extends K<M>>(key: L, age?: number): M[L] {
    this.ensureAliveness();
    this.expire(key, age);
    const link = this.link$(key);
    const source = this.sources.get(key)!;
    assert(source);
    this.load(key, error => {
      !error && this.alive && this.sources.get(key) === source && this.log(key);
    });
    return link;
  }
  public unlink(link: M[K<M>]): boolean;
  public unlink(key: K<M>): boolean;
  public unlink(link: K<M> | M[K<M>]): boolean {
    const key: K<M> = typeof link === 'string'
      ? link
      : link[StoreChannel.Value.key];
    if (key !== link) return link === this.links.get(key) && this.unlink(key);
    this.timers.get(key)?.();
    assert(this.sources.has(key) === this.links.has(key));
    return this.sources.delete(key) && this.links.delete(key);
  }
  public override delete(key: K<M>): void {
    this.ensureAliveness();
    this.timers.get(key)?.();
    assert(this.sources.has(key) === this.links.has(key));
    this.sources.delete(key);
    this.links.delete(key);
    super.delete(key);
  }
}
export namespace StoreChannel {
  export import Config = ChannelStore.Config;
  export import Value = ChannelStore.Value;
  export import Event = ChannelStore.Event;
  export import EventType = ChannelStore.EventType;
  export import Record = ChannelStore.Record;
}
