import { Listen, Config } from '../../infrastructure/indexeddb/api';
import { noop } from '../../../lib/noop';
import { Cancellation } from 'spica/cancellation';
import { tick } from 'spica/clock';

export abstract class KeyValueStore<K extends string, V extends IDBValidValue> {
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
    protected readonly name: string,
    private readonly index: string,
    private readonly listen: Listen,
  ) {
    if (typeof index !== 'string') throw new TypeError();
  }
  private readonly cache = new Map<K, V>();
  private tx_: {
    rw?: IDBTransaction;
    rwc: number;
  } = {
    rwc: 0,
  };
  private get txrw(): IDBTransaction | undefined {
    if (++this.tx_.rwc > 25) {
      this.tx_.rwc = 0;
      this.tx_.rw = undefined;
      return;
    }
    return this.tx_.rw;
  }
  private set txrw(tx: IDBTransaction | undefined) {
    if (!tx) return;
    assert(tx.mode === 'readwrite');
    if (this.tx_.rw && this.tx_.rw === tx) return;
    this.tx_.rwc = 0;
    this.tx_.rw = tx;
    void tick(() => this.tx_.rw = undefined);
  }
  public fetch(key: K, cb: (error: DOMException | Error | null) => void = noop, cancellation = new Cancellation()): undefined {
    return void this.listen(db => {
      if (cancellation.canceled) return void cb(new Error('Cancelled.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = this.index
        ? tx
            .objectStore(this.name)
            .index(this.index)
            .get(key)
        : tx
            .objectStore(this.name)
            .get(key);
      void req.addEventListener('success', () =>
        void cb(req.error));
      void tx.addEventListener('complete', () =>
        void cancellation.close());
      void tx.addEventListener('error', () => (
        void cancellation.close(),
        void cb(tx.error || req.error)));
      void tx.addEventListener('abort', () => (
        void cancellation.close(),
        void cb(tx.error || req.error)));
      void cancellation.register(() =>
        void tx.abort());
    }, () => void cb(new Error('Access has failed.')));
  }
  public has(key: K): boolean {
    return this.cache.has(key);
  }
  public get(key: K): V | undefined {
    return this.cache.get(key);
  }
  public set(key: K, value: V, cb: (key: K, error: DOMException | Error) => void = noop): V {
    return this.put(value, key, cb);
  }
  private put(value: V, key: K, cb: (key: K, error: DOMException | Error) => void = noop): V {
    void this.cache.set(key, value);
    void this.listen(db => {
      if (!this.cache.has(key)) return;
      const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
      this.index
        ? tx
          .objectStore(this.name)
          .put(this.cache.get(key))
        : tx
          .objectStore(this.name)
          .put(this.cache.get(key), key);
      void tx.addEventListener('complete', () =>
        void cb(key, tx.error));
      void tx.addEventListener('error', () =>
        void cb(key, tx.error));
      void tx.addEventListener('abort', () =>
        void cb(key, tx.error));
    }, () => void cb(key, new Error('Access has failed.')));
    return value;
  }
  public delete(key: K, cb: (error: DOMException | Error) => void = noop): void {
    void this.cache.delete(key);
    void this.listen(db => {
      const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
      void tx
        .objectStore(this.name)
        .delete(key);
      void tx.addEventListener('complete', () =>
        void cb(tx.error));
      void tx.addEventListener('error', () =>
        void cb(tx.error));
      void tx.addEventListener('abort', () =>
        void cb(tx.error));
    }, () => void cb(new Error('Access has failed.')));
  }
  public cursor(query: IDBValidKey | IDBKeyRange | null, index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, cb: (cursor: IDBCursorWithValue | null, error: DOMException | Error | null) => void): void {
    void this.listen(db => {
      const tx = db.transaction(this.name, mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      void req.addEventListener('success', () => {
        const cursor: IDBCursorWithValue | null = req.result;
        if (!cursor) return;
        void this.cache.set(cursor.primaryKey as K, { ...cursor.value });
        void cb(cursor, req.error);
      });
      void tx.addEventListener('complete', () =>
        void cb(null, req.error));
      void tx.addEventListener('error', () =>
        void cb(null, req.error));
      void tx.addEventListener('abort', () =>
        void cb(null, req.error));
    }, () => void cb(null, new Error('Access has failed.')));
  }
}
