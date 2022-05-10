import { ObjectEntries, ObjectFromEntries } from 'spica/alias';
import { StorageChannel as IStorageChannel } from '../../../../../';
import { Observer } from '../../../../../internal';
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
    private readonly config: StorageChannel.Config<V>,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Storage channel "${name}" is already open.`);
    cache.add(name);
    this.cancellation.register(() =>
      void cache.delete(name));
    this.cancellation.register(
      storageEventStream.on([this.mode, this.name], ({ newValue }: StorageEvent): void => {
        const source = this.source;
        const memory = parse<V>(newValue);
        const link = this.link_;
        if (!source || !link) return;
        void (ObjectEntries(memory) as [Prop<V>, V[Prop<V>]][])
          .filter(isValidProperty)
          .forEach(([prop]) => {
            const newValue = memory[prop];
            const oldValue = source[prop];
            if (equal(newValue, oldValue)) return;
            source[prop] = newValue;
            this.config.migrate?.(link);
            const event = new StorageChannel.Event(StorageChannel.EventType.recv, prop, source[prop], oldValue);
            this.events.recv.emit([event.prop], event);
            (source[StorageChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>).emit([event.type, event.prop], event);
          });
      }));
  }
  private cancellation = new Cancellation();
  private readonly mode = this.storage === localStorage ? 'local' : 'session';
  private get alive(): boolean {
    return this.cancellation.isAlive;
  }
  public readonly events = {
    send: new Observation<[Prop<V>], { [P in Prop<V>]: StorageChannel.Event<V, P>; }[Prop<V>], void>({ limit: Infinity }),
    recv: new Observation<[Prop<V>], { [P in Prop<V>]: StorageChannel.Event<V, P>; }[Prop<V>], void>({ limit: Infinity }),
  } as const;
  private ensureAliveness(): void {
    if (!this.alive) throw new Error(`ClientChannel: Storage channel "${this.name}" is already closed.`);
  }
  private source?: V;
  private link_?: V;
  public link(): V {
    this.ensureAliveness();
    if (this.link_) return this.link_;
    const source = this.source = {
      ...parse<V>(this.storage.getItem(this.name)),
      [StorageChannel.Value.key]: this.name,
      [StorageChannel.Value.event]: new Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>({ limit: Infinity }),
    };
    this.link_ = build<V>(source, this.config.schema(), (prop, newValue, oldValue) => {
      if (!this.alive || this.source !== source) return;
      this.storage.setItem(this.name, JSON.stringify(ObjectFromEntries(ObjectEntries(source).filter(isValidProperty))));
      const event = new StorageChannel.Event<V>(StorageChannel.EventType.send, prop, newValue, oldValue);
      this.events.send.emit([event.prop], event);
      (source[StorageChannel.Value.event] as Observation<[StorageChannel.EventType, Prop<V>], StorageChannel.Event<V>, void>).emit([event.type, event.prop], event);
    });
    this.config.migrate?.(this.link_);
    return this.link();
  }
  public unlink(): boolean {
    const result = !!this.source;
    this.source = this.link_ = void 0;
    return result;
  }
  public close(): void {
    this.cancellation.cancel();
  }
  public destroy(): void {
    this.ensureAliveness();
    this.cancellation.cancel();
    this.storage.removeItem(this.name);
  }
}
export namespace StorageChannel {
  export import Config = IStorageChannel.Config;
  export interface Value {
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[EventType, P], Event<this, P>, void]; }[Prop<this>]>;
  }
  export namespace Value {
    export const key: typeof DAO.key = DAO.key;
    export const event: typeof DAO.event = DAO.event;
  }
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
