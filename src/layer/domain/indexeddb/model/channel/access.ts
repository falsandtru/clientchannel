import { Observer } from 'spica';
import { Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { EventStore } from '../../../../data/es/store';

export const name = 'access';

namespace AccessStoreSchema {
  export const key = 'key';
  export const date = 'date';
}

export class AccessStore<K extends string> extends KeyValueStore<K, AccessRecord<K>> {
  public static configure(): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(name)
          ? db.transaction(name).objectStore(name)
          : db.createObjectStore(name, {
            keyPath: AccessStoreSchema.key,
            autoIncrement: false
          });
        if (!store.indexNames.contains(AccessStoreSchema.key)) {
          void store.createIndex(AccessStoreSchema.key, AccessStoreSchema.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(AccessStoreSchema.date)) {
          void store.createIndex(AccessStoreSchema.date, AccessStoreSchema.date);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(name)
            && db.transaction(name).objectStore(name).indexNames.contains(AccessStoreSchema.key)
            && db.transaction(name).objectStore(name).indexNames.contains(AccessStoreSchema.date);
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
    super(database, name, AccessStoreSchema.key);
    void Object.freeze(this);

    void access
      .monitor([], ({key, type}) =>
        type === EventStore.EventType.delete
          ? void this.delete(key)
          : void this.set(key, new AccessRecord(key, Date.now()))
      );
  }
  public recent(limit: number, cb: (keys: K[], err: DOMException | DOMError | null) => void): void {
    const keys: K[] = [];
    return void this.cursor(
      null,
      AccessStoreSchema.date,
      'prev',
      'readonly',
      (cursor, err): void => {
        if (!cursor) return void cb(keys, err);
        if (--limit < 0) return;
        void keys.push(cursor.primaryKey);
        void cursor.continue();
      });
  }
}

class AccessRecord<K extends string> {
  constructor(
    public readonly key: K,
    public readonly date: number
  ) {
  }
}
