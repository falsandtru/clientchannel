import { StoreChannel as IStoreChannel, StoreChannelConfig, StoreChannelObject } from '../../../../../';
import { Observation, Observer } from 'spica/observation';
import { DiffStruct } from 'spica/type';
import { throttle } from 'spica/throttle';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> extends ChannelStore<K, V> implements IStoreChannel<K, V> {
  constructor(
    name: string,
    private readonly Schema: new () => V,
    {
      migrate = () => void 0,
      destroy = () => true,
      age = Infinity,
      size = Infinity,
      debug = false,
    }: StoreChannelConfig<K, V> & { size?: number; } = { Schema }
  ) {
    super(name, Object.keys(new Schema()).filter(isValidPropertyName).filter(isValidPropertyValue(new Schema())), destroy, age, size, debug);

    const attrs = <(keyof V)[]>Object.keys(new Schema())
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(new Schema()));

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
            .map((attr: keyof DiffStruct<V, StoreChannelObject<K>>) => {
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
            void cast(source.__event!)
              .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr as never, memory[attr as never], oldVal as never));
          }
        }
      });
    void Object.freeze(this);
  }
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, Partial<V>>();
  public link(key: K, age?: number): V {
    void this.fetch(key);
    void this.expire(key, age);
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links.set(key, build(
          Object.defineProperties(
            this.sources.set(key, this.get(key)).get(key)!,
            {
              __meta: {
                get: () =>
                  this.meta(key)
              },
              __id: {
                get: () =>
                  this.meta(key).id
              },
              __key: {
                get: () =>
                  this.meta(key).key
              },
              __date: {
                get: () =>
                  this.meta(key).date
              },
              __event: {
                value: new Observation<[StorageChannel.EventType], StorageChannel.Event<V>, void>({ limit: Infinity })
              },
            }),
          () => new this.Schema(),
          (attr, newValue, oldValue) => (
            void this.add(new ChannelStore.Record<K, V>(key, { [attr]: newValue } as V)),
            void cast(this.sources.get(key)!.__event!)
              .emit([StorageChannel.EventType.send, attr], new StorageChannel.Event<V>(StorageChannel.EventType.send, attr as never, newValue, oldValue))),
          throttle(100, () => this.has(key) && void this.log(key))))
          .get(key)!;
  }
  public destroy(): void {
    void super.destroy();
  }
}

function cast<V extends Observer<K, D, R>, K extends any[], D, R>(o: V): Observation<K, D, R> {
  return o as any;
}
