export const indexedDB = self.indexedDB;
export const IDBKeyRange = self.IDBKeyRange;

export type IDBTransactionMode
  = typeof IDBTransactionMode.readonly
  | typeof IDBTransactionMode.readwrite;
export namespace IDBTransactionMode {
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
