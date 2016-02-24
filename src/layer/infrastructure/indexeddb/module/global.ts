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

export namespace IDBTransaction {
  export const readonly = "readonly";
  export const readwrite = "readwrite";
};

export namespace IDBCursorDirection {
  export const next = 'next';
  export const nextunique = 'nextunique';
  export const prev = 'prev';
  export const prevunique = 'prevunique';
}