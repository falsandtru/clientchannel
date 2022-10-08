import { Listen, Config } from '../../infrastructure/indexeddb/api';
import { Cancellation } from 'spica/cancellation';
import { clock } from 'spica/clock';
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
    this.tx.rw = undefined;
    tx.commit();
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
      this.tx.rw = undefined;
    };
    this.tx.rw.addEventListener('abort', clear);
    this.tx.rw.addEventListener('error', clear);
    this.tx.rw.addEventListener('complete', clear);
    clock.now(clear);
  }
  public transact(
    cache: (db: IDBDatabase) => IDBTransaction | undefined,
    success: (tx: IDBTransaction) => void,
    failure: (reason: unknown) => void,
    tx = this.txrw,
  ): void {
    return tx
      ? void success(tx)
      : void this.listen(db => {
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
      if (cancellation?.isCancelled()) return void cb?.(new Error('Request is cancelled.'), key);
      const tx = db.transaction(this.name, 'readonly');
      const req: IDBRequest<V> = this.index
        ? tx
            .objectStore(this.name)
            .index(this.index)
            .get(key)
        : tx
            .objectStore(this.name)
            .get(key);
      req.addEventListener('success', () =>
        void cb?.(tx.error || req.error, key, req.result) && this.cache.set(key, req.result));
      tx.addEventListener('complete', () =>
        void cancellation?.close());
      tx.addEventListener('error', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error, key)));
      tx.addEventListener('abort', () => (
        void cancellation?.close(),
        void cb?.(tx.error || req.error, key)));
      cancellation?.register(() =>
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
    this.cache.set(key, value);
    if (!this.alive) return value;
    this.transact(
      db =>
        this.alive && this.cache.has(key)
          ? db.transaction(this.name, 'readwrite')
          : undefined,
      tx => {
        this.index
          ? tx
            .objectStore(this.name)
            .put(this.cache.get(key))
          : tx
            .objectStore(this.name)
            .put(this.cache.get(key), key);
        tx.addEventListener('complete', () =>
          void cb?.(tx.error, key, value));
        tx.addEventListener('error', () =>
          void cb?.(tx.error, key, value));
        tx.addEventListener('abort', () =>
          void cb?.(tx.error, key, value));
      },
      () => void cb?.(new Error('Request has failed.'), key, value));
    return value;
  }
  public delete(key: K, cb?: (error: DOMException | Error | null, key: K) => void): void {
    this.cache.delete(key);
    if (!this.alive) return;
    this.transact(
      db =>
        this.alive
          ? db.transaction(this.name, 'readwrite')
          : undefined,
      tx => {
        tx
          .objectStore(this.name)
          .delete(key);
        tx.addEventListener('complete', () =>
          void cb?.(tx.error, key));
        tx.addEventListener('error', () =>
          void cb?.(tx.error, key));
        tx.addEventListener('abort', () =>
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
          .count(query ?? undefined)
        : tx
          .objectStore(this.name)
          .count(query ?? undefined);
      req.addEventListener('success', () =>
        void resolve(req.result));
      tx.addEventListener('complete', () =>
        void reject(req.error));
      tx.addEventListener('error', () =>
        void reject(req.error));
      tx.addEventListener('abort', () =>
        void reject(req.error));
    }, () => void reject(new Error('Request has failed.'))));
  }
  public getAll<R extends object>(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    count: number | undefined,
    index: string, mode: IDBTransactionMode, stores: string[],
    cb: (error: DOMException | Error | null, cursor: R[] | null, tx: IDBTransaction | null) => void,
  ): void {
    if (!this.alive) return;
    this.listen(db => {
      if (!this.alive) return;
      const tx = db.transaction([this.name, ...stores], mode);
      const req = index
        ? tx
          .objectStore(this.name)
          .index(index)
          .getAll(query, count)
        : tx
          .objectStore(this.name)
          .getAll(query, count);
      req.addEventListener('success', () => {
        const values = req.result;
        if (values) {
          try {
            cb(tx.error || req.error, values, tx);
          }
          catch (reason) {
            causeAsyncException(reason);
          }
          return;
        }
        else {
          cb(tx.error || req.error, null, tx);
          mode === 'readwrite' && tx.commit();
          return;
        }
      });
      tx.addEventListener('complete', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('error', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('abort', () =>
        void cb(tx.error || req.error, null, null));
    }, () => void cb(new Error('Request has failed.'), null, null));
  }
  public cursor(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    index: string, direction: IDBCursorDirection, mode: IDBTransactionMode, stores: string[],
    cb: (error: DOMException | Error | null, cursor: IDBCursorWithValue | null, tx: IDBTransaction | null) => void,
  ): void {
    if (!this.alive) return;
    this.listen(db => {
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
      req.addEventListener('success', () => {
        const cursor = req.result;
        if (cursor) {
          try {
            this.cache.set(cursor.primaryKey as K, { ...cursor.value });
            cb(tx.error || req.error, cursor, tx);
          }
          catch (reason) {
            cursor.delete();
            causeAsyncException(reason);
          }
          return;
        }
        else {
          cb(tx.error || req.error, null, tx);
          mode === 'readwrite' && tx.commit();
          return;
        }
      });
      tx.addEventListener('complete', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('error', () =>
        void cb(tx.error || req.error, null, null));
      tx.addEventListener('abort', () =>
        void cb(tx.error || req.error, null, null));
    }, () => void cb(new Error('Request has failed.'), null, null));
  }
  public close() {
    this.alive = false;
  }
}
