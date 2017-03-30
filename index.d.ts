import { Observer, Subscriber } from 'spica';

export function storechannel<K extends string, V extends StoreChannelObject<K>>(name: string, config: StoreChannelConfig<K, V>): StoreChannel<K, V>;
export interface StoreChannel<K extends string, V extends StoreChannelObject<K>> {
  readonly events: {
    readonly load: Observer<never[] | [K] | [K, string] | [K, string, StoreChannelEvent.Type], StoreChannelEvent<K>, void>,
    readonly save: Observer<never[] | [K] | [K, string] | [K, string, StoreChannelEvent.Type], StoreChannelEvent<K>, void>,
    readonly loss: Observer<never[] | [K] | [K, string] | [K, string, StoreChannelEvent.Type], StoreChannelEvent<K>, void>
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
  readonly __event: Observer<[MessageChannelEvent.Type] | [MessageChannelEvent.Type, string], MessageChannelEvent, any>;
  readonly __transaction: (key: K, cb: () => any, complete: (err?: DOMException | DOMError | Error) => any) => void;
}
export interface StoreChannelObjectMetaData<K extends string> {
  readonly id: number;
  readonly key: K;
  readonly date: number;
}
export interface StoreChannelEvent<K extends string> {
  readonly type: StoreChannelEvent.Type;
  readonly id: number;
  readonly key: K;
  readonly attr: string;
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

export function messagechannel<V extends MessageChannelObject>(name: string, config: MessageChannelConfig<V>): MessageChannel<V>;
export interface MessageChannel<V extends MessageChannelObject> {
  readonly events: {
    readonly send: Observer<never[] | [string], MessageChannelEvent, void>;
    readonly recv: Observer<never[] | [string], MessageChannelEvent, void>;
  };
  link(): V;
  destroy(): void;
}
export interface MessageChannelConfig<V extends MessageChannelObject> {
  schema(): V;
}
export interface MessageChannelObject {
  readonly __key: string;
  readonly __event: Observer<[MessageChannelEvent.Type] | [MessageChannelEvent.Type, string], MessageChannelEvent, any>;
}
export interface MessageChannelEvent {
  readonly type: MessageChannelEvent.Type;
  readonly key: string;
  readonly attr: string;
  readonly newValue: any;
  readonly oldValue: any;
}
export namespace MessageChannelEvent {
  export type Type
    = Type.Send
    | Type.Recv;
  export namespace Type {
    export type Send = 'send';
    export type Recv = 'recv';
  }
}
