import { StoreChannel, StoreChannelObject, StoreChannelConfig } from '../../../';
import { BroadcastChannel, BroadcastChannelObject, BroadcastChannelConfig } from '../../../';
import { StoreChannel as IDBChannel } from '../domain/indexeddb/api';
import { BroadcastChannel as WebStorage, localStorage, supportWebStorage } from '../domain/webstorage/api';
export * from '../domain/indexeddb/api';
export * from '../domain/webstorage/api';

export function store<K extends string, V extends StoreChannelObject<K>>(name: string, config: StoreChannelConfig<K, V>): StoreChannel<K, V> {
  if (!supportWebStorage) throw new Error(`ClientChannel: Couldn't use WebStorage.`);
  const {
    schema,
    destroy = () => true,
    expiry = Infinity
  } = config;
  return new IDBChannel<K, V>(name, schema, destroy, expiry);
}

export function broadcast<V extends BroadcastChannelObject>(name: string, config: BroadcastChannelConfig<V>): BroadcastChannel<V> {
  if (!supportWebStorage) throw new Error(`ClientChannel: Couldn't use WebStorage.`);
  const {
    schema
  } = config;
  return new WebStorage(name, localStorage, schema);
}
