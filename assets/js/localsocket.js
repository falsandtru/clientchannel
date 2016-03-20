/*! localsocket v0.0.5 https://github.com/falsandtru/localsocket | (c) 2015, falsandtru | MIT License (https://opensource.org/licenses/MIT) */
define = typeof define === 'function' && define.amd
  ? define
  : (function () {
    'use strict';
    var name = 'localsocket',
        workspace = {};
    return function define(m, rs, f) {
      return !f
        ? void define(name, m, rs)
        : void f.apply(this, rs.map(function (r) {
          switch (r) {
            case 'require': {
              return typeof require === 'function' ? require : void 0;
            }
            case 'exports': {
              return m.indexOf('/') === -1
                ? workspace[m] = typeof exports === 'undefined' ? self[m] = self[m] || {} : exports
                : workspace[m] = workspace.hasOwnProperty(m) ? workspace[m] : {};
            }
            default: {
              return r.slice(-2) === '.d' && {}
                  || workspace.hasOwnProperty(r) && workspace[r]
                  || typeof require === 'function' && require(r)
                  || self[r];
            }
          }
        }));
    };
  })();
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('src/layer/infrastructure/indexeddb/module/global', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    exports.indexedDB = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.msIndexedDB;
    var IDBKeyRange_ = self.IDBKeyRange || self.webkitIDBKeyRange || self.mozIDBKeyRange || self.msIDBKeyRange;
    exports.IDBKeyRange = IDBKeyRange_;
    ;
    var IDBTransaction;
    (function (IDBTransaction) {
        IDBTransaction.readonly = 'readonly';
        IDBTransaction.readwrite = 'readwrite';
    }(IDBTransaction = exports.IDBTransaction || (exports.IDBTransaction = {})));
    ;
    var IDBCursorDirection;
    (function (IDBCursorDirection) {
        IDBCursorDirection.next = 'next';
        IDBCursorDirection.nextunique = 'nextunique';
        IDBCursorDirection.prev = 'prev';
        IDBCursorDirection.prevunique = 'prevunique';
    }(IDBCursorDirection = exports.IDBCursorDirection || (exports.IDBCursorDirection = {})));
});
define('src/layer/infrastructure/indexeddb/model/event', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    (function (IDBEvenTypes) {
        IDBEvenTypes[IDBEvenTypes['connect'] = 0] = 'connect';
        IDBEvenTypes[IDBEvenTypes['disconnect'] = 1] = 'disconnect';
        IDBEvenTypes[IDBEvenTypes['block'] = 2] = 'block';
        IDBEvenTypes[IDBEvenTypes['error'] = 3] = 'error';
        IDBEvenTypes[IDBEvenTypes['abort'] = 4] = 'abort';
        IDBEvenTypes[IDBEvenTypes['crash'] = 5] = 'crash';
        IDBEvenTypes[IDBEvenTypes['destroy'] = 6] = 'destroy';
    }(exports.IDBEvenTypes || (exports.IDBEvenTypes = {})));
    var IDBEvenTypes = exports.IDBEvenTypes;
    var IDBEventName;
    (function (IDBEventName) {
        IDBEventName.connect = IDBEvenTypes[IDBEvenTypes.connect];
        IDBEventName.disconnect = IDBEvenTypes[IDBEvenTypes.disconnect];
        IDBEventName.block = IDBEvenTypes[IDBEvenTypes.block];
        IDBEventName.error = IDBEvenTypes[IDBEvenTypes.error];
        IDBEventName.abort = IDBEvenTypes[IDBEvenTypes.abort];
        IDBEventName.crash = IDBEvenTypes[IDBEvenTypes.crash];
        IDBEventName.destroy = IDBEvenTypes[IDBEvenTypes.destroy];
    }(IDBEventName = exports.IDBEventName || (exports.IDBEventName = {})));
    var IDBEvent = function () {
        function IDBEvent(type, name) {
            this.name = name;
            this.namespace = [this.name];
            this.type = IDBEvenTypes[type];
            void Object.freeze(this);
        }
        return IDBEvent;
    }();
    exports.IDBEvent = IDBEvent;
});
define('src/layer/infrastructure/webstorage/module/global', [
    'require',
    'exports',
    'arch-stream'
], function (require, exports, arch_stream_1) {
    'use strict';
    var webStorage = {};
    exports.supportWebStorage = function () {
        try {
            var key = 'localsocket#' + arch_stream_1.uuid();
            void self.sessionStorage.setItem(key, key);
            if (key !== self.sessionStorage.getItem(key))
                throw 1;
            void self.sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }();
    exports.localStorage = exports.supportWebStorage ? self.localStorage : void 0;
    exports.sessionStorage = exports.supportWebStorage ? self.sessionStorage : void 0;
});
define('src/layer/infrastructure/webstorage/model/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/webstorage/module/global'
], function (require, exports, arch_stream_2, global_1) {
    'use strict';
    var storageEvents = {
        localStorage: new arch_stream_2.Observable(),
        sessionStorage: new arch_stream_2.Observable()
    };
    exports.events = storageEvents;
    void window.addEventListener('storage', function (event) {
        switch (event.storageArea) {
        case global_1.localStorage: {
                return void storageEvents.localStorage.emit(['storage'], event);
            }
        case global_1.sessionStorage: {
                return void storageEvents.sessionStorage.emit(['storage'], event);
            }
        }
    });
});
define('src/layer/infrastructure/webstorage/api', [
    'require',
    'exports',
    'src/layer/infrastructure/webstorage/module/global',
    'src/layer/infrastructure/webstorage/model/event'
], function (require, exports, global_2, event_1) {
    'use strict';
    exports.localStorage = global_2.localStorage;
    exports.sessionStorage = global_2.sessionStorage;
    exports.supportWebStorage = global_2.supportWebStorage;
    exports.events = event_1.events;
});
define('src/layer/infrastructure/indexeddb/model/access', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/module/global',
    'src/layer/infrastructure/indexeddb/model/event',
    'src/layer/infrastructure/webstorage/api'
], function (require, exports, arch_stream_3, global_3, event_2, api_1) {
    'use strict';
    var IDBEventObserver = new arch_stream_3.Observable();
    exports.event = IDBEventObserver;
    exports.ConfigMap = new arch_stream_3.Map();
    var StateCommand;
    (function (StateCommand) {
        StateCommand[StateCommand['open'] = 0] = 'open';
        StateCommand[StateCommand['close'] = 1] = 'close';
        StateCommand[StateCommand['destroy'] = 2] = 'destroy';
    }(StateCommand || (StateCommand = {})));
    var StateCommandMap = new arch_stream_3.Map();
    var RequestQueueSet = new arch_stream_3.Set();
    var StateSet = new arch_stream_3.Set();
    var ConnectionSet = new arch_stream_3.Set();
    function open(name, config) {
        void StateCommandMap.set(name, 0);
        void exports.ConfigMap.set(name, config);
        if (!StateSet.get(name)) {
            void StateSet.add(name, true);
            void handleFromInitialState(name);
        }
        return function (req) {
            var queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
            void queue.push(req);
            void drain(name);
        };
    }
    exports.open = open;
    function listen(name) {
        return function (req) {
            var queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
            void queue.push(req);
            void drain(name);
        };
    }
    exports.listen = listen;
    function close(name) {
        void StateCommandMap.set(name, 1);
        void exports.ConfigMap.set(name, {
            make: function () {
                return false;
            },
            verify: function () {
                return false;
            },
            destroy: function () {
                return false;
            }
        });
        if (ConnectionSet.get(name)) {
            return ConnectionSet.get(name).end();
        }
        if (!StateSet.get(name)) {
            void StateSet.add(name, true);
            void handleFromInitialState(name);
        }
    }
    exports.close = close;
    function destroy(name) {
        void StateCommandMap.set(name, 2);
        void exports.ConfigMap.set(name, {
            make: function () {
                return false;
            },
            verify: function () {
                return false;
            },
            destroy: function () {
                return true;
            }
        });
        if (ConnectionSet.get(name)) {
            return ConnectionSet.get(name).destroy();
        }
        if (!StateSet.get(name)) {
            void StateSet.add(name, true);
            void handleFromInitialState(name);
        }
    }
    exports.destroy = destroy;
    function drain(name) {
        if (!api_1.supportWebStorage)
            return void RequestQueueSet.delete(name);
        var db = ConnectionSet.get(name);
        var reqs = RequestQueueSet.get(name) || [];
        while (true) {
            try {
                while (db && reqs.length > 0 && StateCommandMap.get(name) === 0) {
                    void reqs[0](db);
                    void reqs.shift();
                }
                break;
            } catch (err) {
                void console.error(err, err + '', err.stack);
                void handleFromCrashState(name, err);
            }
        }
    }
    function handleFromInitialState(name, version) {
        if (version === void 0) {
            version = 0;
        }
        var config = exports.ConfigMap.get(name);
        try {
            var openRequest_1 = version ? global_3.indexedDB.open(name, version) : global_3.indexedDB.open(name);
            openRequest_1.onupgradeneeded = function (event) {
                return void handleFromUpgradeState(name, openRequest_1);
            };
            openRequest_1.onsuccess = function (_) {
                return void handleFromSuccessState(name, openRequest_1.result);
            };
            openRequest_1.onblocked = function (_) {
                return void handleFromBlockedState(name, openRequest_1);
            };
            openRequest_1.onerror = function (event) {
                return void handleFromErrorState(name, openRequest_1.error, event);
            };
        } catch (err) {
            void handleFromCrashState(name, err);
        }
    }
    function handleFromBlockedState(name, openRequest) {
        void IDBEventObserver.emit([
            name,
            event_2.IDBEvenTypes[event_2.IDBEvenTypes.block]
        ], new event_2.IDBEvent(event_2.IDBEvenTypes.block, name));
    }
    function handleFromUpgradeState(name, openRequest) {
        var db = openRequest.result;
        var _a = exports.ConfigMap.get(name), make = _a.make, destroy = _a.destroy;
        try {
            if (make(db)) {
                openRequest.onsuccess = function (_) {
                    return void handleFromSuccessState(name, db);
                };
                openRequest.onerror = function (event) {
                    return void handleFromErrorState(name, openRequest.error, event);
                };
            } else {
                openRequest.onsuccess = openRequest.onerror = function (event) {
                    void db.close();
                    destroy(openRequest.error, event) ? void handleFromDestroyState(name) : void handleFromEndState(name);
                };
            }
        } catch (err) {
            void handleFromCrashState(name, err);
        }
    }
    function handleFromSuccessState(name, db) {
        db.onversionchange = function (_) {
            return void db.close();
        };
        db.end = function () {
            void ConnectionSet.delete(name);
            void db.close();
            void handleFromEndState(name);
        };
        db.destroy = function () {
            void ConnectionSet.delete(name);
            void db.close();
            void handleFromDestroyState(name);
        };
        db.onerror = function (event) {
            void ConnectionSet.delete(name);
            void handleFromErrorState(name, event.target.error, event);
        };
        db.onabort = function (event) {
            void ConnectionSet.delete(name);
            void handleFromAbortState(name, event.target.error, event);
        };
        switch (StateCommandMap.get(name)) {
        case 0: {
                var verify = exports.ConfigMap.get(name).verify;
                try {
                    if (!verify(db))
                        return void handleFromEndState(name, +db.version + 1);
                    void IDBEventObserver.emit([
                        name,
                        event_2.IDBEvenTypes[event_2.IDBEvenTypes.connect]
                    ], new event_2.IDBEvent(event_2.IDBEvenTypes.connect, name));
                    void ConnectionSet.add(name, db);
                    void drain(name);
                } catch (err) {
                    void handleFromCrashState(name, err);
                }
                return;
            }
        case 1: {
                return void db.end();
            }
        case 2: {
                return void db.destroy();
            }
        }
        throw new TypeError('LocalSocket: Invalid command ' + StateCommandMap.get(name) + '.');
    }
    function handleFromErrorState(name, error, event) {
        void event.preventDefault();
        void ConnectionSet.delete(name);
        void IDBEventObserver.emit([
            name,
            event_2.IDBEvenTypes[event_2.IDBEvenTypes.error]
        ], new event_2.IDBEvent(event_2.IDBEvenTypes.error, name));
        var destroy = exports.ConfigMap.get(name).destroy;
        if (destroy(error, event)) {
            return void handleFromDestroyState(name);
        } else {
            return void handleFromEndState(name);
        }
    }
    function handleFromAbortState(name, error, event) {
        void event.preventDefault();
        void ConnectionSet.delete(name);
        void IDBEventObserver.emit([
            name,
            event_2.IDBEvenTypes[event_2.IDBEvenTypes.abort]
        ], new event_2.IDBEvent(event_2.IDBEvenTypes.abort, name));
        var destroy = exports.ConfigMap.get(name).destroy;
        if (destroy(error, event)) {
            return void handleFromDestroyState(name);
        } else {
            return void handleFromEndState(name);
        }
    }
    function handleFromCrashState(name, error) {
        void ConnectionSet.delete(name);
        void IDBEventObserver.emit([
            name,
            event_2.IDBEvenTypes[event_2.IDBEvenTypes.crash]
        ], new event_2.IDBEvent(event_2.IDBEvenTypes.crash, name));
        var destroy = exports.ConfigMap.get(name).destroy;
        if (destroy(error, null)) {
            return void handleFromDestroyState(name);
        } else {
            return void handleFromEndState(name);
        }
    }
    function handleFromDestroyState(name) {
        void ConnectionSet.delete(name);
        var deleteRequest = global_3.indexedDB.deleteDatabase(name);
        deleteRequest.onsuccess = function (_) {
            void RequestQueueSet.delete(name);
            void IDBEventObserver.emit([
                name,
                event_2.IDBEvenTypes[event_2.IDBEvenTypes.destroy]
            ], new event_2.IDBEvent(event_2.IDBEvenTypes.destroy, name));
            return void handleFromEndState(name);
        };
        deleteRequest.onerror = function (event) {
            void handleFromErrorState(name, deleteRequest.error, event);
        };
    }
    function handleFromEndState(name, version) {
        if (version === void 0) {
            version = 0;
        }
        void ConnectionSet.delete(name);
        void IDBEventObserver.emit([
            name,
            event_2.IDBEvenTypes[event_2.IDBEvenTypes.disconnect]
        ], new event_2.IDBEvent(event_2.IDBEvenTypes.disconnect, name));
        switch (StateCommandMap.get(name)) {
        case 0: {
                return void handleFromInitialState(name, version);
            }
        case 1: {
                void exports.ConfigMap.delete(name);
                void StateSet.delete(name);
                return void 0;
            }
        case 2: {
                void exports.ConfigMap.delete(name);
                void StateSet.delete(name);
                return void 0;
            }
        }
        throw new TypeError('LocalSocket: Invalid command ' + StateCommandMap.get(name) + '.');
    }
});
define('src/layer/infrastructure/indexeddb/api', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/module/global',
    'src/layer/infrastructure/indexeddb/model/access',
    'src/layer/infrastructure/indexeddb/model/event'
], function (require, exports, global_4, access_1, event_3) {
    'use strict';
    exports.indexedDB = global_4.indexedDB;
    exports.IDBKeyRange = global_4.IDBKeyRange;
    exports.IDBTransaction = global_4.IDBTransaction;
    exports.IDBCursorDirection = global_4.IDBCursorDirection;
    exports.open = access_1.open;
    exports.listen = access_1.listen;
    exports.close = access_1.close;
    exports.destroy = access_1.destroy;
    exports.event = access_1.event;
    exports.IDBEvent = event_3.IDBEvent;
    exports.IDBEventName = event_3.IDBEventName;
});
define('src/lib/noop', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function noop() {
        ;
    }
    exports.noop = noop;
});
define('src/layer/domain/dao/module/builder', [
    'require',
    'exports',
    'arch-stream',
    'src/lib/noop'
], function (require, exports, arch_stream_4, noop_1) {
    'use strict';
    exports.SCHEMA = {
        META: { NAME: '__meta' },
        ID: { NAME: '__id' },
        KEY: { NAME: '__key' },
        DATE: { NAME: '__date' },
        EVENT: { NAME: '__event' }
    };
    function build(source, factory, update) {
        if (update === void 0) {
            update = noop_1.noop;
        }
        var dao = factory();
        void Object.keys(exports.SCHEMA).map(function (prop) {
            return exports.SCHEMA[prop].NAME;
        }).reduce(function (_, prop) {
            delete dao[prop];
        }, void 0);
        if (typeof source[exports.SCHEMA.KEY.NAME] !== 'string')
            throw new TypeError('LocalSocket: Invalid key: ' + source[exports.SCHEMA.KEY.NAME]);
        var descmap = arch_stream_4.assign(Object.keys(dao).filter(isValidPropertyName).filter(isValidPropertyValue(dao)).reduce(function (map, prop) {
            {
                var desc = Object.getOwnPropertyDescriptor(dao, prop);
                if (desc && (desc.get || desc.set))
                    return map;
            }
            var iniVal = dao[prop];
            if (source[prop] === void 0) {
                source[prop] = iniVal;
            }
            map[prop] = {
                configurable: false,
                enumerable: true,
                get: function () {
                    return source[prop] === void 0 ? iniVal : source[prop];
                },
                set: function (newVal) {
                    var oldVal = source[prop];
                    if (newVal === oldVal)
                        return;
                    source[prop] = newVal === void 0 ? iniVal : newVal;
                    void update(prop, newVal, oldVal);
                }
            };
            return map;
        }, {}), (_a = {}, _a[exports.SCHEMA.META.NAME] = {
            configurable: false,
            enumerable: false,
            get: function () {
                return source[exports.SCHEMA.META.NAME];
            }
        }, _a[exports.SCHEMA.ID.NAME] = {
            configurable: false,
            enumerable: false,
            get: function () {
                return source[exports.SCHEMA.ID.NAME];
            }
        }, _a[exports.SCHEMA.KEY.NAME] = {
            configurable: false,
            enumerable: false,
            get: function () {
                return source[exports.SCHEMA.KEY.NAME];
            }
        }, _a[exports.SCHEMA.DATE.NAME] = {
            configurable: false,
            enumerable: false,
            get: function () {
                return source[exports.SCHEMA.DATE.NAME];
            }
        }, _a[exports.SCHEMA.EVENT.NAME] = {
            configurable: false,
            enumerable: false,
            get: function () {
                return source[exports.SCHEMA.EVENT.NAME];
            }
        }, _a));
        void Object.defineProperties(dao, descmap);
        void Object.seal(dao);
        return dao;
        var _a;
    }
    exports.build = build;
    var RegVelidPropertyName = /^[A-z_$][0-9A-z_$]*$/;
    function isValidPropertyName(prop) {
        return prop.length > 0 && prop[0] !== '_' && prop[prop.length - 1] !== '_' && RegVelidPropertyName.test(prop);
    }
    exports.isValidPropertyName = isValidPropertyName;
    function isValidPropertyValue(dao) {
        return function (prop) {
            switch (typeof dao[prop]) {
            case 'undefined':
            case 'boolean':
            case 'number':
            case 'string':
            case 'object': {
                    return true;
                }
            default: {
                    return false;
                }
            }
        };
    }
    exports.isValidPropertyValue = isValidPropertyValue;
});
define('src/layer/domain/dao/api', [
    'require',
    'exports',
    'src/layer/domain/dao/module/builder'
], function (require, exports, builder_1) {
    'use strict';
    exports.SCHEMA = builder_1.SCHEMA;
    exports.build = builder_1.build;
    exports.isValidPropertyName = builder_1.isValidPropertyName;
    exports.isValidPropertyValue = builder_1.isValidPropertyValue;
});
define('src/layer/domain/indexeddb/model/types', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function IdNumber(id) {
        return +id;
    }
    exports.IdNumber = IdNumber;
    function KeyString(key) {
        return key !== void 0 && key !== null ? key + '' : '';
    }
    exports.KeyString = KeyString;
});
define('src/layer/domain/lib/assign', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function assign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (target === undefined || target === null) {
            throw new TypeError('LocalSocket: assign: Cannot merge objects into ' + target + '.');
        }
        var to = Object(target);
        for (var i = 0; i < sources.length; i++) {
            var nextSource = sources[i];
            if (nextSource === undefined || nextSource === null) {
                continue;
            }
            nextSource = Object(nextSource);
            for (var _a = 0, _b = Object.keys(Object(nextSource)); _a < _b.length; _a++) {
                var nextKey = _b[_a];
                var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                if (desc !== undefined && desc.enumerable) {
                    var nextValue = nextSource[nextKey];
                    var prevValue = to[nextKey];
                    if (isClonable(nextValue)) {
                        to[nextKey] = Array.isArray(nextValue) ? nextValue.slice() : assign({}, nextValue);
                    } else {
                        to[nextKey] = nextValue;
                    }
                }
            }
        }
        return to;
        function isClonable(obj) {
            return !!obj && typeof obj === 'object' && !isTypedArray(obj) && obj instanceof Blob === false && obj instanceof ImageData === false && obj instanceof ArrayBuffer === false;
            function isTypedArray(obj) {
                return obj instanceof Object && obj.constructor['BYTES_PER_ELEMENT'] > 0 && obj.buffer instanceof ArrayBuffer;
            }
        }
    }
    exports.assign = assign;
});
define('src/layer/domain/indexeddb/model/store/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/lib/assign',
    'src/lib/noop'
], function (require, exports, arch_stream_5, api_2, types_1, assign_1, noop_2) {
    'use strict';
    (function (EventTypes) {
        EventTypes[EventTypes['put'] = 0] = 'put';
        EventTypes[EventTypes['delete'] = 1] = 'delete';
        EventTypes[EventTypes['snapshot'] = 2] = 'snapshot';
    }(exports.EventTypes || (exports.EventTypes = {})));
    var EventTypes = exports.EventTypes;
    var EventValue = function () {
        function EventValue() {
        }
        return EventValue;
    }();
    exports.EventValue = EventValue;
    var EventRecord = function () {
        function EventRecord(id, key, value, date, type) {
            if (typeof this.id === 'number' && this.id > 0 === false || this.id !== void 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event id: ' + this.id);
            this.type = EventTypes[type];
            if (typeof this.type !== 'string' || EventTypes[this.type] === void 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event type: ' + this.type);
            this.key = key;
            if (typeof this.key !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event key: ' + this.key);
            this.value = value;
            if (typeof this.value !== 'object' || !this.value)
                throw new TypeError('LocalSocket: EventRecord: Invalid event value: ' + this.value);
            this.date = date;
            if (typeof this.date !== 'number' || this.date >= 0 === false)
                throw new TypeError('LocalSocket: EventRecord: Invalid event date: ' + this.date);
            this.attr = this.type === EventTypes[EventTypes.put] ? Object.keys(value).reduce(function (r, p) {
                return p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r;
            }, '') : '';
            if (typeof this.attr !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr: ' + this.key);
            if (this.type === EventTypes[EventTypes.put] && this.attr.length === 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            if (this.type !== EventTypes[EventTypes.put] && this.attr.length !== 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            switch (type) {
            case EventTypes.put: {
                    this.value = value = assign_1.assign(new EventValue(), (_a = {}, _a[this.attr] = value[this.attr], _a));
                    void Object.freeze(this.value);
                    return;
                }
            case EventTypes.snapshot: {
                    this.value = value = assign_1.assign(new EventValue(), value);
                    void Object.freeze(this.value);
                    return;
                }
            case EventTypes.delete:
            default: {
                    this.value = value = new EventValue();
                    void Object.freeze(this.value);
                    return;
                }
            }
            throw new TypeError('LocalSocket: Invalid event type: ' + type);
            var _a;
        }
        return EventRecord;
    }();
    var UnsavedEventRecord = function (_super) {
        __extends(UnsavedEventRecord, _super);
        function UnsavedEventRecord(key, value, type, date) {
            if (type === void 0) {
                type = EventTypes.put;
            }
            if (date === void 0) {
                date = Date.now();
            }
            _super.call(this, void 0, key, value, date, type);
            if (this.id !== void 0 || 'id' in this)
                throw new TypeError('LocalSocket: UnsavedEventRecord: Invalid event id: ' + this.id);
        }
        return UnsavedEventRecord;
    }(EventRecord);
    exports.UnsavedEventRecord = UnsavedEventRecord;
    var SavedEventRecord = function (_super) {
        __extends(SavedEventRecord, _super);
        function SavedEventRecord(id, key, value, type, date) {
            _super.call(this, id, key, value, date, type);
            this.id = id;
            if (this.id > 0 === false)
                throw new TypeError('LocalSocket: SavedEventRecord: Invalid event id: ' + this.id);
            void Object.freeze(this);
        }
        return SavedEventRecord;
    }(EventRecord);
    exports.SavedEventRecord = SavedEventRecord;
    exports.ESEventTypes = {
        put: 'put',
        delete: 'delete',
        snapshot: 'snapshot',
        query: 'query'
    };
    var ESEvent = function () {
        function ESEvent(type, id, key, attr) {
            this.type = type;
            this.id = id;
            this.key = key;
            this.attr = attr;
            void Object.freeze(this);
        }
        return ESEvent;
    }();
    exports.ESEvent = ESEvent;
    var STORE_FIELDS = {
        id: 'id',
        key: 'key',
        type: 'type',
        attr: 'attr',
        value: 'value',
        date: 'date',
        surrogateKeyDateField: 'key+date'
    };
    var AbstractEventStore = function () {
        function AbstractEventStore(access, name) {
            var _this = this;
            this.access = access;
            this.name = name;
            this.cache = new arch_stream_5.Supervisor();
            this.events = {
                load: new arch_stream_5.Observable(),
                save: new arch_stream_5.Observable(),
                loss: new arch_stream_5.Observable(),
                access: new arch_stream_5.Observable()
            };
            this.syncState = new arch_stream_5.Map();
            this.syncWaits = new arch_stream_5.Observable();
            this.snapshotCycle = 10;
            this.snapshotJobState = new arch_stream_5.Map();
            var lastNotifiedIdSet = new arch_stream_5.Set(function (o, n) {
                return n > o ? n : o;
            });
            var lastUpdatedDateSet = new arch_stream_5.Set(function (o, n) {
                return n > o ? n : o;
            });
            void this.cache.events.exec.monitor([], function (_a) {
                var _ = _a[0], sub = _a[1];
                var event = sub(void 0);
                if (event instanceof SavedEventRecord === false)
                    return void lastUpdatedDateSet.add(event.key, event.date);
                var isNewMaxId = function () {
                    return !lastNotifiedIdSet.has(event.key) || event.id > lastNotifiedIdSet.get(event.key);
                };
                var isNewMaxDate = function () {
                    return !lastUpdatedDateSet.has(event.key) || event.date > lastUpdatedDateSet.get(event.key) && event.date > _this.cache.cast([event.key], void 0).filter(function (e) {
                        return e !== event;
                    }).reduce(function (date, e) {
                        return e.date > date ? e.date : date;
                    }, 0);
                };
                if (isNewMaxId() && isNewMaxDate()) {
                    void lastNotifiedIdSet.add(event.key, event.id);
                    void lastUpdatedDateSet.add(event.key, event.date);
                    void _this.events.load.emit([
                        event.key,
                        event.attr,
                        event.type
                    ], new ESEvent(event.type, event.id, event.key, event.attr));
                } else {
                    void lastNotifiedIdSet.add(event.key, event.id);
                    void lastUpdatedDateSet.add(event.key, event.date);
                }
            });
        }
        AbstractEventStore.configure = function (name) {
            return {
                make: function (db) {
                    var store = db.objectStoreNames.contains(name) ? db.transaction(name).objectStore(name) : db.createObjectStore(name, {
                        keyPath: STORE_FIELDS.id,
                        autoIncrement: true
                    });
                    if (!store.indexNames.contains(STORE_FIELDS.id)) {
                        void store.createIndex(STORE_FIELDS.id, STORE_FIELDS.id, { unique: true });
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.key)) {
                        void store.createIndex(STORE_FIELDS.key, STORE_FIELDS.key);
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.type)) {
                        void store.createIndex(STORE_FIELDS.type, STORE_FIELDS.type);
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.attr)) {
                        void store.createIndex(STORE_FIELDS.attr, STORE_FIELDS.attr);
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.value)) {
                        void store.createIndex(STORE_FIELDS.value, STORE_FIELDS.value);
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.date)) {
                        void store.createIndex(STORE_FIELDS.date, STORE_FIELDS.date);
                    }
                    if (!store.indexNames.contains(STORE_FIELDS.surrogateKeyDateField)) {
                        void store.createIndex(STORE_FIELDS.surrogateKeyDateField, [
                            STORE_FIELDS.key,
                            STORE_FIELDS.date
                        ]);
                    }
                    return true;
                },
                verify: function (db) {
                    return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.id) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.key) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.type) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.attr) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.value) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.date) && db.transaction(name).objectStore(name).indexNames.contains(STORE_FIELDS.surrogateKeyDateField);
                },
                destroy: function () {
                    return true;
                }
            };
        };
        AbstractEventStore.prototype.sync = function (keys, cb) {
            var _this = this;
            if (cb === void 0) {
                cb = noop_2.noop;
            }
            return void keys.reduce(function (msg, key) {
                switch (_this.syncState.get(key)) {
                case true: {
                        return msg.then(function (a) {
                            return arch_stream_5.concat(a, [void 0]);
                        });
                    }
                case false: {
                        if (cb === noop_2.noop)
                            return msg.then(function (a) {
                                return arch_stream_5.concat(a, [void 0]);
                            });
                        var job_1 = arch_stream_5.Msg();
                        void _this.syncWaits.once([key], function (err) {
                            return void job_1.send([err]);
                        });
                        return msg.then(function (a) {
                            return job_1.then(function (b) {
                                return arch_stream_5.concat(a, b);
                            });
                        });
                    }
                default: {
                        void _this.update(key);
                        if (cb === noop_2.noop)
                            return msg.then(function (a) {
                                return arch_stream_5.concat(a, [void 0]);
                            });
                        var job_2 = arch_stream_5.Msg();
                        void _this.syncWaits.once([key], function (err) {
                            return void job_2.send([err]);
                        });
                        return msg.then(function (a) {
                            return job_2.then(function (b) {
                                return arch_stream_5.concat(a, b);
                            });
                        });
                    }
                }
            }, arch_stream_5.Msg().send([], true)).then(cb);
        };
        AbstractEventStore.prototype.update = function (key) {
            var _this = this;
            var latest = this.meta(key);
            var savedEvents = [];
            void this.syncState.set(key, this.syncState.get(key) === true);
            return void this.cursor(key, STORE_FIELDS.key, api_2.IDBCursorDirection.prev, api_2.IDBTransaction.readonly, function (cursor, err) {
                if (err)
                    return void _this.syncWaits.emit([key], err);
                if (!cursor || cursor.value.id <= latest.id) {
                    if (compose(savedEvents).reduce(function (e) {
                            return e;
                        }).type === EventTypes[EventTypes.delete]) {
                        void _this.clean(Infinity, key);
                    } else {
                        void savedEvents.reduceRight(function (acc, e) {
                            return acc.some(function (_a) {
                                var attr = _a.attr;
                                return attr === e.attr;
                            }) ? acc : arch_stream_5.concat([e], acc);
                        }, []).reduce(function (acc, e) {
                            switch (EventTypes[e.type]) {
                            case EventTypes.put: {
                                    return arch_stream_5.concat([e], acc);
                                }
                            default: {
                                    return [e];
                                }
                            }
                        }, []).reduce(function (_, e) {
                            void _this.cache.terminate([
                                e.key,
                                e.attr,
                                arch_stream_5.sqid(e.id)
                            ]);
                            void _this.cache.register([
                                e.key,
                                e.attr,
                                arch_stream_5.sqid(e.id)
                            ], function (_) {
                                return e;
                            });
                        }, void 0);
                        void _this.cache.cast([key], void 0);
                    }
                    void _this.syncState.set(key, true);
                    void _this.syncWaits.emit([key], void 0);
                    if (savedEvents.length > _this.snapshotCycle) {
                        void _this.snapshot(key);
                    }
                    return;
                }
                var event = cursor.value;
                if (_this.cache.refs([
                        event.key,
                        event.attr,
                        arch_stream_5.sqid(event.id)
                    ]).length > 0)
                    return;
                void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, EventTypes[event.type], event.date));
                if (event.type !== EventTypes[EventTypes.put])
                    return;
                void cursor.continue();
            });
        };
        AbstractEventStore.prototype.meta = function (key) {
            var events = this.cache.cast([key], void 0);
            return Object.freeze(assign_1.assign({
                id: events.reduce(function (id, e) {
                    return e.id > id ? e.id : id;
                }, 0),
                date: 0
            }, compose(events).reduce(function (e) {
                return e;
            }), { key: key }));
        };
        AbstractEventStore.prototype.has = function (key) {
            return compose(this.cache.cast([key], void 0)).reduce(function (e) {
                return e;
            }).type !== EventTypes[EventTypes.delete];
        };
        AbstractEventStore.prototype.get = function (key) {
            void this.sync([key]);
            void this.events.access.emit([key], new ESEvent(exports.ESEventTypes.query, types_1.IdNumber(0), key, ''));
            return compose(this.cache.cast([key], void 0)).reduce(function (e) {
                return e;
            }).value;
        };
        AbstractEventStore.prototype.add = function (event) {
            var _this = this;
            void this.events.access.emit([
                event.key,
                event.attr,
                event.type
            ], new ESEvent(event.type, types_1.IdNumber(0), event.key, event.attr));
            if (event instanceof UnsavedEventRecord === false)
                throw new Error('LocalSocket: Cannot add a saved event: ' + JSON.stringify(event));
            void this.sync([event.key]);
            var id = arch_stream_5.sqid();
            void this.cache.register([
                event.key,
                event.attr,
                arch_stream_5.sqid(0),
                id
            ], function (_) {
                return event;
            });
            void this.cache.cast([
                event.key,
                event.attr,
                arch_stream_5.sqid(0),
                id
            ], void 0);
            return void this.access(function (db) {
                if (_this.cache.refs([
                        event.key,
                        event.attr,
                        arch_stream_5.sqid(0)
                    ]).length === 0)
                    return;
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readwrite);
                var req = tx.objectStore(_this.name).add(event);
                tx.oncomplete = function (_) {
                    var savedEvent = new SavedEventRecord(types_1.IdNumber(req.result), event.key, event.value, EventTypes[event.type], event.date);
                    void _this.cache.terminate([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_5.sqid(0),
                        id
                    ]);
                    void _this.cache.register([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_5.sqid(savedEvent.id)
                    ], function (_) {
                        return savedEvent;
                    });
                    void _this.events.save.emit([
                        savedEvent.key,
                        savedEvent.attr,
                        savedEvent.type
                    ], new ESEvent(savedEvent.type, savedEvent.id, savedEvent.key, savedEvent.attr));
                    void _this.cache.cast([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_5.sqid(savedEvent.id)
                    ], void 0);
                    if (_this.cache.refs([event.key]).filter(function (_a) {
                            var sub = _a[1];
                            return sub(void 0) instanceof SavedEventRecord;
                        }).length > _this.snapshotCycle) {
                        void _this.snapshot(event.key);
                    } else if (savedEvent.type === EventTypes[EventTypes.delete]) {
                        void _this.clean(Infinity, savedEvent.key);
                    }
                };
                tx.onerror = tx.onabort = function (_) {
                    void setTimeout(function () {
                        if (_this.cache.refs([
                                event.key,
                                event.attr,
                                arch_stream_5.sqid(0),
                                id
                            ]).length === 0)
                            return;
                        void _this.events.loss.emit([
                            event.key,
                            event.attr,
                            event.type
                        ], new ESEvent(event.type, event.id, event.key, event.attr));
                    }, 1000);
                };
            });
        };
        AbstractEventStore.prototype.delete = function (key) {
            return void this.add(new UnsavedEventRecord(key, new EventValue(), EventTypes.delete));
        };
        AbstractEventStore.prototype.snapshot = function (key) {
            var _this = this;
            if (this.snapshotJobState.get(key))
                return;
            void this.snapshotJobState.set(key, true);
            return void this.access(function (db) {
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readwrite);
                var store = tx.objectStore(_this.name);
                var req = store.index(STORE_FIELDS.key).openCursor(key, api_2.IDBCursorDirection.prev);
                var savedEvents = [];
                req.onsuccess = function (_) {
                    var cursor = req.result;
                    if (cursor) {
                        var event_4 = cursor.value;
                        void savedEvents.unshift(new SavedEventRecord(event_4.id, event_4.key, event_4.value, EventTypes[event_4.type], event_4.date));
                    }
                    if (!cursor || EventTypes[cursor.value.type] !== EventTypes.put) {
                        if (savedEvents.length < _this.snapshotCycle)
                            return;
                        void _this.clean(Infinity, key);
                        var composedEvent = compose(savedEvents).reduce(function (e) {
                            return e;
                        });
                        if (composedEvent instanceof SavedEventRecord)
                            return;
                        switch (composedEvent.type) {
                        case EventTypes[EventTypes.snapshot]: {
                                return void store.add(new UnsavedEventRecord(composedEvent.key, composedEvent.value, EventTypes[composedEvent.type], savedEvents.reduce(function (date, e) {
                                    return e.date > date ? e.date : date;
                                }, 0)));
                            }
                        case EventTypes[EventTypes.delete]: {
                                return void 0;
                            }
                        }
                        throw new TypeError('LocalSocket: Invalid event type: ' + composedEvent.type);
                    }
                    void cursor.continue();
                };
                tx.oncomplete = function (_) {
                    void _this.snapshotJobState.set(key, false);
                    void _this.update(key);
                };
                tx.onerror = tx.onabort = function (_) {
                    void _this.snapshotJobState.set(key, false);
                };
            });
        };
        AbstractEventStore.prototype.clean = function (until, key) {
            var _this = this;
            if (until === void 0) {
                until = Infinity;
            }
            var removedEvents = [];
            var cleanStateMap = new arch_stream_5.Map();
            return void this.cursor(key ? api_2.IDBKeyRange.bound([
                key,
                0
            ], [
                key,
                until
            ]) : api_2.IDBKeyRange.upperBound(until), key ? STORE_FIELDS.surrogateKeyDateField : STORE_FIELDS.date, api_2.IDBCursorDirection.prev, api_2.IDBTransaction.readwrite, function (cursor, err) {
                if (!cursor)
                    return void removedEvents.reduce(function (_, event) {
                        return void _this.cache.terminate([
                            event.key,
                            event.attr,
                            arch_stream_5.sqid(event.id)
                        ]);
                    }, void 0);
                var event = cursor.value;
                switch (event.type) {
                case EventTypes[EventTypes.put]: {
                        void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
                        break;
                    }
                case EventTypes[EventTypes.snapshot]: {
                        if (!cleanStateMap.get(event.key)) {
                            void cleanStateMap.set(event.key, true);
                            void cursor.continue();
                            return;
                        }
                        break;
                    }
                case EventTypes[EventTypes.delete]: {
                        void cleanStateMap.set(event.key, true);
                        break;
                    }
                default: {
                        void cleanStateMap.set(event.key, true);
                        break;
                    }
                }
                if (cleanStateMap.get(event.key)) {
                    void cursor.delete();
                    void removedEvents.unshift(event);
                }
                void cursor.continue();
            });
        };
        AbstractEventStore.prototype.cursor = function (query, index, direction, mode, cb) {
            var _this = this;
            return void this.access(function (db) {
                var tx = db.transaction(_this.name, mode);
                var req = index ? tx.objectStore(_this.name).index(index).openCursor(query, direction) : tx.objectStore(_this.name).openCursor(query, direction);
                req.onsuccess = function (_) {
                    return req.result && cb(req.result, req.error);
                };
                tx.oncomplete = function (_) {
                    return void cb(null, tx.error);
                };
                ;
                tx.onerror = tx.onabort = function (_) {
                    return void cb(null, tx.error);
                };
            });
        };
        return AbstractEventStore;
    }();
    exports.AbstractEventStore = AbstractEventStore;
    function compose(events) {
        return group(events).map(function (events) {
            return events.reduceRight(compose, new UnsavedEventRecord(types_1.KeyString(''), new EventValue(), EventTypes.delete, 0));
        });
        function group(events) {
            return events.map(function (e, i) {
                return [
                    e,
                    i
                ];
            }).sort(function (_a, _b) {
                var a = _a[0], ai = _a[1];
                var b = _b[0], bi = _b[1];
                return indexedDB.cmp(a.key, b.key) || b.date - a.date || bi - ai;
            }).reduceRight(function (_a, _b) {
                var head = _a[0], tail = _a.slice(1);
                var event = _b[0];
                var prev = head[0];
                if (!prev)
                    return [[event]];
                return prev.key === event.key ? arch_stream_5.concat([arch_stream_5.concat([event], head)], tail) : arch_stream_5.concat([[event]], arch_stream_5.concat([head], tail));
            }, [[]]);
        }
        function compose(target, source) {
            switch (source.type) {
            case EventTypes[EventTypes.put]: {
                    return source.value[source.attr] !== void 0 ? new UnsavedEventRecord(source.key, assign_1.assign(new EventValue(), target.value, source.value), EventTypes.snapshot) : new UnsavedEventRecord(source.key, Object.keys(target.value).reduce(function (value, prop) {
                        if (prop === source.attr)
                            return value;
                        value[prop] = target[prop];
                        return value;
                    }, new EventValue()), EventTypes.snapshot);
                }
            case EventTypes[EventTypes.snapshot]: {
                    return source;
                }
            case EventTypes[EventTypes.delete]: {
                    return source;
                }
            }
            throw new TypeError('LocalSocket: Invalid event type: ' + source.type);
        }
    }
    exports.compose = compose;
});
define('src/layer/domain/indexeddb/model/schema/socket/data', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/model/store/event'
], function (require, exports, event_5) {
    'use strict';
    exports.STORE_NAME = 'data';
    exports.STORE_FIELDS = { key: 'key' };
    var DataValue = function () {
        function DataValue() {
        }
        return DataValue;
    }();
    exports.DataValue = DataValue;
    var DataStore = function (_super) {
        __extends(DataStore, _super);
        function DataStore(access) {
            _super.call(this, access, exports.STORE_NAME);
            void Object.freeze(this);
        }
        DataStore.configure = function () {
            return event_5.AbstractEventStore.configure(exports.STORE_NAME);
        };
        return DataStore;
    }(event_5.AbstractEventStore);
    exports.DataStore = DataStore;
});
define('src/layer/domain/indexeddb/model/store/key-value', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/lib/noop'
], function (require, exports, arch_stream_6, api_3, noop_3) {
    'use strict';
    (function (EventTypes) {
        EventTypes[EventTypes['get'] = 0] = 'get';
        EventTypes[EventTypes['put'] = 1] = 'put';
        EventTypes[EventTypes['delete'] = 2] = 'delete';
    }(exports.EventTypes || (exports.EventTypes = {})));
    var EventTypes = exports.EventTypes;
    var AbstractKeyValueStore = function () {
        function AbstractKeyValueStore(access, name, index) {
            this.access = access;
            this.name = name;
            this.index = index;
            this.cache = new arch_stream_6.Map();
            this.events = { access: new arch_stream_6.Observable() };
            if (typeof index !== 'string')
                throw new TypeError();
        }
        AbstractKeyValueStore.configure = function () {
            return {
                make: function () {
                    return true;
                },
                verify: function () {
                    return true;
                },
                destroy: function () {
                    return true;
                }
            };
        };
        AbstractKeyValueStore.prototype.get = function (key, cb) {
            var _this = this;
            if (cb === void 0) {
                cb = noop_3.noop;
            }
            void this.events.access.emit([key], [
                [key],
                EventTypes.get
            ]);
            void this.access(function (db) {
                var tx = db.transaction(_this.name, api_3.IDBTransaction.readonly);
                var req = _this.index ? tx.objectStore(_this.name).index(_this.index).get(key) : tx.objectStore(_this.name).get(key);
                var result;
                req.onsuccess = function (_) {
                    return result = req.result !== void 0 && req.result !== null ? req.result : _this.cache.get(key);
                };
                tx.oncomplete = function (_) {
                    return cb(result, tx.error);
                };
                tx.onerror = tx.onabort = function (_) {
                    return cb(void 0, tx.error);
                };
            });
            return this.cache.get(key);
        };
        AbstractKeyValueStore.prototype.set = function (key, value, cb) {
            if (cb === void 0) {
                cb = noop_3.noop;
            }
            return this.put(value, key, cb);
        };
        AbstractKeyValueStore.prototype.put = function (value, key, cb) {
            var _this = this;
            if (cb === void 0) {
                cb = noop_3.noop;
            }
            void this.cache.set(key, value);
            void this.events.access.emit([key], [
                [key],
                EventTypes.put
            ]);
            void this.access(function (db) {
                if (!_this.cache.has(key))
                    return;
                var tx = db.transaction(_this.name, api_3.IDBTransaction.readwrite);
                var req = _this.index ? tx.objectStore(_this.name).put(_this.cache.get(key)) : tx.objectStore(_this.name).put(_this.cache.get(key), key);
                tx.oncomplete = tx.onerror = tx.onabort = function (_) {
                    return void cb(key, tx.error);
                };
            });
            return this.cache.get(key);
        };
        AbstractKeyValueStore.prototype.delete = function (key, cb) {
            var _this = this;
            if (cb === void 0) {
                cb = noop_3.noop;
            }
            void this.cache.delete(key);
            void this.events.access.emit([key], [
                [key],
                EventTypes.delete
            ]);
            void this.access(function (db) {
                var tx = db.transaction(_this.name, api_3.IDBTransaction.readwrite);
                var req = tx.objectStore(_this.name).delete(key);
                tx.oncomplete = tx.onerror = tx.onabort = function (_) {
                    return void cb(tx.error);
                };
            });
        };
        AbstractKeyValueStore.prototype.cursor = function (query, index, direction, mode, cb) {
            var _this = this;
            void this.access(function (db) {
                var tx = db.transaction(_this.name, mode);
                var req = index ? tx.objectStore(_this.name).index(index).openCursor(query, direction) : tx.objectStore(_this.name).openCursor(query, direction);
                req.onsuccess = function (_) {
                    return req.result && cb(req.result, req.error);
                };
                tx.oncomplete = function (_) {
                    return void cb(null, tx.error);
                };
                ;
                tx.onerror = tx.onabort = function (_) {
                    return void cb(null, tx.error);
                };
            });
        };
        return AbstractKeyValueStore;
    }();
    exports.AbstractKeyValueStore = AbstractKeyValueStore;
});
define('src/layer/domain/indexeddb/model/schema/socket/access', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/model/store/key-value',
    'src/layer/domain/indexeddb/model/store/event'
], function (require, exports, key_value_1, event_6) {
    'use strict';
    exports.STORE_NAME = 'access';
    exports.STORE_FIELDS = {
        key: 'key',
        date: 'date'
    };
    var AccessRecord = function () {
        function AccessRecord(key, date) {
            this.key = key;
            this.date = date;
        }
        return AccessRecord;
    }();
    var AccessStore = function (_super) {
        __extends(AccessStore, _super);
        function AccessStore(access, event) {
            var _this = this;
            _super.call(this, access, exports.STORE_NAME, exports.STORE_FIELDS.key);
            void Object.freeze(this);
            void event.monitor([], function (_a) {
                var key = _a.key, type = _a.type;
                return type === event_6.ESEventTypes.delete ? void _this.delete(key) : void _this.set(key, new AccessRecord(key, Date.now()));
            });
        }
        AccessStore.configure = function () {
            return {
                make: function (db) {
                    var store = db.objectStoreNames.contains(exports.STORE_NAME) ? db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME) : db.createObjectStore(exports.STORE_NAME, {
                        keyPath: exports.STORE_FIELDS.key,
                        autoIncrement: false
                    });
                    if (!store.indexNames.contains(exports.STORE_FIELDS.key)) {
                        void store.createIndex(exports.STORE_FIELDS.key, exports.STORE_FIELDS.key, { unique: true });
                    }
                    if (!store.indexNames.contains(exports.STORE_FIELDS.date)) {
                        void store.createIndex(exports.STORE_FIELDS.date, exports.STORE_FIELDS.date);
                    }
                    return true;
                },
                verify: function (db) {
                    return db.objectStoreNames.contains(exports.STORE_NAME) && db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME).indexNames.contains(exports.STORE_FIELDS.key) && db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME).indexNames.contains(exports.STORE_FIELDS.date);
                },
                destroy: function () {
                    return true;
                }
            };
        };
        return AccessStore;
    }(key_value_1.AbstractKeyValueStore);
    exports.AccessStore = AccessStore;
});
define('src/layer/domain/indexeddb/model/schema/socket/expiry', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/domain/indexeddb/model/store/key-value',
    'src/layer/domain/indexeddb/model/store/event'
], function (require, exports, api_4, key_value_2, event_7) {
    'use strict';
    exports.STORE_NAME = 'expiry';
    exports.STORE_FIELDS = {
        key: 'key',
        expiry: 'expiry'
    };
    var ExpiryRecord = function () {
        function ExpiryRecord(key, expiry) {
            this.key = key;
            this.expiry = expiry;
        }
        return ExpiryRecord;
    }();
    var ExpiryStore = function (_super) {
        __extends(ExpiryStore, _super);
        function ExpiryStore(access, data, expiries) {
            var _this = this;
            _super.call(this, access, exports.STORE_NAME, exports.STORE_FIELDS.key);
            void Object.freeze(this);
            var timer = 0;
            var scheduled = Infinity;
            var schedule = function (date) {
                if (scheduled < date)
                    return;
                void clearTimeout(timer);
                scheduled = date;
                timer = setTimeout(function () {
                    scheduled = Infinity;
                    void _this.cursor(null, exports.STORE_FIELDS.expiry, api_4.IDBCursorDirection.next, api_4.IDBTransaction.readonly, function (cursor) {
                        if (!cursor)
                            return;
                        var record = cursor.value;
                        if (record.expiry > Date.now()) {
                            void schedule(record.expiry);
                        } else {
                            void data.delete(record.key);
                            void cursor.continue();
                        }
                    });
                }, date - Date.now());
            };
            void schedule(Date.now());
            void data.events.access.monitor([], function (_a) {
                var key = _a.key, type = _a.type;
                if (type === event_7.ESEventTypes.delete) {
                    void _this.delete(key);
                } else {
                    if (!expiries.has(key))
                        return;
                    var expiry = Date.now() + expiries.get(key);
                    void _this.set(key, new ExpiryRecord(key, expiry));
                    void schedule(expiry);
                }
            });
        }
        ExpiryStore.configure = function () {
            return {
                make: function (db) {
                    var store = db.objectStoreNames.contains(exports.STORE_NAME) ? db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME) : db.createObjectStore(exports.STORE_NAME, {
                        keyPath: exports.STORE_FIELDS.key,
                        autoIncrement: false
                    });
                    if (!store.indexNames.contains(exports.STORE_FIELDS.key)) {
                        void store.createIndex(exports.STORE_FIELDS.key, exports.STORE_FIELDS.key, { unique: true });
                    }
                    if (!store.indexNames.contains(exports.STORE_FIELDS.expiry)) {
                        void store.createIndex(exports.STORE_FIELDS.expiry, exports.STORE_FIELDS.expiry);
                    }
                    return true;
                },
                verify: function (db) {
                    return db.objectStoreNames.contains(exports.STORE_NAME) && db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME).indexNames.contains(exports.STORE_FIELDS.key) && db.transaction(exports.STORE_NAME).objectStore(exports.STORE_NAME).indexNames.contains(exports.STORE_FIELDS.expiry);
                },
                destroy: function () {
                    return true;
                }
            };
        };
        return ExpiryStore;
    }(key_value_2.AbstractKeyValueStore);
    exports.ExpiryStore = ExpiryStore;
});
define('src/layer/domain/indexeddb/model/schema/socket', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/indexeddb/model/store/event',
    'src/layer/domain/indexeddb/model/schema/socket/data',
    'src/layer/domain/indexeddb/model/schema/socket/access',
    'src/layer/domain/indexeddb/model/schema/socket/expiry',
    'src/lib/noop'
], function (require, exports, arch_stream_7, api_5, types_2, event_8, data_1, access_2, expiry_1, noop_4) {
    'use strict';
    exports.SocketRecord = event_8.UnsavedEventRecord;
    exports.ESEventTypes = event_8.ESEventTypes;
    exports.SocketValue = data_1.DataValue;
    var SocketStore = function () {
        function SocketStore(name, destroy, expiry) {
            if (expiry === void 0) {
                expiry = Infinity;
            }
            this.name = name;
            this.expiry = expiry;
            this.expiries = new arch_stream_7.Map();
            var access = api_5.open(name, {
                make: function (db) {
                    return data_1.DataStore.configure().make(db) && access_2.AccessStore.configure().make(db) && expiry_1.ExpiryStore.configure().make(db);
                },
                verify: function (db) {
                    return data_1.DataStore.configure().verify(db) && access_2.AccessStore.configure().verify(db) && expiry_1.ExpiryStore.configure().verify(db);
                },
                destroy: function (err, ev) {
                    return data_1.DataStore.configure().destroy(err, ev) && access_2.AccessStore.configure().destroy(err, ev) && expiry_1.ExpiryStore.configure().destroy(err, ev) && destroy(err, ev);
                }
            });
            this.schema = new Schema(access, this.expiries);
            this.events = this.schema.data.events;
        }
        SocketStore.prototype.sync = function (keys, cb) {
            if (cb === void 0) {
                cb = noop_4.noop;
            }
            return this.schema.data.sync(keys, cb);
        };
        SocketStore.prototype.meta = function (key) {
            return this.schema.data.meta(types_2.KeyString(key));
        };
        SocketStore.prototype.has = function (key) {
            return this.schema.data.has(types_2.KeyString(key));
        };
        SocketStore.prototype.get = function (key) {
            return this.schema.data.get(types_2.KeyString(key));
        };
        SocketStore.prototype.add = function (record) {
            return this.schema.data.add(record);
        };
        SocketStore.prototype.delete = function (key) {
            return this.schema.data.delete(types_2.KeyString(key));
        };
        SocketStore.prototype.expire = function (key, expiry) {
            if (expiry === void 0) {
                expiry = this.expiry;
            }
            if (expiry === Infinity)
                return;
            return void this.expiries.set(key, expiry);
        };
        SocketStore.prototype.recent = function (limit, cb) {
            var keys = [];
            return void this.schema.access.cursor(null, access_2.STORE_FIELDS.date, api_5.IDBCursorDirection.prevunique, api_5.IDBTransaction.readonly, function (cursor, err) {
                if (!cursor)
                    return void cb(keys, err);
                if (--limit < 0)
                    return;
                void keys.push(cursor.primaryKey);
                void cursor.continue();
            });
        };
        SocketStore.prototype.destroy = function () {
            return api_5.destroy(this.name);
        };
        return SocketStore;
    }();
    exports.SocketStore = SocketStore;
    var Schema = function () {
        function Schema(access, expiries) {
            this.data = new data_1.DataStore(access);
            this.access = new access_2.AccessStore(access, this.data.events.access);
            this.expire = new expiry_1.ExpiryStore(access, this.data, expiries);
            void Object.freeze(this);
        }
        return Schema;
    }();
});
define('src/layer/domain/webstorage/service/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/webstorage/api'
], function (require, exports, arch_stream_8, api_6) {
    'use strict';
    exports.events = {
        localStorage: subscribe(api_6.events.localStorage),
        sessionStorage: subscribe(api_6.events.sessionStorage)
    };
    function subscribe(source) {
        var observer = new arch_stream_8.Observable();
        void source.on(['storage'], function (event) {
            return void observer.emit([event.key], event);
        });
        return observer;
    }
});
define('src/layer/domain/webstorage/service/storage', [
    'require',
    'exports',
    'arch-stream'
], function (require, exports, arch_stream_9) {
    'use strict';
    var StorageLike = function () {
        function StorageLike() {
            this.store = new arch_stream_9.Map();
        }
        Object.defineProperty(StorageLike.prototype, 'length', {
            get: function () {
                return this.store.size;
            },
            enumerable: true,
            configurable: true
        });
        StorageLike.prototype.getItem = function (key) {
            return this.store.has(key) ? this.store.get(key) : null;
        };
        StorageLike.prototype.setItem = function (key, data) {
            void this.store.set(key, data);
        };
        StorageLike.prototype.removeItem = function (key) {
            void this.store.delete(key);
        };
        StorageLike.prototype.clear = function () {
            void this.store.clear();
        };
        return StorageLike;
    }();
    exports.fakeStorage = new StorageLike();
});
define('src/layer/domain/webstorage/repository/port', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/domain/dao/api',
    'src/layer/domain/webstorage/service/event',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/service/storage'
], function (require, exports, arch_stream_10, api_7, event_9, api_8, storage_1) {
    'use strict';
    var LocalStorageObjectCache = new arch_stream_10.Set();
    var LocalStorageSubscriber = new arch_stream_10.Set();
    var SessionStorageObjectCache = new arch_stream_10.Set();
    var SessionStorageSubscriber = new arch_stream_10.Set();
    var PortEventTypes;
    (function (PortEventTypes) {
        PortEventTypes.send = 'send';
        PortEventTypes.recv = 'recv';
    }(PortEventTypes = exports.PortEventTypes || (exports.PortEventTypes = {})));
    var PortEvent = function () {
        function PortEvent(type, key, attr, newValue, oldValue) {
            this.type = type;
            this.key = key;
            this.attr = attr;
            this.newValue = newValue;
            this.oldValue = oldValue;
        }
        return PortEvent;
    }();
    exports.PortEvent = PortEvent;
    function repository(name, storage, factory, log) {
        if (storage === void 0) {
            storage = api_8.sessionStorage || storage_1.fakeStorage;
        }
        if (log === void 0) {
            log = {
                update: function (name) {
                },
                delete: function (name) {
                }
            };
        }
        return new Port(name, storage, factory, log);
    }
    exports.repository = repository;
    var Port = function () {
        function Port(name, storage, factory, log) {
            if (log === void 0) {
                log = {
                    update: function (name) {
                    },
                    delete: function (name) {
                    }
                };
            }
            this.name = name;
            this.storage = storage;
            this.factory = factory;
            this.log = log;
            this.cache = this.storage === api_8.localStorage ? LocalStorageObjectCache : SessionStorageObjectCache;
            this.eventSource = this.storage === api_8.localStorage ? event_9.events.localStorage : event_9.events.sessionStorage;
            this.uuid = arch_stream_10.uuid();
            this.events = {
                send: new arch_stream_10.Observable(),
                recv: new arch_stream_10.Observable()
            };
            void Object.freeze(this);
        }
        Port.prototype.link = function () {
            var _this = this;
            if (this.cache.has(this.name))
                return this.cache.get(this.name);
            var source = arch_stream_10.assign((_a = {}, _a[api_7.SCHEMA.KEY.NAME] = this.name, _a[api_7.SCHEMA.EVENT.NAME] = new arch_stream_10.Observable(), _a), parse(this.storage.getItem(this.name) || '{}'));
            var dao = api_7.build(source, this.factory, function (attr, newValue, oldValue) {
                void _this.log.update(_this.name);
                void _this.storage.setItem(_this.name, JSON.stringify(Object.keys(source).filter(api_7.isValidPropertyName).filter(api_7.isValidPropertyValue(source)).reduce(function (acc, prop) {
                    return Object.defineProperty(acc, prop, {
                        value: source[prop],
                        enumerable: true,
                        writable: true,
                        configurable: true
                    });
                }, {})));
                {
                    var event_10 = new PortEvent(PortEventTypes.send, _this.name, attr, newValue, oldValue);
                    void source[api_7.SCHEMA.EVENT.NAME].emit([
                        PortEventTypes.send,
                        attr
                    ], event_10);
                    void _this.events.send.emit([attr], event_10);
                }
            });
            var subscriber = function (_a) {
                var newValue = _a.newValue, oldValue = _a.oldValue;
                if (newValue) {
                    var item_1 = parse(newValue);
                    void Object.keys(item_1).filter(api_7.isValidPropertyName).filter(api_7.isValidPropertyValue(item_1)).reduce(function (_, prop) {
                        var _a = [
                                item_1[prop],
                                source[prop]
                            ], newVal = _a[0], oldVal = _a[1];
                        if (newVal === oldVal)
                            return;
                        source[prop] = newVal;
                    }, void 0);
                }
                {
                    var event_11 = new PortEvent(PortEventTypes.recv, _this.name, '', newValue, oldValue);
                    void source[api_7.SCHEMA.EVENT.NAME].emit([
                        PortEventTypes.recv,
                        ''
                    ], event_11);
                    void _this.events.recv.emit([''], event_11);
                }
            };
            void this.eventSource.on([
                this.name,
                this.uuid
            ], subscriber);
            void this.cache.add(this.name, dao);
            void this.log.update(this.name);
            return dao;
            function parse(item) {
                try {
                    return JSON.parse(item);
                } catch (_) {
                    return {};
                }
            }
            var _a;
        };
        Port.prototype.close = function () {
            void this.eventSource.off([
                this.name,
                this.uuid
            ]);
            void this.cache.delete(this.name);
        };
        Port.prototype.destroy = function () {
            void this.close();
            void this.storage.removeItem(this.name);
            void this.log.delete(this.name);
        };
        return Port;
    }();
});
define('src/layer/domain/indexeddb/repository/socket', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/domain/dao/api',
    'src/layer/domain/indexeddb/model/schema/socket',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/repository/port',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/lib/assign'
], function (require, exports, arch_stream_11, api_9, socket_1, api_10, port_1, types_3, assign_2) {
    'use strict';
    function socket(name, factory, destroy, expiry) {
        if (expiry === void 0) {
            expiry = Infinity;
        }
        return new Socket(name, factory, expiry, destroy);
    }
    exports.socket = socket;
    var Message = function () {
        function Message(key, attr, date) {
            this.key = key;
            this.attr = attr;
            this.date = date;
        }
        return Message;
    }();
    var Port = function () {
        function Port() {
            this.msgs = [];
            this.msgHeadSet_ = new arch_stream_11.Set(function (o, n) {
                return n > o ? n : o;
            });
        }
        Port.prototype.recv = function () {
            var _this = this;
            return this.msgs.map(function (msg) {
                return new Message(msg.key, msg.attr, msg.date);
            }).filter(function (msg) {
                return !_this.msgHeadSet_.has(msg.key) || msg.date > _this.msgHeadSet_.get(msg.key);
            }).filter(function (msg) {
                return !void _this.msgHeadSet_.add(msg.key, msg.date);
            });
        };
        Port.prototype.send = function (msg) {
            this.msgs = arch_stream_11.concat([msg], this.msgs.slice(0, 9));
        };
        return Port;
    }();
    var Socket = function (_super) {
        __extends(Socket, _super);
        function Socket(name, factory, expiry, destroy) {
            var _this = this;
            _super.call(this, name, destroy, expiry);
            this.factory = factory;
            this.proxy = port_1.repository(this.name, api_10.localStorage, function () {
                return new Port();
            });
            this.port = this.proxy.link();
            this.links = new arch_stream_11.Set();
            this.sources = new arch_stream_11.Set();
            void this.port.__event.monitor([], function (_a) {
                var type = _a.type, newValue = _a.newValue;
                switch (type) {
                case port_1.PortEventTypes.send: {
                        return;
                    }
                case port_1.PortEventTypes.recv: {
                        return void _this.port.recv().reduce(function (_, msg) {
                            return void _this.schema.data.update(msg.key);
                        }, void 0);
                    }
                }
            });
            void this.events.save.monitor([], function (_a) {
                var id = _a.id, key = _a.key, attr = _a.attr;
                void _this.port.send(new Message(key, attr, Date.now()));
            });
            void this.events.load.monitor([], function (_a) {
                var id = _a.id, key = _a.key, attr = _a.attr, type = _a.type;
                var source = _this.sources.get(key);
                if (!source)
                    return;
                switch (type) {
                case socket_1.ESEventTypes.put: {
                        var oldVal = source[attr];
                        var newVal = _this.get(key)[attr];
                        source[attr] = newVal;
                        void source.__event.emit([
                            port_1.PortEventTypes.recv,
                            attr
                        ], new port_1.PortEvent(port_1.PortEventTypes.recv, key, attr, newVal, oldVal));
                        return;
                    }
                case socket_1.ESEventTypes.delete: {
                        var cache = _this.get(key);
                        void Object.keys(cache).filter(api_9.isValidPropertyName).filter(api_9.isValidPropertyValue(cache)).reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = void 0;
                            source[attr] = newVal;
                            void source.__event.emit([
                                port_1.PortEventTypes.recv,
                                attr
                            ], new port_1.PortEvent(port_1.PortEventTypes.recv, key, attr, newVal, oldVal));
                        }, void 0);
                        return;
                    }
                case socket_1.ESEventTypes.snapshot: {
                        var cache_1 = _this.get(key);
                        void Object.keys(cache_1).filter(api_9.isValidPropertyName).filter(api_9.isValidPropertyValue(cache_1)).reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = cache_1[attr];
                            source[attr] = newVal;
                            void source.__event.emit([
                                port_1.PortEventTypes.recv,
                                attr
                            ], new port_1.PortEvent(port_1.PortEventTypes.recv, key, attr, newVal, oldVal));
                        }, void 0);
                        return;
                    }
                }
            });
            void Object.freeze(this);
        }
        Socket.prototype.link = function (key, expiry) {
            var _this = this;
            void this.expire(key, expiry);
            if (this.links.has(key))
                return this.links.get(key);
            return this.links.add(key, api_9.build(Object.defineProperties(this.sources.add(key, assign_2.assign({}, this.get(key))), {
                __meta: {
                    get: function () {
                        return _this.meta(key);
                    }
                },
                __id: {
                    get: function () {
                        return this.__meta.id;
                    }
                },
                __key: {
                    get: function () {
                        return this.__meta.key;
                    }
                },
                __date: {
                    get: function () {
                        return this.__meta.date;
                    }
                },
                __event: { value: new arch_stream_11.Observable() }
            }), this.factory, function (attr, newValue, oldValue) {
                void _this.add(new socket_1.SocketRecord(types_3.KeyString(key), (_a = {}, _a[attr] = newValue, _a)));
                void _this.sources.get(key).__event.emit([
                    port_1.PortEventTypes.send,
                    attr
                ], new port_1.PortEvent(port_1.PortEventTypes.send, key, attr, newValue, oldValue));
                var _a;
            }));
        };
        Socket.prototype.close = function () {
            void this.proxy.close();
        };
        Socket.prototype.destroy = function () {
            void this.close();
            void this.proxy.destroy();
            void _super.prototype.destroy.call(this);
        };
        return Socket;
    }(socket_1.SocketStore);
});
define('src/layer/domain/indexeddb/service/event', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api'
], function (require, exports, api_11) {
    'use strict';
    exports.event = api_11.event;
});
define('src/layer/domain/indexeddb/api', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/repository/socket',
    'src/layer/domain/indexeddb/service/event'
], function (require, exports, socket_2, event_12) {
    'use strict';
    exports.socket = socket_2.socket;
    exports.event = event_12.event;
});
define('src/layer/domain/webstorage/service/log', [
    'require',
    'exports',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/repository/port'
], function (require, exports, api_12, port_2) {
    'use strict';
    var VERSION = 1;
    var WebStorageLog = function () {
        function WebStorageLog() {
            this.version = VERSION;
            this.logs = Object.create(null);
        }
        WebStorageLog.prototype.verify = function () {
            if (this.version === VERSION)
                return true;
            this.logs = Object.create(null);
            if (this.version > VERSION || !this.version) {
                this.logs = this.logs;
            }
            return false;
        };
        WebStorageLog.prototype.has = function (name) {
            void this.verify();
            return name in this.logs;
        };
        WebStorageLog.prototype.get = function (name) {
            void this.verify();
            return this.logs[name] || 0;
        };
        WebStorageLog.prototype.update = function (name) {
            void this.verify();
            this.logs[name] = Date.now();
        };
        WebStorageLog.prototype.delete = function (name) {
            void this.verify();
            delete this.logs[name];
        };
        WebStorageLog.prototype.clear = function () {
            void this.verify();
            this.logs = Object.create(null);
        };
        WebStorageLog.prototype.commit = function () {
            if (!this.verify())
                return;
            this.logs = this.logs;
        };
        WebStorageLog.prototype.entries = function () {
            var _this = this;
            if (!this.verify())
                return [];
            return Object.keys(this.logs).map(function (name) {
                return [
                    name,
                    _this.logs[name]
                ];
            });
        };
        return WebStorageLog;
    }();
    exports.WebStorageLog = WebStorageLog;
    exports.namespace = 'localsocket::log';
    exports.log = api_12.localStorage ? port_2.repository(exports.namespace, api_12.localStorage, function () {
        return new WebStorageLog();
    }).link() : new WebStorageLog();
    void setInterval(function () {
        return void exports.log.commit();
    }, 1000);
    void window.addEventListener('unload', function () {
        return void exports.log.commit();
    });
});
define('src/layer/domain/webstorage/service/expiry', [
    'require',
    'exports',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/repository/port',
    'src/layer/domain/webstorage/service/log'
], function (require, exports, api_13, port_3, log_1) {
    'use strict';
    var VERSION = 1;
    var WebStorageExpiry = function () {
        function WebStorageExpiry() {
            this.version = VERSION;
            this.expiries = Object.create(null);
        }
        WebStorageExpiry.prototype.verify = function () {
            if (this.version === VERSION)
                return true;
            this.expiries = Object.create(null);
            if (this.version > VERSION || !this.version) {
                this.expiries = this.expiries;
            }
            return false;
        };
        WebStorageExpiry.prototype.has = function (name) {
            void this.verify();
            return name in this.expiries;
        };
        WebStorageExpiry.prototype.get = function (name) {
            void this.verify();
            return this.expiries[name] || 0;
        };
        WebStorageExpiry.prototype.add = function (name, expiry) {
            void this.verify();
            this.expiries[name] = expiry;
            void this.clean_(name);
        };
        WebStorageExpiry.prototype.delete = function (name) {
            void this.verify();
            delete this.expiries[name];
        };
        WebStorageExpiry.prototype.clear = function () {
            void this.verify();
            this.expiries = Object.create(null);
        };
        WebStorageExpiry.prototype.commit = function () {
            if (!this.verify())
                return;
            this.expiries = this.expiries;
        };
        WebStorageExpiry.prototype.entries = function () {
            var _this = this;
            if (!this.verify())
                return [];
            return Object.keys(this.expiries).map(function (name) {
                return [
                    name,
                    _this.expiries[name]
                ];
            });
        };
        WebStorageExpiry.prototype.clean = function (now) {
            var _this = this;
            if (now === void 0) {
                now = Date.now();
            }
            void exports.expiry.entries().forEach(function (_a) {
                var name = _a[0];
                return void _this.clean_(name, now);
            });
        };
        WebStorageExpiry.prototype.clean_ = function (name, now) {
            if (now === void 0) {
                now = Date.now();
            }
            if (!log_1.log.has(name) || !exports.expiry.has(name))
                return;
            if (log_1.log.get(name) + exports.expiry.get(name) > now)
                return;
            void port_3.repository(name, api_13.localStorage, Object).destroy();
            void exports.expiry.delete(name);
            void log_1.log.delete(name);
        };
        return WebStorageExpiry;
    }();
    exports.WebStorageExpiry = WebStorageExpiry;
    exports.namespace = 'localsocket::expiry';
    exports.expiry = api_13.localStorage ? port_3.repository(exports.namespace, api_13.localStorage, function () {
        return new WebStorageExpiry();
    }).link() : new WebStorageExpiry();
    void setInterval(function () {
        return void exports.expiry.commit();
    }, 1000);
    void window.addEventListener('unload', function () {
        return void exports.expiry.commit();
    });
    void exports.expiry.clean();
});
define('src/layer/domain/webstorage/api', [
    'require',
    'exports',
    'src/layer/domain/webstorage/repository/port',
    'src/layer/domain/webstorage/service/log',
    'src/layer/domain/webstorage/service/expiry',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/service/event'
], function (require, exports, port_4, log_2, expiry_2, api_14, api_15, event_13) {
    'use strict';
    exports.localStorage = api_15.localStorage;
    exports.sessionStorage = api_15.sessionStorage;
    exports.supportWebStorage = api_15.supportWebStorage;
    exports.events = event_13.events;
    function webstorage(name, storage, factory, expiry_) {
        void expiry_2.expiry.add(name, expiry_);
        return port_4.repository(name, storage, factory, storage === api_14.localStorage ? log_2.log : void 0);
    }
    exports.webstorage = webstorage;
});
define('src/layer/app/api', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api',
    'src/layer/domain/webstorage/api'
], function (require, exports, api_16, api_17, api_18, api_19, api_20) {
    'use strict';
    exports.status = api_20.supportWebStorage;
    function socket(name, config) {
        config = configure(config);
        return api_16.socket(name, config.factory, config.destroy, config.expiry);
        function configure(config) {
            var Config = function () {
                function Config(expiry, factory, destroy) {
                    if (expiry === void 0) {
                        expiry = Infinity;
                    }
                    if (destroy === void 0) {
                        destroy = function () {
                            return true;
                        };
                    }
                    this.expiry = expiry;
                    this.factory = factory;
                    this.destroy = destroy;
                    void Object.freeze(this);
                }
                return Config;
            }();
            return new Config(config.expiry, config.factory, config.destroy);
        }
    }
    exports.socket = socket;
    function port(name, config) {
        config = configure(config);
        return api_17.webstorage(name, api_17.localStorage, config.factory, config.expiry);
        function configure(config) {
            var Config = function () {
                function Config(expire, factory, destroy) {
                    if (expire === void 0) {
                        expire = 30 * 24 * 60 * 60 * 1000;
                    }
                    if (destroy === void 0) {
                        destroy = function () {
                            return true;
                        };
                    }
                    this.expire = expire;
                    this.factory = factory;
                    this.destroy = destroy;
                    void Object.freeze(this);
                }
                return Config;
            }();
            return new Config(config.expiry, config.factory, config.destroy);
        }
    }
    exports.port = port;
    var events;
    (function (events) {
        events.indexedDB = api_18.event;
        events.localStorage = api_19.events.localStorage;
        events.sessionStorage = api_19.events.sessionStorage;
    }(events = exports.events || (exports.events = {})));
});
define('src/layer/interface/api', [
    'require',
    'exports',
    'src/layer/app/api'
], function (require, exports, api_21) {
    'use strict';
    exports.socket = api_21.socket;
    exports.port = api_21.port;
    exports.events = api_21.events;
    exports.status = api_21.status;
});
define('src/export', [
    'require',
    'exports',
    'src/layer/interface/api'
], function (require, exports, api_22) {
    'use strict';
    exports.default = api_22.socket;
    exports.socket = api_22.socket;
    exports.port = api_22.port;
    exports.status = api_22.status;
});
define('localsocket', [
    'require',
    'exports',
    'src/export',
    'src/export'
], function (require, exports, export_1, export_2) {
    'use strict';
    function __export(m) {
        for (var p in m)
            if (!exports.hasOwnProperty(p))
                exports[p] = m[p];
    }
    __export(export_1);
    exports.default = export_2.default;
});
define('src/layer/domain/indexeddb/model/api', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api'
], function (require, exports, api_23) {
    'use strict';
    exports.IDBKeyRange = api_23.IDBKeyRange;
});