/*! localsocket v0.0.1 https://github.com/falsandtru/localsocket | (c) 2015, falsandtru | MIT Licence */
/*! Link: MIT Lisence http://www.opensource.org/licenses/mit-license.php */
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
    (function (IDBEvenType) {
        IDBEvenType[IDBEvenType['connect'] = 0] = 'connect';
        IDBEvenType[IDBEvenType['disconnect'] = 1] = 'disconnect';
        IDBEvenType[IDBEvenType['block'] = 2] = 'block';
        IDBEvenType[IDBEvenType['error'] = 3] = 'error';
        IDBEvenType[IDBEvenType['abort'] = 4] = 'abort';
        IDBEvenType[IDBEvenType['crash'] = 5] = 'crash';
        IDBEvenType[IDBEvenType['destroy'] = 6] = 'destroy';
    }(exports.IDBEvenType || (exports.IDBEvenType = {})));
    var IDBEvenType = exports.IDBEvenType;
    var IDBEventName;
    (function (IDBEventName) {
        IDBEventName.connect = IDBEvenType[IDBEvenType.connect];
        IDBEventName.disconnect = IDBEvenType[IDBEvenType.disconnect];
        IDBEventName.block = IDBEvenType[IDBEvenType.block];
        IDBEventName.error = IDBEvenType[IDBEvenType.error];
        IDBEventName.abort = IDBEvenType[IDBEvenType.abort];
        IDBEventName.crash = IDBEvenType[IDBEvenType.crash];
        IDBEventName.destroy = IDBEvenType[IDBEvenType.destroy];
    }(IDBEventName = exports.IDBEventName || (exports.IDBEventName = {})));
    var IDBEvent = function () {
        function IDBEvent(type, name) {
            this.name = name;
            this.namespace = [this.name];
            this.type = IDBEvenType[type];
            void Object.freeze(this);
        }
        return IDBEvent;
    }();
    exports.IDBEvent = IDBEvent;
});
define('src/layer/infrastructure/indexeddb/model/access', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/module/global',
    'src/layer/infrastructure/indexeddb/model/event'
], function (require, exports, arch_stream_1, global_1, event_1) {
    'use strict';
    var IDBEventObserver = new arch_stream_1.Observable();
    exports.event = IDBEventObserver;
    exports.ConfigMap = new arch_stream_1.Map();
    var StateCommand;
    (function (StateCommand) {
        StateCommand[StateCommand['open'] = 0] = 'open';
        StateCommand[StateCommand['close'] = 1] = 'close';
        StateCommand[StateCommand['destroy'] = 2] = 'destroy';
    }(StateCommand || (StateCommand = {})));
    var StateCommandMap = new arch_stream_1.Map();
    var RequestQueueSet = new arch_stream_1.Set();
    var StateSet = new arch_stream_1.Set();
    var ConnectionSet = new arch_stream_1.Set();
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
                void console.error(err, err + '');
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
            var openRequest_1 = version ? global_1.indexedDB.open(name, version) : global_1.indexedDB.open(name);
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
        void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.block, name));
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
                    void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.connect, name));
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
        void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.error, name));
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
        void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.abort, name));
        var destroy = exports.ConfigMap.get(name).destroy;
        if (destroy(error, event)) {
            return void handleFromDestroyState(name);
        } else {
            return void handleFromEndState(name);
        }
    }
    function handleFromCrashState(name, error) {
        void ConnectionSet.delete(name);
        void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.crash, name));
        var destroy = exports.ConfigMap.get(name).destroy;
        if (destroy(error, null)) {
            return void handleFromDestroyState(name);
        } else {
            return void handleFromEndState(name);
        }
    }
    function handleFromDestroyState(name) {
        void ConnectionSet.delete(name);
        var deleteRequest = global_1.indexedDB.deleteDatabase(name);
        deleteRequest.onsuccess = function (_) {
            void RequestQueueSet.delete(name);
            void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.destroy, name));
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
        void IDBEventObserver.emit(new event_1.IDBEvent(event_1.IDBEvenType.disconnect, name));
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
], function (require, exports, global_2, access_1, event_2) {
    'use strict';
    exports.indexedDB = global_2.indexedDB;
    exports.IDBKeyRange = global_2.IDBKeyRange;
    exports.IDBTransaction = global_2.IDBTransaction;
    exports.IDBCursorDirection = global_2.IDBCursorDirection;
    exports.open = access_1.open;
    exports.listen = access_1.listen;
    exports.close = access_1.close;
    exports.destroy = access_1.destroy;
    exports.event = access_1.event;
    exports.IDBEvent = event_2.IDBEvent;
    exports.IDBEventName = event_2.IDBEventName;
});
define('src/layer/app/module/config', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function configure(config) {
        return new StorageConfig(config.life, config.factory, config.destroy);
    }
    exports.configure = configure;
    var StorageConfig = function () {
        function StorageConfig(life, factory, destroy) {
            if (life === void 0) {
                life = 10;
            }
            if (destroy === void 0) {
                destroy = function () {
                    return true;
                };
            }
            this.life = life;
            this.factory = factory;
            this.destroy = destroy;
        }
        return StorageConfig;
    }();
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
], function (require, exports, arch_stream_2, noop_1) {
    'use strict';
    exports.SCHEMA = {
        ID: { NAME: '__id' },
        KEY: { NAME: '__key' },
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
        var descmap = arch_stream_2.assign(Object.keys(dao).filter(isValidPropertyName).filter(isValidPropertyValue(dao)).reduce(function (map, prop) {
            {
                var desc = Object.getOwnPropertyDescriptor(dao, prop);
                if (desc && (desc.get || desc.set))
                    return map;
            }
            if (source[prop] === void 0) {
                source[prop] = dao[prop];
            }
            map[prop] = {
                configurable: false,
                enumerable: true,
                get: function () {
                    return source[prop];
                },
                set: function (newVal) {
                    var oldVal = source[prop];
                    if (newVal === oldVal)
                        return;
                    source[prop] = newVal;
                    void update(prop, newVal, oldVal);
                }
            };
            return map;
        }, {}), (_a = {}, _a[exports.SCHEMA.ID.NAME] = {
            configurable: false,
            enumerable: true,
            get: function () {
                return source[exports.SCHEMA.ID.NAME];
            }
        }, _a[exports.SCHEMA.KEY.NAME] = {
            configurable: false,
            enumerable: true,
            get: function () {
                return source[exports.SCHEMA.KEY.NAME];
            }
        }, _a[exports.SCHEMA.EVENT.NAME] = {
            configurable: false,
            enumerable: true,
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
                    if (!nextValue || typeof nextValue !== 'object') {
                        to[nextKey] = nextValue;
                        continue;
                    }
                    if (Array.isArray(nextValue)) {
                        to[nextKey] = nextValue.slice();
                        continue;
                    }
                    if (nextValue instanceof Blob || nextValue instanceof ImageData) {
                        to[nextKey] = nextValue;
                        continue;
                    }
                    if (prevValue && nextValue && typeof prevValue === 'object' && !Array.isArray(prevValue)) {
                        to[nextKey] = assign(prevValue, nextValue);
                        continue;
                    }
                    to[nextKey] = assign({}, nextValue);
                }
            }
        }
        return to;
    }
    exports.assign = assign;
});
define('src/layer/domain/indexeddb/model/store/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/lib/assign'
], function (require, exports, arch_stream_3, api_1, types_1, assign_1) {
    'use strict';
    (function (EventType) {
        EventType[EventType['put'] = 0] = 'put';
        EventType[EventType['delete'] = 1] = 'delete';
        EventType[EventType['snapshot'] = 2] = 'snapshot';
    }(exports.EventType || (exports.EventType = {})));
    var EventType = exports.EventType;
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
            this.type = EventType[type];
            if (typeof this.type !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event type: ' + this.type);
            this.key = key;
            if (typeof this.key !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event key: ' + this.key);
            this.value = value;
            if (typeof this.value !== 'object' || !this.value)
                throw new TypeError('LocalSocket: EventRecord: Invalid event value: ' + this.value);
            this.date = date;
            if (typeof this.date !== 'number' || this.date > 0 === false)
                throw new TypeError('LocalSocket: EventRecord: Invalid event date: ' + this.date);
            this.attr = this.type === EventType[EventType.put] ? Object.keys(value).reduce(function (r, p) {
                return p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r;
            }, '') : '';
            if (typeof this.attr !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr: ' + this.key);
            if (this.type === EventType[EventType.put] && this.attr.length === 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            if (this.type !== EventType[EventType.put] && this.attr.length !== 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            switch (type) {
            case EventType.put: {
                    this.value = value = assign_1.assign(new EventValue(), (_a = {}, _a[this.attr] = value[this.attr], _a));
                    return;
                }
            case EventType.snapshot: {
                    this.value = value = assign_1.assign(new EventValue(), value);
                    return;
                }
            case EventType.delete:
            default: {
                    this.value = value = new EventValue();
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
        function UnsavedEventRecord(key, value, type) {
            if (type === void 0) {
                type = EventType.put;
            }
            _super.call(this, void 0, key, value, Date.now(), type);
            if (this.id !== void 0 || 'id' in this)
                throw new TypeError('LocalSocket: EventRecord: Invalid event id: ' + this.id);
        }
        return UnsavedEventRecord;
    }(EventRecord);
    exports.UnsavedEventRecord = UnsavedEventRecord;
    var SavedEventRecord = function (_super) {
        __extends(SavedEventRecord, _super);
        function SavedEventRecord(id, key, value, date, type) {
            _super.call(this, id, key, value, date, type);
            this.id = id;
            if (typeof this.id !== 'number' || this.id > 0 === false)
                throw new TypeError('LocalSocket: EventRecord: Invalid event id: ' + this.id);
        }
        return SavedEventRecord;
    }(EventRecord);
    exports.SavedEventRecord = SavedEventRecord;
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
            this.cache = new arch_stream_3.Supervisor();
            this.events = {
                sync: new arch_stream_3.Observable(),
                load: new arch_stream_3.Observable(),
                save: new arch_stream_3.Observable(),
                loss: new arch_stream_3.Observable(),
                access: new arch_stream_3.Observable()
            };
            this.syncedKeyMap = new arch_stream_3.Map();
            this.snapshotCycle = 10;
            this.snapshotJobState = new arch_stream_3.Map();
            var lastNotifiedIdSet = new arch_stream_3.Set(function (o, n) {
                return n > o ? n : o;
            });
            var lastUpdatedDateSet = new arch_stream_3.Set(function (o, n) {
                return n > o ? n : o;
            });
            void this.cache.events.exec.monitor([], function (_a) {
                var _ = _a[0], sub = _a[1];
                var event = sub(void 0);
                if (event.id > 0 === false)
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
                    ], [
                        event.key,
                        event.attr,
                        EventType[event.type]
                    ]);
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
        AbstractEventStore.prototype.sync = function (key) {
            return this.syncedKeyMap.has(key) ? void this.syncedKeyMap.get(key) : void this.syncedKeyMap.set(key, !!void this.update(key));
        };
        AbstractEventStore.prototype.update = function (key) {
            var _this = this;
            var head = this.head(key);
            var savedEvents = [];
            void this.cursor(key, STORE_FIELDS.key, api_1.IDBCursorDirection.prev, api_1.IDBTransaction.readonly, function (cursor, err) {
                if (err) {
                    if (_this.syncedKeyMap.get(key) === false) {
                        void _this.syncedKeyMap.delete(key);
                    }
                    return;
                }
                if (!cursor || cursor.value.id <= head) {
                    void savedEvents.reduceRight(function (acc, e) {
                        return acc.some(function (_a) {
                            var attr = _a.attr;
                            return attr === e.attr;
                        }) ? acc : arch_stream_3.concat([e], acc);
                    }, []).reduce(function (acc, e) {
                        switch (EventType[e.type]) {
                        case EventType.put: {
                                return arch_stream_3.concat([e], acc);
                            }
                        default: {
                                return [e];
                            }
                        }
                    }, []).reduce(function (_, e) {
                        void _this.cache.terminate([
                            e.key,
                            e.attr,
                            arch_stream_3.sqid(e.id)
                        ]);
                        void _this.cache.register([
                            e.key,
                            e.attr,
                            arch_stream_3.sqid(e.id)
                        ], function (_) {
                            return e;
                        });
                    }, void 0);
                    void _this.cache.cast([key], void 0);
                    if (_this.syncedKeyMap.get(key) !== true) {
                        void _this.syncedKeyMap.set(key, true);
                        void _this.events.sync.emit([key], [key]);
                    }
                    if (savedEvents.length > _this.snapshotCycle) {
                        void _this.snapshot(key);
                    }
                    return;
                }
                var event = cursor.value;
                if (_this.cache.refs([
                        event.key,
                        event.attr,
                        arch_stream_3.sqid(event.id)
                    ]).length > 0)
                    return;
                void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.date, EventType[event.type]));
                if (event.type !== EventType[EventType.put])
                    return;
                void cursor.continue();
            });
        };
        AbstractEventStore.prototype.heads = function (cb) {
            var heads = [];
            void this.cursor(null, STORE_FIELDS.key, api_1.IDBCursorDirection.prevunique, api_1.IDBTransaction.readonly, function (cursor, err) {
                if (!cursor)
                    return void cb(heads, err);
                var event = cursor.value;
                void heads.push(event);
                void cursor.continue();
            });
        };
        AbstractEventStore.prototype.head = function (key) {
            return this.cache.cast([key], void 0).reduce(function (id, e) {
                return e.id > id ? e.id : id;
            }, types_1.IdNumber(0));
        };
        AbstractEventStore.prototype.has = function (key) {
            return compose(this.cache.cast([key], void 0)).reduce(function (e) {
                return e;
            }).type !== EventType[EventType.delete];
        };
        AbstractEventStore.prototype.get = function (key) {
            void this.sync(key);
            void this.events.access.emit([key], [
                key,
                '',
                void 0
            ]);
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
            ], [
                event.key,
                event.attr,
                EventType[event.type]
            ]);
            if (event.id !== void 0 || event instanceof UnsavedEventRecord === false)
                throw new Error('LocalSocket: Cannot add a saved event: ' + JSON.stringify(event));
            void this.sync(event.key);
            var id = arch_stream_3.sqid();
            void this.cache.register([
                event.key,
                event.attr,
                arch_stream_3.sqid(0),
                id
            ], function (_) {
                return event;
            });
            void this.cache.cast([
                event.key,
                event.attr,
                arch_stream_3.sqid(0),
                id
            ], void 0);
            void this.access(function (db) {
                if (_this.cache.refs([
                        event.key,
                        event.attr,
                        arch_stream_3.sqid(0)
                    ]).length === 0)
                    return;
                var tx = db.transaction(_this.name, api_1.IDBTransaction.readwrite);
                var req = tx.objectStore(_this.name).add(event);
                tx.oncomplete = function (_) {
                    var savedEvent = new SavedEventRecord(types_1.IdNumber(req.result), event.key, event.value, event.date, EventType[event.type]);
                    void _this.cache.terminate([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_3.sqid(0),
                        id
                    ]);
                    void _this.cache.register([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_3.sqid(savedEvent.id)
                    ], function (_) {
                        return savedEvent;
                    });
                    void _this.events.save.emit([
                        savedEvent.key,
                        savedEvent.attr,
                        savedEvent.type
                    ], [
                        savedEvent.key,
                        savedEvent.attr,
                        EventType[savedEvent.type]
                    ]);
                    void _this.cache.cast([
                        savedEvent.key,
                        savedEvent.attr,
                        arch_stream_3.sqid(savedEvent.id)
                    ], void 0);
                    if (_this.cache.refs([event.key]).filter(function (_a) {
                            var sub = _a[1];
                            return sub(void 0) instanceof SavedEventRecord;
                        }).length > _this.snapshotCycle) {
                        void _this.snapshot(event.key);
                    }
                };
                tx.onerror = tx.onabort = function (_) {
                    void setTimeout(function () {
                        if (_this.cache.refs([
                                event.key,
                                event.attr,
                                arch_stream_3.sqid(0),
                                id
                            ]).length === 0)
                            return;
                        void _this.events.loss.emit([
                            event.key,
                            event.attr,
                            event.type
                        ], [
                            event.key,
                            event.attr,
                            EventType[event.type]
                        ]);
                    }, 1000);
                };
            });
            return this;
        };
        AbstractEventStore.prototype.delete = function (key) {
            var _this = this;
            void setTimeout(function () {
                return void _this.clean(Infinity, key);
            }, 10);
            return this.add(new UnsavedEventRecord(key, new EventValue(), EventType.delete));
        };
        AbstractEventStore.prototype.snapshot = function (key) {
            var _this = this;
            if (this.snapshotJobState.get(key))
                return;
            void this.snapshotJobState.set(key, true);
            void this.access(function (db) {
                var tx = db.transaction(_this.name, api_1.IDBTransaction.readwrite);
                var store = tx.objectStore(_this.name);
                var req = store.index(STORE_FIELDS.key).openCursor(key, api_1.IDBCursorDirection.prev);
                var savedEvents = [];
                req.onsuccess = function (_) {
                    var cursor = req.result;
                    if (cursor) {
                        var event_3 = cursor.value;
                        void savedEvents.unshift(new SavedEventRecord(event_3.id, event_3.key, event_3.value, event_3.date, EventType[event_3.type]));
                    }
                    if (!cursor || EventType[cursor.value.type] !== EventType.put) {
                        if (savedEvents.length < _this.snapshotCycle)
                            return;
                        var event_4 = compose(savedEvents).reduce(function (e) {
                            return e;
                        });
                        event_4.date = savedEvents.reduce(function (date, e) {
                            return e.date > date ? e.date : date;
                        }, 0);
                        void _this.clean(Infinity, key);
                        if (event_4.id > 0)
                            return;
                        switch (event_4.type) {
                        case EventType[EventType.snapshot]: {
                                if (event_4.id !== void 0)
                                    throw new Error('LocalSocket: Cannot add a saved event: ' + JSON.stringify(event_4));
                                return void store.add(event_4);
                            }
                        }
                        throw new TypeError('LocalSocket: Invalid event type: ' + event_4.type);
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
            return this;
        };
        AbstractEventStore.prototype.keys = function (cb) {
            void this.heads(function (heads, err) {
                return void cb(heads.map(function (_a) {
                    var key = _a.key;
                    return key;
                }), err);
            });
        };
        AbstractEventStore.prototype.clean = function (until, key) {
            var _this = this;
            if (until === void 0) {
                until = Infinity;
            }
            var removedEvents = [];
            var cleanStateMap = new arch_stream_3.Map();
            void this.cursor(key ? api_1.IDBKeyRange.bound([
                key,
                0
            ], [
                key,
                until
            ]) : api_1.IDBKeyRange.upperBound(until), key ? STORE_FIELDS.surrogateKeyDateField : STORE_FIELDS.date, api_1.IDBCursorDirection.prev, api_1.IDBTransaction.readwrite, function (cursor, err) {
                if (!cursor)
                    return void removedEvents.reduce(function (_, event) {
                        return void _this.cache.terminate([
                            event.key,
                            event.attr,
                            arch_stream_3.sqid(event.id)
                        ]);
                    }, void 0);
                var event = cursor.value;
                switch (event.type) {
                case EventType[EventType.put]: {
                        void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
                        break;
                    }
                case EventType[EventType.snapshot]: {
                        if (!cleanStateMap.get(event.key)) {
                            void cleanStateMap.set(event.key, true);
                            void cursor.continue();
                            return;
                        }
                        break;
                    }
                case EventType[EventType.delete]: {
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
        return AbstractEventStore;
    }();
    exports.AbstractEventStore = AbstractEventStore;
    function compose(events) {
        return group(events).map(function (events) {
            return events.reduceRight(compose, new UnsavedEventRecord(types_1.KeyString(''), new EventValue(), EventType.delete));
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
                return prev.key === event.key ? arch_stream_3.concat([arch_stream_3.concat([event], head)], tail) : arch_stream_3.concat([[event]], arch_stream_3.concat([head], tail));
            }, [[]]);
        }
        function compose(target, source) {
            switch (source.type) {
            case EventType[EventType.put]: {
                    return source.value[source.attr] !== void 0 ? new UnsavedEventRecord(source.key, assign_1.assign(new EventValue(), target.value, source.value), EventType.snapshot) : new UnsavedEventRecord(source.key, Object.keys(target.value).reduce(function (value, prop) {
                        if (prop === source.attr)
                            return value;
                        value[prop] = target[prop];
                        return value;
                    }, new EventValue()), EventType.snapshot);
                }
            case EventType[EventType.snapshot]: {
                    return new UnsavedEventRecord(source.key, assign_1.assign(new EventValue(), source.value), EventType.snapshot);
                }
            case EventType[EventType.delete]: {
                    return new UnsavedEventRecord(source.key, new EventValue(), EventType.delete);
                }
            default: {
                    return new UnsavedEventRecord(source.key, assign_1.assign(new EventValue(), target.value, source.value), EventType.snapshot);
                }
            }
            throw new TypeError('LocalSocket: Invalid event type: ' + source.type);
        }
    }
    exports.compose = compose;
});
define('src/layer/domain/indexeddb/model/schema/storage/data', [
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
], function (require, exports, arch_stream_4, api_2, noop_2) {
    'use strict';
    (function (EventType) {
        EventType[EventType['get'] = 0] = 'get';
        EventType[EventType['put'] = 1] = 'put';
        EventType[EventType['delete'] = 2] = 'delete';
    }(exports.EventType || (exports.EventType = {})));
    var EventType = exports.EventType;
    var AbstractKeyValueStore = function () {
        function AbstractKeyValueStore(access, name, index) {
            this.access = access;
            this.name = name;
            this.index = index;
            this.cache = new arch_stream_4.Map();
            this.events = { access: new arch_stream_4.Observable() };
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
                cb = noop_2.noop;
            }
            void this.events.access.emit([key], [
                [key],
                EventType.get
            ]);
            void this.access(function (db) {
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readonly);
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
                cb = noop_2.noop;
            }
            return this.put(value, key, cb);
        };
        AbstractKeyValueStore.prototype.put = function (value, key, cb) {
            var _this = this;
            if (cb === void 0) {
                cb = noop_2.noop;
            }
            void this.cache.set(key, value);
            void this.events.access.emit([key], [
                [key],
                EventType.put
            ]);
            void this.access(function (db) {
                if (!_this.cache.has(key))
                    return;
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readwrite);
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
                cb = noop_2.noop;
            }
            void this.cache.delete(key);
            void this.events.access.emit([key], [
                [key],
                EventType.delete
            ]);
            void this.access(function (db) {
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readwrite);
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
define('src/layer/domain/indexeddb/model/schema/storage/access', [
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
            void event.monitor([], function (_a) {
                var key = _a[0], type = _a[2];
                return type === event_6.EventType.delete ? void _this.delete(key) : void _this.set(key, new AccessRecord(key, Date.now()));
            });
            void Object.freeze(this);
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
define('src/layer/domain/indexeddb/model/schema/storage', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/indexeddb/model/store/event',
    'src/layer/domain/indexeddb/model/schema/storage/data',
    'src/layer/domain/indexeddb/model/schema/storage/access',
    'src/lib/noop'
], function (require, exports, api_3, types_2, event_7, data_1, access_2, noop_3) {
    'use strict';
    exports.StorageRecord = event_7.UnsavedEventRecord;
    exports.EventType = event_7.EventType;
    exports.StorageValue = data_1.DataValue;
    var Storage = function () {
        function Storage(name, destroy) {
            this.name = name;
            var access = api_3.open(name, {
                make: function (db) {
                    return data_1.DataStore.configure().make(db) && access_2.AccessStore.configure().make(db);
                },
                verify: function (db) {
                    return data_1.DataStore.configure().verify(db) && access_2.AccessStore.configure().verify(db);
                },
                destroy: function (err, ev) {
                    return data_1.DataStore.configure().destroy(err, ev) && access_2.AccessStore.configure().destroy(err, ev) && destroy(err, ev);
                }
            });
            this.schema = new Schema(access);
            this.events = this.schema.data.events;
        }
        Storage.prototype.keys = function (cb) {
            if (cb === void 0) {
                cb = noop_3.noop;
            }
            return this.schema.data.keys(cb);
        };
        Storage.prototype.has = function (key) {
            return this.schema.data.has(types_2.KeyString(key));
        };
        Storage.prototype.get = function (key) {
            return this.schema.data.get(types_2.KeyString(key));
        };
        Storage.prototype.add = function (record) {
            return void this.schema.data.add(record);
        };
        Storage.prototype.delete = function (key) {
            void this.schema.data.delete(types_2.KeyString(key));
        };
        Storage.prototype.recent = function (limit, cb) {
            var keys = [];
            void this.schema.access.cursor(null, access_2.STORE_FIELDS.date, api_3.IDBCursorDirection.prevunique, api_3.IDBTransaction.readonly, function (cursor, err) {
                if (!cursor)
                    return void cb(keys, err);
                if (--limit < 0)
                    return;
                void keys.push(cursor.primaryKey);
                void cursor.continue();
            });
        };
        Storage.prototype.clean = function (until, key) {
            if (until === void 0) {
                until = Infinity;
            }
            void this.schema.data.clean(until, key && types_2.KeyString(key));
        };
        Storage.prototype.destroy = function () {
            void api_3.destroy(this.name);
        };
        return Storage;
    }();
    exports.Storage = Storage;
    var Schema = function () {
        function Schema(access) {
            this.data = new data_1.DataStore(access);
            this.access = new access_2.AccessStore(access, this.data.events.access);
            void Object.freeze(this);
        }
        return Schema;
    }();
});
define('src/layer/infrastructure/webstorage/module/global', [
    'require',
    'exports',
    'arch-stream'
], function (require, exports, arch_stream_5) {
    'use strict';
    var webStorage = {};
    var existWebStorage = function () {
        try {
            var key = 'localsocket#' + arch_stream_5.uuid();
            void self.sessionStorage.setItem(key, key);
            if (key !== self.sessionStorage.getItem(key))
                throw 1;
            void self.sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }();
    exports.localStorage = existWebStorage ? self.localStorage : void 0;
    exports.sessionStorage = existWebStorage ? self.sessionStorage : void 0;
});
define('src/layer/infrastructure/webstorage/model/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/webstorage/module/global'
], function (require, exports, arch_stream_6, global_3) {
    'use strict';
    var storageEvents = {
        localStorage: new arch_stream_6.Observable(),
        sessionStorage: new arch_stream_6.Observable()
    };
    exports.events = storageEvents;
    void window.addEventListener('storage', function (event) {
        switch (event.storageArea) {
        case global_3.localStorage: {
                return void storageEvents.localStorage.emit('storage', event);
            }
        case global_3.sessionStorage: {
                return void storageEvents.sessionStorage.emit('storage', event);
            }
        }
    });
});
define('src/layer/infrastructure/webstorage/api', [
    'require',
    'exports',
    'src/layer/infrastructure/webstorage/module/global',
    'src/layer/infrastructure/webstorage/model/event'
], function (require, exports, global_4, event_8) {
    'use strict';
    exports.localStorage = global_4.localStorage;
    exports.sessionStorage = global_4.sessionStorage;
    exports.events = event_8.events;
});
define('src/layer/domain/webstorage/service/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/webstorage/api'
], function (require, exports, arch_stream_7, api_4) {
    'use strict';
    exports.events = {
        localStorage: subscribe(api_4.events.localStorage),
        sessionStorage: subscribe(api_4.events.sessionStorage)
    };
    function subscribe(source) {
        var observer = new arch_stream_7.Observable();
        void source.on('storage', function (event) {
            return void observer.emit(event.key, event);
        });
        return observer;
    }
});
define('src/layer/domain/webstorage/repository/store', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/domain/dao/api',
    'src/layer/domain/webstorage/service/event',
    'src/layer/infrastructure/webstorage/api',
    'src/lib/noop'
], function (require, exports, arch_stream_8, api_5, event_9, api_6, noop_4) {
    'use strict';
    var LocalStorageObjectCache = new arch_stream_8.Set();
    var LocalStorageSubscriber = new arch_stream_8.Set();
    var SessionStorageObjectCache = new arch_stream_8.Set();
    var SessionStorageSubscriber = new arch_stream_8.Set();
    var StoreEvent = function () {
        function StoreEvent(type, key, attr, newValue, oldValue) {
            this.type = type;
            this.key = key;
            this.attr = attr;
            this.newValue = newValue;
            this.oldValue = oldValue;
        }
        return StoreEvent;
    }();
    exports.StoreEvent = StoreEvent;
    function repository(name, storage, factory, life, meta) {
        if (storage === void 0) {
            storage = api_6.sessionStorage;
        }
        if (life === void 0) {
            life = 0;
        }
        if (meta === void 0) {
            meta = {
                add: function (name, life) {
                },
                delete: function (name) {
                }
            };
        }
        return new Store(name, storage, factory, life, meta);
    }
    exports.repository = repository;
    var Store = function () {
        function Store(name, storage, factory, life, meta) {
            if (meta === void 0) {
                meta = {
                    add: function (name, life) {
                    },
                    delete: function (name) {
                    }
                };
            }
            this.name = name;
            this.storage = storage;
            this.factory = factory;
            this.life = life;
            this.meta = meta;
            this.event = new arch_stream_8.Observable();
            this.cache = this.storage === api_6.localStorage ? LocalStorageObjectCache : SessionStorageObjectCache;
            this.eventSource = this.storage === api_6.localStorage ? event_9.events.localStorage : event_9.events.sessionStorage;
            this.subscriber = noop_4.noop;
            this.event['toJSON'] = function () {
                return void 0;
            };
        }
        Store.prototype.link = function () {
            var _this = this;
            if (this.cache.has(this.name))
                return this.cache.get(this.name);
            void this.close();
            var source = arch_stream_8.assign((_a = {}, _a[api_5.SCHEMA.KEY.NAME] = this.name, _a[api_5.SCHEMA.EVENT.NAME] = this.event, _a), parse(this.storage.getItem(this.name) || '{}'));
            source.__event['toJSON'] = function () {
                return void 0;
            };
            var dao = api_5.build(source, this.factory, function (attr, newValue, oldValue) {
                if (_this.storage === api_6.localStorage && _this.storage.getItem(_this.name) === null) {
                    void _this.meta.add(_this.name, _this.life);
                }
                void _this.storage.setItem(_this.name, JSON.stringify(source));
                void _this.event.emit([
                    'send',
                    attr
                ], new StoreEvent('send', _this.name, attr, newValue, oldValue));
            });
            this.subscriber = function (_a) {
                var newValue = _a.newValue, oldValue = _a.oldValue;
                if (newValue) {
                    var item_1 = parse(newValue);
                    void Object.keys(item_1).filter(api_5.isValidPropertyName).filter(api_5.isValidPropertyValue(item_1)).reduce(function (_, prop) {
                        var _a = [
                                item_1[prop],
                                source[prop]
                            ], newVal = _a[0], oldVal = _a[1];
                        if (newVal === oldVal)
                            return;
                        source[prop] = newVal;
                    }, void 0);
                }
                void _this.event.emit(['recv'], new StoreEvent('recv', _this.name, void 0, newValue, oldValue));
            };
            void this.eventSource.on(this.name, this.subscriber);
            void this.cache.add(this.name, dao);
            void this.storage.setItem(this.name, JSON.stringify(source));
            void this.meta.add(this.name, this.life);
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
        Store.prototype.close = function () {
            void this.eventSource.off(this.name, this.subscriber);
            void this.cache.delete(this.name);
        };
        Store.prototype.destroy = function () {
            void this.close();
            void this.storage.removeItem(this.name);
            void this.meta.delete(this.name);
        };
        return Store;
    }();
});
define('src/layer/domain/indexeddb/repository/socket', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/domain/dao/api',
    'src/layer/domain/indexeddb/model/schema/storage',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/repository/store',
    'src/layer/domain/indexeddb/model/types',
    'src/layer/domain/lib/assign'
], function (require, exports, arch_stream_9, api_7, storage_1, api_8, store_1, types_3, assign_2) {
    'use strict';
    function socket(name, factory, destroy) {
        return new Socket(name, factory, destroy);
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
            this.msgHeadSet_ = new arch_stream_9.Set(function (o, n) {
                return n > o ? n : o;
            });
        }
        Port.prototype.recv = function () {
            var _this = this;
            return this.msgs.filter(function (msg) {
                return !_this.msgHeadSet_.has(msg.key) || msg.date > _this.msgHeadSet_.get(msg.key);
            }).filter(function (msg) {
                return !void _this.msgHeadSet_.add(msg.key, msg.date);
            });
        };
        Port.prototype.send = function (msg) {
            this.msgs = arch_stream_9.concat([msg], this.msgs.slice(0, 9));
        };
        return Port;
    }();
    var Socket = function (_super) {
        __extends(Socket, _super);
        function Socket(name, factory, destroy) {
            var _this = this;
            _super.call(this, name, destroy);
            this.factory = factory;
            this.proxy = store_1.repository(this.name, api_8.localStorage, function () {
                return new Port();
            });
            this.port = this.proxy.link();
            this.links = new arch_stream_9.Set();
            this.sources = new arch_stream_9.Set();
            void this.port.__event.monitor([], function (_a) {
                var type = _a.type, newValue = _a.newValue;
                switch (type) {
                case 'send': {
                        return;
                    }
                case 'recv': {
                        return void _this.port.recv().reduce(function (_, msg) {
                            return void _this.schema.data.update(msg.key);
                        }, void 0);
                    }
                }
            });
            void this.events.save.monitor([], function (_a) {
                var key = _a[0], attr = _a[1];
                void _this.port.send(new Message(key, attr, Date.now()));
            });
            void this.events.load.monitor([], function (_a) {
                var key = _a[0], attr = _a[1], type = _a[2];
                var source = _this.sources.get(key);
                if (!source)
                    return;
                switch (type) {
                case storage_1.EventType.put: {
                        var oldVal = source[attr];
                        var newVal = _this.get(key)[attr];
                        source[attr] = newVal;
                        void source.__event.emit([
                            'recv',
                            attr
                        ], new store_1.StoreEvent('recv', key, attr, newVal, oldVal));
                        return;
                    }
                case storage_1.EventType.delete: {
                        var cache = _this.get(key);
                        void Object.keys(cache).filter(api_7.isValidPropertyName).filter(api_7.isValidPropertyValue(cache)).reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = void 0;
                            source[attr] = newVal;
                            void source.__event.emit([
                                'recv',
                                attr
                            ], new store_1.StoreEvent('recv', key, attr, newVal, oldVal));
                        }, void 0);
                        return;
                    }
                case storage_1.EventType.snapshot: {
                        var cache_1 = _this.get(key);
                        void Object.keys(cache_1).filter(api_7.isValidPropertyName).filter(api_7.isValidPropertyValue(cache_1)).reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = cache_1[attr];
                            source[attr] = newVal;
                            void source.__event.emit([
                                'recv',
                                attr
                            ], new store_1.StoreEvent('recv', key, attr, newVal, oldVal));
                        }, void 0);
                        return;
                    }
                }
            });
        }
        Socket.prototype.link = function (key) {
            var _this = this;
            if (this.links.has(key))
                return this.links.get(key);
            var source = this.sources.add(key, assign_2.assign((_a = {}, _a[api_7.SCHEMA.KEY.NAME] = key, _a[api_7.SCHEMA.EVENT.NAME] = new arch_stream_9.Observable(), _a), this.get(key)));
            source.__event['toJSON'] = function () {
                return void 0;
            };
            var link = this.links.add(key, api_7.build(source, this.factory, function (attr, newValue, oldValue) {
                void _this.add(new storage_1.StorageRecord(types_3.KeyString(key), (_a = {}, _a[attr] = newValue, _a)));
                void source.__event.emit([
                    'send',
                    attr
                ], new store_1.StoreEvent('send', key, attr, newValue, oldValue));
                var _a;
            }));
            return link;
            var _a;
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
    }(storage_1.Storage);
});
define('src/layer/domain/indexeddb/service/event', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api'
], function (require, exports, api_9) {
    'use strict';
    exports.event = api_9.event;
});
define('src/layer/domain/indexeddb/api', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/repository/socket',
    'src/layer/domain/indexeddb/service/event'
], function (require, exports, socket_1, event_10) {
    'use strict';
    exports.socket = socket_1.socket;
    exports.event = event_10.event;
});
define('src/layer/domain/webstorage/service/meta', [
    'require',
    'exports',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/repository/store'
], function (require, exports, api_10, store_2) {
    'use strict';
    var WebStorageMetaData = function () {
        function WebStorageMetaData() {
            this.expires = {};
        }
        WebStorageMetaData.prototype.add = function (name, life) {
            this.expires[name] = this.expires[name] || new WebStorageMetaDataItem(name, new WebStorageMetaDataItemExpire(life));
        };
        WebStorageMetaData.prototype.delete = function (name) {
            delete this.expires[name];
        };
        WebStorageMetaData.prototype.commit = function () {
            this.expires = this.expires;
        };
        WebStorageMetaData.prototype.entries = function () {
            var _this = this;
            return Object.keys(this.expires).map(function (name) {
                return [
                    name,
                    _this.expires[name]
                ];
            });
        };
        return WebStorageMetaData;
    }();
    exports.WebStorageMetaData = WebStorageMetaData;
    var WebStorageMetaDataItem = function () {
        function WebStorageMetaDataItem(name, expire) {
            this.name = name;
            this.expire = expire;
        }
        return WebStorageMetaDataItem;
    }();
    var WebStorageMetaDataItemExpire = function () {
        function WebStorageMetaDataItemExpire(life) {
            this.life = life;
            this.atime = Date.now();
            this.rest = this.life;
        }
        return WebStorageMetaDataItemExpire;
    }();
    var name = 'localsocket::meta';
    exports.meta = store_2.repository(name, api_10.localStorage, function () {
        return new WebStorageMetaData();
    }, Infinity).link();
});
define('src/layer/domain/webstorage/service/clean', [
    'require',
    'exports',
    'src/layer/domain/webstorage/repository/store'
], function (require, exports, store_3) {
    'use strict';
    function clean(meta, storage, now) {
        if (now === void 0) {
            now = Date.now();
        }
        if (!storage)
            return;
        void meta.entries().reduce(function (_, _a) {
            var name = _a[0], expire = _a[1].expire;
            if (expire.atime + 1000 * 3600 * 24 > now) {
                expire.rest = expire.life;
            } else {
                expire.atime = now;
                void --expire.rest;
            }
            if (expire.rest < 0) {
                void store_3.repository(name, storage, function () {
                    return {};
                }, 0, meta).destroy();
            }
        }, void 0);
        void meta.commit();
    }
    exports.clean = clean;
});
define('src/layer/domain/webstorage/api', [
    'require',
    'exports',
    'src/layer/domain/webstorage/repository/store',
    'src/layer/domain/webstorage/service/meta',
    'src/layer/domain/webstorage/service/clean',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/service/event'
], function (require, exports, store_4, meta_1, clean_1, api_11, api_12, event_11) {
    'use strict';
    exports.localStorage = api_12.localStorage;
    exports.sessionStorage = api_12.sessionStorage;
    exports.events = event_11.events;
    function webstorage(name, storage, factory, life) {
        return store_4.repository(name, storage, factory, life, storage === api_11.localStorage ? meta_1.meta : void 0);
    }
    exports.webstorage = webstorage;
    void clean_1.clean(meta_1.meta, api_11.localStorage);
    void setInterval(function () {
        return void clean_1.clean(meta_1.meta, api_11.localStorage);
    }, 1000 * 3600);
});
define('src/layer/app/api', [
    'require',
    'exports',
    'src/layer/app/module/config',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api'
], function (require, exports, config_1, api_13, api_14, api_15, api_16) {
    'use strict';
    function socket(name, config) {
        config = config_1.configure(config);
        return api_13.socket(name, config.factory, config.destroy);
    }
    exports.socket = socket;
    function store(name, storage, config) {
        config = config_1.configure(config);
        switch (storage) {
        case api_14.localStorage: {
                return api_14.webstorage(name, api_14.localStorage, config.factory, config.life);
            }
        case api_14.sessionStorage: {
                return api_14.webstorage(name, api_14.sessionStorage, config.factory, config.life);
            }
        }
        throw new TypeError('LocalSocket: Invalid storage type ' + storage);
    }
    exports.store = store;
    var events;
    (function (events) {
        events.indexedDB = api_15.event;
        events.localStorage = api_16.events.localStorage;
        events.sessionStorage = api_16.events.sessionStorage;
    }(events = exports.events || (exports.events = {})));
});
define('src/layer/interface/api', [
    'require',
    'exports',
    'src/layer/app/api',
    'src/layer/app/api'
], function (require, exports, api_17, api_18) {
    'use strict';
    function localsocket(name, storage, config) {
        if (storage === void 0) {
            storage = indexedDB;
        }
        if (config === void 0) {
            config = {};
        }
        return storage === indexedDB ? api_17.socket(name, config) : api_17.store(name, storage, config);
    }
    exports.localsocket = localsocket;
    exports.events = api_18.events;
});
define('src/export', [
    'require',
    'exports',
    'src/layer/interface/api'
], function (require, exports, api_19) {
    'use strict';
    exports.default = api_19.localsocket;
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
], function (require, exports, api_20) {
    'use strict';
    exports.IDBKeyRange = api_20.IDBKeyRange;
});