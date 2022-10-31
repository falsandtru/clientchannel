import { StoreChannel as BaseStoreChannel } from '../domain/indexeddb/api';
import { StorageChannel as BaseStorageChannel, localStorage, sessionStorage, fakeStorage } from '../domain/webstorage/api';
import { Channel as BroadcastChannel } from '../domain/broadcast/channel';
import { Ownership as BaseOwnership } from '../domain/ownership/channel';

export * from '../domain/indexeddb/api';
export * from '../domain/webstorage/api';

export class StoreChannel<M extends object> extends BaseStoreChannel<M> {
  constructor(
    name: string,
    config: StoreChannel.Config<M>,
  ) {
    super(name, config);
  }
}
export namespace StoreChannel {
  export import Config = BaseStoreChannel.Config;
  export import Value = BaseStoreChannel.Value;
}

export class StorageChannel<V extends BaseStorageChannel.Value> extends BaseStorageChannel<V> {
  constructor(
    name: string,
    config: StorageChannel.Config<V>
  ) {
    super(name, localStorage || sessionStorage || fakeStorage, config);
  }
}
export namespace StorageChannel {
  export import Config = BaseStorageChannel.Config;
  export import Value = BaseStorageChannel.Value;
}

export class Ownership<K extends string> extends BaseOwnership<K> {
  constructor(name: K) {
    super(new BroadcastChannel(name, false));
  }
}
