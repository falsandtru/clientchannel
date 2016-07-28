import { indexedDB, IDBKeyRange, IDBTransactionMode } from './global';

describe('Unit: layers/infrastructure/indexeddb/module/global', () => {
  describe('indexedDB', () => {
    it('exist', () => {
      assert(indexedDB);
    });

  });

  describe('IDBKeyRange', () => {
    it('exist', () => {
      assert(IDBKeyRange);
    });

  });

  describe('IDBTransactionMode', () => {
    it('readonly', () => {
      assert(IDBTransactionMode.readonly === 'readonly');
    });

    it('readwrite', () => {
      assert(IDBTransactionMode.readwrite === 'readwrite');
    });

  });

});
