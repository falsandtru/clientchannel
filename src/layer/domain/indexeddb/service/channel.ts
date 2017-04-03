import { StoreChannel, StoreChannelObject as ChannelObject } from '../../../../../';
import { Observable, clone, concat } from 'spica';
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
            const oldVal = source[attr];
            const newVal = this.get(key)[attr];
            source[attr] = newVal;
            void source.__event
              .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event(BroadcastChannel.Event.Type.recv, key, attr, newVal, oldVal));
            return;
          }
          case ChannelStore.Event.Type.delete: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr) => {
                const oldVal = source[attr];
                const newVal = <void>void 0;
                source[attr] = newVal;
                void source.__event
                  .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event(BroadcastChannel.Event.Type.recv, key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ChannelStore.Event.Type.snapshot: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void source.__event
                  .emit([BroadcastChannel.Event.Type.recv, attr], new BroadcastChannel.Event(BroadcastChannel.Event.Type.recv, key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
        }
      });
    void Object.seal(this);
  }
  private readonly broadcast = new BroadcastChannel(this.name, localStorage, () => new BroadcastSchema<K>());
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, InternalChannelObject<K>>();
  public link(key: K, expiry?: number): V {
    void this.expire(key, expiry);
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links
        .set(key, build(
          Object.defineProperties(
            (void this.sources.set(key, clone<{}, InternalChannelObject<K>>({}, <any><V>this.get(key))), this.sources.get(key)),
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
                value: new Observable<[BroadcastChannelEvent.Type], BroadcastChannelEvent, any>()
              },
              __transaction: {
                value: (cb: () => any, complete: (err?: DOMException | DOMError | Error) => any) => this.transaction(key, cb, complete)
              }
            }
          ),
          this.factory,
          (attr, newValue, oldValue) => (
            void this.add(new ChannelStore.Record(<K>key, <V>{ [attr]: newValue })),
            void this.sources.get(key)!.__event
              .emit([BroadcastChannel.Event.Type.send, attr], new BroadcastChannel.Event(BroadcastChannel.Event.Type.send, key, attr, newValue, oldValue)))))
        .get(key)!;
  }
  public destroy(): void {
    void this.broadcast.destroy();
    void cache.delete(this);
    void super.destroy();
  }
}

interface InternalChannelObject<K extends string> extends ChannelObject<K> {
  readonly __event: Observable<[BroadcastChannelEvent.Type] | [BroadcastChannelEvent.Type, string], BroadcastChannelEvent, any>;
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
