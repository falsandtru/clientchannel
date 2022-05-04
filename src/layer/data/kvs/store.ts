import { Promise } from 'spica/global';
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
    if (++this.tx.rwc < 25 || !this.tx.rw) return;
    const tx = this.tx.rw;
    this.tx.rwc = 0;
    this.tx.rw = void 0;
    void tx.commit();
    return this.tx.rw;
  }
  private set txrw(tx: IDBTransaction | undefined) {
    assert(tx = tx!);
    assert(tx.mode === 'readwrite');
    assert.deepStrictEqual([...tx.objectStoreNames], [this.name]);
    if (this.tx.rw === tx) return;
    this.tx.rwc = 0;
    this.tx.rw = tx;
    const clear = () => {
      if (this.tx.rw !== tx) return;
      this.tx.rw = void 0;
    };
    void this.tx.rw.addEventListener('abort', clear);
    void this.tx.rw.addEventListener('error', clear);
    void this.tx.rw.addEventListener('complete', clear);
    void tick(clear);
  }
  public transact(
    cache: (db: IDBDatabase) => IDBTransaction | undefined,
    success: (tx: IDBTransaction) => void,
    failure: (reason: unknown) => void,
    tx = this.txrw,
  ): void {
    return tx
      ? void success(tx)
      : this.listen(db => {
          const tx = cache(db);
          return tx
            ? void success(this.txrw = tx)
            : void failure(new Error('Session is already closed.'));
        }, failure);
  }
  public load(key: K, cb?: (error: DOMException | Error | null, key: K, value?: V) => boolean | void, cancellation?: Cancellation): undefined {
    if (!this.alive) return void cb?.(new Error('Session is already closed.'), key);
    return void this.listen(db => {
      if (!this.alive) return void cb?.(new Error('Session is already closed.'), key);
      if (cancellation?.cancelled) return void cb?.(new Error('Request is cancelled.'), key);
      const tx = db.transaction(this.name, 'readonly');
      const req: IDBRequest<V> = this.index
        ? tx
            .objectStore(this.name)
            .index(this.index)
            .get(key)
        : tx
            .objectStore(this.name)
            .get(key);
      void req.addEventListener('success', () =>
        cb?.(tx.error || req.error, key, req.result) && this.cache.set(key, req.result));
      void tx.addEventListener('complete', () =>
        void cancellation?.close());
      void tx.addEventListener('error', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error, key)));
      void tx.addEventListener('abort', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error, key)));
      void cancellation?.register(() =>
        void tx.abort());
    }, () => void cb?.(new Error('Request has failed.'), key));
  }
  public has(key: K): boolean {
    return this.cache.has(key);
  }
  public get(key: K): V | undefined {
    return this.cache.get(key);
  }
  public set(key: K, value: V, cb?: (error: DOMException | Error | null, key: K, value: V) => void): V {
    return this.put(value, key, cb);
  }
  private put(value: V, key: K, cb?: (error: DOMException | Error | null, key: K, value: V) => void): V {
    void this.cache.set(key, value);
    if (!this.alive) return value;
    void this.transact(
      db =>
        this.alive && this.cache.has(key)
          ? db.transaction(this.name, 'readwrite')
          : void 0,
      tx => {
        this.index
          ? tx
            .objectStore(this.name)
            .put(this.cache.get(key))
          : tx
            .objectStore(this.name)
            .put(this.cache.get(key), key);
        void tx.addEventListener('complete', () =>
          void cb?.(tx.error, key, value));
        void tx.addEventListener('error', () =>
          void cb?.(tx.error, key, value));
        void tx.addEventListener('abort', () =>
          void cb?.(tx.error, key, value));
      },
      () => void cb?.(new Error('Request has failed.'), key, value));
    return value;
  }
  public delete(key: K, cb?: (error: DOMException | Error | null, key: K) => void): void {
    void this.cache.delete(key);
    if (!this.alive) return;
    void this.transact(
      db =>
        this.alive
          ? db.transaction(this.name, 'readwrite')
          : void 0,
      tx => {
        void tx
          .objectStore(this.name)
          .delete(key);
        void tx.addEventListener('complete', () =>
          void cb?.(tx.error, key));
        void tx.addEventListener('error', () =>
          void cb?.(tx.error, key));
        void tx.addEventListener('abort', () =>
          void cb?.(tx.error, key));
      },
      () => void cb?.(new Error('Request has failed.'), key));
  }
  public count(query: IDBValidKey | IDBKeyRange | null | undefined, index: string): Promise<number> {
    return new Promise((resolve, reject) => void this.listen(db => {
      if (!this.alive) return void reject(new Error('Session is already closed.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .count(query ?? void 0)
        : tx
          .objectStore(this.name)
          .count(query ?? void 0);
      void req.addEventListener('success', () => {
        void resolve(req.result)
      });
      void tx.addEventListener('complete', () =>
        void reject(req.error));
      void tx.addEventListener('error', () =>
        void reject(req.error));
      void tx.addEventListener('abort', () =>
        void reject(req.error));
    }, () => void reject(new Error('Request has failed.'))));
  }
  public cursor(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, stores: string[],
    cb: (error: DOMException | Error | null, cursor: IDBCursorWithValue | null, tx: IDBTransaction | null) => void,
  ): void {
    if (!this.alive) return;
    void this.listen(db => {
      if (!this.alive) return;
      const tx = db.transaction([this.name, ...stores], mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .openCursor(query, direction)
        : tx
          .objectStore(this.name)
          .openCursor(query, direction);
      void req.addEventListener('success', () => {
        const cursor = req.result;
        if (cursor) {
          try {
            void this.cache.set(cursor.primaryKey as K, { ...cursor.value });
            void cb(tx.error || req.error, cursor, tx);
          }
          catch (reason) {
            void cursor.delete();
            void causeAsyncException(reason);
          }
          return;
        }
        else {
          void cb(tx.error || req.error, null, tx);
          mode === 'readwrite' && void tx.commit();
          return;
        }
      });
      void tx.addEventListener('complete', () =>
        void cb(tx.error || req.error, null, null));
      void tx.addEventListener('error', () =>
        void cb(tx.error || req.error, null, null));
      void tx.addEventListener('abort', () =>
        void cb(tx.error || req.error, null, null));
    }, () => void cb(new Error('Request has failed.'), null, null));
  }
  public close() {
    this.alive = false;
  }
}
