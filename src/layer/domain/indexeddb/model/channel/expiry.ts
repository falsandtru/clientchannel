import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { Cancellee } from 'spica/cancellation';
import { Ownership } from '../../../ownership/channel';

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
    private readonly ownership: Ownership<string>,
    private readonly listen: Listen,
  ) {
    void this.schedule(10 * 1000);
    void Object.freeze(this);
  }
  private store = new class extends KeyValueStore<K, ExpiryRecord<K>> { }(name, ExpiryStoreSchema.key, this.listen);
  private schedule = (() => {
    let timer = 0;
    let scheduled = Infinity;
    let running = false;
    void this.ownership.take('store', 0);
    return (timeout: number): void => {
      timeout = Math.max(timeout, 3 * 1000);
      if (running) return;
      if (Date.now() + timeout >= scheduled) return;
      scheduled = Date.now() + timeout;
      void clearTimeout(timer);
      timer = setTimeout(() => {
        scheduled = Infinity;
        if (!this.ownership.take('store', 5 * 1000)) return;
        const since = Date.now();
        let count = 0;
        let retry = false;
        return void this.store.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', (cursor, error) => {
          running = false;
          if (this.cancellation.canceled) return;
          if (error) return void this.schedule(Math.max(60 * 1000, (Date.now() - since) * 3));
          if (!cursor && retry) return void this.schedule(Math.max(10 * 1000, (Date.now() - since) * 3));
          if (!cursor) return;
          if (!this.ownership.take('store', 3 * 1000)) return;
          const { key, expiry }: ExpiryRecord<K> = cursor.value;
          if (expiry > Date.now()) return void this.schedule(Math.max(expiry - Date.now(), (Date.now() - since) * 3));
          if (++count > 50) return void this.schedule((Date.now() - since) * 3);
          running = true;
          if (!this.ownership.take(`key:${key}`, 5 * 1000)) return retry = true, void cursor.continue();
          void this.chan.delete(key);
          return void cursor.continue();
        });
      }, timeout);
    };
  })();
  public set(key: K, age: number): void {
    if (age === Infinity) return void this.delete(key);
    void this.schedule(age);
    void this.store.set(key, new ExpiryRecord(key, Date.now() + age));
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
