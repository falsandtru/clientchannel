import { Observer, Subscriber } from 'spica';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  constructor(name: string, config: StoreChannelConfig<K, V>);
  readonly events: {
    readonly load: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEvent.Type], StoreChannelEvent<K, V>, void>,
    readonly save: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEvent.Type], StoreChannelEvent<K, V>, void>,
    readonly loss: Observer<never[] | [K] | [K, keyof V | ''] | [K, keyof V | '', StoreChannelEvent.Type], StoreChannelEvent<K, V>, void>
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
  expiry?: number;
  destroy?(error: DOMException | DOMError, event: Event | null): boolean;
}
export interface StoreChannelObject<K extends string> {
  readonly __meta: StoreChannelObjectMetaData<K>;
  readonly __id: number;
  readonly __key: K;
  readonly __date: number;
  readonly __event: Observer<[BroadcastChannelEvent.Type] | [BroadcastChannelEvent.Type, keyof this | ''], BroadcastChannelEvent<this>, any>;
  readonly __transaction: (key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any) => void;
}
export interface StoreChannelObjectMetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}
export interface StoreChannelEvent<K extends string, V extends StoreChannelObject<K>> {
  readonly type: StoreChannelEvent.Type;
  readonly id: number;
  readonly key: K;
  readonly attr: keyof V | '';
}
export namespace StoreChannelEvent {
  export type Type
    = Type.Put
    | Type.Delete
    | Type.Snapshot;
  export namespace Type {
    export type Put = 'put';
    export type Delete = 'delete';
    export type Snapshot = 'snapshot';
  }
}

export class BroadcastChannel<V extends BroadcastChannelObject> {
  constructor(name: string, config: BroadcastChannelConfig<V>);
  readonly events: {
    readonly send: Observer<never[] | [keyof V], BroadcastChannelEvent<V>, void>;
    readonly recv: Observer<never[] | [keyof V], BroadcastChannelEvent<V>, void>;
  };
  link(): V;
  destroy(): void;
}
export interface BroadcastChannelConfig<V extends BroadcastChannelObject> {
  schema(): V;
}
export interface BroadcastChannelObject {
  readonly __event: Observer<[BroadcastChannelEvent.Type] | [BroadcastChannelEvent.Type, keyof this], BroadcastChannelEvent<this>, any>;
}
export interface BroadcastChannelEvent<V extends BroadcastChannelObject> {
  readonly type: BroadcastChannelEvent.Type;
  readonly attr: keyof V;
  readonly newValue: V[keyof V];
  readonly oldValue: V[keyof V];
}
export namespace BroadcastChannelEvent {
  export type Type
    = Type.Send
    | Type.Recv;
  export namespace Type {
    export type Send = 'send';
    export type Recv = 'recv';
  }
}
