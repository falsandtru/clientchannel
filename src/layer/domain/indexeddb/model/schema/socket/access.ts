import {Observable} from 'arch-stream';
import {Config, Access} from '../../../../../infrastructure/indexeddb/api';
import {KeyString} from '../../types';
import {AbstractKeyValueStore} from '../../store/key-value';
import {ESEventType, ESEvent} from '../../store/event';

export const STORE_NAME = 'access';
export const STORE_FIELDS = {
  key: 'key',
  date: 'date'
};

class AccessRecord {
  constructor(
    public key: KeyString,
    public date: number
  ) {
  }
}

export class AccessStore extends AbstractKeyValueStore<string, AccessRecord> {
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
        if (!store.indexNames.contains(STORE_FIELDS.date)) {
          void store.createIndex(STORE_FIELDS.date, STORE_FIELDS.date);
        }
        return true;
      },
      verify(db) {
        return db.objectStoreNames.contains(STORE_NAME)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(STORE_FIELDS.key)
            && db.transaction(STORE_NAME).objectStore(STORE_NAME).indexNames.contains(STORE_FIELDS.date);
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    access: Access,
    event: Observable<string, ESEvent, void>
  ) {
    super(access, STORE_NAME, STORE_FIELDS.key);
    void Object.freeze(this);

    void event
      .monitor([], ({key, type}) =>
        type === ESEventType.delete
          ? void this.delete(key)
          : void this.set(key, new AccessRecord(key, Date.now()))
      );
  }
}
