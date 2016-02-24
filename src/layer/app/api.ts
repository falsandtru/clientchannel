import {LocalSocket, LocalStore, LocalSocketObject, LocalSocketConfig} from 'localsocket';
import {indexedDB} from '../infrastructure/indexeddb/api';
import {configure} from './module/config';
import {socket as indexeddb} from '../domain/indexeddb/api';
import {webstorage, localStorage, sessionStorage} from '../domain/webstorage/api';
import {event as IDBEventStream} from '../domain/indexeddb/api';
import {events as WebStorageEventStreams} from '../domain/webstorage/api';

export function socket<T extends LocalSocketObject>(name: string, config: LocalSocketConfig<T>): LocalSocket<T> {
  config = configure(config);
  return indexeddb(name, config.factory, config.destroy);
}
export function store<T extends LocalSocketObject>(name: string, storage: Storage, config: LocalSocketConfig<T>): LocalStore<T> {
  config = configure(config);
  switch (storage) {
    case localStorage: {
      return webstorage(name, localStorage, config.factory, config.life);
    }
    case sessionStorage: {
      return webstorage(name, sessionStorage, config.factory, config.life);
    }
  }
  throw new TypeError(`LocalSocket: Invalid storage type ${storage}`);
}

export namespace events {
  export const indexedDB = IDBEventStream;
  export const localStorage = WebStorageEventStreams.localStorage;
  export const sessionStorage = WebStorageEventStreams.sessionStorage;
}
