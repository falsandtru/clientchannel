# ClientChannel

![CI](https://github.com/falsandtru/clientChannel/workflows/CI/badge.svg)

Store and sync objects between tabs via IndexedDB or LocalStorage.

## Features

- Store and restore objects using IndexedDB or LocalStorage.
- Cross data binding between tabs.
- Expiration per individual objects.
- Limitation of the number of objects.

## Demos

Store and sync the text and the canvas.

https://falsandtru.github.io/clientchannel/

## APIs

[index.d.ts](index.d.ts)

## Usage

### Persist data

A schema is defined by properties of objects made by the given factory function.
Property names having the underscore(`_`) or dollar(`$`) prefix or postfix will be excluded from schema.
Property values of linked objects will be stored when updating.
Linked objects will be updated automatically when a linked object is updated on another thread(tab).

```ts
import { StoreChannel } from 'clientchannel';

interface Schemas {
  'theme/v1': ThemeSchema;
  'editor/v1': EditorSchema;
}

interface ThemeSchema extends StoreChannel.Value {
}
class ThemeSchema {
  // Only properties having a valid name and a storable value consist schema.
  // /^(?=[a-z])[0-9a-zA-Z_]*[0-9a-zA-Z]$/
  name = 'default';
}

interface EditorSchema extends StoreChannel.Value {
}
class EditorSchema {
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
const chan = new StoreChannel<Schemas>('settings', {
  schemas: {
    'theme/v1': () => new ThemeSchema(),
    'editor/v1': () => new EditorSchema(),
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
```

### Communication and Synchronization

Linked objects provede send and recv events.
`send` event will be emitted when a linked object is changed by own thread(tab).
`recv` event will be emitted when a linked object is changed by another thread(tab).

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
