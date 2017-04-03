import { store, broadcast } from '../../index';

describe('Interface: Package', function () {
  describe('clientchannel', function () {
    it('store', function () {
      assert(typeof store === 'function');
    });

    it('broadcast', function () {
      assert(typeof broadcast === 'function');
    });

  });

});
