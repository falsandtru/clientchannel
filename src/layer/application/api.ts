import { StoreChannel, StoreChannelObject, StoreChannelConfig } from '../../../';
import { MessageChannel, MessageChannelObject, MessageChannelConfig } from '../../../';
import { StoreChannel as IDBChannel } from '../domain/indexeddb/api';
import { MessageChannel as WebStorage, localStorage, supportWebStorage } from '../domain/webstorage/api';

export function storechannel<K extends string, V extends StoreChannelObject<K>>(name: string, config: StoreChannelConfig<K, V>): StoreChannel<K, V> {
  if (!supportWebStorage) throw new Error(`ClientChannel: Couldn't use WebStorage.`);
  const {
    schema,
    destroy = () => true,
    expiry = Infinity
  } = config;
  return new IDBChannel<K, V>(name, schema, destroy, expiry);
}

export function messagechannel<V extends MessageChannelObject>(name: string, config: MessageChannelConfig<V>): MessageChannel<V> {
  if (!supportWebStorage) throw new Error(`ClientChannel: Couldn't use WebStorage.`);
  const {
    schema
  } = config;
  return new WebStorage(name, localStorage, schema);
}
