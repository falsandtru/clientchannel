import { Observer } from 'spica/observation';
import { AtomicPromise } from 'spica/promise';

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
    readonly load: Observer<[K] | [K, Extract<keyof V | '', string>] | [K, Extract<keyof V | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly save: Observer<[K] | [K, Extract<keyof V | '', string>] | [K, Extract<keyof V | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly loss: Observer<[K] | [K, Extract<keyof V | '', string>] | [K, Extract<keyof V | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
  };
  sync(keys: K[], cb?: (results: AtomicPromise<K>[]) => void): void;
  link(key: K, age?: number): V;
  delete(key: K): void;
  recent(limit: number, cb: (keys: K[], err?: DOMException | Error | null) => void): void;
  close(): void;
  destroy(): void;
}
export interface StoreChannelConfig<K extends string, V extends StoreChannelObject<K>> {
  schema: () => V;
  age?: number;
  migrate?(link: V): void;
  destroy?(reason: unknown, event?: Event): boolean;
  debug?: boolean;
}
export interface StoreChannelObject<K extends string> {
  readonly [ChannelObject.meta]: StoreChannelObjectMetaData<K>;
  readonly [ChannelObject.id]: number;
  readonly [ChannelObject.key]: K;
  readonly [ChannelObject.date]: number;
  readonly [ChannelObject.event]: Observer<[StorageChannelEventType] | [StorageChannelEventType, Extract<keyof this, string>], StorageChannelEvent<this>, void>;
}
export interface StoreChannelObjectMetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}
export interface StoreChannelEvent<K extends string, V> {
  readonly type: StoreChannelEventType;
  readonly id: number;
  readonly key: K;
  readonly attr: Extract<keyof V | '', string>;
}
export type StoreChannelEventType
  = StoreChannelEventType.Put
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
    readonly send: Observer<[Extract<keyof V, string>], StorageChannelEvent<V>, void>;
    readonly recv: Observer<[Extract<keyof V, string>], StorageChannelEvent<V>, void>;
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
  readonly [ChannelObject.event]: Observer<[StorageChannelEventType] | [StorageChannelEventType, Extract<keyof this, string>], StorageChannelEvent<this>, void>;
}
export interface StorageChannelEvent<V> {
  readonly type: StorageChannelEventType;
  readonly attr: Extract<keyof V, string>;
  readonly newValue: V[Extract<keyof V, string>];
  readonly oldValue: V[Extract<keyof V, string>];
}
export type StorageChannelEventType
  = StorageChannelEventType.Send
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
