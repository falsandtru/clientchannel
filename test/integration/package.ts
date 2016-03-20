import {socket, LocalSocketObject} from 'localsocket';
import {port, LocalPortObject} from 'localsocket';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('persistence', () => {
      interface Schema extends LocalSocketObject {
      }
      class Schema {
        // getter/setter will exclude in schema.
        get key() {
          return this.__key;
        }
        // property names that has underscore prefix or postfix will exclude in schema.
        private _separator = ' ';
        // basic property names will include in schema.
        firstName = '';
        lastName = '';
        // invalid value types will exclude in schema.
        name() {
          return this.firstName + this._separator + this.lastName;
        }
      }

      const sock = socket('domain', {
        // delete linked record 3 days later from last access.
        expiry: 3 * 24 * 60 * 60 * 1e3,
        schema() {
          return new Schema();
        }
      });
      // load data from indexeddb a little later.
      const link: Schema = sock.link('path');
      // save data to indexeddb, and sync data between all tabs.
      link.firstName = 'john';
      link.lastName = 'smith';
      sock.destroy();
    });

    it('communicate', () => {
      interface Schema extends LocalPortObject {
      }
      class Schema {
        get event() {
          return this.__event;
        }
        version = 0;
      }

      const sock = port('version', {
        expiry: 3,
        schema() {
          return new Schema();
        }
      });
      const link: Schema = sock.link();
      const VERSION = 1;
      link.event.on(['recv', 'version'], ({newValue}) => {
        if (newValue === VERSION) return;
        if (newValue > VERSION) {
          location.reload();
        }
        else {
          link.version = VERSION;
        }
      });
      link.version = VERSION;
      sock.destroy();
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
