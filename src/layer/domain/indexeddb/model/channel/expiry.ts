import { Observer } from 'spica/observation';
import { Cancellee } from 'spica/cancellation';
import { Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { EventStore } from '../../../../data/es/store';

const name = 'expiry';

namespace ExpiryStoreSchema {
  export const key = 'key';
  export const expiry = 'expiry';
}

export class ExpiryStore<K extends string> extends KeyValueStore<K, ExpiryRecord<K>> {
  public static configure(): Config {
    return {
      make(tx) {
        const store = tx.db.objectStoreNames.contains(name)
          ? tx.objectStore(name)
          : tx.db.createObjectStore(name, {
            keyPath: ExpiryStoreSchema.key,
            autoIncrement: false
          });
        if (!store.indexNames.contains(ExpiryStoreSchema.key)) {
          void store.createIndex(ExpiryStoreSchema.key, ExpiryStoreSchema.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(ExpiryStoreSchema.expiry)) {
          void store.createIndex(ExpiryStoreSchema.expiry, ExpiryStoreSchema.expiry);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(name)
            && db.transaction(name).objectStore(name).indexNames.contains(ExpiryStoreSchema.key)
            && db.transaction(name).objectStore(name).indexNames.contains(ExpiryStoreSchema.expiry);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    database: string,
    store: {
      delete(key: K): void;
    },
    access: Observer<any[], EventStore.InternalEvent<K>, void>,
    ages: Map<K, number>,
    cancellation: Cancellee<void>,
  ) {
    super(database, name, ExpiryStoreSchema.key);
    void Object.freeze(this);

    let timer = 0;
    let scheduled = Infinity;
    let schedule = (date: number): void => {
      assert(date > Date.now() - 10);
      if (scheduled < date) return;
      void clearTimeout(timer);
      scheduled = date;
      timer = setTimeout(() => {
        scheduled = Infinity;
        void this.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', cursor => {
          if (!cursor) return;
          const record: ExpiryRecord<K> = cursor.value;
          if (record.expiry > Date.now() && Number.isFinite(record.expiry)) return void schedule(record.expiry);
          void store.delete(record.key);
          return void cursor.continue();
        });
      }, date - Date.now());
    };
    void cancellation.register(() => void clearTimeout(timer))

    void schedule(Date.now());
    void access
      .monitor([], ({key, type}) => {
        switch (type) {
          case EventStore.EventType.delete:
            return void this.delete(key);
          default:
            if (!ages.has(key)) return;
            assert(ages.get(key)! < Infinity);
            const expiry = Date.now() + ages.get(key)!;
            void this.set(key, new ExpiryRecord(key, expiry));
            return void schedule(expiry);
        }
      });
  }
}

class ExpiryRecord<K extends string> {
  constructor(
    public readonly key: K,
    public readonly expiry: number
  ) {
    assert(Number.isSafeInteger(expiry));
    assert(expiry >= Date.now());
  }
}
