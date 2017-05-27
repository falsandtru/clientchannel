import { StoreChannel as IStoreChannel, StoreChannelObject as ChannelObject } from '../../../../../';
import { Observable, assign } from 'spica';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { StorageChannel } from '../../webstorage/api';
import { BroadcastChannel } from '../../broadcast/api';

export class StoreChannel<K extends string, V extends ChannelObject<K>> extends ChannelStore<K, V> implements IStoreChannel<K, V> {
  constructor(
    name: string,
    private readonly factory: () => V,
    destroy: (err: DOMException | DOMError, ev: Event | null) => boolean = () => true,
    size: number = Infinity,
    expiry: number = Infinity,
  ) {
    super(name, Object.keys(factory()).filter(isValidPropertyName).filter(isValidPropertyValue(factory())), destroy, size, expiry);
    const keys = Object.keys(this.factory())
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(this.factory()));
    void this.broadcast.listen(ev =>
      void this.fetch(ev instanceof MessageEvent ? <K>ev.data : <K>ev.newValue));
    void this.events.save
      .monitor([], ({key}) =>
        void this.broadcast.post(key));
    void this.events.load
      .monitor([], ({key, attr, type}) => {
        const source = this.sources.get(key);
        if (!source) return;
        switch (type) {
          case ChannelStore.EventType.put: {
            const cache = this.get(key);
            void keys
              .filter(attr_ => attr_ === attr)
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr: keyof V) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void cast(source).__event
                  .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ChannelStore.EventType.delete: {
            const cache = this.factory();
            void keys
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr: keyof V) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void cast(source).__event
                  .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ChannelStore.EventType.snapshot: {
            const cache = this.get(key);
            void keys
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr: keyof V) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void cast(source).__event
                  .emit([StorageChannel.EventType.recv, attr], new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
        }
      });
    void Object.seal(this);
  }
  private readonly broadcast = new BroadcastChannel<K>(this.name);
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, V>();
  public link(key: K, expiry?: number): V {
    void this.expire(key, expiry);
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links
        .set(key, build(
          Object.defineProperties(
            this.sources.set(key, assign<V>({}, this.get(key))).get(key)!,
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
                value: new Observable<[StorageChannel.EventType], StorageChannel.Event<V>, any>()
              },
              __transaction: {
                value: (cb: () => any, complete: (err?: DOMException | DOMError | Error) => any) => this.transaction(key, cb, complete)
              }
            }
          ),
          this.factory,
          (attr: keyof V, newValue, oldValue) => (
            void this.add(new ChannelStore.Record<K, V>(key, <V>{ [attr]: newValue })),
            void cast(this.sources.get(key)!).__event
              .emit([StorageChannel.EventType.send, attr], new StorageChannel.Event<V>(StorageChannel.EventType.send, attr, newValue, oldValue)))))
        .get(key)!;
  }
  public destroy(): void {
    void this.broadcast.close();
    void super.destroy();
  }
}

function cast<K extends string, V extends ChannelObject<K>>(source: V) {
  return <V & InternalChannelObject<K>>source;

  interface InternalChannelObject<K extends string> extends ChannelObject<K> {
    readonly __event: Observable<[StorageChannel.EventType] | [StorageChannel.EventType, keyof this | ''], StorageChannel.Event<this>, any>;
  }
}
