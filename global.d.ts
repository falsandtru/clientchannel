declare global {
  interface NumberConstructor {
    isNaN(target: any): target is number;
  }

  interface IDBDatabase {
    onclose: (ev: Event) => void;
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

import assert from 'power-assert';

type Assert = typeof assert;

declare global {
  const assert: Assert;
}
