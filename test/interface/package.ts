import { StoreChannel, StorageChannel, Ownership } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('StoreChannel', function () {
      assert(typeof StoreChannel === 'function');
    });

    it('StorageChannel', function () {
      assert(typeof StorageChannel === 'function');
    });

    it('Ownership', function () {
      assert(typeof Ownership === 'function');
    });

  });

});
