import {LocalSocketObjectMetaData} from 'localsocket';
import {IObservableObserver, Set, Map} from 'arch-stream';
import {open, destroy, Config, Access, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../../../infrastructure/indexeddb/api';
import {IdNumber, KeyString} from '../types';
import {UnsavedEventRecord, SavedEventRecord, ESEventType, ESEvent} from '../store/event';
import {DataStore, DataValue as SocketValue} from './socket/data';
import {AccessStore, STORE_FIELDS as AccessStoreFields} from './socket/access';
import {ExpiryStore, STORE_FIELDS as ExpireStoreFields} from './socket/expiry';
import {noop} from '../../../../../lib/noop';

export {
  UnsavedEventRecord as SocketRecord,
  SocketValue,
  ESEventType
}

export class SocketStore<T extends SocketValue> {
  constructor(
    public name: string,
    destroy: (err: DOMError, event: Event) => boolean,
    public expiry = Infinity
  ) {
    const access = open(name, {
      make(db) {
        return DataStore.configure().make(db)
            && AccessStore.configure().make(db)
            && ExpiryStore.configure().make(db);
      },
      verify(db) {
        return DataStore.configure().verify(db)
            && AccessStore.configure().verify(db)
            && ExpiryStore.configure().verify(db);
      },
      destroy(err, ev) {
        return DataStore.configure().destroy(err, ev)
            && AccessStore.configure().destroy(err, ev)
            && ExpiryStore.configure().destroy(err, ev)
            && destroy(err, ev);
      }
    });
    this.schema = new Schema<T>(access, this.expiries);
    this.events = this.schema.data.events;
  }
  protected schema: Schema<T>;
  public events: {
    load: IObservableObserver<[string] | [string, string] | [string, string, string], ESEvent, void>,
    save: IObservableObserver<[string] | [string, string] | [string, string, string], ESEvent, void>,
    loss: IObservableObserver<[string] | [string, string] | [string, string, string], ESEvent, void>
  };
  public sync(keys: KeyString[], cb: (errs?: DOMError[]) => any = noop): void {
    return this.schema.data.sync(keys, cb);
  }
  public meta(key: string): LocalSocketObjectMetaData {
    return this.schema.data.meta(KeyString(key));
  }
  public has(key: string): boolean {
    return this.schema.data.has(KeyString(key));
  }
  public get(key: string): T {
    return this.schema.data.get(KeyString(key));
  }
  public add(record: UnsavedEventRecord<T>): void {
    return this.schema.data.add(record);
  }
  public delete(key: string): void {
    return this.schema.data.delete(KeyString(key));
  }
  private expiries = new Map<string, number>();
  public expire(key: string, expiry: number = this.expiry): void {
    assert(expiry > 0);
    if (expiry === Infinity) return;
    return void this.expiries.set(key, expiry);
  }
  public recent(limit: number, cb: (keys: string[], error: DOMError) => any): void {
    const keys: string[] = [];
    return void this.schema.access.cursor(
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
  public destroy(): void {
    return destroy(this.name);
  }
}

class Schema<T extends SocketValue> {
  constructor(
    access: Access,
    expiries: Map<string, number>
  ) {
    this.data = new DataStore<KeyString, T>(access);
    this.access = new AccessStore(access, this.data.events.access);
    this.expire = new ExpiryStore(access, this.data, expiries);
    void Object.freeze(this);
  }
  public data: DataStore<KeyString, T>;
  public access: AccessStore;
  public expire: ExpiryStore;
}
