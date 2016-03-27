import {Config, IDBTransaction, IDBCursorDirection} from '../../../../infrastructure/indexeddb/api';
import {AbstractEventStore, UnsavedEventRecord, EventValue} from '../../../../data/store/event';

export const STORE_NAME = 'data';
export const STORE_FIELDS = {
  key: 'key'
};

export class DataValue {
}

export class DataStore<K extends string, V extends DataValue> extends AbstractEventStore<V> {
  public static configure(): Config {
    return AbstractEventStore.configure(STORE_NAME);
  }
  constructor(
    database: string
  ) {
    super(database, STORE_NAME);
    void Object.freeze(this);
  }
}
