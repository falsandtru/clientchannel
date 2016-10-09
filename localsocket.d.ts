declare module 'localsocket' {
  export default socket;

  export const status: boolean;

  export function socket<K extends string, V extends LocalSocketObject<K>>(name: string, config: LocalSocketConfig<K, V>): LocalSocket<K, V>;
  export interface LocalSocket<K extends string, V extends LocalSocketObject<K>> {
    readonly events: {
      readonly load: Observer<never[] | [K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>,
      readonly save: Observer<never[] | [K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>,
      readonly loss: Observer<never[] | [K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>
    };
    sync(keys: K[], cb?: (errs: [K, DOMError | Error][]) => any, timeout?: number): void;
    link(key: K, expiry?: number): V;
    delete(key: K): void;
    recent(limit: number, cb?: (keys: K[], error: DOMError) => any): void;
    close(): void;
    destroy(): void;
  }
  export interface LocalSocketConfig<K extends string, V extends LocalSocketObject<K>> {
    schema(): V;
    expiry?: number;
    destroy?(error: DOMError, event: Event | null): boolean;
  }
  export interface LocalSocketObject<K extends string> {
    readonly __meta: LocalSocketObjectMetaData<K>;
    readonly __id: number;
    readonly __key: K;
    readonly __date: number;
    readonly __event: Observer<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalSocketObjectMetaData<K extends string> {
    readonly id: number;
    readonly key: K;
    readonly date: number;
  }
  export interface LocalSocketEvent<K extends string> {
    readonly type: LocalSocketEventType;
    readonly id: number;
    readonly key: K;
    readonly attr: string;
  }
  export type LocalSocketEventType
    = 'put'
    | 'delete'
    | 'snapshot';

  export function port<V extends LocalPortObject>(name: string, config: LocalPortConfig<V>): LocalPort<V>;
  export interface LocalPort<V extends LocalPortObject> {
    readonly events: {
      readonly send: Observer<never[] | [string], LocalPortEvent, void>;
      readonly recv: Observer<never[] | [string], LocalPortEvent, void>;
    };
    link(): V;
    destroy(): void;
  }
  export interface LocalPortConfig<V extends LocalPortObject> {
    schema(): V;
    destroy?(error: DOMError, event: Event | null): boolean;
  }
  export interface LocalPortObject {
    readonly __key: string;
    readonly __event: Observer<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalPortEvent {
    readonly type: LocalPortEventType;
    readonly key: string;
    readonly attr: string;
    readonly newValue: any;
    readonly oldValue: any;
  }
  export type LocalPortEventType
    = 'send'
    | 'recv';

  // spica@0.0.35
  interface Observer<T extends Array<string | number>, D, R> {
    monitor(type: T, subscriber: Subscriber<D, R>): () => void;
    on(type: T, subscriber: Subscriber<D, R>): () => void;
    off(type: T, subscriber?: Subscriber<D, R>): void;
    once(type: T, subscriber: Subscriber<D, R>): () => void;
  }
  type Subscriber<D, R> = (data: D) => R;

}
