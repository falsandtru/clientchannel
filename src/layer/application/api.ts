import { StoreChannelObject, StoreChannelConfig } from '../../../';
import { BroadcastChannelObject, BroadcastChannelConfig } from '../../../';
import { StoreChannel as IDBChannel } from '../domain/indexeddb/api';
import { BroadcastChannel as WebStorage, localStorage } from '../domain/webstorage/api';
export * from '../domain/indexeddb/api';
export * from '../domain/webstorage/api';

export class StoreChannel<K extends string, V extends StoreChannelObject<K>> extends IDBChannel<K, V> {
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

export class BroadcastChannel<V extends BroadcastChannelObject> extends WebStorage<V> {
  constructor(
    name: string,
    {
      schema
    }: BroadcastChannelConfig<V>
  ) {
    super(name, localStorage, schema);
  }
}
