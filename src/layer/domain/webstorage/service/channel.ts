import { ObjectKeys } from 'spica/alias';
import { StorageChannel as IStorageChannel } from '../../../../../';
import { Prop } from '../../../data/database/value';
import { Observation, Observer } from 'spica/observer';
import { Cancellation } from 'spica/cancellation';
import { equal } from 'spica/compare';
import { DAO, build, isValidPropertyName, isValidPropertyValue } from '../../dao/api';
import { localStorage, sessionStorage, storageEventStream } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';

const cache = new Set<string>();

export class StorageChannel<V extends StorageChannel.Value> implements IStorageChannel<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    factory: () => V,
    migrate?: (link: V) => void,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Storage channel "${name}" is already open.`);
    void cache.add(name);
    void this.cancellation.register(() =>
      void cache.delete(name));
    const source: V = {
      ...parse<V>(this.storage.getItem(this.name)),
      [StorageChannel.Value.key]: this.name,
      [StorageChannel.Value.event]: new Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>({ limit: Infinity }),
    };
    this.link_ = build<V>(source, factory, (prop, newValue, oldValue) => {
      if (!this.alive) return;
      void this.storage.setItem(this.name, JSON.stringify(ObjectKeys(source).filter(isValidPropertyName).filter(isValidPropertyValue(source)).reduce((acc, prop) => {
        acc[prop] = source[prop];
        return acc;
      }, {})));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, prop, newValue, oldValue);
      void this.events.send.emit([event.prop], event);
      void (source[StorageChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>).emit([event.type, event.prop], event);
    });
    void migrate?.(this.link_);
    void this.cancellation.register(
      storageEventStream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const item = parse<V>(newValue);
        void (ObjectKeys(item) as Prop<V>[])
          .filter(isValidPropertyName)
          .filter(isValidPropertyValue(item))
          .forEach(prop => {
            const oldVal = source[prop];
            const newVal = item[prop];
            if (equal(newVal, oldVal)) return;
            source[prop] = newVal;
            void migrate?.(this.link_);
            const event = new StorageChannel.Event(StorageChannel.EventType.recv, prop, source[prop], oldVal);
            void this.events.recv.emit([event.prop], event);
            void (source[StorageChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>).emit([event.type, event.prop], event);
          });
      }));
    assert(Object.freeze(this));
  }
  private cancellation = new Cancellation();
  private readonly mode = this.storage === localStorage ? 'local' : 'session';
  private get alive(): boolean {
    return this.cancellation.alive;
  }
  public readonly events = {
    send: new Observation<[Prop<V>], { [P in Prop<V>]: StorageChannel.Event<V, P>; }[Prop<V>], void>({ limit: Infinity }),
    recv: new Observation<[Prop<V>], { [P in Prop<V>]: StorageChannel.Event<V, P>; }[Prop<V>], void>({ limit: Infinity }),
  } as const;
  private ensureAliveness(): void {
    if (!this.alive) throw new Error(`ClientChannel: Storage channel "${this.name}" is already closed.`);
  }
  private readonly link_: V;
  public link(): V {
    void this.ensureAliveness();
    return this.link_;
  }
  public close(): void {
    void this.cancellation.cancel();
  }
  public destroy(): void {
    void this.ensureAliveness();
    void this.cancellation.cancel();
    void this.storage.removeItem(this.name);
  }
}
export namespace StorageChannel {
  export interface Value {
    readonly [Value.event]: Observer<[EventType, Prop<this>], Event<this>, void>;
  }
  export namespace Value {
    export const key: typeof DAO.key = DAO.key;
    export const event: typeof DAO.event = DAO.event;
  }
  export import Config = IStorageChannel.Config;
  export class Event<V, P extends Prop<V> = Prop<V>> implements IStorageChannel.Event<V, P> {
    constructor(
      public readonly type: EventType,
      public readonly prop: P,
      public readonly newValue: V[P],
      public readonly oldValue: V[P],
    ) {
      assert(typeof type === 'string');
      assert(typeof prop === 'string');
      assert(Object.freeze(this));
    }
  }
  export type EventType = IStorageChannel.EventType;
  export namespace EventType {
    export const send: IStorageChannel.EventType.Send = 'send';
    export const recv: IStorageChannel.EventType.Recv = 'recv';
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
