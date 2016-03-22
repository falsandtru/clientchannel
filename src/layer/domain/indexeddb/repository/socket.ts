import {LocalSocket, LocalSocketObject, LocalPort, LocalPortObject, LocalPortEvent, LocalPortEventType} from 'localsocket';
import {Observable, IObservableObserver, Set, Map, concat} from 'arch-stream';
import {build, SCHEMA, isValidPropertyName, isValidPropertyValue} from '../../dao/api';
import {SocketStore, SocketRecord, SocketValue, ESEventType} from '../model/schema/socket';
import {localStorage} from '../../../infrastructure/webstorage/api';
import {webstorage, WebStorageEvent, WebStorageEventType} from '../../webstorage/api';
import {KeyString} from '../model/types';
import {assign} from '../../lib/assign';

export function socket<T extends SocketValue>(
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
  private msgHeadSet_ = new Set<string, number>((o, n) => n > o ? n : o);
  public recv(): Message[] {
    return this.msgs
      .map(msg => new Message(msg.key, msg.attr, msg.date))
      .filter(msg => !this.msgHeadSet_.has(msg.key) || msg.date > this.msgHeadSet_.get(msg.key))
      .filter(msg => !void this.msgHeadSet_.add(msg.key, msg.date));
  }
  public send(msg: Message): void {
    assert(msg instanceof Message);
    this.msgs = concat([msg], this.msgs.slice(0, 9));
  }
}

class Socket<T extends SocketValue & LocalSocketObject> extends SocketStore<T> implements LocalSocket<T> {
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
          case ESEventType.put: {
            const oldVal = source[attr];
            const newVal = this.get(key)[attr];
            source[attr] = newVal;
            void (<Observable<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>>source.__event)
              .emit([WebStorageEventType.recv, attr], new WebStorageEvent(WebStorageEventType.recv, key, attr, newVal, oldVal));
            return;
          }
          case ESEventType.delete: {
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
          case ESEventType.snapshot: {
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
  private links = new Set<string, T>();
  private sources = new Set<string, T>();
  public link(key: string, expiry?: number): T {
    void this.expire(key, expiry);
    if (this.links.has(key)) return this.links.get(key);
    return this.links.add(key, build(
      Object.defineProperties(
        this.sources.add(key, assign<T>({}, this.get(key))),
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
        void this.add(new SocketRecord(KeyString(key), <T>{ [attr]: newValue }));
        void (<Observable<[LocalPortEventType, string], LocalPortEvent, void>>this.sources.get(key).__event)
          .emit([WebStorageEventType.send, attr], new WebStorageEvent(WebStorageEventType.send, key, attr, newValue, oldValue));
      })
    );
  }
  public destroy(): void {
    void this.proxy.destroy();
    void super.destroy();
  }
}
