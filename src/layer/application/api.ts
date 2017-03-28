import { LocalSocket, LocalSocketObject, LocalSocketConfig } from '../../../';
import { LocalPort, LocalPortObject, LocalPortConfig } from '../../../';
import { Socket } from '../domain/indexeddb/api';
import { Port, localStorage } from '../domain/webstorage/api';
import { event as IDBEventStream } from '../domain/indexeddb/api';
import { events as WebStorageEventStreams } from '../domain/webstorage/api';

export { supportWebStorage as status } from '../domain/webstorage/api';

export function socket<K extends string, V extends LocalSocketObject<K>>(name: string, config: LocalSocketConfig<K, V>): LocalSocket<K, V> {
  const {
    schema,
    destroy = () => true,
    expiry = Infinity
  } = config;
  return new Socket<K, V>(name, schema, destroy, expiry);
}

export function port<V extends LocalPortObject>(name: string, config: LocalPortConfig<V>): LocalPort<V> {
  const {
    schema
  } = config;
  return new Port(name, localStorage, schema);
}

export namespace events {
  export const indexedDB = IDBEventStream;
  export const localStorage = WebStorageEventStreams.localStorage;
  export const sessionStorage = WebStorageEventStreams.sessionStorage;
}
