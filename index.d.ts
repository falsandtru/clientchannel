import { Observer, Subscriber } from 'spica/observation';
import { AtomicPromise } from 'spica/promise';
import { DiffStruct } from 'spica/type';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  constructor(name: string, config: StoreChannelConfig<K, V>);
  readonly events: {
    readonly load: Observer<[] | [K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly save: Observer<[] | [K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly loss: Observer<[] | [K] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>] | [K, Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>, StoreChannelEventType], StoreChannelEvent<K, V>, void>;
  };
  sync(keys: K[], cb?: (results: AtomicPromise<K>[]) => void): void;
  link(key: K, age?: number): V;
  delete(key: K): void;
  recent(limit: number, cb: (keys: K[], err?: DOMException | DOMError | Error | null) => void): void;
  close(): void;
  destroy(): void;
}
export interface StoreChannelConfig<K extends string, V extends StoreChannelObject<K>> {
  Schema: new () => V;
  age?: number;
  migrate?(link: V): void;
  destroy?(reason: any, event?: Event): boolean;
  debug?: boolean;
}
export interface StoreChannelObject<K extends string> {
  readonly __meta: StoreChannelObjectMetaData<K>;
  readonly __id: number;
  readonly __key: K;
  readonly __date: number;
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, Extract<keyof DiffStruct<this, StoreChannelObject<K>>, string>], StorageChannelEvent<this>, void>;
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
  readonly attr: Extract<keyof DiffStruct<V, StoreChannelObject<K>> | '', string>;
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
    readonly send: Observer<[] | [Extract<keyof DiffStruct<V, StorageChannelObject>, string>], StorageChannelEvent<V>, void>;
    readonly recv: Observer<[] | [Extract<keyof DiffStruct<V, StorageChannelObject>, string>], StorageChannelEvent<V>, void>;
  };
  link(): V;
  close(): void;
  destroy(): void;
}
export interface StorageChannelConfig<V extends StorageChannelObject> {
  Schema: new () => V;
  migrate?(link: V): void;
}
export interface StorageChannelObject {
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, Extract<keyof DiffStruct<this, StorageChannelObject>, string>], StorageChannelEvent<this>, void>;
}
export interface StorageChannelEvent<V> {
  readonly type: StorageChannelEventType;
  readonly attr: Extract<keyof DiffStruct<V, StorageChannelObject>, string>;
  readonly newValue: V[Extract<keyof DiffStruct<V, StorageChannelObject>, string>];
  readonly oldValue: V[Extract<keyof DiffStruct<V, StorageChannelObject>, string>];
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
  take(key: K, age: number, wait: number): AtomicPromise<void>;
  extend(key: K, age: number): boolean;
  close(): void;
}
