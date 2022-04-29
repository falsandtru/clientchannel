import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { EventStore } from '../../../../data/es/store';

export const name = 'data';

export class DataStore<K extends string, V extends DataStore.Value> extends EventStore<K, V> {
  public static override configure(): Config {
    return EventStore.configure(name);
  }
  constructor(
    listen: Listen,
    relation: {
      readonly stores: string[];
      delete(key: K, tx: IDBTransaction): void;
    },
  ) {
    super(name, listen, relation);
  }
}
export namespace DataStore {
  export import Event = EventStore.Event;
  export import EventType = EventStore.EventType;
  export import Record = EventStore.Record;
  export import Value = EventStore.Value;
}
