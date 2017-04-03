# ClientChannel

[![Build Status](https://travis-ci.org/falsandtru/clientchannel.svg?branch=master)](https://travis-ci.org/falsandtru/clientchannel)
[![Coverage Status](https://coveralls.io/repos/falsandtru/clientchannel/badge.svg?branch=master&service=github)](https://coveralls.io/github/falsandtru/clientchannel?branch=master)
[![Dependency Status](https://gemnasium.com/falsandtru/clientchannel.svg)](https://gemnasium.com/falsandtru/clientchannel)

Store and sync values by communicating between tabs via IndexedDB and LocalStorage.

## Feature

- Tab communication.
- Bidirectional persistent data binding.
- Data with expiry.

## Demo

Text and Canvas.

https://falsandtru.github.io/clientchannel/

## API

[index.d.ts](index.d.ts)

## Usage

### Persistence

Schemas are defined by property names that made by factory function.
A property name that has underscore(`_`) prefix or postfix will be ignored.
It means you can define the dynamic value object.

Data that assigned to a property of Linked object will be saved to the storage.
When data was updated on other threads(tabs), own thread's property value will be updated automatically.

```ts
import {storechannel, StoreChannelObject} from 'clientchannel';

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
	// property names that has unpersistable values will be excluded in schema.
	name() {
		return this.firstName + this._separator + this.lastName;
	}
}

const chan = storechannel('domain', {
	// delete linked records 3 days later since last access.
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
```

### Communicate and Synchronize

Linked object provedes send/recv events.
`send` event will be emitted when linked object was updated by own thread(tab).
`recv` event will be emitted when linked object was updated by other threads(tabs).

```ts
import {broadcastchannel, BroadcastChannelObject} from 'clientchannel';

interface Schema extends BroadcastChannelObject {
}
class Schema {
	get event() {
		return this.__event;
	}
	version = 0;
}

const chan = broadcastchannel('version', {
	schema() {
		return new Schema();
	}
});
const link: Schema = chan.link();
const VERSION = 1;
link.event.on(['recv', 'version'], ({newValue}) => {
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

## Browser

Requires es6 support.

- Chrome
- Firefox
- Edge (without iframe)
- Safari
