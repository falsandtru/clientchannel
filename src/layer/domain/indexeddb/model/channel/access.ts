import { Date, Promise, setTimeout } from 'spica/global';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';

export const name = 'access';

const enum AccessStoreSchema {
  key = 'key',
  date = 'date',
}

export class AccessStore<K extends string> {
  public static configure(): Config {
    return {
      make(tx) {
        const store = tx.db.objectStoreNames.contains(name)
          ? tx.objectStore(name)
          : tx.db.createObjectStore(name, {
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
    private readonly listen: Listen,
  ) {
    assert(Object.freeze(this));
  }
  private store = new class extends KeyValueStore<K, AccessRecord<K>> { }(name, AccessStoreSchema.key, this.listen);
  public recent(cb?: (key: K, keys: readonly K[]) => boolean | void, timeout?: number): Promise<K[]> {
    const keys: K[] = [];
    let done = false;
    return new Promise((resolve, reject) => (
      timeout !== void 0 && void setTimeout(() => done = !void reject(new Error('Timeout.')), timeout),
      void this.store.cursor(
        null,
        AccessStoreSchema.date,
        'prev',
        'readonly',
        (cursor, error): void => {
          if (done) return;
          if (error) return void reject(error);
          if (!cursor) return void resolve(keys);
          const { key }: AccessRecord<K> = cursor.value;
          void keys.push(key);
          if (cb?.(key, keys) === false) return void resolve(keys);
          void cursor.continue();
        })));
  }
  public fetch(key: K): void {
    return this.store.fetch(key);
  }
  public get(key: K): number {
    return this.store.has(key)
      ? this.store.get(key)!.date
      : 0;
  }
  public set(key: K): void {
    void this.store.set(key, new AccessRecord(key));
  }
  public delete(key: K): void {
    void this.store.delete(key);
  }
  public close(): void {
    void this.store.close();
  }
}

class AccessRecord<K extends string> {
  constructor(
    public readonly key: K,
  ) {
  }
  public readonly date: number = Date.now();
}
