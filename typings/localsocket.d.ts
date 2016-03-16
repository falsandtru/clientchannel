declare module 'localsocket' {
  export default socket;

  export function socket<T extends LocalSocketObject>(name: string, config: LocalSocketConfig<T>): LocalSocket<T>;
  export interface LocalSocket<T extends LocalSocketObject> {
    sync(keys: string[], cb?: (errs: DOMError[]) => any): void;
    link(key: string, expiry?: number): T;
    delete(key: string): void;
    recent(limit: number, cb: (keys: string[], error: DOMError) => any): void;
    destroy(): void;
  }
  export interface LocalSocketObject {
    __meta?: LocalSocketObjectMetaData;
    __id?: number;
    __key?: string;
    __date?: number;
    __event?: IObservableObserver<LocalSocketEventType, LocalSocketEvent, any>;
  }
  export interface LocalSocketConfig<T> {
    expiry?: number;
    factory(): T;
    destroy?(error: DOMError, event: Event): boolean;
  }
  export interface LocalSocketObjectMetaData {
    id: number;
    key: string;
    date: number;
  }

  export function port<T extends LocalPortObject>(name: string, config: LocalPortConfig<T>): LocalPort<T>;
  export interface LocalPort<T extends LocalPortObject> {
    link(): T;
    destroy(): void;
  }
  export interface LocalPortObject {
    __key?: string;
    __event?: IObservableObserver<LocalSocketEventType, LocalSocketEvent, any>;
  }
  export interface LocalPortConfig<T> {
    life?: number;
    factory(): T;
    destroy?(error: DOMError, event: Event): boolean;
  }

  export type LocalSocketEventType
    = 'send'
    | 'recv';
  export interface LocalSocketEvent {
    type: LocalSocketEventType;
    key: string;
    attr: string;
    newValue: any;
    oldValue: any;
  }

  // arch-stream
  export interface IObservableObserver<T extends string | number, D, R> extends IObservableSubscriber<T, D, R> {
    monitor(type: T | T[], subscriber: Subscriber<D, R>): this;
    refs(type: T | T[]): [T[], Subscriber<D, R>, boolean][];
  }
  export interface IObservableSubscriber<T extends string | number, D, R> {
    on(type: T | T[], subscriber: Subscriber<D, R>): this;
    off(type: T | T[], subscriber?: Subscriber<D, R>): this;
    once(type: T | T[], subscriber: Subscriber<D, R>): this;
  }
  type Subscriber<D, R> = (data: D) => R;

}
