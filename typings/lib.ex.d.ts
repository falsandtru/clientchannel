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
  onclose: (ev: Event) => any;
}
