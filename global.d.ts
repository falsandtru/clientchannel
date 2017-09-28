declare global {
  type DiffKey<T extends string, U extends string> = (
    & { [P in T]: P; }
    & { [P in U]: never; }
    & { [x: string]: never; }
  )[T];
  type Diff<T, U> = Pick<T, DiffKey<keyof T, keyof U>>;

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
