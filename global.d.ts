import 'mocha';
import _assert from 'power-assert';

declare global {
  export const assert: typeof _assert;

  interface String {
    split(separator: string | RegExp, limit?: number): string[];
  }

  interface Array<T> {
    split(separator: string | RegExp, limit?: number): T[];
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

}
