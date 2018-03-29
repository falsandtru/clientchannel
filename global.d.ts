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
