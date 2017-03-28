import 'mocha';
import _assert from 'power-assert';

declare global {
  export const assert: typeof _assert;

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
