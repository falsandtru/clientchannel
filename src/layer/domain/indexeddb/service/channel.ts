import { StoreChannel, StoreChannelObject as ChannelObject } from '../../../../../';
import { Observable, assign, concat } from 'spica';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { ChannelStore } from '../model/channel';
import { localStorage } from '../../../infrastructure/webstorage/api';
import { BroadcastChannel, BroadcastChannelObject, BroadcastChannelEvent } from '../../webstorage/api';

const cache = new WeakSet<Channel<string, ChannelObject<string>>>();

export class Channel<K extends string, V extends ChannelObject<K>> extends ChannelStore<K, V> implements StoreChannel<K, V> {
  constructor(
    name: string,
    private readonly factory: () => V,
    destroy: (err: DOMException | DOMError, ev: Event | null) => boolean = () => true,
    expiry: number = Infinity
  ) {
    super(name, destroy, expiry);
    if (cache.has(this)) return this;
    void cache.add(this);
    const keys = Object.keys(this.factory())
      .filter(isValidPropertyName);
    void this.broadcast.link().__event
      .on([BroadcastChannel.Event.Type.recv, 'msgs'], () =>
        void this.broadcast.link().recv()
          .reduce<void>((_, key) => void this.schema.data.fetch(key), void 0));
    void this.events.save
      .monitor([], ({key, attr}) =>
        void this.broadcast.link().send(new Message(key, attr, Date.now())));
    void this.events.load
      .monitor([], ({key, attr, type}) => {
        const source = this.sources.get(key);
        if (!source) return;
        switch (type) {
          case ChannelStore.Event.Type.put: {
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
                  .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event<V>(BroadcastChannel.Event.Type.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ChannelStore.Event.Type.delete: {
            const cache = this.factory();
            void keys
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr: keyof V) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void cast(source).__event
                  .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event<V>(BroadcastChannel.Event.Type.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ChannelStore.Event.Type.snapshot: {
            const cache = this.get(key);
            void keys
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr: keyof V) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void cast(source).__event
                  .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event<V>(BroadcastChannel.Event.Type.recv, attr, newVal, oldVal));
              }, void 0);
            return;
          }
        }
      });
    void Object.seal(this);
  }
  private readonly broadcast = new BroadcastChannel(this.name, localStorage, () => new BroadcastSchema<K>());
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
                get: () => this.meta(key)
              },
              __id: {
                get(this: ChannelObject<K>): number {
                  return this.__meta.id;
                }
              },
              __key: {
                get(this: ChannelObject<K>): string {
                  return this.__meta.key;
                }
              },
              __date: {
                get(this: ChannelObject<K>): number {
                  return this.__meta.date;
                }
              },
              __event: {
                value: new Observable<[BroadcastChannelEvent.Type], BroadcastChannelEvent<V>, any>()
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
              .emit([BroadcastChannel.Event.Type.send, attr], new BroadcastChannel.Event<V>(BroadcastChannel.Event.Type.send, attr, newValue, oldValue)))))
        .get(key)!;
  }
  public destroy(): void {
    void this.broadcast.destroy();
    void cache.delete(this);
    void super.destroy();
  }
}

function cast<K extends string, V extends ChannelObject<K>>(source: V) {
  return <V & InternalChannelObject<K>>source;

  interface InternalChannelObject<K extends string> extends ChannelObject<K> {
    readonly __event: Observable<[BroadcastChannelEvent.Type] | [BroadcastChannelEvent.Type, keyof this | ''], BroadcastChannelEvent<this>, any>;
  }
}

class Message<K extends string> {
  constructor(
    public readonly key: K,
    public readonly attr: string,
    public readonly date: number
  ) {
    assert(typeof key === 'string');
    assert(typeof attr === 'string');
    assert(typeof date === 'number');
    void Object.freeze(this);
  }
}

interface BroadcastSchema<K extends string> extends BroadcastChannelObject {
}
class BroadcastSchema<K extends string> {
  // msgs must be sorted by asc.
  public msgs: Message<K>[] = [];
  private readonly msgLatestUpdates_ = new Map<string, number>();
  public recv(): K[] {
    return this.msgs
      .filter(msg => {
        const received: boolean = msg.date <= this.msgLatestUpdates_.get(msg.key)!;
        void this.msgLatestUpdates_.set(msg.key, msg.date);
        return !received;
      })
      .map(msg => msg.key);
  }
  public send(msg: Message<K>): void {
    this.msgs = this.msgs
      .reduceRight<Message<K>[]>((ms, m) =>
        m.key === ms[0].key || m.date < ms[0].date - 1000 * 1e3
          ? ms
          : concat([m], ms)
      , [msg])
      .slice(-9);
  }
}
