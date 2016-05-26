declare module 'localsocket' {
  export default socket;

  export const status: boolean;

  export function socket<T extends LocalSocketObject>(name: string, config: LocalSocketConfig<T>): LocalSocket<T>;
  export interface LocalSocket<T extends LocalSocketObject> {
    events: {
      load: Observer<[string] | [string, string] | [string, string, LocalSocketEventType], LocalSocketEvent, void>,
      save: Observer<[string] | [string, string] | [string, string, LocalSocketEventType], LocalSocketEvent, void>,
      loss: Observer<[string] | [string, string] | [string, string, LocalSocketEventType], LocalSocketEvent, void>
    };
    sync(keys: string[], cb?: (errs: DOMError[]) => any): void;
    link(key: string, expiry?: number): T;
    delete(key: string): void;
    recent(limit: number, cb: (keys: string[], error: DOMError) => any): void;
    destroy(): void;
  }
  export interface LocalSocketConfig<T extends LocalSocketObject> {
    schema(): T;
    expiry?: number;
    destroy?(error: DOMError, event: Event): boolean;
  }
  export interface LocalSocketObject {
    __meta?: LocalSocketObjectMetaData;
    __id?: number;
    __key?: string;
    __date?: number;
    __event?: Observer<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalSocketObjectMetaData {
    id: number;
    key: string;
    date: number;
  }
  export interface LocalSocketEvent {
    type: LocalSocketEventType;
    id: number;
    key: string;
    attr: string;
  }
  export type LocalSocketEventType
    = 'put'
    | 'delete'
    | 'snapshot';

  export function port<T extends LocalPortObject>(name: string, config: LocalPortConfig<T>): LocalPort<T>;
  export interface LocalPort<T extends LocalPortObject> {
    events: {
      send: Observer<[string], LocalPortEvent, void>;
      recv: Observer<[string], LocalPortEvent, void>;
    };
    link(): T;
    destroy(): void;
  }
  export interface LocalPortConfig<T extends LocalPortObject> {
    schema(): T;
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

  // arch-stream@0.0.105
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
