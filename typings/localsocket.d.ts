declare module 'localsocket' {
  import {IObservableObserver} from 'arch-stream';

  export default socket;

  export const status: boolean;

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
    __event?: IObservableObserver<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalSocketObjectMetaData {
    id: number;
    key: string;
    date: number;
  }
  export interface LocalSocketConfig<T> {
    expiry?: number;
    factory(): T;
    destroy?(error: DOMError, event: Event): boolean;
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
    | 'snapshot'
    | 'query';

  export function port<T extends LocalPortObject>(name: string, config: LocalPortConfig<T>): LocalPort<T>;
  export interface LocalPort<T extends LocalPortObject> {
    events: {
      send: IObservableObserver<[string], LocalPortEvent, void>;
      recv: IObservableObserver<[string], LocalPortEvent, void>;
    };
    link(): T;
    destroy(): void;
  }
  export interface LocalPortObject {
    __key?: string;
    __event?: IObservableObserver<[LocalPortEventType] | [LocalPortEventType, string], LocalPortEvent, any>;
  }
  export interface LocalPortConfig<T> {
    expiry?: number;
    factory(): T;
    destroy?(error: DOMError, event: Event): boolean;
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

}
