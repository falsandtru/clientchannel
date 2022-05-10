import { DAO, Prop } from './src/layer/domain/dao/api';
import { K, Observer } from './internal';

export class StoreChannel<M extends object> {
  constructor(name: string, config: StoreChannel.Config<M>);
  readonly events: {
    readonly load: Observer<{ [L in K<M>]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K<M>]>;
    readonly save: Observer<{ [L in K<M>]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K<M>]>;
    readonly loss: Observer<{ [L in K<M>]: { [P in Prop<M[L]>]: [[L, P, StoreChannel.EventType], StoreChannel.Event<L, P>, void]; }[Prop<M[L]>] | [[L, '', StoreChannel.EventType], StoreChannel.Event<L, ''>, void]; }[K<M>]>;
  };
  sync(keys: readonly K<M>[], timeout?: number): Promise<PromiseSettledResult<K<M>>[]>;
  link<L extends K<M>>(key: L, age?: number): M[L];
  unlink(link: M[K<M>]): boolean;
  unlink(key: K<M>): boolean;
  delete(key: K<M>): void;
  recent(timeout?: number): Promise<K<M>[]>;
  recent(cb?: (key: K<M>, keys: readonly K<M>[]) => boolean | void, timeout?: number): Promise<K<M>[]>;
  close(): void;
  destroy(): void;
}
export namespace StoreChannel {
  export interface Config<M extends object> {
    schemas: { readonly [L in K<M>]: (key: L) => M[L]; };
    capacity?: number;
    age?: number;
    migrate?(link: M[keyof M & string]): void;
    destroy?(reason: unknown, event?: global.Event): boolean;
  }
  export interface Value<K extends string = string> {
    readonly [Value.meta]: ValueMetaData<K>;
    readonly [Value.id]: number;
    readonly [Value.key]: K;
    readonly [Value.date]: number;
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[StorageChannel.EventType, P], StorageChannel.Event<this>, void]; }[Prop<this>]>;
  }
  export namespace Value {
    export const meta: typeof DAO.meta;
    export const id: typeof DAO.id;
    export const key: typeof DAO.key;
    export const date: typeof DAO.date;
    export const event: typeof DAO.event;
  }
  export interface ValueMetaData<K extends string> {
    readonly id: number;
    readonly key: K;
    readonly date: number;
  }
  export interface Event<K extends string, P extends string> {
    readonly type: EventType;
    readonly id: number;
    readonly key: K;
    readonly prop: P;
  }
  export type EventType =
    | EventType.Put
    | EventType.Delete
    | EventType.Snapshot;
  export namespace EventType {
    export type Put = 'put';
    export type Delete = 'delete';
    export type Snapshot = 'snapshot';
  }
  export const EventType: {
    readonly put: EventType.Put;
    readonly delete: EventType.Delete;
    readonly snapshot: EventType.Snapshot;
  };
}

export class StorageChannel<V extends StorageChannel.Value> {
  constructor(name: string, config: StorageChannel.Config<V>);
  readonly events: {
    readonly send: Observer<{ [P in Prop<V>]: [[P], StorageChannel.Event<V, P>, void]; }[Prop<V>]>;
    readonly recv: Observer<{ [P in Prop<V>]: [[P], StorageChannel.Event<V, P>, void]; }[Prop<V>]>;
  };
  link(): V;
  unlink(link?: V): boolean;
  close(): void;
  destroy(): void;
}
export namespace StorageChannel {
  export interface Config<V extends StorageChannel.Value> {
    schema: () => V;
    migrate?(link: V): void;
  }
  export interface Value {
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[EventType, P], Event<this, P>, void]; }[Prop<this>]>;
  }
  export namespace Value {
    export const key: typeof DAO.key;
    export const event: typeof DAO.event;
  }
  export interface Event<V, P extends Prop<V> = Prop<V>> {
    readonly type: EventType;
    readonly prop: P;
    readonly newValue: V[P];
    readonly oldValue: V[P];
  }
  export type EventType =
    | EventType.Send
    | EventType.Recv;
  export namespace EventType {
    export type Send = 'send';
    export type Recv = 'recv';
    export const send: Send;
    export const recv: Recv;
  }
}

export class Ownership<K extends string> {
  constructor(name: K);
  take(key: K, ttl: number): boolean;
  take(key: K, ttl: number, wait: number): Promise<boolean>;
  extend(key: K, ttl: number): boolean;
  release(key: K): void;
  close(): void;
}
