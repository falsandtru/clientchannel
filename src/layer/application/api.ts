import { StoreChannelObject, StoreChannelConfig } from '../../../';
import { StorageChannelObject, StorageChannelConfig } from '../../../';
import { StoreChannel as BaseStoreChannel } from '../domain/indexeddb/api';
import { StorageChannel as BaseStorageChannel, localStorage } from '../domain/webstorage/api';
export * from '../domain/indexeddb/api';
export * from '../domain/webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> extends BaseStoreChannel<K, V> {
  constructor(
    name: string,
    {
      schema,
      destroy = () => true,
      expiry = Infinity
    }: StoreChannelConfig<K, V>
  ) {
    super(name, schema, destroy, expiry);
  }
}

export class StorageChannel<V extends StorageChannelObject> extends BaseStorageChannel<V> {
  constructor(
    name: string,
    {
      schema
    }: StorageChannelConfig<V>
  ) {
    super(name, localStorage, schema);
  }
}
