import {LocalSocket, LocalPort, LocalSocketObject, LocalSocketEvent, LocalSocketEventType} from 'localsocket';
import {Observable, IObservableObserver, Set, Map, concat} from 'arch-stream';
import {build, SCHEMA, isValidPropertyName, isValidPropertyValue} from '../../dao/api';
import {SocketStore, SocketRecord, SocketValue, ESEventType} from '../model/schema/socket';
import {localStorage} from '../../../infrastructure/webstorage/api';
import {repository as portRepository, PortEvent} from '../../webstorage/repository/port';
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
interface Port extends LocalSocketObject {
}

class Socket<T extends SocketValue & LocalSocketObject> extends SocketStore<T> implements LocalSocket<T> {
  constructor(
    name: string,
    protected factory: () => T,
    expiry: number,
    destroy: (err: DOMError, ev: Event) => boolean
  ) {
    super(name, destroy, expiry);
    void this.port.__event
      .monitor([], ({type, newValue}) => {
        switch (type) {
          case 'send': {
            return;
          }
          case 'recv': {
            return void this.port.recv()
              .reduce((_, msg) => void this.schema.data.update(msg.key), void 0);
          }
        }
        assert(false);
      });
    void this.events.save
      .monitor([], ({id, key, attr}) => {
        void this.port.send(new Message(key, attr, Date.now()));
      });
    void this.events.load
      .monitor([], ({id, key, attr, type}) => {
        const source: T & LocalSocketObject = this.sources.get(key);
        if (!source) return;
        switch (type) {
          case ESEventType.put: {
            const oldVal = source[attr];
            const newVal = this.get(key)[attr];
            source[attr] = newVal;
            void (<Observable<LocalSocketEventType, LocalSocketEvent, void>>source.__event)
              .emit(<any>['recv', attr], new PortEvent('recv', key, attr, newVal, oldVal));
            return;
          }
          case ESEventType.delete: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .reduce((_, attr) => {
                const oldVal = source[attr];
                const newVal = <void>void 0;
                source[attr] = newVal;
                void (<Observable<LocalSocketEventType, LocalSocketEvent, void>>source.__event)
                  .emit(<any>['recv', attr], new PortEvent('recv', key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
          case ESEventType.snapshot: {
            const cache = this.get(key);
            void Object.keys(cache)
              .filter(isValidPropertyName)
              .filter(isValidPropertyValue(cache))
              .reduce((_, attr) => {
                const oldVal = source[attr];
                const newVal = cache[attr];
                source[attr] = newVal;
                void (<Observable<LocalSocketEventType, LocalSocketEvent, void>>source.__event)
                  .emit(<any>['recv', attr], new PortEvent('recv', key, attr, newVal, oldVal));
              }, void 0);
            return;
          }
        }
      });
  }
  protected proxy = portRepository(this.name, localStorage, () => new Port());
  protected port = this.proxy.link();
  protected links = new Set<string, T>();
  protected sources = new Set<string, T>();
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
            value: new Observable<LocalSocketEventType, LocalSocketEvent, any>()
          }
        }
      ),
      this.factory,
      (attr, newValue, oldValue) => {
        void this.add(new SocketRecord(KeyString(key), <T>{ [attr]: newValue }));
        void (<Observable<LocalSocketEventType, LocalSocketEvent, void>>this.sources.get(key).__event)
          .emit(<any>['send', attr], new PortEvent('send', key, attr, newValue, oldValue));
      })
    );
  }
  public close(): void {
    void this.proxy.close();
  }
  public destroy(): void {
    void this.close();
    void this.proxy.destroy();
    void super.destroy();
  }
}
