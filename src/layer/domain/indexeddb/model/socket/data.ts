import {Config} from '../../../../infrastructure/indexeddb/api';
import {EventStore} from '../../../../data/store/event';

export const STORE_NAME = 'data';

export class DataStore<K extends string, V extends DataStore.Value> extends EventStore<V> {
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
  export type EventType = EventStore.EventType;
  export const EventType = EventStore.EventType;
  export class Event extends EventStore.Event { }
  export class Record<T extends Value> extends EventStore.Record<T> { }
  export class Value extends EventStore.Value {
  }
}
