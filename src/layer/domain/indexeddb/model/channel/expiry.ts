import { Infinity, Math, Date, setTimeout } from 'spica/global';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { ChannelStore } from '../channel';
import { Ownership } from '../../../ownership/channel';
import { Cancellee } from 'spica/cancellation';
import { causeAsyncException } from 'spica/exception';

const name = 'expiry';

const enum ExpiryStoreSchema {
  key = 'key',
  expiry = 'expiry',
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
    private readonly chan: ChannelStore<K, any>,
    private readonly cancellation: Cancellee<void>,
    private readonly ownership: Ownership<string>,
    private readonly listen: Listen,
  ) {
    void this.schedule(10 * 1000);
    assert(Object.freeze(this));
  }
  private store = new class extends KeyValueStore<K, ExpiryRecord<K>> { }(name, ExpiryStoreSchema.key, this.listen);
  private schedule = (() => {
    let timer = 0;
    let scheduled = Infinity;
    let running = false;
    let wait = 5 * 1000;
    void this.ownership.take('store', 0);
    return (timeout: number): void => {
      timeout = Math.max(timeout, 3 * 1000);
      if (Date.now() + timeout >= scheduled) return;
      scheduled = Date.now() + timeout;
      void clearTimeout(timer);
      timer = setTimeout(() => {
        if (!this.cancellation.alive) return;
        if (running) return;
        scheduled = Infinity;
        if (!this.ownership.take('store', wait)) return this.schedule(wait *= 2);
        wait = Math.max(Math.floor(wait / 1.5), 5 * 1000);
        const since = Date.now();
        let retry = false;
        running = true;
        return void this.store.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', (cursor, error) => {
          running = false;
          if (!this.cancellation.alive) return;
          if (error) return void this.schedule(wait * 10);
          if (!cursor) return retry && void this.schedule(wait);
          try {
            const { key, expiry }: ExpiryRecord<K> = cursor.value;
            if (expiry > Date.now()) return void this.schedule(expiry - Date.now());
            if (!this.ownership.extend('store', wait)) return;
            if (Date.now() - since > 1000) return void this.schedule(wait / 2);
            running = true;
            if (!this.ownership.take(`key:${key}`, wait)) return retry = true, void cursor.continue();
            void this.chan.delete(key);
          }
          catch (reason) {
            void cursor.delete();
            void causeAsyncException(reason);
          }
          return void cursor.continue();
        });
      }, timeout) as any;
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
  public close(): void {
    void this.store.close();
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
