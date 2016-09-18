import def, { status, socket, port } from 'localsocket';

describe('Interface: Package', function () {
  describe('localsocket', function () {
    it('default', function () {
      assert(typeof def === 'function');
    });

    it('status', function () {
      assert(status === true);
    });

    it('socket', function () {
      assert(typeof socket === 'function');
    });

    it('port', function () {
      assert(typeof port === 'function');
    });

  });

});
