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
      Schema,
      migrate = () => void 0,
      destroy = () => true,
      age = Infinity,
      size = Infinity,
    }: StoreChannelConfig<K, V>
  ) {
    super(name, Schema, migrate, destroy, age, size);
  }
}

export class StorageChannel<V extends StorageChannelObject> extends BaseStorageChannel<V> {
  constructor(
    name: string,
    {
      Schema,
      migrate = () => void 0,
    }: StorageChannelConfig<V>
  ) {
    super(name, localStorage, Schema, migrate);
  }
}
