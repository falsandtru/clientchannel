import { Infinity, Date, setTimeout, setInterval, clearInterval } from 'spica/global';
import { min } from 'spica/alias';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { ChannelStore } from '../channel';
import { Ownership } from '../../../ownership/channel';
import { Cancellation, Cancellee } from 'spica/cancellation';

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
          store.createIndex(ExpiryStoreSchema.key, ExpiryStoreSchema.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(ExpiryStoreSchema.expiry)) {
          store.createIndex(ExpiryStoreSchema.expiry, ExpiryStoreSchema.expiry);
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
    this.schedule(10 * 1000);
    assert(Object.freeze(this));
  }
  public readonly name = name;
  private store = new class extends KeyValueStore<K, ExpiryRecord<K>> { }(name, ExpiryStoreSchema.key, this.listen);
  public schedule = (() => {
    let timer = 0;
    let delay = 10 * 1000;
    let schedule = Infinity;
    return (timeout: number): void => {
      timeout = min(timeout, 60 * 60 * 1000);
      if (Date.now() + timeout >= schedule) return;
      schedule = Date.now() + timeout;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!this.cancellation.alive) return;
        if (schedule === 0) return;
        if (!this.ownership.take('store', delay)) return void this.schedule(delay *= 2);
        schedule = 0;
        let timer = setInterval(() => {
          if (this.ownership.extend('store', delay)) return;
          clearInterval(timer);
          timer = 0 as any;
        }, delay / 2);
        this.chan.lock = true;
        return void this.store.cursor(
          null, ExpiryStoreSchema.expiry, 'next', 'readonly', [],
          (error, cursor, tx) => {
            if (!cursor && !tx) return;
            this.chan.lock = false;
            if (timer) {
              clearInterval(timer);
              timer = 0 as any;
            }
            schedule = Infinity;
            if (!this.cancellation.alive) return;
            if (error) return void this.schedule(delay * 10);
            if (!cursor) return;
            if (this.chan.lock) return void this.schedule(delay *= 2);
            const { key, expiry }: ExpiryRecord<K> = cursor.value;
            if (expiry > Date.now()) return void this.schedule(expiry - Date.now());
            if (!this.ownership.extend('store', delay)) return void this.schedule(delay *= 2);
            schedule = 0;
            this.chan.lock = true;
            this.chan.has(key) || this.chan.meta(key).date === 0
              ? this.chan.delete(key)
              : this.chan.clean(key);
            assert(!this.chan.has(key));
            return void cursor.continue();
          });
      }, timeout) as any;
    };
  })();
  public load(key: K, cancellation?: Cancellation): undefined {
    return this.store.load(
      key,
      (err, key, value) =>
        !err && value?.expiry! > this.store.get(key)?.expiry!,
      cancellation);
  }
  public set(key: K, age: number): void {
    if (age === Infinity) return void this.store.delete(key);
    this.schedule(age);
    this.store.set(key, new ExpiryRecord(key, Date.now() + age));
  }
  public close(): void {
    this.store.close();
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
