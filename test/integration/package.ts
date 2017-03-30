import { storechannel, StoreChannelObject } from '../../';
import { messagechannel, MessageChannelObject } from '../../';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('persistence', () => {
      interface Schema extends StoreChannelObject<string> {
      }
      class Schema {
        // getter/setter will be excluded in schema.
        get key() {
          return this.__key;
        }
        // property names that has underscore prefix or postfix will be excluded in schema.
        private _separator = ' ';
        // basic property names will be included in schema.
        firstName = '';
        lastName = '';
        // invalid value types will be excluded in schema.
        name() {
          return this.firstName + this._separator + this.lastName;
        }
      }

      const chan = storechannel('domain', {
        // delete linked record 3 days later since last access.
        expiry: 3 * 24 * 60 * 60 * 1e3,
        schema() {
          return new Schema();
        }
      });
      // load data from indexeddb a little later.
      const link: Schema = chan.link('path');
      // save data to indexeddb, and sync data between all tabs.
      link.firstName = 'john';
      link.lastName = 'smith';
      chan.destroy();
    });

    it('communicate', () => {
      interface Schema extends MessageChannelObject {
      }
      class Schema {
        get event() {
          return this.__event;
        }
        version = 0;
      }

      const chan = messagechannel('version', {
        schema() {
          return new Schema();
        }
      });
      const link: Schema = chan.link();
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
      chan.destroy();
    });

  });

});
