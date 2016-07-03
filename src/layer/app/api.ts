import {LocalSocket, LocalSocketObject, LocalSocketConfig} from 'localsocket';
import {LocalPort, LocalPortObject, LocalPortConfig} from 'localsocket';
import {socket as indexeddb} from '../domain/indexeddb/api';
import {webstorage, localStorage, sessionStorage} from '../domain/webstorage/api';
import {event as IDBEventStream} from '../domain/indexeddb/api';
import {events as WebStorageEventStreams} from '../domain/webstorage/api';

export {supportWebStorage as status} from '../domain/webstorage/api';

export function socket<K extends string, V extends LocalSocketObject<K>>(name: string, config: LocalSocketConfig<K, V>): LocalSocket<K, V> {
  config = configure(config);
  return indexeddb<K, V>(name, config.schema, config.destroy, config.expiry);

  function configure<K extends string, V>(config: LocalSocketConfig<K, V>): LocalSocketConfig<K, V> {
    class Config implements LocalSocketConfig<K, V> {
      constructor(
        public schema: () => V,
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

export function port<V extends LocalPortObject>(name: string, config: LocalPortConfig<V>): LocalPort<V> {
  config = configure(config);
  return webstorage(name, localStorage, config.schema);

  function configure<V>(config: LocalPortConfig<V>): LocalPortConfig<V> {
    class Config<V> implements LocalPortConfig<V> {
      constructor(
        public schema: () => V,
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
