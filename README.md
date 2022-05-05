# ClientChannel

![CI](https://github.com/falsandtru/clientChannel/workflows/CI/badge.svg)

Persist objects and sync them between tabs via IndexedDB or LocalStorage.

## Features

- Persist objects using IndexedDB or LocalStorage.
- Sync objects between tabs.
- Limit the number of objects.
- Expire each object.

## Demos

Persist and sync a text and a canvas between tabs.

https://falsandtru.github.io/clientchannel/

## APIs

[index.d.ts](index.d.ts)

## Usage

### Persist data

A schema is constructed by object properties created from the given schemas.
Property names having a prefix or a suffix of an underscore(`_`) or a dollar(`$`) are excluded from schema.
Property values of linked objects are saved when updating.
**Linked objects are automatically updated when a linked object is updated on another thread(tab).**

```ts
import { StoreChannel } from 'clientchannel';

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
  // Getter and setter names are excluded from schema.
  get key() {
    return this[StoreChannel.Value.key];
  }
  // Properties having an invalid value are excluded from schema.
  event() {
    return this[StoreChannel.Value.event];
  }
  // Properties having an invalid name are excluded from schema.
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

// Load an object from IndexedDB, and link it to the same objects of all the tabs.
const theme = chan.link('theme/v1');
// Save the changes of property values to IndexedDB, and sync them between all the tabs.
theme.name = 'black';
// Schemas are selected by keys.
const editor = chan.link('editor/v1');
editor.mode = 'vim';
editor.event().on(['recv', 'mode'], ev =>
  console.log(`"${ev.prop}" value is changed to "${ev.newValue}" from "${ev.oldValue}".`));
```

### Communication and Synchronization

Linked objects provede the send and the recv events.
The `send` event is emitted when a linked object is changed by own thread(tab).
The `recv` event is emitted when a linked object is changed by another thread(tab).

```ts
import { StorageChannel } from 'clientchannel';

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
```

## Browsers

- Chrome
- Firefox
- Edge (Chromium edition only)
- Safari
