interface String {
  split(separator: string | RegExp, limit?: number): string[];
}

interface Array<T> {
  split(separator: string | RegExp, limit?: number): T[];
}

interface PromiseLike<T> {
  _?: T;
}

interface IDBDatabase {
  onversionchange: (ev: IDBVersionChangeEvent) => any;
  end: () => any;
  destroy: () => any;
}

interface IDBObjectStore {
  createIndex(name: string, keyPath: string | string[], options?: {}): IDBIndex;
}

/*
interface IDBObjectStoreParameters {
  keyPath?: string | string[];
  autoIncrement: boolean;
}

interface IDBIndexParameters {
  unique?: boolean;
  multiEntry?: boolean;
}
*/
