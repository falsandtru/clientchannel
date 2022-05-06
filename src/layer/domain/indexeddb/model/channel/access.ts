import { Infinity, Date, setTimeout, clearTimeout, setInterval, clearInterval } from 'spica/global';
import { min } from 'spica/alias';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { ChannelStore } from '../channel';
import { Ownership } from '../../../ownership/channel';
import { Cancellee } from 'spica/cancellation';

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
          store.createIndex(AccessStoreSchema.key, AccessStoreSchema.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(AccessStoreSchema.date)) {
          store.createIndex(AccessStoreSchema.date, AccessStoreSchema.date);
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
    private readonly chan: ChannelStore<K, any>,
    private readonly cancellation: Cancellee<void>,
    private readonly ownership: Ownership<string>,
    private readonly listen: Listen,
    private readonly capacity: number,
  ) {
    this.schedule(10 * 1000);
    assert(Object.freeze(this));
  }
  public readonly name = name;
  private store = new class extends KeyValueStore<K, AccessRecord<K>> { }(name, AccessStoreSchema.key, this.listen);
  public schedule = (() => {
    let timer: ReturnType<typeof setTimeout> | 0 = 0;
    let delay = 10 * 1000;
    let schedule = Infinity;
    return (timeout: number) => {
      if (this.capacity === Infinity) return;
      timeout = min(timeout, 60 * 60 * 1000);
      if (Date.now() + timeout >= schedule) return;
      schedule = Date.now() + timeout;
      clearTimeout(timer as 0);
      timer = setTimeout(async () => {
        if (!this.cancellation.isAlive) return;
        if (schedule === 0) return;
        schedule = Infinity;
        if (!this.ownership.take('store', delay)) return void this.schedule(delay *= 2);
        if (this.chan.lock) return void this.schedule(delay);
        let timer: ReturnType<typeof setTimeout> | 0 = setInterval(() => {
          if (this.ownership.extend('store', delay)) return;
          clearInterval(timer as 0);
          timer = 0;
        }, delay / 2);
        this.chan.lock = true;
        const size = await this.store.count(null, AccessStoreSchema.key).catch(() => NaN);
        this.chan.lock = false;
        if (size >= 0 === false) return void clearInterval(timer) || void this.schedule(delay *= 2);
        if (size <= this.capacity) return void clearInterval(timer);
        const limit = 100;
        schedule = 0;
        this.chan.lock = true;
        return void this.store.getAll<AccessRecord<K>>(
          null, min(size - this.capacity, limit), AccessStoreSchema.date, 'readonly', [],
          (error, cursor, tx) => {
            if (!cursor && !tx) return;
            this.chan.lock = false;
            schedule = Infinity;
            if (timer) {
              clearInterval(timer);
              timer = 0;
            }
            if (!this.cancellation.isAlive) return;
            if (error) return void this.schedule(delay * 10);
            if (!cursor) return;
            for (const { key } of cursor) {
              this.chan.has(key) || this.chan.meta(key).date === 0
                ? this.chan.delete(key)
                : this.chan.clean(key);
              assert(!this.chan.has(key));
            }
            cursor.length === limit && this.schedule(delay);
          });
      }, timeout);
    };
  })();
  public recent(cb?: (key: K, keys: readonly K[]) => boolean | void, timeout?: number): Promise<K[]> {
    return new Promise((resolve, reject) => {
      let done = false;
      timeout! >= 0 && setTimeout(() => done = !void reject(new Error('Timeout.')), timeout);
      const keys: K[] = [];
      void this.store.cursor(
        null, AccessStoreSchema.date, 'prev', 'readonly', [],
        (error, cursor): void => {
          if (done) return;
          if (error) return void reject(error);
          if (!cursor) return void resolve(keys);
          const { key, active }: AccessRecord<K> = cursor.value;
          if (active) {
            keys.push(key);
            if (cb?.(key, keys) === false) return void resolve(keys);
          }
          cursor.continue();
        });
    });
  }
  public set(key: K, active = true): void {
    this.store.set(key, new AccessRecord(key, active));
  }
  public close(): void {
    this.store.close();
  }
}

class AccessRecord<K extends string> {
  constructor(
    key: K,
    public readonly active: boolean,
  ) {
    this[AccessStoreSchema.key] = key;
  }
  public readonly [AccessStoreSchema.key]: K;
  public readonly [AccessStoreSchema.date]: number = Date.now();
}
