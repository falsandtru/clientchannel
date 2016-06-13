import {LocalSocket, LocalSocketObject, LocalPort, LocalPortObject, LocalPortEvent, LocalPortEventType} from 'localsocket';
import {Observable, Observer, clone, concat} from 'spica';
import {build, SCHEMA, isValidPropertyName, isValidPropertyValue} from '../../dao/api';
import {SocketStore} from '../model/socket';
import {localStorage} from '../../../infrastructure/webstorage/api';
import {webstorage, WebStorageEvent, WebStorageEventType} from '../../webstorage/api';
import {KeyString} from '../../../data/constraint/types';

export function socket<T extends SocketStore.Value>(
  name: string,
  factory: () => T,
  destroy: (err: DOMError, event: Event) => boolean,
  expiry = Infinity
) {
  return new Socket<T>(name, factory, expiry, destroy);
}

class Message {
  constructor(
    public key: KeyString,
    public attr: string,
    public date: number
  ) {
    assert(typeof key === 'string');
    assert(typeof attr === 'string');
    assert(typeof date === 'number');
  }
}

interface Port extends LocalPortObject {
}
class Port {
  public msgs: Message[] = [];
  private msgHeadSet_ = new Map<string, number>();
  public recv(): Message[] {
    return this.msgs
      .map(msg => new Message(msg.key, msg.attr, msg.date))
      .filter(msg => !this.msgHeadSet_.has(msg.key) || msg.date > this.msgHeadSet_.get(msg.key))
      .filter(msg => !void this.msgHeadSet_.set(msg.key, msg.date));
  }
  public send(msg: Message): void {
    assert(msg instanceof Message);
    this.msgs = concat([msg], this.msgs.slice(0, 9));
  }
}

class Socket<T extends SocketStore.Value> extends SocketStore<T> implements LocalSocket<T> {
  constructor(
    database: string,
    private factory: () => T,
    expiry: number,
    destroy: (err: DOMError, ev: Event) => boolean
  ) {
    super(database, destroy, expiry);
    void this.port.__event
      .on([WebStorageEventType.recv, 'msgs'], () => {
        void this.port.recv()
          .reduce((_, msg) => void this.schema.data.update(msg.key), void 0);
      });
    void this.events.save
      .monitor(<any>[], ({id, key, attr}) => {
        void this.port.send(new Message(key, attr, Date.now()));
      });
    void this.events.load
      .monitor(<any>[], ({id, key, attr, type}) => {
        const source: T & LocalSocketObject = this.sources.get(key);
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
              .reduce((_, attr) => {
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
              .reduce((_, attr) => {
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
  private proxy = webstorage(this.database, localStorage, () => new Port());
  private port = this.proxy.link();
  private links = new Map<string, T>();
  private sources = new Map<string, T>();
  public link(key: string, expiry?: number): T {
    void this.expire(key, expiry);
    return this.links.has(key)
      ? this.links.get(key)
      : this.links
        .set(key, build(
          Object.defineProperties(
            (void this.sources.set(key, clone<T>({}, this.get(key))), this.sources.get(key)),
            {
              __meta: {
                get: () => this.meta(key)
              },
              __id: {
                get(): number {
                  return (<LocalSocketObject>this).__meta.id;
                }
              },
              __key: {
                get(): string {
                  return (<LocalSocketObject>this).__meta.key;
                }
              },
              __date: {
                get(): number {
                  return (<LocalSocketObject>this).__meta.date;
                }
              },
              __event: {
                value: new Observable<[LocalPortEventType], LocalPortEvent, any>()
              }
            }
          ),
          this.factory,
          (attr, newValue, oldValue) => {
            void this.add(new SocketStore.Record(KeyString(key), <T>{ [attr]: newValue }));
            void (<Observable<[LocalPortEventType, string], LocalPortEvent, void>>this.sources.get(key).__event)
              .emit([WebStorageEventType.send, attr], new WebStorageEvent(WebStorageEventType.send, key, attr, newValue, oldValue));
          }))
        .get(key);
  }
  public destroy(): void {
    void this.proxy.destroy();
    void super.destroy();
  }
}
