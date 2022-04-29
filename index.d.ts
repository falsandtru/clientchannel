import { Observer } from 'spica/observer';
import { Prop } from './src/layer/data/database/value';

export namespace ChannelObject {
  export const meta: unique symbol;
  export const id: unique symbol;
  export const key: unique symbol;
  export const date: unique symbol;
  export const event: unique symbol;
}

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  constructor(name: string, config: StoreChannelConfig<K, V>);
  readonly events: {
    readonly load: Observer<[K, Prop<V> | '', StoreChannelEventType], StoreChannelEvent<K, Prop<V> | ''>, void>;
    readonly save: Observer<[K, Prop<V> | '', StoreChannelEventType], StoreChannelEvent<K, Prop<V> | ''>, void>;
    readonly loss: Observer<[K, Prop<V> | '', StoreChannelEventType], StoreChannelEvent<K, Prop<V> | ''>, void>;
  };
  sync(keys: readonly K[], timeout?: number): Promise<PromiseSettledResult<K>[]>;
  link(key: K, age?: number): V;
  delete(key: K): void;
  recent(timeout?: number): Promise<K[]>;
  recent(cb?: (key: K, keys: readonly K[]) => boolean | void, timeout?: number): Promise<K[]>;
  close(): void;
  destroy(): void;
}
export interface StoreChannelConfig<K extends string, V extends StoreChannelObject<K>> {
  schema: () => V;
  capacity?: number;
  age?: number;
  migrate?(link: V): void;
  destroy?(reason: unknown, event?: Event): boolean;
}
export interface StoreChannelObject<K extends string> {
  readonly [ChannelObject.meta]: StoreChannelObjectMetaData<K>;
  readonly [ChannelObject.id]: number;
  readonly [ChannelObject.key]: K;
  readonly [ChannelObject.date]: number;
  readonly [ChannelObject.event]: Observer<[StorageChannelEventType, Prop<this>], StorageChannelEvent<this>, void>;
}
export interface StoreChannelObjectMetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}
export interface StoreChannelEvent<K extends string, P extends string> {
  readonly type: StoreChannelEventType;
  readonly id: number;
  readonly key: K;
  readonly attr: P;
}
export type StoreChannelEventType =
  | StoreChannelEventType.Put
  | StoreChannelEventType.Delete
  | StoreChannelEventType.Snapshot;
export namespace StoreChannelEventType {
  export type Put = 'put';
  export type Delete = 'delete';
  export type Snapshot = 'snapshot';
}

export class StorageChannel<V extends StorageChannelObject> {
  constructor(name: string, config: StorageChannelConfig<V>);
  readonly events: {
    readonly send: Observer<[Prop<V>], { [P in Prop<V>]: StorageChannelEvent<V, P>; }[Prop<V>], void>;
    readonly recv: Observer<[Prop<V>], { [P in Prop<V>]: StorageChannelEvent<V, P>; }[Prop<V>], void>;
  };
  link(): V;
  close(): void;
  destroy(): void;
}
export interface StorageChannelConfig<V extends StorageChannelObject> {
  schema: () => V;
  migrate?(link: V): void;
}
export interface StorageChannelObject {
  readonly [ChannelObject.event]: Observer<[StorageChannelEventType, Prop<this>], StorageChannelEvent<this>, void>;
}
export interface StorageChannelEvent<V, P extends Prop<V> = Prop<V>> {
  readonly type: StorageChannelEventType;
  readonly attr: P;
  readonly newValue: V[P];
  readonly oldValue: V[P];
}
export type StorageChannelEventType =
  | StorageChannelEventType.Send
  | StorageChannelEventType.Recv;
export namespace StorageChannelEventType {
  export type Send = 'send';
  export type Recv = 'recv';
}

export class Ownership<K extends string> {
  constructor(name: K);
  take(key: K, age: number): boolean;
  take(key: K, age: number, wait: number): Promise<boolean>;
  extend(key: K, age: number): boolean;
  release(key: K): void;
  close(): void;
}
