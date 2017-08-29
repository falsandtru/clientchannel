import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { Cancellee } from 'spica/cancellation';
import { Channel } from '../../../broadcast/channel';

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
    private readonly chan: {
      meta(key: K): { id: number; };
      has(key: K): boolean;
      delete(key: K): void;
    },
    private readonly cancellation: Cancellee<void>,
    private readonly channel: Channel<K>,
    private readonly listen: Listen,
  ) {
    void this.schedule(Date.now() + 60 * 1000);
    void Object.freeze(this);
  }
  private store = new class extends KeyValueStore<K, ExpiryRecord<K>> { }(name, ExpiryStoreSchema.key, this.listen);
  private schedule = ((timer = 0, scheduled = Infinity) => {
    return (date: number): void => {
      assert(date > Date.now() - 10);
      if (date >= scheduled) return;
      scheduled = date;
      void clearTimeout(timer);
      timer = setTimeout(() => {
        scheduled = Infinity;
        let count = 0;
        return void this.store.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', (cursor, error) => {
          if (this.cancellation.canceled) return;
          if (error) return void this.schedule(Date.now() + 10 * 1000);
          if (!cursor) return;
          const { key, expiry }: ExpiryRecord<K> = cursor.value;
          if (expiry > Date.now()) return void this.schedule(expiry);
          if (!this.chan.has(key) && this.chan.meta(key).id > 0) return void cursor.continue();
          if (!this.channel.ownership.take(key, 0)) return void cursor.continue();
          if (++count > 10) return void this.schedule(Date.now() + 5 * 1000);
          void this.chan.delete(key);
          return void cursor.continue();
        });
      }, Math.max(date - Date.now(), 3 * 1000));
    };
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
    assert(Number.isFinite(expiry));
    assert(Number.isSafeInteger(expiry));
    assert(expiry >= Date.now());
  }
}
