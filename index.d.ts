﻿import { Observer, Subscriber } from 'spica/observation';
import { DiffStruct } from 'spica/type';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  constructor(name: string, config: StoreChannelConfig<K, V>);
  readonly events: {
    readonly load: Observer<never[] | [K] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | ''] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly save: Observer<never[] | [K] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | ''] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>;
    readonly loss: Observer<never[] | [K] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | ''] | [K, keyof DiffStruct<V, StoreChannelObject<K>> | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>;
  };
  sync(keys: K[], cb?: (results: [K, DOMException | DOMError | Error | null][]) => void): void;
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
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, keyof DiffStruct<this, StoreChannelObject<K>>], StorageChannelEvent<this>, any>;
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
  readonly attr: keyof DiffStruct<V, StoreChannelObject<K>> | '';
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
    readonly send: Observer<never[] | [keyof DiffStruct<V, StorageChannelObject>], StorageChannelEvent<V>, void>;
    readonly recv: Observer<never[] | [keyof DiffStruct<V, StorageChannelObject>], StorageChannelEvent<V>, void>;
  };
  link(): V;
  destroy(): void;
}
export interface StorageChannelConfig<V extends StorageChannelObject> {
  Schema: new () => V;
  migrate?(link: V): void;
}
export interface StorageChannelObject {
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, keyof DiffStruct<this, StorageChannelObject>], StorageChannelEvent<this>, any>;
}
export interface StorageChannelEvent<V> {
  readonly type: StorageChannelEventType;
  readonly attr: keyof DiffStruct<V, StorageChannelObject>;
  readonly newValue: V[keyof DiffStruct<V, StorageChannelObject>];
  readonly oldValue: V[keyof DiffStruct<V, StorageChannelObject>];
}
export type StorageChannelEventType
  = StorageChannelEventType.Send
  | StorageChannelEventType.Recv;
export namespace StorageChannelEventType {
  export type Send = 'send';
  export type Recv = 'recv';
}
