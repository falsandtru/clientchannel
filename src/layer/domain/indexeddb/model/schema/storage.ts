import {Observable, Set} from 'arch-stream';
import {open, destroy, Config, Access, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../../../infrastructure/indexeddb/api';
import {IdNumber, KeyString} from '../types';
import {UnsavedEventRecord, SavedEventRecord, ESEventType, ESEvent} from '../store/event';
import {DataStore, DataValue as StorageValue} from './storage/data';
import {AccessStore, STORE_FIELDS as AccessStoreFields} from './storage/access';
import {noop} from '../../../../../lib/noop';

export {
  UnsavedEventRecord as StorageRecord,
  StorageValue,
  ESEventType
}

export class Storage<T extends StorageValue> {
  constructor(public name: string, destroy: (err: DOMError, event: Event) => boolean) {
    const access = open(name, {
      make(db) {
        return DataStore.configure().make(db)
            && AccessStore.configure().make(db);
      },
      verify(db) {
        return DataStore.configure().verify(db)
            && AccessStore.configure().verify(db);
      },
      destroy(err, ev) {
        return DataStore.configure().destroy(err, ev)
            && AccessStore.configure().destroy(err, ev)
            && destroy(err, ev);
      }
    });
    this.schema = new Schema<T>(access);
    this.events = this.schema.data.events;
  }
  protected schema: Schema<T>;
  public events: {
    load: Observable<string, ESEvent, void>;
    save: Observable<string, ESEvent, void>;
    loss: Observable<string, ESEvent, void>;
  };
  public keys(cb: (keys: string[], error: DOMError) => any = noop): void {
    return this.schema.data.keys(cb);
  }
  public has(key: string): boolean {
    return this.schema.data.has(KeyString(key));
  }
  public get(key: string): T {
    return this.schema.data.get(KeyString(key));
  }
  public add(record: UnsavedEventRecord<T>): void {
    return void this.schema.data.add(record);
  }
  public delete(key: string): void {
    void this.schema.data.delete(KeyString(key));
  }
  public head(key: string): number {
    return this.schema.data.head(KeyString(key));
  }
  public recent(limit: number, cb: (keys: string[], error: DOMError) => any): void {
    const keys: string[] = [];
    void this.schema.access.cursor(
      null,
      AccessStoreFields.date,
      IDBCursorDirection.prevunique,
      IDBTransaction.readonly,
      (cursor, err) => {
        if (!cursor) return void cb(keys, err);
        if (--limit < 0) return;
        void keys.push(cursor.primaryKey);
        void cursor.continue();
      }
    );
  }
  public clean(until: number = Infinity, key?: string): void {
    void this.schema.data.clean(until, key && KeyString(key));
  }
  public destroy(): void {
    void destroy(this.name);
  }
}

class Schema<T extends StorageValue> {
  constructor(
    access: Access
  ) {
    this.data = new DataStore<KeyString, T>(access);
    this.access = new AccessStore(access, this.data.events.access);
    void Object.freeze(this);
  }
  public data: DataStore<KeyString, T>;
  public access: AccessStore;
}
