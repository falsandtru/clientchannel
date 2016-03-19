import {Observable, Map} from 'arch-stream';
import {open, Config, Access, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../../../infrastructure/indexeddb/api';
import {IDBValue} from '../types';
import {noop} from '../../../../../lib/noop';

export enum EventTypes {
  get,
  put,
  delete
}

export abstract class AbstractKeyValueStore<K extends string, V extends IDBValue> {
  public static configure(): Config {
    return {
      make() {
        return true;
      },
      verify() {
        return true;
      },
      destroy() {
        return true;
      }
    };
  }
  constructor(
    protected access: Access,
    public name: string,
    protected index: string
  ) {
    if (typeof index !== 'string') throw new TypeError();
  }
  protected cache = new Map<K, V>();
  public events = {
    access: new Observable<[K], [[K], EventTypes], void>()
  };
  public get(key: K, cb: (value: V, error: DOMError) => any = noop): V {
    void this.events.access.emit([key], [[key], EventTypes.get]);
    void this.access(db => {
      const tx = db.transaction(this.name, IDBTransaction.readonly);
      const req = this.index
        ? tx
          .objectStore(this.name)
          .index(this.index)
          .get(key)
        : tx
          .objectStore(this.name)
          .get(key);
      let result: V;
      req.onsuccess = _ =>
        result = req.result !== void 0 && req.result !== null
          ? req.result
          : this.cache.get(key);
      tx.oncomplete = _ => cb(result, tx.error);
      tx.onerror = tx.onabort = _ => cb(void 0, tx.error);
    });
    return this.cache.get(key);
  }
  public set(key: K, value: V, cb: (key: K, error: DOMError) => any = noop): V {
    return this.put(value, key, cb);
  }
  protected put(value: V, key: K, cb: (key: K, error: DOMError) => any = noop): V {
    void this.cache.set(key, value);
    void this.events.access.emit([key], [[key], EventTypes.put]);
    void this.access(db => {
      if (!this.cache.has(key)) return;
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const req = this.index
        ? tx
          .objectStore(this.name)
          .put(this.cache.get(key))
        : tx
          .objectStore(this.name)
          .put(this.cache.get(key), key);
      tx.oncomplete = tx.onerror = tx.onabort = _ => void cb(key, tx.error);
    });
    return this.cache.get(key);
  }
  public delete(key: K, cb: (error: DOMError) => any = noop): void {
    void this.cache.delete(key);
    void this.events.access.emit([key], [[key], EventTypes.delete]);
    void this.access(db => {
      const tx = db.transaction(this.name, IDBTransaction.readwrite);
      const req = tx
        .objectStore(this.name)
        .delete(key);
      tx.oncomplete = tx.onerror = tx.onabort = _ => void cb(tx.error);
    });
  }
  public cursor(query: any, index: string, direction: string, mode: string, cb: (cursor: IDBCursorWithValue, error: DOMError) => any): void {
    void this.access(db => {
      const tx = db
        .transaction(this.name, mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      req.onsuccess = _ => req.result && cb(req.result, req.error);
      tx.oncomplete = _ => void cb(null, tx.error);;
      tx.onerror = tx.onabort = _ => void cb(null, tx.error);
    });
  }
}
