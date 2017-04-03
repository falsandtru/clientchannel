import { Config } from '../../../../infrastructure/indexeddb/api';
import { EventStore } from '../../../../data/store/event';

export const STORE_NAME = 'data';

export class DataStore<K extends string, V extends DataStore.Value> extends EventStore<K, V> {
  public static configure(): Config {
    return EventStore.configure(STORE_NAME);
  }
  constructor(
    database: string
  ) {
    super(database, STORE_NAME);
    void Object.freeze(this);
  }
}
export namespace DataStore {
  export import Event = EventStore.Event;
  export import Record = EventStore.Record;
  export import Value = EventStore.Value;
}
