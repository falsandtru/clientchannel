import def, {
  socket,
  port,
  LocalSocket,
  LocalPort,
  LocalSocketConfig,
  LocalSocketObject,
  LocalSocketEvent,
  LocalSocketEventType
} from 'localsocket';

describe('Interface: Package', function () {
  describe('localsocket', function () {
    it('default', function () {
      assert(typeof def === 'function');
    });

    it('socket', function () {
      assert(typeof socket === 'function');
    });

    it('port', function () {
      assert(typeof port === 'function');
    });

  });

  describe('power-assert', function () {
    it('assertion self-check', function (done) {
      setTimeout(function () {
        try {
          console.log(assert(false === true), assert); // LOG: undefined, function powerAssert() { ... }
        }
        catch (e) {
          done();
          return;
        }
        throw new Error('WARNING!: assert function does not work.');
      }, 1);
    });

  });

});
