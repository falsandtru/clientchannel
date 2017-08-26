import { StoreChannel, StoreChannelObject } from '../../index';
import { StorageChannel, StorageChannelObject } from '../../index';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('store', () => {
      interface Value extends StoreChannelObject<string> {
      }
      class Value {
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

      const chan = new StoreChannel('domain', {
        Schema: Value,
        // delete linked records 3 days later since last access.
        age: 3 * 24 * 60 * 60 * 1e3,
        // delete linked records overed 100 in order of oldest or cache algorithm.
        size: 100,
      });
      // load data from indexeddb a little later.
      const link = chan.link('path');
      // save data to indexeddb, and sync data between all tabs.
      link.firstName = 'john';
      link.lastName = 'smith';
      chan.destroy();
    });

    it('communication', () => {
      interface Value extends StorageChannelObject {
      }
      class Value {
        get event() {
          return this.__event;
        }
        version = 0;
      }

      const chan = new StorageChannel('version', {
        Schema: Value,
      });
      const link = chan.link();
      const VERSION = 1;
      link.event.on(['recv', 'version'], ({ newValue }) => {
        if (newValue === VERSION) return;
        if (newValue > VERSION) {
          location.reload(true);
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
