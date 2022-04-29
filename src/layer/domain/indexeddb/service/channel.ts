import { ObjectDefineProperties, ObjectKeys } from 'spica/alias';
import { StoreChannel as IStoreChannel } from '../../../../../';
import { Prop } from '../../../data/database/value';
import { Observation } from 'spica/observer';
import { throttle } from 'spica/throttle';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannel.Value<K>> extends ChannelStore<K, V> implements IStoreChannel<K, V> {
  constructor(
    name: string,
    private readonly factory: () => V,
    {
      migrate,
      destroy = () => true,
      age = Infinity,
      capacity = Infinity,
      debug = false,
    }: Partial<StoreChannel.Config<K, V>> & { debug?: boolean; } = {},
  ) {
    super(name, destroy, age, capacity, debug);

    const props = <Prop<V>[]>ObjectKeys(factory())
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(factory()));

    const update = (key: K, props: Prop<V>[]): void => {
      const source = this.sources.get(key)! as V;
      const memory = this.get(key)! as V;
      const link = this.link(key);
      assert(memory instanceof Object === false);
      const changes = props
        .filter(prop => prop in memory)
        .map(prop => {
          const newVal = memory[prop];
          const oldVal = source[prop];
          source[prop] = newVal;
          return {
            prop,
            newVal,
            oldVal,
          };
        })
        .filter(({ newVal, oldVal }) =>
          ![newVal].includes(oldVal));
      if (changes.length === 0) return;
      void migrate?.(link);
      for (const { prop, oldVal } of changes) {
        void (source[StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>)
          .emit([StorageChannel.EventType.recv, prop], new StorageChannel.Event<V>(StorageChannel.EventType.recv, prop, memory[prop], oldVal));
      }
    }

    void this.events_.load
      .monitor([], ({ key, prop, type }) => {
        if (!this.sources.has(key)) return;
        switch (type) {
          case StoreChannel.EventType.put:
            return void update(key, props.filter(a => a === prop));
          case StoreChannel.EventType.delete:
          case StoreChannel.EventType.snapshot:
            return void update(key, props);
        }
      });
    assert(Object.freeze(this));
  }
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, Partial<V>>();
  public link(key: K, age?: number): V {
    void this.ensureAliveness();
    void this.expire(key, age);
    void this.load(key, error =>
      !error && this.alive && this.links.has(key) && void this.log(key));
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links.set(key, build(
          ObjectDefineProperties(
            this.sources.set(key, this.get(key)).get(key)!,
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
                value: new Observation<[StorageChannel.EventType], StorageChannel.Event<V>, void>({ limit: Infinity })
              },
            }) as V,
          this.factory,
          (prop, newValue, oldValue) => {
            if (!this.alive) return;
            void this.add(new StoreChannel.Record<K, V>(key, { [prop]: newValue } as unknown as Partial<V>));
            void (this.sources.get(key)![StoreChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>)
              .emit([StorageChannel.EventType.send, prop], new StorageChannel.Event<V>(StorageChannel.EventType.send, prop, newValue, oldValue));
          },
          throttle(100, () => this.alive && this.links.has(key) && void this.log(key))))
          .get(key)!;
  }
}
export namespace StoreChannel {
  export import Value = ChannelStore.Value;
  export import Config = ChannelStore.Config;
  export import Event = ChannelStore.Event;
  export import EventType = ChannelStore.EventType;
  export import Record = ChannelStore.Record;
}
