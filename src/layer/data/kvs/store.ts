import { Listen, Config } from '../../infrastructure/indexeddb/api';
import { Cancellation } from 'spica/cancellation';
import { tick } from 'spica/clock';
import { causeAsyncException } from 'spica/exception';

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
  }
  private alive = true;
  private readonly cache = new Map<K, V>();
  private tx: {
    rw?: IDBTransaction;
    rwc: number;
  } = {
    rwc: 0,
  };
  private get txrw(): IDBTransaction | undefined {
    if (++this.tx.rwc > 25) {
      this.tx.rwc = 0;
      this.tx.rw = void 0;
      return;
    }
    return this.tx.rw;
  }
  private set txrw(tx: IDBTransaction | undefined) {
    if (!tx) return;
    assert(tx.mode === 'readwrite');
    if (this.tx.rw && this.tx.rw === tx) return;
    this.tx.rwc = 0;
    this.tx.rw = tx;
    void tick(() => this.tx.rw = void 0);
  }
  public fetch(key: K, cb?: (error: DOMException | Error | null) => void, cancellation?: Cancellation): undefined {
    if (!this.alive) return void cb?.(new Error('Session is already closed.'));
    return void this.listen(db => {
      if (!this.alive) return void cb?.(new Error('Session is already closed.'));
      if (cancellation?.cancelled) return void cb?.(new Error('Request is cancelled.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = this.index
        ? tx
            .objectStore(this.name)
            .index(this.index)
            .get(key)
        : tx
            .objectStore(this.name)
            .get(key);
      void req.addEventListener('success', () => (
        this.cache.set(key, req.result),
        void cb?.(req.error)));
      void tx.addEventListener('complete', () =>
        void cancellation?.close());
      void tx.addEventListener('error', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error)));
      void tx.addEventListener('abort', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error)));
      void cancellation?.register(() =>
        void tx.abort());
    }, () => void cb?.(new Error('Request has failed.')));
  }
  public has(key: K): boolean {
    return this.cache.has(key);
  }
  public get(key: K): V | undefined {
    return this.cache.get(key);
  }
  public set(key: K, value: V, cb?: (key: K, error: DOMException | Error | null) => void): V {
    return this.put(value, key, cb);
  }
  private put(value: V, key: K, cb?: (key: K, error: DOMException | Error | null) => void): V {
    void this.cache.set(key, value);
    if (!this.alive) return value;
    void this.listen(db => {
      if (!this.alive) return;
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
        void cb?.(key, tx.error));
      void tx.addEventListener('error', () =>
        void cb?.(key, tx.error));
      void tx.addEventListener('abort', () =>
        void cb?.(key, tx.error));
    }, () => void cb?.(key, new Error('Request has failed.')));
    return value;
  }
  public delete(key: K, cb?: (error: DOMException | Error | null) => void): void {
    void this.cache.delete(key);
    if (!this.alive) return;
    void this.listen(db => {
      if (!this.alive) return;
      const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
      void tx
        .objectStore(this.name)
        .delete(key);
      void tx.addEventListener('complete', () =>
        void cb?.(tx.error));
      void tx.addEventListener('error', () =>
        void cb?.(tx.error));
      void tx.addEventListener('abort', () =>
        void cb?.(tx.error));
    }, () => void cb?.(new Error('Request has failed.')));
  }
  public cursor(query: IDBValidKey | IDBKeyRange | null, index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, cb: (cursor: IDBCursorWithValue | null, error: DOMException | Error | null) => void): void {
    if (!this.alive) return;
    void this.listen(db => {
      if (!this.alive) return;
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
        try {
          void this.cache.set(cursor.primaryKey as K, { ...cursor.value });
          void cb(cursor, req.error);
        }
        catch (reason) {
          void this.delete(cursor.primaryKey as K);
          void causeAsyncException(reason);
        }
      });
      void tx.addEventListener('complete', () =>
        void cb(null, req.error));
      void tx.addEventListener('error', () =>
        void cb(null, req.error));
      void tx.addEventListener('abort', () =>
        void cb(null, req.error));
    }, () => void cb(null, new Error('Request has failed.')));
  }
  public close() {
    this.alive = false;
  }
}
