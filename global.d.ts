interface PromiseConstructor {
  reject(): Promise<never>;
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
