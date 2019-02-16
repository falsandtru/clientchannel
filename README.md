# ClientChannel

[![Build Status](https://travis-ci.org/falsandtru/clientchannel.svg?branch=master)](https://travis-ci.org/falsandtru/clientchannel)
[![Coverage Status](https://coveralls.io/repos/falsandtru/clientchannel/badge.svg?branch=master&service=github)](https://coveralls.io/github/falsandtru/clientchannel?branch=master)

Store and sync values by communication between tabs via IndexedDB and LocalStorage.

## Features

- Tab communication.
- Bidirectional persistent data binding.
- Expiration by data.

## Demos

Text and Canvas.

https://falsandtru.github.io/clientchannel/

## APIs

[index.d.ts](index.d.ts)

## Usage

### Storing

Schemas are defined by property names that made by factory function.
A property name that has underscore(`_`) prefix or postfix will be ignored.
It means you can define the dynamic value object.

Data that assigned to a property of Linked object will be saved to the storage.
When data was updated on other threads(tabs), own thread's property value will be updated automatically.

```ts
import { StoreChannel, StoreChannelObject } from 'clientchannel';

interface Value extends StoreChannelObject<string> {
}
class Value {
  // getter/setter will be excluded in schema.
  get key() {
    return this.__key;
  }
  // Property names that has underscore prefix or postfix will be excluded in schema.
  private _separator = ' ';
  // Storable data with normal property name will be included in schema.
  firstName = '';
  lastName = '';
  // Unstorable data will be ignored.
  name() {
    return this.firstName + this._separator + this.lastName;
  }
}

const chan = new StoreChannel('domain', {
  Schema: Value,
  // Delete linked records 3 days later since last access.
  age: 3 * 24 * 60 * 60 * 1e3,
});
// Load data from indexeddb a little later.
const link = chan.link('path');
// Save data to indexeddb, and sync data between all tabs.
link.firstName = 'john';
link.lastName = 'smith';
```

### Communication and Synchronization

Linked object provedes send/recv events.
`send` event will be emitted when linked object was updated by own thread(tab).
`recv` event will be emitted when linked object was updated by other threads(tabs).

```ts
import { StorageChannel, StorageChannelObject } from 'clientchannel';

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
```

## Browsers

Requires es6 and modern DOM API support.

- Chrome
- Firefox
- Edge (without iframe)
- Safari

Polyfill: https://cdn.polyfill.io
