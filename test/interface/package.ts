import { storechannel, broadcastchannel } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('storechannel', function () {
      assert(typeof storechannel === 'function');
    });

    it('broadcastchannel', function () {
      assert(typeof broadcastchannel === 'function');
    });

  });

});
