import socket, {
  LocalSocket,
  LocalStore,
  LocalSocketConfig,
  LocalSocketObject,
  LocalSocketEvent,
  LocalSocketEventType
} from 'localsocket';

describe('Interface: Package', function () {
  describe('LocalSocket of default', function () {
    it('socket', function () {
      assert(typeof socket === 'function');
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
