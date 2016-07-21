import { indexedDB, IDBKeyRange, IDBTransaction } from './global';

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
      assert(IDBTransaction.readonly === 'readonly');
    });

    it('readwrite', () => {
      assert(IDBTransaction.readwrite === 'readwrite');
    });

  });

});
