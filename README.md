# localsocket

[![Build Status](https://travis-ci.org/falsandtru/localsocket.svg?branch=master)](https://travis-ci.org/falsandtru/localsocket)
[![Coverage Status](https://coveralls.io/repos/falsandtru/localsocket/badge.svg?branch=master&service=github)](https://coveralls.io/github/falsandtru/localsocket?branch=master)
[![Dependency Status](https://gemnasium.com/falsandtru/localsocket.svg)](https://gemnasium.com/falsandtru/localsocket)

Communicate between other tabs via IndexedDB and LocalStorage.

## Feature

- Tab communication.
- Bidirectional persistent data binding.
- Data with expiry.

## Demo

Text and Canvas.

https://falsandtru.github.io/localsocket/

## API

[localsocket.d.ts](localsocket.d.ts)

## Usage

### Persistence

Schemas are defined by property names that made by factory function.
A property name that has underscore(`_`) prefix or postfix will be ignored.
It means you can define the dynamic value object.

Data that assigned to a property of Linked object will be saved to the storage.
When data was updated on other threads(tabs), own thread's property value will be updated automatically.

```ts
import {socket, LocalSocketObject} from 'localsocket';

interface Schema extends LocalSocketObject<string> {
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

const sock = socket('domain', {
	// delete linked records 3 days later since last access.
	expiry: 3 * 24 * 60 * 60 * 1e3,
	schema() {
		return new Schema();
	}
});
// load data from indexeddb a little later.
const link: Schema = sock.link('path');
// save data to indexeddb, and sync data between all tabs.
link.firstName = 'john';
link.lastName = 'smith';
```

### Communicate and Synchronize

Linked object provedes send/recv events.
`send` event will be emitted when linked object was updated by own thread(tab).
`recv` event will be emitted when linked object was updated by other threads(tabs).

```ts
import {port, LocalPortObject} from 'localsocket';

interface Schema extends LocalPortObject {
}
class Schema {
	get event() {
		return this.__event;
	}
	version = 0;
}

const sock = port('version', {
	schema() {
		return new Schema();
	}
});
const link: Schema = sock.link();
const VERSION = 1;
link.event.on(['recv', 'version'], ({newValue}) => {
	if (newValue === VERSION) return;
	if (newValue > VERSION) {
		location.reload();
	}
	else {
		link.version = VERSION;
	}
});
link.version = VERSION;
```

## Browser

- Chrome
- Firefox
- Edge
- Safari
