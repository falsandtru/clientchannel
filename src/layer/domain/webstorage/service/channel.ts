import { StorageChannel as IStorageChannel, StorageChannelObject, StorageChannelEvent, StorageChannelEventType } from '../../../../../';
import { Observation } from 'spica/observation';
import { Cancellation } from 'spica/cancellation';
import { DiffStruct } from 'spica/type';
import { SCHEMA, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { localStorage, sessionStorage, storageEventStream } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';

const cache = new Set<string>();

export class StorageChannel<V extends StorageChannelObject> implements IStorageChannel<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    Schema: new () => V,
    migrate: (link: V) => void = () => void 0,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Specified storage channel "${name}" is already opened.`);
    void cache.add(name);
    void this.cancellation.register(() =>
      void cache.delete(name));
    const source: V = {
      [SCHEMA.KEY.NAME]: this.name,
      [SCHEMA.EVENT.NAME]: new Observation<[StorageChannelEventType] | [StorageChannelEventType, keyof V], StorageChannel.Event<V>, void>(),
      ...parse<V>(this.storage.getItem(this.name)) as object
    } as any;
    this.link_ = build(source, () => new Schema(), (attr: keyof DiffStruct<V, StorageChannelObject>, newValue, oldValue) => {
      void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, attr) => {
        acc[attr] = source[attr];
        return acc;
      }, {})));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, attr, newValue, oldValue);
      void (source.__event as Observation<[StorageChannelEventType, keyof DiffStruct<V, StorageChannelObject>], StorageChannel.Event<V>, void>).emit([event.type, event.attr], event);
      void this.events.send.emit([event.attr], event);
    });
    void migrate(this.link_);
    void this.cancellation.register(
      storageEventStream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const item: V = parse<V>(newValue);
        void Object.keys(item)
          .filter(isValidPropertyName)
          .filter(isValidPropertyValue(item))
          .reduce<void>((_, attr: keyof DiffStruct<V, StorageChannelObject>) => {
            const oldVal = source[attr];
            const newVal = item[attr];
            if ([newVal].includes(oldVal)) return;
            source[attr] = newVal;
            void migrate(this.link_);
            const event = new StorageChannel.Event<V>(StorageChannel.EventType.recv, attr, source[attr], oldVal);
            void (source.__event as Observation<[StorageChannelEventType, keyof DiffStruct<V, StorageChannelObject>], StorageChannel.Event<V>, void>).emit([event.type, event.attr], event);
            void this.events.recv.emit([event.attr], event);
          }, void 0);
      }));
    void Object.freeze(this);
  }
  private cancellation = new Cancellation();
  private readonly mode = this.storage === localStorage ? 'local' : 'session';
  public readonly events = Object.freeze({
    send: new Observation<never[] | [keyof DiffStruct<V, StorageChannelObject>], StorageChannel.Event<V>, void>(),
    recv: new Observation<never[] | [keyof DiffStruct<V, StorageChannelObject>], StorageChannel.Event<V>, void>(),
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
      public readonly attr: keyof DiffStruct<V, StorageChannelObject>,
      public readonly newValue: V[keyof DiffStruct<V, StorageChannelObject>],
      public readonly oldValue: V[keyof DiffStruct<V, StorageChannelObject>],
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
