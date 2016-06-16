declare const self: Window & {
  webkitIndexedDB?: IDBFactory;
  mozIndexedDB?: IDBFactory;
  IDBKeyRange: typeof IDBKeyRange;
  webkitIDBKeyRange: typeof IDBKeyRange;
  mozIDBKeyRange: typeof IDBKeyRange;
  msIDBKeyRange: typeof IDBKeyRange;
}
export const indexedDB: IDBFactory = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.msIndexedDB;
const IDBKeyRange_ = self.IDBKeyRange || self.webkitIDBKeyRange || self.mozIDBKeyRange || self.msIDBKeyRange;;
export {IDBKeyRange_ as IDBKeyRange}

export type IDBTransaction
  = typeof IDBTransaction.readonly
  | typeof IDBTransaction.readwrite;
export namespace IDBTransaction {
  export const readonly: 'readonly' = "readonly";
  export const readwrite: 'readwrite' = "readwrite";
}

export type IDBCursorDirection
  = typeof IDBCursorDirection.next
  | typeof IDBCursorDirection.nextunique
  | typeof IDBCursorDirection.prev
  | typeof IDBCursorDirection.prevunique;
export namespace IDBCursorDirection {
  export const next: 'next' = 'next';
  export const nextunique: 'nextunique' = 'nextunique';
  export const prev: 'prev' = 'prev';
  export const prevunique: 'prevunique' = 'prevunique';
}
