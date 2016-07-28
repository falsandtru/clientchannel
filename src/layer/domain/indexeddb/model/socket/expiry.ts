import { event, IDBEventType, Config, IDBCursorDirection, IDBTransactionMode } from '../../../../infrastructure/indexeddb/api';
import { KeyValueStore } from '../../../../data/store/key-value';
import { EventStore } from '../../../../data/store/event';
import { DataStore } from './data';

export const STORE_NAME = 'expiry';

export class ExpiryStore<K extends string> extends KeyValueStore<K, ExpiryRecord<K>> {
  public static readonly fields = Object.freeze({
    key: <'key'>'key',
    expiry: <'expiry'>'expiry'
  });
  public static configure(): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(STORE_NAME)
          ? db.transaction(STORE_NAME).objectStore(STORE_NAME)
          : db.createObjectStore(STORE_NAME, {
            keyPath: ExpiryStore.fields.key,
            autoIncrement: false
          });
        if (!store.indexNames.contains(ExpiryStore.fields.key)) {
          void store.createIndex(ExpiryStore.fields.key, ExpiryStore.fields.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(ExpiryStore.fields.expiry)) {
          void store.createIndex(ExpiryStore.fields.expiry, ExpiryStore.fields.expiry);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(STORE_NAME)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(ExpiryStore.fields.key)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(ExpiryStore.fields.expiry);
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
    data: DataStore<K, any>,
    expiries: Map<K, number>
  ) {
    super(database, STORE_NAME, ExpiryStore.fields.key);
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
        void this.cursor(null, ExpiryStore.fields.expiry, IDBCursorDirection.next, IDBTransactionMode.readonly, cursor => {
          if (!cursor) return;
          const record: ExpiryRecord<K> = cursor.value;
          if (record.expiry > Date.now()) {
            void schedule(record.expiry);
          }
          else {
            void store.delete(record.key);
            void cursor.continue();
          }
        });
      }, date - Date.now());
      void event.once([database, IDBEventType.destroy], () => void clearTimeout(timer));
    };

    void schedule(Date.now());
    void data.events_.access
      .monitor([], ({key, type}) => {
        if (type === EventStore.EventType.delete) {
          void this.delete(key);
        }
        else {
          if (!expiries.has(key)) return;
          assert(expiries.get(key) < Infinity);
          const expiry = Date.now() + expiries.get(key);
          void this.set(key, new ExpiryRecord(key, expiry));
          void schedule(expiry);
        }
      });
  }
}

class ExpiryRecord<K extends string> {
  constructor(
    public readonly key: K,
    public readonly expiry: number
  ) {
  }
}
