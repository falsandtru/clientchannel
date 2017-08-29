import { StoreChannel as IStoreChannel, StoreChannelConfig, StoreChannelObject as ChannelObject } from '../../../../../';
import { Observation } from 'spica/observation';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';

export class StoreChannel<K extends string, V extends ChannelObject<K>> extends ChannelStore<K, V> implements IStoreChannel<K, V> {
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
        const memory = this.get(key);
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
            .map((attr: keyof V) => {
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
              newVal !== oldVal ||
              !(Number.isNaN(newVal) && Number.isNaN(oldVal)));
          if (changes.length === 0) return;
          void migrate(link);
          void changes
            .forEach(({ attr, oldVal }) =>
              void cast(source).__event
                .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, memory[attr], oldVal)));
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
                value: new Observation<[StorageChannel.EventType], StorageChannel.Event<V>, any>()
              },
            }
          ),
          () => new this.Schema(),
          (attr: keyof V, newValue, oldValue) => (
            void this.add(new ChannelStore.Record<K, V>(key, { [attr]: newValue } as V)),
            void cast(this.sources.get(key)!).__event
              .emit([StorageChannel.EventType.send, attr], new StorageChannel.Event<V>(StorageChannel.EventType.send, attr, newValue, oldValue))),
          () => void this.log(key)))
          .get(key)!;
  }
  public destroy(): void {
    void super.destroy();
  }
}

function cast<K extends string, V extends ChannelObject<K>>(source: Partial<V>) {
  return source as V & InternalChannelObject<K>;

  interface InternalChannelObject<K extends string> extends ChannelObject<K> {
    readonly __event: Observation<[StorageChannel.EventType] | [StorageChannel.EventType, keyof this], StorageChannel.Event<this>, any>;
  }
}
