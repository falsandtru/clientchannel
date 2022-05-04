import { StoreChannel, StorageChannel } from '../../index';

describe('Integration: Package', function () {
  describe('usage', function () {
    it('store', async () => {
      interface SettingsSchemas {
        'theme/v1': ThemeSettings;
        'editor/v1': EditorSettings;
      }

      interface ThemeSettings extends StoreChannel.Value {
      }
      class ThemeSettings {
        // Only properties having a valid name and a storable value consist schema.
        // /^(?=[a-z])[0-9a-zA-Z_]*[0-9a-zA-Z]$/
        name = 'default';
      }

      interface EditorSettings extends StoreChannel.Value {
      }
      class EditorSettings {
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
        revision = 0;
        mode = 'default';
        settings = {
          indent: 'space',
        };
      }

      // Appropriate for settings, updates, backups, etc...
      const chan = new StoreChannel<SettingsSchemas>('settings', {
        schemas: {
          'theme/v1': () => new ThemeSettings(),
          'editor/v1': () => new EditorSettings(),
        },
        // Limit the number of stored objects.
        capacity: 1000,
        // Delete stored objects 365 days later since the last access.
        age: 365 * 24 * 60 * 60 * 1e3,
      });

      // Load an object from IndexedDB.
      const theme = chan.link('theme/v1');
      // Save changes of property values to IndexedDB, and sync them between all tabs.
      theme.name = 'black';
      // Schemas are defined by keys.
      const editor = chan.link('editor/v1');
      editor.mode = 'vim';

      await new Promise(resolve => chan.events.save.once(['theme/v1', 'name', 'put'], resolve));
      await Promise.all([
        new Promise(resolve => editor.event().once(['send', 'settings'], resolve)),
        editor.settings = { indent: 'space' },
      ]);
      chan.destroy();
    });

    it('communication', async () => {
      localStorage.removeItem('config/version');

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
      link.event().on(['recv', 'version'], ({ newValue }) => {
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

      await Promise.all([
        new Promise(resolve => link.event().once(['send', 'version'], resolve)),
        link.version = VERSION + 1,
      ]);
      chan.destroy();
    });

  });

});
