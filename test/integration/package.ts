import { StoreChannel, StoreChannelObject, StorageChannel, StorageChannelObject, ChannelObject } from '../../index';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('store', () => {
      interface Value extends StoreChannelObject<string> {
      }
      class Value {
        // Getter/setter will be excluded in schema.
        get key() {
          return this[ChannelObject.key];
        }
        // Property names that has underscore prefix or postfix will be excluded in schema.
        private _separator = ' ';
        // Basic property names will be included in schema.
        firstName = '';
        lastName = '';
        // Invalid value types will be excluded in schema.
        name() {
          return this.firstName + this._separator + this.lastName;
        }
      }

      const chan = new StoreChannel('domain', {
        schema: () => new Value(),
        // Delete linked records 3 days later since last access.
        age: 3 * 24 * 60 * 60 * 1e3,
      });
      // Load data from indexeddb a little later.
      const link = chan.link('path');
      // Save data to indexeddb, and sync data between all tabs.
      link.firstName = 'john';
      link.lastName = 'smith';
      chan.destroy();
    });

    it('communication', () => {
      interface Value extends StorageChannelObject {
      }
      class Value {
        get event() {
          return this[ChannelObject.event];
        }
        version = 0;
      }

      const chan = new StorageChannel('version', {
        schema: () => new Value(),
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
