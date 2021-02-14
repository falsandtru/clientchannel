import { ObjectDefineProperties, ObjectFreeze, ObjectKeys } from 'spica/alias';
import { StoreChannel as IStoreChannel, StoreChannelConfig, StoreChannelObject } from '../../../../../';
import { Observation, Observer } from 'spica/observer';
import { throttle } from 'spica/throttle';
import { Schema, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> extends ChannelStore<K, V> implements IStoreChannel<K, V> {
  constructor(
    name: string,
    private readonly factory: () => V,
    {
      migrate = () => void 0,
      destroy = () => true,
      age = Infinity,
      size = Infinity,
      debug = false,
    }: Partial<StoreChannelConfig<K, V>> & { size?: number; } = {},
  ) {
    super(name, ObjectKeys(factory()).filter(isValidPropertyName).filter(isValidPropertyValue(factory())), destroy, age, size, debug);

    const attrs = <(keyof V)[]>ObjectKeys(factory())
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(factory()));

    void this.events_.load
      .monitor([], ({ key, attr, type }) => {
        if (!this.sources.has(key)) return;
        const source = this.sources.get(key)!;
        const memory = this.get(key)!;
        const link = this.link(key);
        switch (type) {
          case ChannelStore.EventType.put:
            return void update(attrs.filter(a => a === attr));
          case ChannelStore.EventType.delete:
          case ChannelStore.EventType.snapshot:
            return void update(attrs);
        }
        return;

        function update(attrs: (keyof V)[]): void {
          const changes = attrs
            .filter(attr => attr in memory)
            .map(attr => {
              const newVal = memory[attr];
              const oldVal = source[attr];
              source[attr] = newVal;
              return {
                attr,
                newVal,
                oldVal,
              };
            })
            .filter(({ newVal, oldVal }) =>
              ![newVal].includes(oldVal));
          if (changes.length === 0) return;
          void migrate(link);
          for (const { attr, oldVal } of changes) {
            void cast(source[Schema.event]!)
              .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr as never, memory[attr as never], oldVal as never));
          }
        }
      });
    void ObjectFreeze(this);
  }
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, Partial<V>>();
  public link(key: K, age?: number): V {
    void this.fetch(key);
    void this.expire(key, age);
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links.set(key, build(
          ObjectDefineProperties(
            this.sources.set(key, this.get(key)).get(key)! as V,
            {
              [Schema.meta]: {
                get: () =>
                  this.meta(key)
              },
              [Schema.id]: {
                get: () =>
                  this.meta(key).id
              },
              [Schema.key]: {
                get: () =>
                  this.meta(key).key
              },
              [Schema.date]: {
                get: () =>
                  this.meta(key).date
              },
              [Schema.event]: {
                value: new Observation<[StorageChannel.EventType], StorageChannel.Event<V>, void>({ limit: Infinity })
              },
            }),
          this.factory,
          (attr, newValue, oldValue) => {
            if (!this.alive) return;
            void this.add(new ChannelStore.Record<K, V>(key, { [attr]: newValue } as unknown as Partial<V>));
            void cast(this.sources.get(key)![Schema.event]!)
              .emit([StorageChannel.EventType.send, attr], new StorageChannel.Event<V>(StorageChannel.EventType.send, attr as never, newValue, oldValue));
          },
          throttle(100, () => this.alive && this.links.has(key) && this.has(key) && void this.log(key))))
          .get(key)!;
  }
}

function cast<V extends Observer<K, D, R>, K extends unknown[], D, R>(o: V): Observation<K, D, R> {
  return o as any;
}
