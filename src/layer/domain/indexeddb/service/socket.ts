import { LocalSocket, LocalSocketObject, LocalPortObject, LocalPortEvent, LocalPortEventType } from 'localsocket';
import { Observable, clone, concat } from 'spica';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { SocketStore } from '../model/socket';
import { localStorage } from '../../../infrastructure/webstorage/api';
import { Port, WebStorageEvent, WebStorageEventType } from '../../webstorage/api';

const cache = new WeakSet<Socket<string, SocketStore.Value<string>>>();

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

interface PortSchema<K extends string> extends LocalPortObject {
}
class PortSchema<K extends string> {
  // msgs must be sorted by asc.
  public msgs: Message<K>[] = [];
  private readonly msgLatestUpdates_ = new Map<string, number>();
  public recv(): K[] {
    return this.msgs
      .filter(msg => {
        const received: boolean = msg.date <= this.msgLatestUpdates_.get(msg.key);
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

export class Socket<K extends string, V extends SocketStore.Value<K>> extends SocketStore<K, V> implements LocalSocket<K, V> {
  constructor(
    name: string,
    private readonly factory: () => V,
    destroy: (err: DOMError, ev: Event | null) => boolean = () => true,
    expiry: number = Infinity
  ) {
    super(name, destroy, expiry);
    if (cache.has(this)) return this;
    void cache.add(this);
    void this.port.link().__event
      .on([WebStorageEventType.recv, 'msgs'], () =>
        void this.port.link().recv()
          .reduce<void>((_, key) => void this.schema.data.fetch(key), void 0));
    void this.events.save
      .monitor([], ({key, attr}) =>
        void this.port.link().send(new Message(key, attr, Date.now())));
    void this.events.load
      .monitor([], ({key, attr, type}) => {
        const source = this.sources.get(key);
        if (!source) return;
        switch (type) {
          case SocketStore.EventType.put: {
            const oldVal = source[attr];
            const newVal = this.get(key)[attr];
            source[attr] = newVal;
            void (<Observable<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>>source.__event)
              .emit([WebStorageEventType.recv, attr], new WebStorageEvent(WebStorageEventType.recv, key, attr, newVal, oldVal));
            return;
          }
          case SocketStore.EventType.delete: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr) => {
                const oldVal = source[attr];
                const newVal = <void>void 0;
                source[attr] = newVal;
                void (<Observable<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>>source.__event)
                  .emit([WebStorageEventType.recv, attr], new WebStorageEvent(WebStorageEventType.recv, key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case SocketStore.EventType.snapshot: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .sort()
              .reduce<void>((_, attr) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void (<Observable<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>>source.__event)
                  .emit([WebStorageEventType.recv, attr], new WebStorageEvent(WebStorageEventType.recv, key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
        }
      });
    void Object.seal(this);
  }
  private readonly port = new Port(this.name, localStorage, () => new PortSchema<K>());
  private readonly links = new Map<K, V>();
  private readonly sources = new Map<K, V>();
  public link(key: K, expiry?: number): V {
    void this.expire(key, expiry);
    return this.links.has(key)
      ? this.links.get(key)!
      : this.links
        .set(key, build(
          Object.defineProperties(
            (void this.sources.set(key, clone<V>({}, this.get(key))), this.sources.get(key)),
            {
              __meta: {
                get: () => this.meta(key)
              },
              __id: {
                get(this: LocalSocketObject<K>): number {
                  return this.__meta.id;
                }
              },
              __key: {
                get(this: LocalSocketObject<K>): string {
                  return this.__meta.key;
                }
              },
              __date: {
                get(this: LocalSocketObject<K>): number {
                  return this.__meta.date;
                }
              },
              __event: {
                value: new Observable<[LocalPortEventType], LocalPortEvent, any>()
              }
            }
          ),
          this.factory,
          (attr, newValue, oldValue) => (
            void this.add(new SocketStore.Record(<K>key, <V>{ [attr]: newValue })),
            void (<Observable<[LocalPortEventType, string], LocalPortEvent, void>>this.sources.get(key)!.__event)
              .emit([WebStorageEventType.send, attr], new WebStorageEvent(WebStorageEventType.send, key, attr, newValue, oldValue)))))
        .get(key)!;
  }
  public destroy(): void {
    void this.port.destroy();
    void cache.delete(this);
    void super.destroy();
  }
}
