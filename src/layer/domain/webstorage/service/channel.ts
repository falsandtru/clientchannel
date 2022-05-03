import { ObjectEntries, ObjectFromEntries } from 'spica/alias';
import { StorageChannel as IStorageChannel } from '../../../../../';
import { Observer } from '../../../../../observer';
import { DAO, Prop, isValidProperty, build } from '../../dao/api';
import { localStorage, sessionStorage, storageEventStream } from '../../../infrastructure/webstorage/api';
import { StorageLike, fakeStorage } from '../model/storage';
import { Observation } from 'spica/observer';
import { Cancellation } from 'spica/cancellation';
import { equal } from 'spica/compare';

const cache = new Set<string>();

export class StorageChannel<V extends StorageChannel.Value> implements IStorageChannel<V> {
  constructor(
    public readonly name: string,
    private readonly storage: StorageLike = sessionStorage || fakeStorage,
    schema: () => V,
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
    this.link_ = build<V>(source, schema(), (prop, newValue, oldValue) => {
      if (!this.alive) return;
      void this.storage.setItem(this.name, JSON.stringify(ObjectFromEntries(ObjectEntries(source).filter(isValidProperty))));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, prop, newValue, oldValue);
      void this.events.send.emit([event.prop], event);
      void (source[StorageChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>).emit([event.type, event.prop], event);
    });
    void migrate?.(this.link_);
    void this.cancellation.register(
      storageEventStream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const item = parse<V>(newValue);
        void (ObjectEntries(item) as [Prop<V>, V[Prop<V>]][])
          .filter(isValidProperty)
          .forEach(([prop]) => {
            const oldValue = source[prop];
            const newValue = item[prop];
            if (equal(newValue, oldValue)) return;
            source[prop] = newValue;
            void migrate?.(this.link_);
            const event = new StorageChannel.Event(StorageChannel.EventType.recv, prop, source[prop], oldValue);
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
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[EventType, P], Event<this, P>, void]; }[Prop<this>]>;
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
