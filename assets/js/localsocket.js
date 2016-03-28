/*! localsocket v0.0.10 https://github.com/falsandtru/localsocket | (c) 2015, falsandtru | MIT License (https://opensource.org/licenses/MIT) */
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
define('src/layer/data/constraint/values', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var RegValidValueNameFormat = /^[A-z][0-9A-z_]*$/;
    var RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;
    function isValidName(prop) {
        return prop.length > 0 && prop[0] !== '_' && prop[prop.length - 1] !== '_' && !RegInvalidValueNameFormat.test(prop) && RegValidValueNameFormat.test(prop);
    }
    exports.isValidName = isValidName;
    function isValidValue(dao) {
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
    exports.isValidValue = isValidValue;
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
    'src/layer/data/constraint/values',
    'src/lib/noop'
], function (require, exports, arch_stream_1, values_1, noop_1) {
    'use strict';
    exports.isValidPropertyName = values_1.isValidName;
    exports.isValidPropertyValue = values_1.isValidValue;
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
        var descmap = arch_stream_1.assign(Object.keys(dao).filter(values_1.isValidName).filter(values_1.isValidValue(dao)).reduce(function (map, prop) {
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
                enumerable: true,
                get: function () {
                    return source[prop] === void 0 ? iniVal : source[prop];
                },
                set: function (newVal) {
                    var oldVal = source[prop];
                    if (!values_1.isValidValue(source)(prop))
                        return;
                    if (newVal === oldVal && newVal instanceof Object === false)
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
    var IDBEventType;
    (function (IDBEventType) {
        IDBEventType.connect = 'connect';
        IDBEventType.disconnect = 'disconnect';
        IDBEventType.block = 'block';
        IDBEventType.error = 'error';
        IDBEventType.abort = 'abort';
        IDBEventType.crash = 'crash';
        IDBEventType.destroy = 'destroy';
    }(IDBEventType = exports.IDBEventType || (exports.IDBEventType = {})));
    var IDBEvent = function () {
        function IDBEvent(type, name) {
            this.type = type;
            this.name = name;
            this.namespace = [this.name];
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
], function (require, exports, arch_stream_2) {
    'use strict';
    var webStorage = {};
    exports.supportWebStorage = function () {
        try {
            var key = 'localsocket#' + arch_stream_2.uuid();
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
], function (require, exports, arch_stream_3, global_1) {
    'use strict';
    var storageEvents = {
        localStorage: new arch_stream_3.Observable(),
        sessionStorage: new arch_stream_3.Observable()
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
    'src/layer/infrastructure/indexeddb/model/event'
], function (require, exports, arch_stream_4, global_3, event_2) {
    'use strict';
    var IDBEventObserver = new arch_stream_4.Observable();
    exports.event = IDBEventObserver;
    exports.ConfigMap = new arch_stream_4.Map();
    var CommandMap = new arch_stream_4.Map();
    var CommandType;
    (function (CommandType) {
        CommandType[CommandType['open'] = 0] = 'open';
        CommandType[CommandType['close'] = 1] = 'close';
        CommandType[CommandType['destroy'] = 2] = 'destroy';
    }(CommandType || (CommandType = {})));
    var StateSet = new arch_stream_4.Set(function (o, n) {
        switch (o.constructor) {
        case State.Initial:
            switch (n.constructor) {
            case State.Block:
            case State.Upgrade:
            case State.Success:
            case State.Error:
            case State.Abort:
            case State.Crash:
                return n;
            }
            break;
        case State.Block:
            switch (n.constructor) {
            case State.Upgrade:
            case State.Success:
            case State.Error:
            case State.Abort:
                return n;
            }
            break;
        case State.Upgrade:
            switch (n.constructor) {
            case State.Success:
            case State.Error:
            case State.Abort:
            case State.Crash:
            case State.Destroy:
            case State.End:
                return n;
            }
            break;
        case State.Success:
            switch (n.constructor) {
            case State.Error:
            case State.Abort:
            case State.Crash:
            case State.Destroy:
            case State.End:
                return n;
            }
            break;
        case State.Error:
            switch (n.constructor) {
            case State.Destroy:
            case State.End:
                return n;
            }
            break;
        case State.Abort:
            switch (n.constructor) {
            case State.Destroy:
            case State.End:
                return n;
            }
            break;
        case State.Crash:
            switch (n.constructor) {
            case State.Destroy:
            case State.End:
                return n;
            }
            break;
        case State.Destroy:
            switch (n.constructor) {
            case State.Error:
            case State.End:
                return n;
            }
            break;
        }
        throw new Error('LocalSocket: Invalid mutation: ' + o.constructor.toString().match(/\w+/g)[1] + ' to ' + n.constructor.toString().match(/\w+/g)[1]);
    });
    var State;
    (function (State) {
        var Initial = function () {
            function Initial(database) {
                this.database = database;
                void StateSet.add(database, this);
            }
            return Initial;
        }();
        State.Initial = Initial;
        var Block = function () {
            function Block(database) {
                this.database = database;
                void StateSet.add(database, this);
            }
            return Block;
        }();
        State.Block = Block;
        var Upgrade = function () {
            function Upgrade(database, session) {
                this.database = database;
                this.session = session;
                void StateSet.add(database, this);
            }
            return Upgrade;
        }();
        State.Upgrade = Upgrade;
        var Success = function () {
            function Success(database, connection) {
                this.database = database;
                this.connection = connection;
                void StateSet.add(database, this);
            }
            return Success;
        }();
        State.Success = Success;
        var Error = function () {
            function Error(database, error, event) {
                this.database = database;
                this.error = error;
                this.event = event;
                void StateSet.add(database, this);
            }
            return Error;
        }();
        State.Error = Error;
        var Abort = function () {
            function Abort(database, error, event) {
                this.database = database;
                this.error = error;
                this.event = event;
                void StateSet.add(database, this);
            }
            return Abort;
        }();
        State.Abort = Abort;
        var Crash = function () {
            function Crash(database, error) {
                this.database = database;
                this.error = error;
                void StateSet.add(database, this);
            }
            return Crash;
        }();
        State.Crash = Crash;
        var Destroy = function () {
            function Destroy(database) {
                this.database = database;
                void StateSet.add(database, this);
            }
            return Destroy;
        }();
        State.Destroy = Destroy;
        var End = function () {
            function End(database) {
                this.database = database;
                void StateSet.add(database, this);
            }
            return End;
        }();
        State.End = End;
    }(State || (State = {})));
    var RequestQueueSet = new arch_stream_4.Set();
    function open(name, config) {
        void CommandMap.set(name, 0);
        void exports.ConfigMap.set(name, config);
        if (StateSet.has(name))
            return;
        void handleFromInitialState(new State.Initial(name));
    }
    exports.open = open;
    function listen(name) {
        return function (req) {
            var queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
            void queue.push(req);
            var state = StateSet.get(name);
            if (state instanceof State.Success) {
                void state.drain();
            }
        };
    }
    exports.listen = listen;
    function close(name) {
        void CommandMap.set(name, 1);
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
        if (StateSet.get(name) instanceof State.Success)
            return StateSet.get(name).end();
        if (StateSet.has(name))
            return;
        void handleFromInitialState(new State.Initial(name));
    }
    exports.close = close;
    function destroy(name) {
        void CommandMap.set(name, 2);
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
        if (StateSet.get(name) instanceof State.Success)
            return StateSet.get(name).destroy();
        if (StateSet.has(name))
            return;
        void handleFromInitialState(new State.Initial(name));
    }
    exports.destroy = destroy;
    function handleFromInitialState(_a, version) {
        var database = _a.database;
        if (version === void 0) {
            version = 0;
        }
        var config = exports.ConfigMap.get(database);
        try {
            var openRequest_1 = version ? global_3.indexedDB.open(database, version) : global_3.indexedDB.open(database);
            var clear_1 = function () {
                openRequest_1.onupgradeneeded = void 0;
                openRequest_1.onsuccess = void 0;
                openRequest_1.onerror = void 0;
            };
            openRequest_1.onblocked = function (_) {
                return void handleFromBlockedState(new State.Block(database));
            };
            openRequest_1.onupgradeneeded = function (event) {
                void clear_1();
                void handleFromUpgradeState(new State.Upgrade(database, openRequest_1));
            };
            openRequest_1.onsuccess = function (_) {
                void clear_1();
                void handleFromSuccessState(new State.Success(database, openRequest_1.result));
            };
            openRequest_1.onerror = function (event) {
                void clear_1();
                void handleFromErrorState(new State.Error(database, openRequest_1.error, event));
            };
        } catch (err) {
            void handleFromCrashState(new State.Crash(database, err));
        }
        return;
        function handleFromBlockedState(_a) {
            var database = _a.database;
            void IDBEventObserver.emit([
                database,
                event_2.IDBEventType.block
            ], new event_2.IDBEvent(event_2.IDBEventType.block, database));
        }
        function handleFromUpgradeState(_a) {
            var database = _a.database, session = _a.session;
            var db = session.transaction.db;
            var _b = exports.ConfigMap.get(database), make = _b.make, destroy = _b.destroy;
            try {
                if (make(db)) {
                    session.onsuccess = function (_) {
                        return void handleFromSuccessState(new State.Success(database, db));
                    };
                    session.onerror = function (event) {
                        return void handleFromErrorState(new State.Error(database, session.error, event));
                    };
                } else {
                    session.onsuccess = session.onerror = function (event) {
                        void db.close();
                        destroy(session.error, event) ? void handleFromDestroyState(new State.Destroy(database)) : void handleFromEndState(new State.End(database));
                    };
                }
            } catch (err) {
                void handleFromCrashState(new State.Crash(database, err));
            }
        }
        function handleFromSuccessState(state) {
            var database = state.database, connection = state.connection;
            var clear = function () {
                connection.onversionchange = function () {
                    return void connection.close();
                };
                connection.onerror = void 0;
                connection.onabort = void 0;
                connection.onclose = void 0;
            };
            connection.onversionchange = function (_a) {
                var newVersion = _a.newVersion;
                void clear();
                void connection.close();
                if (!newVersion) {
                    void RequestQueueSet.delete(database);
                    void IDBEventObserver.emit([
                        database,
                        event_2.IDBEventType.destroy
                    ], new event_2.IDBEvent(event_2.IDBEventType.destroy, database));
                }
                if (StateSet.get(database) !== state)
                    return;
                void handleFromEndState(new State.End(database));
            };
            connection.onerror = function (event) {
                void clear();
                void handleFromErrorState(new State.Error(database, event.target.error, event));
            };
            connection.onabort = function (event) {
                void clear();
                void handleFromAbortState(new State.Abort(database, event.target.error, event));
            };
            connection.onclose = function (event) {
                void clear();
                void IDBEventObserver.emit([
                    database,
                    event_2.IDBEventType.destroy
                ], new event_2.IDBEvent(event_2.IDBEventType.destroy, database));
                if (StateSet.get(database) !== state)
                    return;
                void handleFromEndState(new State.End(database));
            };
            state.destroy = function () {
                void clear();
                void connection.close();
                void handleFromDestroyState(new State.Destroy(database));
            };
            state.end = function () {
                void clear();
                void connection.close();
                void handleFromEndState(new State.End(database));
            };
            state.drain = function () {
                var reqs = RequestQueueSet.get(database) || [];
                try {
                    while (reqs.length > 0 && CommandMap.get(database) === 0) {
                        void reqs[0](connection);
                        void reqs.shift();
                    }
                } catch (err) {
                    if (err instanceof DOMError || err instanceof DOMException) {
                        void console.warn(err);
                    } else {
                        void console.error(err);
                    }
                    void clear();
                    void handleFromCrashState(new State.Crash(database, err));
                }
            };
            switch (CommandMap.get(database)) {
            case 0: {
                    var verify = exports.ConfigMap.get(database).verify;
                    try {
                        if (!verify(connection))
                            return void handleFromEndState(new State.End(database), connection.version + 1);
                    } catch (err) {
                        return void handleFromCrashState(new State.Crash(database, err));
                    }
                    void IDBEventObserver.emit([
                        database,
                        event_2.IDBEventType.connect
                    ], new event_2.IDBEvent(event_2.IDBEventType.connect, database));
                    return void state.drain();
                }
            case 1: {
                    return void state.end();
                }
            case 2: {
                    return void state.destroy();
                }
            }
            throw new TypeError('LocalSocket: Invalid command ' + CommandMap.get(database) + '.');
        }
        function handleFromErrorState(_a) {
            var database = _a.database, error = _a.error, event = _a.event;
            void event.preventDefault();
            void IDBEventObserver.emit([
                database,
                event_2.IDBEventType.error
            ], new event_2.IDBEvent(event_2.IDBEventType.error, database));
            var destroy = exports.ConfigMap.get(database).destroy;
            if (destroy(error, event)) {
                return void handleFromDestroyState(new State.Destroy(database));
            } else {
                return void handleFromEndState(new State.End(database));
            }
        }
        function handleFromAbortState(_a) {
            var database = _a.database, error = _a.error, event = _a.event;
            void event.preventDefault();
            void IDBEventObserver.emit([
                database,
                event_2.IDBEventType.abort
            ], new event_2.IDBEvent(event_2.IDBEventType.abort, database));
            var destroy = exports.ConfigMap.get(database).destroy;
            if (destroy(error, event)) {
                return void handleFromDestroyState(new State.Destroy(database));
            } else {
                return void handleFromEndState(new State.End(database));
            }
        }
        function handleFromCrashState(_a) {
            var database = _a.database, error = _a.error;
            void IDBEventObserver.emit([
                database,
                event_2.IDBEventType.crash
            ], new event_2.IDBEvent(event_2.IDBEventType.crash, database));
            var destroy = exports.ConfigMap.get(database).destroy;
            if (destroy(error, null)) {
                return void handleFromDestroyState(new State.Destroy(database));
            } else {
                return void handleFromEndState(new State.End(database));
            }
        }
        function handleFromDestroyState(_a) {
            var database = _a.database;
            var deleteRequest = global_3.indexedDB.deleteDatabase(database);
            deleteRequest.onsuccess = function (_) {
                void RequestQueueSet.delete(database);
                void IDBEventObserver.emit([
                    database,
                    event_2.IDBEventType.destroy
                ], new event_2.IDBEvent(event_2.IDBEventType.destroy, database));
                void handleFromEndState(new State.End(database));
            };
            deleteRequest.onerror = function (event) {
                void handleFromErrorState(new State.Error(database, deleteRequest.error, event));
            };
        }
        function handleFromEndState(_a, version) {
            var database = _a.database;
            if (version === void 0) {
                version = 0;
            }
            void StateSet.delete(database);
            switch (CommandMap.get(database)) {
            case 0: {
                    return void handleFromInitialState(new State.Initial(database), version);
                }
            case 1: {
                    void CommandMap.delete(database);
                    void exports.ConfigMap.delete(database);
                    return void IDBEventObserver.emit([
                        database,
                        event_2.IDBEventType.disconnect
                    ], new event_2.IDBEvent(event_2.IDBEventType.disconnect, database));
                }
            case 2: {
                    void CommandMap.delete(database);
                    void exports.ConfigMap.delete(database);
                    return void IDBEventObserver.emit([
                        database,
                        event_2.IDBEventType.disconnect
                    ], new event_2.IDBEvent(event_2.IDBEventType.disconnect, database));
                }
            }
            throw new TypeError('LocalSocket: Invalid command ' + CommandMap.get(database) + '.');
        }
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
    exports.IDBEventType = event_3.IDBEventType;
});
define('src/layer/data/constraint/types', [
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
define('src/layer/data/lib/assign', [
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
                    if (isCloneable(nextValue)) {
                        to[nextKey] = Array.isArray(nextValue) ? nextValue.slice() : assign({}, nextValue);
                    } else {
                        to[nextKey] = nextValue;
                    }
                }
            }
        }
        return to;
        function isCloneable(obj) {
            return !!obj && typeof obj === 'object' && !isTypedArray(obj) && !isBlob(obj) && !isImageData(obj) && !isArrayBuffer(obj);
            function isTypedArray(obj) {
                return obj instanceof Object && obj.constructor instanceof Object && obj.constructor['BYTES_PER_ELEMENT'] > 0 && isArrayBuffer(obj.buffer);
            }
            function isBlob(obj) {
                return type(obj) === 'Blob';
            }
            function isImageData(obj) {
                return type(obj) === 'ImageData';
            }
            function isArrayBuffer(obj) {
                return type(obj) === 'ArrayBuffer';
            }
            function type(target) {
                return Object.prototype.toString.call(obj).split(' ').pop().slice(0, -1);
            }
        }
    }
    exports.assign = assign;
});
define('src/layer/data/schema/event', [
    'require',
    'exports',
    'src/layer/data/lib/assign'
], function (require, exports, assign_1) {
    'use strict';
    exports.EventType = {
        put: 'put',
        delete: 'delete',
        snapshot: 'snapshot'
    };
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
            this.type = type;
            if (typeof this.type !== 'string')
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
            this.attr = this.type === exports.EventType.put ? Object.keys(value).reduce(function (r, p) {
                return p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r;
            }, '') : '';
            if (typeof this.attr !== 'string')
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr: ' + this.key);
            if (this.type === exports.EventType.put && this.attr.length === 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            if (this.type !== exports.EventType.put && this.attr.length !== 0)
                throw new TypeError('LocalSocket: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
            switch (type) {
            case exports.EventType.put: {
                    this.value = value = assign_1.assign(new EventValue(), (_a = {}, _a[this.attr] = value[this.attr], _a));
                    void Object.freeze(this.value);
                    return;
                }
            case exports.EventType.snapshot: {
                    this.value = value = assign_1.assign(new EventValue(), value);
                    void Object.freeze(this.value);
                    return;
                }
            case exports.EventType.delete:
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
    exports.EventRecord = EventRecord;
});
define('src/layer/data/store/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/data/constraint/types',
    'src/layer/data/schema/event',
    'src/layer/data/lib/assign',
    'src/lib/noop'
], function (require, exports, arch_stream_5, api_1, types_1, event_4, assign_2, noop_2) {
    'use strict';
    exports.EventType = event_4.EventType;
    exports.EventValue = event_4.EventValue;
    var UnsavedEventRecord = function (_super) {
        __extends(UnsavedEventRecord, _super);
        function UnsavedEventRecord(key, value, type, date) {
            if (type === void 0) {
                type = event_4.EventType.put;
            }
            if (date === void 0) {
                date = Date.now();
            }
            _super.call(this, void 0, key, value, date, type);
            if (this.id !== void 0 || 'id' in this)
                throw new TypeError('LocalSocket: UnsavedEventRecord: Invalid event id: ' + this.id);
        }
        return UnsavedEventRecord;
    }(event_4.EventRecord);
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
    }(event_4.EventRecord);
    exports.SavedEventRecord = SavedEventRecord;
    exports.ESEventType = {
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
        function AbstractEventStore(database, name) {
            var _this = this;
            this.database = database;
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
            return void this.cursor(key, STORE_FIELDS.key, api_1.IDBCursorDirection.prev, api_1.IDBTransaction.readonly, function (cursor, err) {
                if (err)
                    return void _this.syncWaits.emit([key], err);
                if (!cursor || cursor.value.id <= latest.id) {
                    if (compose(savedEvents).reduce(function (e) {
                            return e;
                        }).type === event_4.EventType.delete) {
                        void _this.clean(Infinity, key);
                    } else {
                        void savedEvents.reduceRight(function (acc, e) {
                            return acc.some(function (_a) {
                                var attr = _a.attr;
                                return attr === e.attr;
                            }) ? acc : arch_stream_5.concat([e], acc);
                        }, []).reduce(function (acc, e) {
                            switch (e.type) {
                            case event_4.EventType.put: {
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
                void savedEvents.unshift(new SavedEventRecord(event.id, event.key, event.value, event.type, event.date));
                if (event.type !== event_4.EventType.put)
                    return;
                void cursor.continue();
            });
        };
        AbstractEventStore.prototype.meta = function (key) {
            var events = this.cache.cast([key], void 0);
            return Object.freeze(assign_2.assign({
                id: events.reduce(function (id, e) {
                    return e.id > id ? e.id : id;
                }, 0),
                date: 0
            }, compose(events).reduce(function (e) {
                return e;
            }), { key: key }));
        };
        AbstractEventStore.prototype.keys = function () {
            return this.cache.cast([], void 0).reduce(function (keys, e) {
                return keys.length === 0 || keys[keys.length - 1] !== e.key ? arch_stream_5.concat(keys, [e.key]) : keys;
            }, []).sort();
        };
        AbstractEventStore.prototype.has = function (key) {
            return compose(this.cache.cast([key], void 0)).reduce(function (e) {
                return e;
            }).type !== event_4.EventType.delete;
        };
        AbstractEventStore.prototype.get = function (key) {
            void this.sync([key]);
            void this.events.access.emit([key], new ESEvent(exports.ESEventType.query, types_1.IdNumber(0), key, ''));
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
            return void api_1.listen(this.database)(function (db) {
                if (_this.cache.refs([
                        event.key,
                        event.attr,
                        arch_stream_5.sqid(0)
                    ]).length === 0)
                    return;
                var tx = db.transaction(_this.name, api_1.IDBTransaction.readwrite);
                var req = tx.objectStore(_this.name).add(event);
                tx.oncomplete = function (_) {
                    var savedEvent = new SavedEventRecord(types_1.IdNumber(req.result), event.key, event.value, event.type, event.date);
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
                    } else if (savedEvent.type === event_4.EventType.delete) {
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
            return void this.add(new UnsavedEventRecord(key, new event_4.EventValue(), event_4.EventType.delete));
        };
        AbstractEventStore.prototype.snapshot = function (key) {
            var _this = this;
            if (this.snapshotJobState.get(key))
                return;
            void this.snapshotJobState.set(key, true);
            return void api_1.listen(this.database)(function (db) {
                var tx = db.transaction(_this.name, api_1.IDBTransaction.readwrite);
                var store = tx.objectStore(_this.name);
                var req = store.index(STORE_FIELDS.key).openCursor(key, api_1.IDBCursorDirection.prev);
                var savedEvents = [];
                req.onsuccess = function (_) {
                    var cursor = req.result;
                    if (cursor) {
                        var event_5 = cursor.value;
                        void savedEvents.unshift(new SavedEventRecord(event_5.id, event_5.key, event_5.value, event_5.type, event_5.date));
                    }
                    if (!cursor || cursor.value.type !== event_4.EventType.put) {
                        if (savedEvents.length < _this.snapshotCycle)
                            return;
                        void _this.clean(Infinity, key);
                        var composedEvent = compose(savedEvents).reduce(function (e) {
                            return e;
                        });
                        if (composedEvent instanceof SavedEventRecord)
                            return;
                        switch (composedEvent.type) {
                        case event_4.EventType.snapshot: {
                                return void store.add(new UnsavedEventRecord(composedEvent.key, composedEvent.value, composedEvent.type, savedEvents.reduce(function (date, e) {
                                    return e.date > date ? e.date : date;
                                }, 0)));
                            }
                        case event_4.EventType.delete: {
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
            return void this.cursor(key ? api_1.IDBKeyRange.bound([
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
                            arch_stream_5.sqid(event.id)
                        ]);
                    }, void 0);
                var event = cursor.value;
                switch (event.type) {
                case event_4.EventType.put: {
                        void cleanStateMap.set(event.key, cleanStateMap.get(event.key) || false);
                        break;
                    }
                case event_4.EventType.snapshot: {
                        if (!cleanStateMap.get(event.key)) {
                            void cleanStateMap.set(event.key, true);
                            void cursor.continue();
                            return;
                        }
                        break;
                    }
                case event_4.EventType.delete: {
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
            return void api_1.listen(this.database)(function (db) {
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
            return events.reduceRight(compose, new UnsavedEventRecord(types_1.KeyString(''), new event_4.EventValue(), event_4.EventType.delete, 0));
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
            case event_4.EventType.put: {
                    return source.value[source.attr] !== void 0 ? new UnsavedEventRecord(source.key, assign_2.assign(new event_4.EventValue(), target.value, source.value), event_4.EventType.snapshot) : new UnsavedEventRecord(source.key, Object.keys(target.value).reduce(function (value, prop) {
                        if (prop === source.attr)
                            return value;
                        value[prop] = target[prop];
                        return value;
                    }, new event_4.EventValue()), event_4.EventType.snapshot);
                }
            case event_4.EventType.snapshot: {
                    return source;
                }
            case event_4.EventType.delete: {
                    return source;
                }
            }
            throw new TypeError('LocalSocket: Invalid event type: ' + source.type);
        }
    }
    exports.compose = compose;
});
define('src/layer/domain/indexeddb/model/socket/data', [
    'require',
    'exports',
    'src/layer/data/store/event'
], function (require, exports, event_6) {
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
        function DataStore(database) {
            _super.call(this, database, exports.STORE_NAME);
            void Object.freeze(this);
        }
        DataStore.configure = function () {
            return event_6.AbstractEventStore.configure(exports.STORE_NAME);
        };
        return DataStore;
    }(event_6.AbstractEventStore);
    exports.DataStore = DataStore;
});
define('src/layer/data/store/key-value', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/lib/noop'
], function (require, exports, arch_stream_6, api_2, noop_3) {
    'use strict';
    exports.EventType = {
        get: 'get',
        put: 'put',
        delete: 'delete'
    };
    var AbstractKeyValueStore = function () {
        function AbstractKeyValueStore(database, name, index) {
            this.database = database;
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
                exports.EventType.get
            ]);
            void api_2.listen(this.database)(function (db) {
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
                exports.EventType.put
            ]);
            void api_2.listen(this.database)(function (db) {
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
                cb = noop_3.noop;
            }
            void this.cache.delete(key);
            void this.events.access.emit([key], [
                [key],
                exports.EventType.delete
            ]);
            void api_2.listen(this.database)(function (db) {
                var tx = db.transaction(_this.name, api_2.IDBTransaction.readwrite);
                var req = tx.objectStore(_this.name).delete(key);
                tx.oncomplete = tx.onerror = tx.onabort = function (_) {
                    return void cb(tx.error);
                };
            });
        };
        AbstractKeyValueStore.prototype.cursor = function (query, index, direction, mode, cb) {
            var _this = this;
            void api_2.listen(this.database)(function (db) {
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
define('src/layer/domain/indexeddb/model/socket/access', [
    'require',
    'exports',
    'src/layer/data/store/key-value',
    'src/layer/data/store/event'
], function (require, exports, key_value_1, event_7) {
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
        function AccessStore(database, event) {
            var _this = this;
            _super.call(this, database, exports.STORE_NAME, exports.STORE_FIELDS.key);
            void Object.freeze(this);
            void event.monitor([], function (_a) {
                var key = _a.key, type = _a.type;
                return type === event_7.ESEventType.delete ? void _this.delete(key) : void _this.set(key, new AccessRecord(key, Date.now()));
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
define('src/layer/domain/indexeddb/model/socket/expiry', [
    'require',
    'exports',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/data/store/key-value',
    'src/layer/data/store/event'
], function (require, exports, api_3, key_value_2, event_8) {
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
        function ExpiryStore(database, store, data, expiries) {
            var _this = this;
            _super.call(this, database, exports.STORE_NAME, exports.STORE_FIELDS.key);
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
                    void _this.cursor(null, exports.STORE_FIELDS.expiry, api_3.IDBCursorDirection.next, api_3.IDBTransaction.readonly, function (cursor) {
                        if (!cursor)
                            return;
                        var record = cursor.value;
                        if (record.expiry > Date.now()) {
                            void schedule(record.expiry);
                        } else {
                            void store.delete(record.key);
                            void cursor.continue();
                        }
                    });
                }, date - Date.now());
                void api_3.event.once([
                    database,
                    api_3.IDBEventType.destroy
                ], function () {
                    return void clearTimeout(timer);
                });
            };
            void schedule(Date.now());
            void data.events.access.monitor([], function (_a) {
                var key = _a.key, type = _a.type;
                if (type === event_8.ESEventType.delete) {
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
define('src/layer/domain/indexeddb/model/socket', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/indexeddb/api',
    'src/layer/data/constraint/types',
    'src/layer/data/store/event',
    'src/layer/domain/indexeddb/model/socket/data',
    'src/layer/domain/indexeddb/model/socket/access',
    'src/layer/domain/indexeddb/model/socket/expiry',
    'src/lib/noop'
], function (require, exports, arch_stream_7, api_4, types_2, event_9, data_1, access_2, expiry_1, noop_4) {
    'use strict';
    exports.SocketRecord = event_9.UnsavedEventRecord;
    exports.ESEventType = event_9.ESEventType;
    exports.SocketValue = data_1.DataValue;
    var SocketStore = function () {
        function SocketStore(database, destroy, expiry) {
            var _this = this;
            if (expiry === void 0) {
                expiry = Infinity;
            }
            this.database = database;
            this.expiry = expiry;
            this.uuid = arch_stream_7.uuid();
            this.events = {
                load: new arch_stream_7.Observable(),
                save: new arch_stream_7.Observable(),
                loss: new arch_stream_7.Observable()
            };
            this.expiries = new arch_stream_7.Map();
            void api_4.open(database, {
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
            this.schema = new Schema(this, this.expiries);
            void api_4.event.on([
                database,
                api_4.IDBEventType.destroy,
                this.uuid
            ], function () {
                return void _this.schema.bind();
            });
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
            return void this.schema.access.cursor(null, access_2.STORE_FIELDS.date, api_4.IDBCursorDirection.prevunique, api_4.IDBTransaction.readonly, function (cursor, err) {
                if (!cursor)
                    return void cb(keys, err);
                if (--limit < 0)
                    return;
                void keys.push(cursor.primaryKey);
                void cursor.continue();
            });
        };
        SocketStore.prototype.destroy = function () {
            void api_4.event.off([
                this.database,
                api_4.IDBEventType.destroy,
                this.uuid
            ]);
            return api_4.destroy(this.database);
        };
        return SocketStore;
    }();
    exports.SocketStore = SocketStore;
    var Schema = function () {
        function Schema(store_, expiries_) {
            this.store_ = store_;
            this.expiries_ = expiries_;
            void this.bind();
        }
        Schema.prototype.bind = function () {
            var _this = this;
            var keys = this.data ? this.data.keys() : [];
            this.data = new data_1.DataStore(this.store_.database);
            this.data.events.load.monitor([], function (ev) {
                return _this.store_.events.load.emit([
                    ev.key,
                    ev.attr,
                    ev.type
                ], ev);
            });
            this.data.events.save.monitor([], function (ev) {
                return _this.store_.events.save.emit([
                    ev.key,
                    ev.attr,
                    ev.type
                ], ev);
            });
            this.data.events.loss.monitor([], function (ev) {
                return _this.store_.events.loss.emit([
                    ev.key,
                    ev.attr,
                    ev.type
                ], ev);
            });
            this.access = new access_2.AccessStore(this.store_.database, this.data.events.access);
            this.expire = new expiry_1.ExpiryStore(this.store_.database, this.store_, this.data, this.expiries_);
            void this.data.sync(keys);
        };
        return Schema;
    }();
});
define('src/layer/domain/webstorage/service/event', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/infrastructure/webstorage/api'
], function (require, exports, arch_stream_8, api_5) {
    'use strict';
    exports.events = {
        localStorage: subscribe(api_5.events.localStorage),
        sessionStorage: subscribe(api_5.events.sessionStorage)
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
], function (require, exports, arch_stream_10, api_6, event_10, api_7, storage_1) {
    'use strict';
    var LocalStorageObjectCache = new arch_stream_10.Set();
    var LocalStorageSubscriber = new arch_stream_10.Set();
    var SessionStorageObjectCache = new arch_stream_10.Set();
    var SessionStorageSubscriber = new arch_stream_10.Set();
    var PortEventType;
    (function (PortEventType) {
        PortEventType.send = 'send';
        PortEventType.recv = 'recv';
    }(PortEventType = exports.PortEventType || (exports.PortEventType = {})));
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
            storage = api_7.sessionStorage || storage_1.fakeStorage;
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
            this.cache = this.storage === api_7.localStorage ? LocalStorageObjectCache : SessionStorageObjectCache;
            this.eventSource = this.storage === api_7.localStorage ? event_10.events.localStorage : event_10.events.sessionStorage;
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
            var source = arch_stream_10.assign((_a = {}, _a[api_6.SCHEMA.KEY.NAME] = this.name, _a[api_6.SCHEMA.EVENT.NAME] = new arch_stream_10.Observable(), _a), parse(this.storage.getItem(this.name)));
            var dao = api_6.build(source, this.factory, function (attr, newValue, oldValue) {
                void _this.log.update(_this.name);
                void _this.storage.setItem(_this.name, JSON.stringify(Object.keys(source).filter(api_6.isValidPropertyName).filter(api_6.isValidPropertyValue(source)).reduce(function (acc, attr) {
                    acc[attr] = source[attr];
                    return acc;
                }, {})));
                var event = new PortEvent(PortEventType.send, _this.name, attr, newValue, oldValue);
                void source.__event.emit([
                    event.type,
                    event.attr
                ], event);
                void _this.events.send.emit([event.attr], event);
            });
            var subscriber = function (_a) {
                var newValue = _a.newValue;
                var item = parse(newValue);
                void Object.keys(item).filter(api_6.isValidPropertyName).filter(api_6.isValidPropertyValue(item)).reduce(function (_, attr) {
                    var oldVal = source[attr];
                    var newVal = item[attr];
                    if (newVal === oldVal)
                        return;
                    source[attr] = newVal;
                    var event = new PortEvent(PortEventType.recv, _this.name, attr, newVal, oldVal);
                    void source.__event.emit([
                        event.type,
                        event.attr
                    ], event);
                    void _this.events.recv.emit([event.attr], event);
                }, void 0);
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
                    return JSON.parse(item) || {};
                } catch (_) {
                    return {};
                }
            }
            var _a;
        };
        Port.prototype.destroy = function () {
            void this.eventSource.off([
                this.name,
                this.uuid
            ]);
            void this.cache.delete(this.name);
            void this.storage.removeItem(this.name);
            void this.log.delete(this.name);
        };
        return Port;
    }();
});
define('src/layer/domain/webstorage/api', [
    'require',
    'exports',
    'src/layer/domain/webstorage/repository/port',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/service/event',
    'src/layer/domain/webstorage/repository/port'
], function (require, exports, port_1, api_8, event_11, port_2) {
    'use strict';
    exports.localStorage = api_8.localStorage;
    exports.sessionStorage = api_8.sessionStorage;
    exports.supportWebStorage = api_8.supportWebStorage;
    exports.events = event_11.events;
    exports.WebStorageEvent = port_2.PortEvent;
    exports.WebStorageEventType = port_2.PortEventType;
    function webstorage(name, storage, factory) {
        return port_1.repository(name, storage, factory);
    }
    exports.webstorage = webstorage;
});
define('src/layer/domain/indexeddb/repository/socket', [
    'require',
    'exports',
    'arch-stream',
    'src/layer/domain/dao/api',
    'src/layer/domain/indexeddb/model/socket',
    'src/layer/infrastructure/webstorage/api',
    'src/layer/domain/webstorage/api',
    'src/layer/data/constraint/types',
    'src/layer/data/lib/assign'
], function (require, exports, arch_stream_11, api_9, socket_1, api_10, api_11, types_3, assign_3) {
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
        function Socket(database, factory, expiry, destroy) {
            var _this = this;
            _super.call(this, database, destroy, expiry);
            this.factory = factory;
            this.proxy = api_11.webstorage(this.database, api_10.localStorage, function () {
                return new Port();
            });
            this.port = this.proxy.link();
            this.links = new arch_stream_11.Set();
            this.sources = new arch_stream_11.Set();
            void this.port.__event.on([
                api_11.WebStorageEventType.recv,
                'msgs'
            ], function () {
                void _this.port.recv().reduce(function (_, msg) {
                    return void _this.schema.data.update(msg.key);
                }, void 0);
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
                case socket_1.ESEventType.put: {
                        var oldVal = source[attr];
                        var newVal = _this.get(key)[attr];
                        source[attr] = newVal;
                        void source.__event.emit([
                            api_11.WebStorageEventType.recv,
                            attr
                        ], new api_11.WebStorageEvent(api_11.WebStorageEventType.recv, key, attr, newVal, oldVal));
                        return;
                    }
                case socket_1.ESEventType.delete: {
                        var cache = _this.get(key);
                        void Object.keys(cache).filter(api_9.isValidPropertyName).filter(api_9.isValidPropertyValue(cache)).sort().reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = void 0;
                            source[attr] = newVal;
                            void source.__event.emit([
                                api_11.WebStorageEventType.recv,
                                attr
                            ], new api_11.WebStorageEvent(api_11.WebStorageEventType.recv, key, attr, newVal, oldVal));
                        }, void 0);
                        return;
                    }
                case socket_1.ESEventType.snapshot: {
                        var cache_1 = _this.get(key);
                        void Object.keys(cache_1).filter(api_9.isValidPropertyName).filter(api_9.isValidPropertyValue(cache_1)).sort().reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = cache_1[attr];
                            source[attr] = newVal;
                            void source.__event.emit([
                                api_11.WebStorageEventType.recv,
                                attr
                            ], new api_11.WebStorageEvent(api_11.WebStorageEventType.recv, key, attr, newVal, oldVal));
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
            return this.links.add(key, api_9.build(Object.defineProperties(this.sources.add(key, assign_3.assign({}, this.get(key))), {
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
                    api_11.WebStorageEventType.send,
                    attr
                ], new api_11.WebStorageEvent(api_11.WebStorageEventType.send, key, attr, newValue, oldValue));
                var _a;
            }));
        };
        Socket.prototype.destroy = function () {
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
], function (require, exports, api_12) {
    'use strict';
    exports.event = api_12.event;
    exports.IDBEventType = api_12.IDBEventType;
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
    exports.IDBEventType = event_12.IDBEventType;
});
define('src/layer/app/api', [
    'require',
    'exports',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api',
    'src/layer/domain/indexeddb/api',
    'src/layer/domain/webstorage/api',
    'src/layer/domain/webstorage/api'
], function (require, exports, api_13, api_14, api_15, api_16, api_17) {
    'use strict';
    exports.status = api_17.supportWebStorage;
    function socket(name, config) {
        config = configure(config);
        return api_13.socket(name, config.schema, config.destroy, config.expiry);
        function configure(config) {
            var Config = function () {
                function Config(schema, expiry, destroy) {
                    if (expiry === void 0) {
                        expiry = Infinity;
                    }
                    if (destroy === void 0) {
                        destroy = function () {
                            return true;
                        };
                    }
                    this.schema = schema;
                    this.expiry = expiry;
                    this.destroy = destroy;
                    void Object.freeze(this);
                }
                return Config;
            }();
            return new Config(config.schema, config.expiry, config.destroy);
        }
    }
    exports.socket = socket;
    function port(name, config) {
        config = configure(config);
        return api_14.webstorage(name, api_14.localStorage, config.schema);
        function configure(config) {
            var Config = function () {
                function Config(schema, destroy) {
                    if (destroy === void 0) {
                        destroy = function () {
                            return true;
                        };
                    }
                    this.schema = schema;
                    this.destroy = destroy;
                    void Object.freeze(this);
                }
                return Config;
            }();
            return new Config(config.schema, config.destroy);
        }
    }
    exports.port = port;
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
    'src/layer/app/api'
], function (require, exports, api_18) {
    'use strict';
    exports.socket = api_18.socket;
    exports.port = api_18.port;
    exports.events = api_18.events;
    exports.status = api_18.status;
});
define('src/export', [
    'require',
    'exports',
    'src/layer/interface/api'
], function (require, exports, api_19) {
    'use strict';
    exports.default = api_19.socket;
    exports.socket = api_19.socket;
    exports.port = api_19.port;
    exports.status = api_19.status;
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