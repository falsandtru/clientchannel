import { StoreChannel, StorageChannel } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('StoreChannel', function () {
      assert(typeof StoreChannel === 'function');
    });

    it('StorageChannel', function () {
      assert(typeof StorageChannel === 'function');
    });

  });

});
