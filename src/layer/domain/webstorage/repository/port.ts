import {LocalPort, LocalPortObject, LocalSocketEvent, LocalSocketEventType} from 'localsocket';
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

export class PortEvent implements LocalSocketEvent {
  constructor(
    public type: LocalSocketEventType,
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
    this.event['toJSON'] = (): void => void 0;
    void Object.freeze(this);
  }
  private event = new Observable<[LocalSocketEventType] | [LocalSocketEventType, string], PortEvent, void>();
  private cache = this.storage === localStorage ? LocalStorageObjectCache : SessionStorageObjectCache;
  private eventSource = this.storage === localStorage ? events.localStorage : events.sessionStorage;
  private uuid = uuid();
  public link(): T {
    if (this.cache.has(this.name)) return <T>this.cache.get(this.name);

    const source: T = assign<T>(
      <T><any>{
        [SCHEMA.KEY.NAME]: this.name,
        [SCHEMA.EVENT.NAME]: this.event
      },
      parse<T>(this.storage.getItem(this.name) || '{}')
    );
    const dao: T = build(source, this.factory, (attr, newValue, oldValue) => {
      void this.log.update(this.name);
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, prop) =>
        Object.defineProperty(acc, prop, {
          value: source[prop],
          enumerable: true,
          writable: true,
          configurable: true
        })
      , {})));
      void this.event.emit(['send', attr], new PortEvent('send', this.name, attr, newValue, oldValue));
    });
    const subscriber = ({newValue, oldValue}: StorageEvent): void => {
      if (newValue) {
        const item: T = parse<T>(newValue);
        void Object.keys(item)
          .filter(isValidPropertyName)
          .filter(isValidPropertyValue(item))
          .reduce((_, prop) => {
            const [newVal, oldVal] = [item[prop], source[prop]];
            if (newVal === oldVal) return;
            source[prop] = newVal;
            /*
            void document.defaultView.dispatchEvent(new StorageEvent(`storage:${this.name}`, {
              key: prop,
              oldValue: JSON.stringify(oldVal),
              newValue: JSON.stringify(newVal),
              url: location.href,
              storageArea: storage
            }));
            */
          }, void 0);
      }
      void this.event.emit(['recv'], new PortEvent('recv', this.name, '', newValue, oldValue));
    };
    void this.eventSource.on([this.name, this.uuid], subscriber);
    void this.cache.add(this.name, dao);
    void this.log.update(this.name);
    return dao;

    function parse<T>(item: string): T {
      try {
        return JSON.parse(item);
      }
      catch (_) {
        return <T>{};
      }
    }
  }
  public close(): void {
    void this.eventSource.off([this.name, this.uuid]);
    void this.cache.delete(this.name);
  }
  public destroy(): void {
    void this.close();
    void this.storage.removeItem(this.name);
    void this.log.delete(this.name);
  }
}
