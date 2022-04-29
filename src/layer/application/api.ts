import { StoreChannel as BaseStoreChannel } from '../domain/indexeddb/api';
import { StorageChannel as BaseStorageChannel, localStorage } from '../domain/webstorage/api';
import { Channel as BroadcastChannel } from '../domain/broadcast/channel';
import { Ownership as BaseOwnership } from '../domain/ownership/channel';

export * from '../domain/indexeddb/api';
export * from '../domain/webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannel.Value<K>> extends BaseStoreChannel<K, V> {
  constructor(
    name: string,
    config: StoreChannel.Config<K, V>,
  ) {
    super(name, config.schema, config);
  }
}
export namespace StoreChannel {
  export import Value = BaseStoreChannel.Value;
  export import Config = BaseStoreChannel.Config;
}

export class StorageChannel<V extends BaseStorageChannel.Value> extends BaseStorageChannel<V> {
  constructor(
    name: string,
    {
      schema,
      migrate,
    }: StorageChannel.Config<V>
  ) {
    super(name, localStorage, schema, migrate);
  }
}
export namespace StorageChannel {
  export import Value = BaseStorageChannel.Value;
  export import Config = BaseStorageChannel.Config;
}

export class Ownership<K extends string> extends BaseOwnership<K> {
  constructor(name: K) {
    super(new BroadcastChannel(name, false));
  }
}
