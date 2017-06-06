import { StorageChannel as IStorageChannel, StorageChannelObject as ChannelObject, StorageChannelEvent, StorageChannelEventType } from '../../../../../';
import { Observation, Cancellation } from 'spica';
import { SCHEMA, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { localStorage, sessionStorage, eventstream } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';

const cache = new Map<string, StorageChannel<ChannelObject>>();

export class StorageChannel<V extends ChannelObject> implements IStorageChannel<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    private readonly factory: () => V,
    migrate: (link: V) => void = () => void 0,
    private readonly log = {
      update(_name: string) { },
      delete(_name: string) { }
    }
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: WebStorage: Specified channel ${name} is already created.`);
    void cache.set(name, this);
    void this.cancellation.register(() =>
      void cache.delete(name));
    const source: V = <any>{
      [SCHEMA.KEY.NAME]: this.name,
      [SCHEMA.EVENT.NAME]: new Observation<[StorageChannelEventType] | [StorageChannelEventType, keyof V], StorageChannel.Event<V>, void>(),
      ...<Object>parse<V>(this.storage.getItem(this.name))
    };
    this.link_ = build(source, this.factory, (attr: keyof V, newValue, oldValue) => {
      void this.log.update(this.name);
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, attr) => {
        acc[attr] = source[attr];
        return acc;
      }, {})));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, attr, newValue, oldValue);
      void (<Observation<[StorageChannelEventType, keyof V], StorageChannel.Event<V>, any>>source.__event).emit([event.type, event.attr], event);
      void this.events.send.emit([event.attr], event);
    });
    void migrate(this.link_);
    void this.cancellation.register(
      eventstream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const item: V = parse<V>(newValue);
        void Object.keys(item)
          .filter(isValidPropertyName)
          .filter(isValidPropertyValue(item))
          .reduce<void>((_, attr: keyof V) => {
            const oldVal = source[attr];
            const newVal = item[attr];
            if (newVal === oldVal) return;
            source[attr] = newVal;
            void migrate(this.link_);
            const event = new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, source[attr], oldVal);
            void (<Observation<[StorageChannelEventType, keyof V], StorageChannel.Event<V>, any>>source.__event).emit([event.type, event.attr], event);
            void this.events.recv.emit([event.attr], event);
          }, void 0);
      }));
    void this.log.update(this.name);
    void this.cancellation.register(() =>
      void this.log.delete(this.name));
    void this.cancellation.register(() =>
        void this.storage.removeItem(this.name));
    void Object.freeze(this);
  }
  private cancellation = new Cancellation();
  private readonly mode = this.storage === localStorage ? 'local' : 'session';
  public readonly events = {
    send: new Observation<never[] | [keyof V], StorageChannel.Event<V>, void>(),
    recv: new Observation<never[] | [keyof V], StorageChannel.Event<V>, void>()
  };
  private readonly link_: V;
  public link(): V {
    return this.link_;
  }
  public destroy(): void {
    void this.cancellation.cancel();
  }
}
export namespace StorageChannel {
  export class Event<V extends ChannelObject> implements StorageChannelEvent<V> {
    constructor(
      public readonly type: EventType,
      public readonly attr: keyof V,
      public readonly newValue: any,
      public readonly oldValue: any
    ) {
      assert(typeof type === 'string');
      assert(typeof attr === 'string');
      void Object.freeze(this);
    }
  }
  export type EventType = StorageChannelEventType;
  export namespace EventType {
    export const send: StorageChannelEventType.Send = 'send';
    export const recv: StorageChannelEventType.Recv = 'recv';
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