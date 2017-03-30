import { storechannel, messagechannel } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('storechannel', function () {
      assert(typeof storechannel === 'function');
    });

    it('messagechannel', function () {
      assert(typeof messagechannel === 'function');
    });

  });

});
