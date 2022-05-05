import { ObjectDefineProperties, ObjectKeys } from 'spica/alias';
import { StoreChannel as IStoreChannel } from '../../../../../';
import { Prop } from '../../../data/database/value';
import { build } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';
import { Observation } from 'spica/observer';
import { throttle } from 'spica/throttle';
import { equal } from 'spica/compare';

export class StoreChannel<M extends object, K extends keyof M & string = keyof M & string> extends ChannelStore<K, StoreChannel.Value<K>, M> implements IStoreChannel<M, K> {
  constructor(
    name: string,
    private readonly schemas: { [K in keyof M & string]: (key: K) => M[K]; },
    {
      migrate,
      destroy = () => true,
      age = Infinity,
      capacity = Infinity,
      debug = false,
    }: Partial<StoreChannel.Config<M>> & { debug?: boolean; } = {},
  ) {
    super(name, destroy, age, capacity, debug);

    const update = (key: K, prop: Prop<M[K]> | ''): void => {
      const source = this.sources.get(key)! as M[K];
      const memory = this.get(key)! as M[K];
      const link = this.link_(key);
      assert(memory instanceof Object === false);
      const props = prop === ''
        ? ObjectKeys(memory) as Prop<M[K]>[]
        : prop in memory ? [prop] : [];
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
        (source[StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<M[K]>], StorageChannel.Event<M[K]>, void>)
          .emit([StorageChannel.EventType.recv, prop], new StorageChannel.Event<M[K]>(StorageChannel.EventType.recv, prop, memory[prop], oldValue));
      }
    };

    this.events_.load
      .monitor([], ({ key, prop, type }) => {
        if (!this.sources.has(key)) return;
        switch (type) {
          case StoreChannel.EventType.put:
          case StoreChannel.EventType.snapshot:
            return void update(key, prop);
          case StoreChannel.EventType.delete:
            return;
        }
      });
  }
  private readonly sources = new Map<K, Partial<M[K]>>();
  private readonly links = new Map<K, M[K]>();
  private link_<L extends K>(key: L): M[L] {
    return this.links.has(key)
      ? this.links.get(key) as M[L]
      : this.links.set(key, build<M[L]>(
          ObjectDefineProperties(
            this.sources.set(key, this.get(key) as Partial<M[L]>).get(key) as M[L] & object,
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
          '' in this.schemas
            ? (this.schemas[key] ?? this.schemas[''])(key) as M[L] & object
            : this.schemas[key](key) as M[L] & object,
          (prop, newValue, oldValue) => {
            if (!this.alive) return;
            this.add(new StoreChannel.Record<L, StoreChannel.Value<L>>(key, { [prop]: newValue }));
            if (equal(newValue, oldValue)) return;
            (this.sources.get(key)![StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<M[L]>], StorageChannel.Event<M[L]>, void>)
              .emit([StorageChannel.EventType.send, prop], new StorageChannel.Event<M[L]>(StorageChannel.EventType.send, prop, newValue, oldValue));
          },
          throttle(100, () => { this.links.has(key) && this.alive && this.log(key); })))
          .get(key) as M[L];
  }
  public link<L extends K>(key: L, age?: number): M[L] {
    this.ensureAliveness();
    this.expire(key, age);
    this.load(key, error => { !error && this.alive && this.log(key); });
    return this.link_(key);
  }
  public override delete(key: K): void {
    this.ensureAliveness();
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
