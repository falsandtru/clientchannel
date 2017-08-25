import { Cancellee } from 'spica/cancellation';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';

const name = 'expiry';

namespace ExpiryStoreSchema {
  export const key = 'key';
  export const expiry = 'expiry';
}

export class ExpiryStore<K extends string> {
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
    private readonly channel: {
      delete(key: K): void;
    },
    private readonly cancellation: Cancellee<void>,
    private readonly listen: Listen,
  ) {
    void Object.freeze(this);
    void this.schedule(Date.now());
  }
  private store = new class extends KeyValueStore<K, ExpiryRecord<K>> { }(name, ExpiryStoreSchema.key, this.listen);
  private schedule = ((timer = 0, scheduled = Infinity) => {
    void this.cancellation.register(() => void clearTimeout(timer));
    return (date: number): void => {
      assert(date > Date.now() - 10);
      if (scheduled < date) return;
      void clearTimeout(timer);
      scheduled = date;
      timer = setTimeout(() => {
        scheduled = 0;
        void this.store.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', cursor => {
          if (!cursor) return scheduled = Infinity;
          const record: ExpiryRecord<K> = cursor.value;
          if (record.expiry > Date.now() && Number.isFinite(record.expiry)) {
            scheduled = Infinity;
            return void this.schedule(record.expiry);
          }
          void this.channel.delete(record.key);
          return void cursor.continue();
        });
      }, date - Date.now());
    }
  })();
  public set(key: K, age: number): void {
    if (age === Infinity) return void this.delete(key);
    const expiry = Date.now() + age;
    void this.schedule(expiry);
    void this.store.set(key, new ExpiryRecord(key, expiry));
  }
  public delete(key: K): void {
    void this.store.delete(key);
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
