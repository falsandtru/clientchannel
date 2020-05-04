import { StoreChannel, StoreChannelObject, StorageChannel, StorageChannelObject, ChannelObject } from '../../index';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('store', () => {
      interface Value extends StoreChannelObject<string> {
      }
      class Value {
        // Getter and setter names will be excluded from schema.
        get key() {
          return this[ChannelObject.key];
        }
        // Properties having an invalid name will be excluded from schema.
        private _separator = ' ';
        // Only properties having a valid name and a storable value consist schema.
        firstName = '';
        lastName = '';
        // Properties having an invalid value will be excluded from schema.
        name() {
          return this.firstName + this._separator + this.lastName;
        }
      }

      const chan = new StoreChannel('domain', {
        schema: () => new Value(),
        // Delete records of update events of a linked object 3 days later since the last access.
        age: 3 * 24 * 60 * 60 * 1e3,
      });
      // Load data from IndexedDB with little delay.
      const link = chan.link('path');
      // Save data to IndexedDB, and sync data between all tabs.
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
        switch (true) {
          case newValue === VERSION:
            return;
          case newValue > VERSION:
            return location.reload(true);
          default:
            return link.version = VERSION;
        }
      });
      link.version = VERSION;
      chan.destroy();
    });

  });

});
