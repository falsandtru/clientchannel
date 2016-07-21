import { LocalSocket, LocalSocketObject, LocalPortObject, LocalPortEvent, LocalPortEventType } from 'localsocket';
import { Observable, clone, concat } from 'spica';
import { build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { SocketStore } from '../model/socket';
import { localStorage } from '../../../infrastructure/webstorage/api';
import { webstorage, WebStorageEvent, WebStorageEventType } from '../../webstorage/api';

export function socket<K extends string, V extends SocketStore.Value<K>>(
  name: string,
  factory: () => V,
  destroy: (err: DOMError, event: Event | null) => boolean = () => true,
  expiry = Infinity
): Socket<K, V> {
  return new Socket<K, V>(name, factory, expiry, destroy);
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

interface Port<K extends string> extends LocalPortObject {
}
class Port<K extends string> {
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
    assert(msg instanceof Message);
    this.msgs = concat([msg], this.msgs.slice(0, 9));
  }
}

class Socket<K extends string, V extends SocketStore.Value<K>> extends SocketStore<K, V> implements LocalSocket<K, V> {
  constructor(
    database: string,
    private readonly factory: () => V,
    expiry: number,
    destroy: (err: DOMError, ev: Event) => boolean
  ) {
    super(database, destroy, expiry);
    void this.port.__event
      .on([WebStorageEventType.recv, 'msgs'], () =>
        void this.port.recv()
          .reduce<void>((_, key) => void this.schema.data.update(key), void 0));
    void this.events.save
      .monitor([], ({key, attr}) =>
        void this.port.send(new Message(key, attr, Date.now())));
    void this.events.load
      .monitor([], ({key, attr, type}) => {
        const source: V & LocalSocketObject<K> | undefined = this.sources.get(key);
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
    void Object.freeze(this);
  }
  private readonly proxy = webstorage(this.database, localStorage, () => new Port<K>());
  private readonly port = this.proxy.link();
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
    void this.proxy.destroy();
    void super.destroy();
  }
}
