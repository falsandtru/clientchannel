declare module 'localsocket' {
  export default socket;

  export function socket<T extends LocalSocketObject>(name: string, storage: IDBFactory, config: LocalSocketConfig<T>): LocalSocket<T>;
  export interface LocalSocket<T extends LocalSocketObject> {
    link(key: string): T;
    delete(key: string): void;
    keys(cb: (keys: string[], error: DOMError) => any): void;
    recent(limit: number, cb: (keys: string[], error: DOMError) => any): void;
    destroy(): void;
  }
  export function socket<T extends LocalSocketObject>(name: string, storage: Storage, config: LocalSocketConfig<T>): LocalStore<T>;
  export interface LocalStore<T extends LocalSocketObject> {
    link(): T;
    destroy(): void;
  }

  export interface LocalSocketObject {
    __id?: number;
    __key?: string;
    __event?: IObservableObserver<LocalSocketEventType, LocalSocketEvent, any>;
  }
  export interface LocalSocketConfig<T> {
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
    attr: string | void;
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
