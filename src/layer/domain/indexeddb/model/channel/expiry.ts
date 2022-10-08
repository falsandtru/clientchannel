import { min } from 'spica/alias';
import { Listen, Config } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/kvs/store';
import { ChannelStore } from '../channel';
import { Ownership } from '../../../ownership/channel';
import { Cancellation, Cancellee } from 'spica/cancellation';
import { setTimer, setRepeatTimer } from 'spica/timer';

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
    let untimer: () => void;
    let delay = 10 * 1000;
    let schedule = Infinity;
    return (timeout: number): void => {
      timeout = min(timeout, 60 * 60 * 1000);
      if (Date.now() + timeout >= schedule) return;
      schedule = Date.now() + timeout;
      untimer?.();
      untimer = setTimer(timeout, () => {
        if (!this.cancellation.isAlive()) return;
        if (schedule === 0) return;
        schedule = Infinity;
        if (!this.ownership.take('store', delay)) return void this.schedule(delay *= 2);
        if (this.chan.lock) return void this.schedule(delay);
        let untimer = setRepeatTimer(1000, () => {
          if (this.ownership.extend('store', delay)) return;
          untimer();
        });
        const limit = 100;
        schedule = 0;
        this.chan.lock = true;
        return void this.store.getAll<ExpiryRecord<K>>(
          null, limit, ExpiryStoreSchema.expiry, 'readonly', [],
          (error, cursor, tx) => {
            if (!cursor && !tx) return;
            this.chan.lock = false;
            schedule = Infinity;
            untimer();
            if (!this.cancellation.isAlive()) return;
            if (error) return void this.schedule(delay * 10);
            if (!cursor) return;
            if (!this.ownership.extend('store', delay)) return void this.schedule(delay *= 2);
            for (const { key, expiry } of cursor) {
              if (expiry > Date.now()) return void this.schedule(expiry - Date.now());
              this.chan.has(key) || this.chan.meta(key).date === 0
                ? this.chan.delete(key)
                : this.chan.clean(key);
              assert(!this.chan.has(key));
            }
            cursor.length === limit && this.schedule(delay);
          });
      });
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
    key: K,
    expiry: number
  ) {
    assert(Number.isFinite(expiry));
    assert(Number.isSafeInteger(expiry));
    assert(expiry >= Date.now());
    this[ExpiryStoreSchema.key] = key;
    this[ExpiryStoreSchema.expiry] = expiry;
  }
  // Bug: TypeScript
  public readonly [ExpiryStoreSchema.key]: K = '' as K;
  // Bug: TypeScript
  public readonly [ExpiryStoreSchema.expiry]: number = 0;
}
