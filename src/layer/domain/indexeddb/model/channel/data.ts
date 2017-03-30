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
  export class Event<K extends string> extends EventStore.Event<K> { }
  export namespace Event {
    export import Type = EventStore.Event.Type;
  }
  export class Record<K extends string, V extends Value> extends EventStore.Record<K, V> { }
  export class Value extends EventStore.Value {
  }
}
