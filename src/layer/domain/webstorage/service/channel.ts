import { StorageChannel as IStorageChannel, StorageChannelObject, StorageChannelEvent, StorageChannelEventType } from '../../../../../';
import { Observation } from 'spica/observer';
import { Cancellation } from 'spica/cancellation';
import { Schema, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { localStorage, sessionStorage, storageEventStream } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';

const cache = new Set<string>();

export class StorageChannel<V extends StorageChannelObject> implements IStorageChannel<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    factory: () => V,
    migrate: (link: V) => void = () => void 0,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Storage channel "${name}" is already open.`);
    void cache.add(name);
    void this.cancellation.register(() =>
      void cache.delete(name));
    const source: V = {
      ...parse<V>(this.storage.getItem(this.name)),
      [Schema.key]: this.name,
      [Schema.event]: new Observation<[StorageChannelEventType] | [StorageChannelEventType, keyof V], StorageChannel.Event<V>, void>({ limit: Infinity }),
    };
    this.link_ = build<V>(source, factory, (attr, newValue, oldValue) => {
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, attr) => {
        acc[attr] = source[attr];
        return acc;
      }, {})));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, attr, newValue, oldValue);
      void (source[Schema.event] as Observation<[StorageChannelEventType, Extract<keyof V, string>], StorageChannel.Event<V>, void>).emit([event.type, event.attr], event);
      void this.events.send.emit([event.attr], event);
    });
    void migrate(this.link_);
    void this.cancellation.register(
      storageEventStream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const item = parse<V>(newValue);
        void (Object.keys(item) as Extract<keyof V, string>[])
          .filter(isValidPropertyName)
          .filter(isValidPropertyValue(item))
          .forEach(attr => {
            const oldVal = source[attr];
            const newVal = item[attr];
            if ([newVal].includes(oldVal)) return;
            source[attr] = newVal;
            void migrate(this.link_);
            const event = new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, source[attr], oldVal);
            void (source[Schema.event] as Observation<[StorageChannelEventType, Extract<keyof V, string>], StorageChannel.Event<V>, void>).emit([event.type, event.attr], event);
            void this.events.recv.emit([event.attr], event);
          });
      }));
    void Object.freeze(this);
  }
  private cancellation = new Cancellation();
  private readonly mode = this.storage === localStorage ? 'local' : 'session';
  public readonly events = Object.freeze({
    send: new Observation<[Extract<keyof V, string>], StorageChannel.Event<V>, void>({ limit: Infinity }),
    recv: new Observation<[Extract<keyof V, string>], StorageChannel.Event<V>, void>({ limit: Infinity }),
  });
  private readonly link_: V;
  public link(): V {
    return this.link_;
  }
  public close(): void {
    void this.cancellation.cancel();
  }
  public destroy(): void {
    void this.cancellation.cancel();
    void this.storage.removeItem(this.name);
  }
}
export namespace StorageChannel {
  export class Event<V> implements StorageChannelEvent<V> {
    constructor(
      public readonly type: EventType,
      public readonly attr: Extract<keyof V, string>,
      public readonly newValue: V[Extract<keyof V, string>],
      public readonly oldValue: V[Extract<keyof V, string>],
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
    return JSON.parse(item || '{}') || {} as V;
  }
  catch {
    return {} as V;
  }
}
