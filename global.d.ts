type IDBValidValue
  = boolean
  | IDBValidKey
  | Object
  | File
  | Blob;

interface Window {
  IDBKeyRange: typeof IDBKeyRange;
}
