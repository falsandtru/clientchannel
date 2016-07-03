declare module 'localsocket' {
  export default socket;

  export const status: boolean;

  export function socket<K extends string, V extends LocalSocketObject<K>>(name: string, config: LocalSocketConfig<K, V>): LocalSocket<K, V>;
  export interface LocalSocket<K extends string, V extends LocalSocketObject<K>> {
    events: {
      load: Observer<[K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>,
      save: Observer<[K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>,
      loss: Observer<[K] | [K, string] | [K, string, LocalSocketEventType], LocalSocketEvent<K>, void>
    };
    sync(keys: K[], cb?: (errs: [K, DOMError | Error][]) => any, timeout?: number): void;
    link(key: K, expiry?: number): V;
    delete(key: K): void;
    recent(limit: number, cb?: (keys: K[], error: DOMError) => any): void;
    destroy(): void;
  }
  export interface LocalSocketConfig<K extends string, V extends LocalSocketObject<K>> {
    schema(): V;
    expiry?: number;
    destroy?(error: DOMError, event: Event): boolean;
  }
  export interface LocalSocketObject<K extends string> {
    __meta?: LocalSocketObjectMetaData<K>;
    __id?: number;
    __key?: K;
    __date?: number;
    __event?: Observer<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalSocketObjectMetaData<K extends string> {
    id: number;
    key: K;
    date: number;
  }
  export interface LocalSocketEvent<K extends string> {
    type: LocalSocketEventType;
    id: number;
    key: K;
    attr: string;
  }
  export type LocalSocketEventType
    = 'put'
    | 'delete'
    | 'snapshot';

  export function port<V extends LocalPortObject>(name: string, config: LocalPortConfig<V>): LocalPort<V>;
  export interface LocalPort<V extends LocalPortObject> {
    events: {
      send: Observer<[string], LocalPortEvent, void>;
      recv: Observer<[string], LocalPortEvent, void>;
    };
    link(): V;
    destroy(): void;
  }
  export interface LocalPortConfig<V extends LocalPortObject> {
    schema(): V;
    destroy?(error: DOMError, event: Event): boolean;
  }
  export interface LocalPortObject {
    __key?: string;
    __event?: Observer<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalPortEvent {
    type: LocalPortEventType;
    key: string;
    attr: string;
    newValue: any;
    oldValue: any;
  }
  export type LocalPortEventType
    = 'send'
    | 'recv';

  // spica@0.0.0
  class Observable<T extends Array<string | number>, D, R>
    implements Observer<T, D, R>, Publisher<T, D, R> {
    monitor(type: T, subscriber: Subscriber<D, R>): () => void;
    on(type: T, subscriber: Subscriber<D, R>): () => void;
    off(type: T, subscriber?: Subscriber<D, R>): void;
    once(type: T, subscriber: Subscriber<D, R>): () => void;
    emit(type: T, data: D, tracker?: (data: D, results: R[]) => any): void;
    reflect(type: T, data: D): R[];
    refs(type: T): [T, Subscriber<D, R>, boolean][];
  }
  interface Observer<T extends Array<string | number>, D, R> {
    monitor(type: T, subscriber: Subscriber<D, R>): () => void;
    on(type: T, subscriber: Subscriber<D, R>): () => void;
    off(type: T, subscriber?: Subscriber<D, R>): void;
    once(type: T, subscriber: Subscriber<D, R>): () => void;
  }
  interface Publisher<T extends Array<string | number>, D, R> {
    emit(type: T, data: D, tracker?: (data: D, results: any[]) => any): void;
    reflect(type: T, data: D): R[];
  }
  interface Subscriber<D, R> {
    (data: D): R;
  }

}
