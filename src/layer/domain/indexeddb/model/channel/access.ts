import { Observer } from 'spica';
import { Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { EventStore } from '../../../../data/es/store';

export const STORE_NAME = 'access';

export class AccessStore<K extends string> extends KeyValueStore<K, AccessRecord<K>> {
  public static readonly fields = Object.freeze({
    key: <'key'>'key',
    date: <'date'>'date'
  });
  public static configure(): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(STORE_NAME)
          ? db.transaction(STORE_NAME).objectStore(STORE_NAME)
          : db.createObjectStore(STORE_NAME, {
            keyPath: AccessStore.fields.key,
            autoIncrement: false
          });
        if (!store.indexNames.contains(AccessStore.fields.key)) {
          void store.createIndex(AccessStore.fields.key, AccessStore.fields.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(AccessStore.fields.date)) {
          void store.createIndex(AccessStore.fields.date, AccessStore.fields.date);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(STORE_NAME)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(AccessStore.fields.key)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(AccessStore.fields.date);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    database: string,
    access: Observer<any[], EventStore.InternalEvent<K>, void>
  ) {
    super(database, STORE_NAME, AccessStore.fields.key);
    void Object.freeze(this);

    void access
      .monitor([], ({key, type}) =>
        type === EventStore.EventType.delete
          ? void this.delete(key)
          : void this.set(key, new AccessRecord(key, Date.now()))
      );
  }
}

class AccessRecord<K extends string> {
  constructor(
    public readonly key: K,
    public readonly date: number
  ) {
  }
}
