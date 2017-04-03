import { store, broadcastchannel } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('store', function () {
      assert(typeof store === 'function');
    });

    it('broadcastchannel', function () {
      assert(typeof broadcastchannel === 'function');
    });

  });

});
