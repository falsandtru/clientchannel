import { StoreChannel, StorageChannel } from '../../index';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('store', () => {
      interface Value extends StoreChannel.Value {
      }
      class Value {
        // Getter and setter names will be excluded from schema.
        get key() {
          return this[StoreChannel.Value.key];
        }
        // Properties having an invalid value will be excluded from schema.
        event() {
          return this[StoreChannel.Value.event];
        }
        // Properties having an invalid name will be excluded from schema.
        protected prop_ = '';
        protected $prop = '';
        // Only properties having a valid name and a storable value consist schema.
        input: Record<string, string> = {};
      }

      const chan = new StoreChannel('backup/input', {
        schema: () => new Value(),
        // Limit the number of stored objects.
        capacity: 1000,
        // Delete stored objects 14 days later since the last access.
        age: 14 * 24 * 60 * 60 * 1e3,
      });
      // Load an object from IndexedDB.
      const link = chan.link('contact/v1');
      // Save changes of property values to IndexedDB, and sync them between all tabs.
      link.input = {
        email: 'user@host',
        subject: 'summary',
        message: 'body',
      };
      chan.destroy();
    });

    it('communication', () => {
      interface Value extends StorageChannel.Value {
      }
      class Value {
        event() {
          return this[StorageChannel.Value.event];
        }
        version = 0;
      }

      const chan = new StorageChannel('config/version', {
        schema: () => new Value(),
      });
      const link = chan.link();
      const VERSION = 1;
      link.event().on(['recv', 'version'], ({ newValue = 0 }) => {
        switch (true) {
          case newValue === VERSION:
            return;
          case newValue > VERSION:
            return location.reload();
          default:
            return;
        }
      });
      link.version = VERSION;
      chan.destroy();
    });

  });

});
