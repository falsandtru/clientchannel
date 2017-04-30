import { indexedDB, IDBKeyRange } from './global';

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

});
