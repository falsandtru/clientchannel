import {LocalPort, LocalPortObject, LocalPortEvent, LocalPortEventType} from 'localsocket';
import {Observable, Set, assign, uuid} from 'arch-stream';
import {SCHEMA, build, isValidPropertyName, isValidPropertyValue} from '../../dao/api';
import {events} from '../service/event';
import {localStorage, sessionStorage} from '../../../infrastructure/webstorage/api';
import {fakeStorage} from '../service/storage';
import {noop} from '../../../../lib/noop';

const LocalStorageObjectCache = new Set<string, LocalPortObject>();
const LocalStorageSubscriber = new Set<string, (event: StorageEvent) => any>();

const SessionStorageObjectCache = new Set<string, LocalPortObject>();
const SessionStorageSubscriber = new Set<string, (event: StorageEvent) => any>();

export namespace PortEventTypes {
  export const send: 'send' = 'send';
  export const recv: 'recv' = 'recv';
}
export class PortEvent implements LocalPortEvent {
  constructor(
    public type: LocalPortEventType,
    public key: string,
    public attr: string,
    public newValue: any,
    public oldValue: any
  ) {
    assert(typeof type === 'string');
    assert(typeof key === 'string');
    assert(typeof attr === 'string');
  }
}

export function repository<T extends LocalPortObject>(
  name: string,
  storage: Storage = sessionStorage || fakeStorage,
  factory: () => T,
  log = {
    update(name: string) { },
    delete(name: string) { }
  }
): Port<T> {
  return new Port(name, storage, factory, log);
}

class Port<T extends LocalPortObject> implements LocalPort<T> {
  constructor(
    public name: string,
    private storage: Storage,
    private factory: () => T,
    private log = {
      update(name: string) { },
      delete(name: string) { }
    }
  ) {
    void Object.freeze(this);
  }
  private cache = this.storage === localStorage ? LocalStorageObjectCache : SessionStorageObjectCache;
  private eventSource = this.storage === localStorage ? events.localStorage : events.sessionStorage;
  private uuid = uuid();
  public events = {
    send: new Observable<[string], PortEvent, void>(),
    recv: new Observable<[string], PortEvent, void>()
  };
  public link(): T {
    if (this.cache.has(this.name)) return <T>this.cache.get(this.name);

    const source: T = assign<T>(
      <T><any>{
        [SCHEMA.KEY.NAME]: this.name,
        [SCHEMA.EVENT.NAME]: new Observable<[LocalPortEventType] | [LocalPortEventType, string], PortEvent, void>()
      },
      parse<T>(this.storage.getItem(this.name))
    );
    const dao: T = build(source, this.factory, (attr, newValue, oldValue) => {
      void this.log.update(this.name);
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, attr) => {
        acc[attr] = source[attr];
        return acc;
      }, {})));
      const event = new PortEvent(PortEventTypes.send, this.name, attr, newValue, oldValue);
      void (<Observable<[LocalPortEventType, string], PortEvent, any>>source.__event).emit([event.type, event.attr], event);
      void this.events.send.emit([event.attr], event);
    });
    const subscriber = ({newValue}: StorageEvent): void => {
      const item: T = parse<T>(newValue);
      void Object.keys(item)
        .filter(isValidPropertyName)
        .filter(isValidPropertyValue(item))
        .reduce((_, attr) => {
          const oldVal = source[attr];
          const newVal = item[attr];
          if (newVal === oldVal) return;
          source[attr] = newVal;
          const event = new PortEvent(PortEventTypes.recv, this.name, attr, newVal, oldVal);
          void (<Observable<[LocalPortEventType, string], PortEvent, any>>source.__event).emit([event.type, event.attr], event);
          void this.events.recv.emit([event.attr], event);
        }, void 0);
    };
    void this.eventSource.on([this.name, this.uuid], subscriber);
    void this.cache.add(this.name, dao);
    void this.log.update(this.name);
    return dao;

    function parse<T>(item: string): T {
      try {
        return JSON.parse(item) || <T>{};
      }
      catch (_) {
        return <T>{};
      }
    }
  }
  public destroy(): void {
    void this.eventSource.off([this.name, this.uuid]);
    void this.cache.delete(this.name);
    void this.storage.removeItem(this.name);
    void this.log.delete(this.name);
  }
}
