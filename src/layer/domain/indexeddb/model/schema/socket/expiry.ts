import {Observable, Map} from 'arch-stream';
import {Config, Access, IDBCursorDirection, IDBTransaction} from '../../../../../infrastructure/indexeddb/api';
import {KeyString} from '../../types';
import {AbstractKeyValueStore} from '../../store/key-value';
import {ESEvent, ESEventTypes} from '../../store/event';
import {DataStore} from './data';

export const STORE_NAME = 'expiry';
export const STORE_FIELDS = {
  key: 'key',
  expiry: 'expiry'
};

class ExpiryRecord {
  constructor(
    public key: KeyString,
    public expiry: number
  ) {
  }
}

export class ExpiryStore extends AbstractKeyValueStore<string, ExpiryRecord> {
  public static configure(): Config {
    return {
      make(db) {
        const store = db.objectStoreNames.contains(STORE_NAME)
          ? db.transaction(STORE_NAME).objectStore(STORE_NAME)
          : db.createObjectStore(STORE_NAME, {
            keyPath: STORE_FIELDS.key,
            autoIncrement: false
          });
        if (!store.indexNames.contains(STORE_FIELDS.key)) {
          void store.createIndex(STORE_FIELDS.key, STORE_FIELDS.key, {
            unique: true
          });
        }
        if (!store.indexNames.contains(STORE_FIELDS.expiry)) {
          void store.createIndex(STORE_FIELDS.expiry, STORE_FIELDS.expiry);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(STORE_NAME)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(STORE_FIELDS.key)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(STORE_FIELDS.expiry);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    access: Access,
    data: DataStore<KeyString, any>,
    expiries: Map<string, number>
  ) {
    super(access, STORE_NAME, STORE_FIELDS.key);
    void Object.freeze(this);

    let timer = 0;
    let scheduled = Infinity;
    const schedule = (date: number): void => {
      assert(date > Date.now() - 10);
      if (scheduled < date) return;
      void clearTimeout(timer);
      scheduled = date;
      timer = setTimeout(() => {
        scheduled = Infinity;
        void this.cursor(null, STORE_FIELDS.expiry, IDBCursorDirection.next, IDBTransaction.readonly, cursor => {
          if (!cursor) return;
          const record: ExpiryRecord = cursor.value;
          if (record.expiry > Date.now()) {
            void schedule(record.expiry);
          }
          else {
            void data.delete(record.key);
            void cursor.continue();
          }
        });
      }, date - Date.now());
    };

    void schedule(Date.now());
    void data.events.access
      .monitor(<any>[], ({key, type}) => {
        if (type === ESEventTypes.delete) {
          void this.delete(key)
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
