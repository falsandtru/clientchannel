# ClientChannel

![CI](https://github.com/falsandtru/clientChannel/workflows/CI/badge.svg)

Store and sync data between tabs via IndexedDB or LocalStorage.

## Features

- Store and restore data using IndexedDB or LocalStorage.
- Cross data binding between tabs.
- Expiration per individual data.
- Limitation of the number of data.

## Demos

Store and sync the text and the canvas.

https://falsandtru.github.io/clientchannel/

## APIs

[index.d.ts](index.d.ts)

## Usage

### Persist data

A schema is defined by properties of objects made by the registered factory function.
Property names having underscore(`_`) or dollar(`$`) prefix or postfix will be excluded from schema.
Property values of linked objects will be stored by updates.
Linked objects will be updated automatically when a linked object is updated on another thread(tab).

```ts
import { StoreChannel } from 'clientchannel';

interface Value extends StoreChannel.Value<string> {
}
class Value {
  // Getter and setter names will be excluded from schema.
  get key() {
    return this[StoreChannel.Value.key];
  }
  // Properties having an invalid name will be excluded from schema.
  private separator_ = ' ';
  // Only properties having a valid name and a storable value consist schema.
  firstName = '';
  lastName = '';
  // Properties having an invalid value will be excluded from schema.
  name() {
    return this.firstName + this.separator_ + this.lastName;
  }
}

const chan = new StoreChannel('domain', {
  schema: () => new Value(),
  // Limit the number of data.
  capacity: 100,
  // Delete data 3 days later since the last access.
  age: 3 * 24 * 60 * 60 * 1e3,
});
// Load the data from IndexedDB with little delay.
const link = chan.link('path');
// Save the data to IndexedDB, and sync data between all tabs.
link.firstName = 'john';
link.lastName = 'smith';
```

### Communication and Synchronization

Linked objects provede send and recv events.
`send` event will be emitted when a linked object was updated by own thread(tab).
`recv` event will be emitted when a linked object was updated by another thread(tab).

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

const chan = new StorageChannel('version', {
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
      return link.version = VERSION;
  }
});
link.version = VERSION;
```

## Browsers

Requires es6 and modern DOM API support.

- Chrome
- Firefox
- Edge (Chromium edition only)
- Safari

Polyfill: https://cdn.polyfill.io
