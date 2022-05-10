import { ObjectDefineProperties, ObjectKeys } from 'spica/alias';
import { StoreChannel as IStoreChannel } from '../../../../../';
import { K } from '../../../../../internal';
import { Prop } from '../../../data/database/value';
import { build } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';
import { Observation } from 'spica/observer';
import { throttle } from 'spica/throttle';
import { equal } from 'spica/compare';

export class StoreChannel<M extends object> extends ChannelStore<K<M>, StoreChannel.Value<K<M>>, M> implements IStoreChannel<M> {
  constructor(
    name: string,
    private readonly schemas: { [L in K<M>]: (key: L) => M[L]; },
    {
      migrate,
      destroy = () => true,
      age = Infinity,
      capacity = Infinity,
      debug = false,
    }: Partial<StoreChannel.Config<M>> & { debug?: boolean; } = {},
  ) {
    super(name, destroy, age, capacity, debug);

    const update = (key: K<M>, prop: Prop<M[K<M>]> | ''): void => {
      const source = this.sources.get(key)! as M[K<M>];
      const memory = this.get(key)! as M[K<M>];
      const link = this.link_(key);
      assert(memory instanceof Object === false);
      const props = prop === ''
        ? ObjectKeys(memory) as Prop<M[K<M>]>[]
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
        (source[StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<M[K<M>]>], StorageChannel.Event<M[K<M>]>, void>)
          .emit([StorageChannel.EventType.recv, prop], new StorageChannel.Event<M[K<M>]>(StorageChannel.EventType.recv, prop, memory[prop], oldValue));
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
  private readonly sources = new Map<K<M>, Partial<M[K<M>]>>();
  private readonly links = new Map<K<M>, M[K<M>]>();
  private link_<L extends K<M>>(key: L): M[L] {
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
  public link<L extends K<M>>(key: L, age?: number): M[L] {
    this.ensureAliveness();
    this.expire(key, age);
    this.load(key, error => { !error && this.alive && this.log(key); });
    return this.link_(key);
  }
  public override delete(key: K<M>): void {
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
