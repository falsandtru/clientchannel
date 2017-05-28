﻿import { Observer, Subscriber } from 'spica';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  constructor(name: string, config: StoreChannelConfig<K, V>);
  readonly events: {
    readonly load: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>,
    readonly save: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>,
    readonly loss: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEventType], StoreChannelEvent<K, V>, void>
  };
  sync(keys: K[], cb?: (errs: [K, DOMException | DOMError][]) => any): void;
  transaction(key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any): void;
  link(key: K, expiry?: number): V;
  delete(key: K): void;
  recent(limit: number, cb: (keys: K[], err?: DOMException | DOMError | null) => any): void;
  close(): void;
  destroy(): void;
}
export interface StoreChannelConfig<K extends string, V extends StoreChannelObject<K>> {
  schema(): V;
  size?: number;
  expiry?: number;
  destroy?(error: DOMException | DOMError, event: Event | null): boolean;
}
export interface StoreChannelObject<K extends string> {
  readonly __meta: StoreChannelObjectMetaData<K>;
  readonly __id: number;
  readonly __key: K;
  readonly __date: number;
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, keyof this | ''], StorageChannelEvent<this>, any>;
  readonly __transaction: (key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any) => void;
}
export interface StoreChannelObjectMetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}
export interface StoreChannelEvent<K extends string, V extends StoreChannelObject<K>> {
  readonly type: StoreChannelEventType;
  readonly id: number;
  readonly key: K;
  readonly attr: keyof V | '';
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
    readonly send: Observer<never[] | [keyof V], StorageChannelEvent<V>, void>;
    readonly recv: Observer<never[] | [keyof V], StorageChannelEvent<V>, void>;
  };
  link(): V;
  destroy(): void;
}
export interface StorageChannelConfig<V extends StorageChannelObject> {
  schema(): V;
  migrate?(link: V): void;
}
export interface StorageChannelObject {
  readonly __event: Observer<[StorageChannelEventType] | [StorageChannelEventType, keyof this], StorageChannelEvent<this>, any>;
}
export interface StorageChannelEvent<V extends StorageChannelObject> {
  readonly type: StorageChannelEventType;
  readonly attr: keyof V;
  readonly newValue: V[keyof V];
  readonly oldValue: V[keyof V];
}
export type StorageChannelEventType
  = StorageChannelEventType.Send
  | StorageChannelEventType.Recv;
export namespace StorageChannelEventType {
  export type Send = 'send';
  export type Recv = 'recv';
}
