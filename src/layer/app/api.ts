import {LocalSocket, LocalSocketObject, LocalSocketConfig} from 'localsocket';
import {LocalPort, LocalPortObject, LocalPortConfig} from 'localsocket';
import {socket as indexeddb} from '../domain/indexeddb/api';
import {webstorage, localStorage, sessionStorage} from '../domain/webstorage/api';
import {event as IDBEventStream} from '../domain/indexeddb/api';
import {events as WebStorageEventStreams} from '../domain/webstorage/api';

export {supportWebStorage as status} from '../domain/webstorage/api';

export function socket<T extends LocalSocketObject>(name: string, config: LocalSocketConfig<T>): LocalSocket<T> {
  config = configure(config);
  return indexeddb(name, config.schema, config.destroy, config.expiry);

  function configure<T>(config: LocalSocketConfig<T>): LocalSocketConfig<T> {
    class Config<T> implements LocalSocketConfig<T> {
      constructor(
        public schema: () => T,
        public expiry: number = Infinity,
        public destroy: (err: DOMError, event: Event) => boolean = () => true
      ) {
        void Object.freeze(this);
      }
    }
    return new Config(
      config.schema,
      config.expiry,
      config.destroy
    );
  }
}

export function port<T extends LocalPortObject>(name: string, config: LocalPortConfig<T>): LocalPort<T> {
  config = configure(config);
  return webstorage(name, localStorage, config.schema);

  function configure<T>(config: LocalPortConfig<T>): LocalPortConfig<T> {
    class Config<T> implements LocalPortConfig<T> {
      constructor(
        public schema: () => T,
        public destroy: (err: DOMError, event: Event) => boolean = () => true
      ) {
        void Object.freeze(this);
      }
    }
    return new Config(
      config.schema,
      config.destroy
    );
  }
}

export namespace events {
  export const indexedDB = IDBEventStream;
  export const localStorage = WebStorageEventStreams.localStorage;
  export const sessionStorage = WebStorageEventStreams.sessionStorage;
}
