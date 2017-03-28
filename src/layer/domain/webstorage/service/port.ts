import { LocalPort, LocalPortObject, LocalPortEvent, LocalPortEventType } from '../../../../../';
import { Observable } from 'spica';
import { SCHEMA, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { events } from '../service/event';
import { localStorage, sessionStorage } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';

const cache = new Map<string, Port<LocalPortObject>>();

export type PortEventType
  = typeof PortEventType.send
  | typeof PortEventType.recv;
export namespace PortEventType {
  export const send: 'send' = 'send';
  export const recv: 'recv' = 'recv';
}
export class PortEvent implements LocalPortEvent {
  constructor(
    public readonly type: LocalPortEventType,
    public readonly key: string,
    public readonly attr: string,
    public readonly newValue: any,
    public readonly oldValue: any
  ) {
    assert(typeof type === 'string');
    assert(typeof key === 'string');
    assert(typeof attr === 'string');
    void Object.freeze(this);
  }
}

export class Port<V extends LocalPortObject> implements LocalPort<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    private readonly factory: () => V,
    private readonly log = {
      update(_name: string) { },
      delete(_name: string) { }
    }
  ) {
    if (cache.has(name)) return <Port<V>>cache.get(name)!;
    void cache.set(name, this);
    const source: V = <any>{
      [SCHEMA.KEY.NAME]: this.name,
      [SCHEMA.EVENT.NAME]: new Observable<[LocalPortEventType] | [LocalPortEventType, string], PortEvent, void>(),
      ...<Object>parse<V>(this.storage.getItem(this.name))
    };
    this.link_ = build(source, this.factory, (attr, newValue, oldValue) => {
      void this.log.update(this.name);
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, attr) => {
        acc[attr] = source[attr];
        return acc;
      }, {})));
      const event = new PortEvent(PortEventType.send, this.name, attr, newValue, oldValue);
      void (<Observable<[LocalPortEventType, string], PortEvent, any>>source.__event).emit([event.type, event.attr], event);
      void this.events.send.emit([event.attr], event);
    });
    const subscriber = ({newValue}: StorageEvent): void => {
      const item: V = parse<V>(newValue);
      void Object.keys(item)
        .filter(isValidPropertyName)
        .filter(isValidPropertyValue(item))
        .reduce<void>((_, attr) => {
          const oldVal = source[attr];
          const newVal = item[attr];
          if (newVal === oldVal) return;
          source[attr] = newVal;
          const event = new PortEvent(PortEventType.recv, this.name, attr, newVal, oldVal);
          void (<Observable<[LocalPortEventType, string], PortEvent, any>>source.__event).emit([event.type, event.attr], event);
          void this.events.recv.emit([event.attr], event);
        }, void 0);
    };
    void this.eventSource.on([this.name], subscriber);
    void this.log.update(this.name);
    void Object.freeze(this);
  }
  private readonly eventSource = this.storage === localStorage ? events.localStorage : events.sessionStorage;
  public readonly events = {
    send: new Observable<never[] | [string], PortEvent, void>(),
    recv: new Observable<never[] | [string], PortEvent, void>()
  };
  private readonly link_: V;
  public link(): V {
    return this.link_;
  }
  public destroy(): void {
    void this.eventSource.off([this.name]);
    void this.storage.removeItem(this.name);
    void this.log.delete(this.name);
    void cache.delete(this.name);
  }
}

function parse<V>(item: string | undefined | null): V {
  try {
    return JSON.parse(item || '{}') || <V>{};
  }
  catch (_) {
    return <V>{};
  }
}
