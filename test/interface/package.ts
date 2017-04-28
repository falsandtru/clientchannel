import { StoreChannel, BroadcastChannel } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('StoreChannel', function () {
      assert(typeof StoreChannel === 'function');
    });

    it('BroadcastChannel', function () {
      assert(typeof BroadcastChannel === 'function');
    });

  });

});
