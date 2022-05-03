import { DAO, Prop } from './src/layer/domain/dao/api';
import { Observer } from './observer';

export class StoreChannel<K extends string, V extends StoreChannel.Value<K>> {
  constructor(name: string, config: StoreChannel.Config<K, V>);
  readonly events: {
    readonly load: Observer<{ [P in Prop<V>]: [[K, P, StoreChannel.EventType], StoreChannel.Event<K, P>, void]; }[Prop<V>] | [[K, '', StoreChannel.EventType], StoreChannel.Event<K, ''>, void]>;
    readonly save: Observer<{ [P in Prop<V>]: [[K, P, StoreChannel.EventType], StoreChannel.Event<K, P>, void]; }[Prop<V>] | [[K, '', StoreChannel.EventType], StoreChannel.Event<K, ''>, void]>;
    readonly loss: Observer<{ [P in Prop<V>]: [[K, P, StoreChannel.EventType], StoreChannel.Event<K, P>, void]; }[Prop<V>] | [[K, '', StoreChannel.EventType], StoreChannel.Event<K, ''>, void]>;
  };
  sync(keys: readonly K[], timeout?: number): Promise<PromiseSettledResult<K>[]>;
  link(key: K, age?: number): V;
  delete(key: K): void;
  recent(timeout?: number): Promise<K[]>;
  recent(cb?: (key: K, keys: readonly K[]) => boolean | void, timeout?: number): Promise<K[]>;
  close(): void;
  destroy(): void;
}
export namespace StoreChannel {
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
  export interface Config<K extends string, V extends StoreChannel.Value<K>> {
    schema: () => V;
    capacity?: number;
    age?: number;
    migrate?(link: V): void;
    destroy?(reason: unknown, event?: global.Event): boolean;
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
  close(): void;
  destroy(): void;
}
export namespace StorageChannel {
  export interface Value {
    readonly [Value.event]: Observer<{ [P in Prop<this>]: [[EventType, P], Event<this, P>, void]; }[Prop<this>]>;
  }
  export namespace Value {
    export const key: typeof DAO.key;
    export const event: typeof DAO.event;
  }
  export interface Config<V extends StorageChannel.Value> {
    schema: () => V;
    migrate?(link: V): void;
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
  take(key: K, age: number): boolean;
  take(key: K, age: number, wait: number): Promise<boolean>;
  extend(key: K, age: number): boolean;
  release(key: K): void;
  close(): void;
}
