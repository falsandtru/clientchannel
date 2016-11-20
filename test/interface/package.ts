import def, { status, socket, port, __esModule } from 'localsocket';

declare module 'localsocket' {
  export const __esModule: boolean | undefined;
}

describe('Interface: Package', function () {
  describe('localsocket', function () {
    it('module', function () {
      assert(__esModule === true);
    });

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
