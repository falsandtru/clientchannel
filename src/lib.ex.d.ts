interface String {
  split(separator: string | RegExp, limit?: number): string[];
}

interface Array<T> {
  split(separator: string | RegExp, limit?: number): T[];
}

interface PromiseLike<T> {
  _?: T;
}

interface Promise<T> {
  _?: T;
}

interface IDBDatabase {
  onclose: (ev: Event) => any;
}

type IDBValidValue
  = boolean
  | IDBValidKey
  | Object
  | File
  | Blob;

interface Window {
  IDBKeyRange: typeof IDBKeyRange;
}
