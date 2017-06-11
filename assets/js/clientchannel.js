/*! clientchannel v0.16.6 https://github.com/falsandtru/clientchannel | (c) 2017, falsandtru | (Apache-2.0 AND MPL-2.0) License */
require = function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == 'function' && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error('Cannot find module \'' + o + '\'');
                throw f.code = 'MODULE_NOT_FOUND', f;
            }
            var l = n[o] = { exports: {} };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++)
        s(r[o]);
    return s;
}({
    1: [
        function (require, module, exports) {
        },
        {}
    ],
    2: [
        function (require, module, exports) {
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    3: [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            __export(require('./layer/interface/api'));
        },
        { './layer/interface/api': 29 }
    ],
    4: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            var api_1 = require('../domain/indexeddb/api');
            var api_2 = require('../domain/webstorage/api');
            __export(require('../domain/indexeddb/api'));
            __export(require('../domain/webstorage/api'));
            var StoreChannel = function (_super) {
                __extends(StoreChannel, _super);
                function StoreChannel(name, _a) {
                    var schema = _a.schema, _b = _a.migrate, migrate = _b === void 0 ? function () {
                            return void 0;
                        } : _b, _c = _a.destroy, destroy = _c === void 0 ? function () {
                            return true;
                        } : _c, _d = _a.size, size = _d === void 0 ? Infinity : _d, _e = _a.expiry, expiry = _e === void 0 ? Infinity : _e;
                    return _super.call(this, name, schema, migrate, destroy, size, expiry) || this;
                }
                return StoreChannel;
            }(api_1.StoreChannel);
            exports.StoreChannel = StoreChannel;
            var StorageChannel = function (_super) {
                __extends(StorageChannel, _super);
                function StorageChannel(name, _a) {
                    var schema = _a.schema, _b = _a.migrate, migrate = _b === void 0 ? function () {
                            return void 0;
                        } : _b;
                    return _super.call(this, name, api_2.localStorage, schema, migrate) || this;
                }
                return StorageChannel;
            }(api_2.StorageChannel);
            exports.StorageChannel = StorageChannel;
        },
        {
            '../domain/indexeddb/api': 13,
            '../domain/webstorage/api': 19
        }
    ],
    5: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function isStorable(value) {
                switch (typeof value) {
                case 'undefined':
                case 'boolean':
                case 'number':
                case 'string':
                    return true;
                case 'object':
                    try {
                        void JSON.stringify(value);
                        return true;
                    } catch (_) {
                        return false;
                    }
                default:
                    return false;
                }
            }
            exports.isStorable = isStorable;
        },
        {}
    ],
    6: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var identifier_1 = require('./identifier');
            var value_1 = require('../database/value');
            exports.EventRecordType = {
                put: 'put',
                delete: 'delete',
                snapshot: 'snapshot'
            };
            var EventRecord = function () {
                function EventRecord(id, type, key, value, date) {
                    this.id = id;
                    this.type = type;
                    this.key = key;
                    this.value = value;
                    this.date = date;
                    if (typeof this.id !== 'number' || !isFinite(this.id) || this.id >= 0 === false || !Number.isInteger(this.id))
                        throw new TypeError('ClientChannel: EventRecord: Invalid event id: ' + this.id);
                    if (typeof this.type !== 'string')
                        throw new TypeError('ClientChannel: EventRecord: Invalid event type: ' + this.type);
                    if (typeof this.key !== 'string')
                        throw new TypeError('ClientChannel: EventRecord: Invalid event key: ' + this.key);
                    if (typeof this.value !== 'object' || !this.value)
                        throw new TypeError('ClientChannel: EventRecord: Invalid event value: ' + JSON.stringify(this.value));
                    if (typeof this.date !== 'number' || !isFinite(this.date) || this.date >= 0 === false)
                        throw new TypeError('ClientChannel: EventRecord: Invalid event date: ' + this.date);
                    this.attr = this.type === exports.EventRecordType.put ? Object.keys(value).filter(isValidPropertyName)[0] : '';
                    if (typeof this.attr !== 'string')
                        throw new TypeError('ClientChannel: EventRecord: Invalid event attr: ' + this.key);
                    switch (type) {
                    case exports.EventRecordType.put:
                        if (!isValidPropertyName(this.attr))
                            throw new TypeError('ClientChannel: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
                        this.value = value = new EventRecordValue((_a = {}, _a[this.attr] = value[this.attr], _a));
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    case exports.EventRecordType.snapshot:
                        if (this.attr !== '')
                            throw new TypeError('ClientChannel: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
                        this.value = value = new EventRecordValue(value);
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    case exports.EventRecordType.delete:
                        if (this.attr !== '')
                            throw new TypeError('ClientChannel: EventRecord: Invalid event attr with ' + this.type + ': ' + this.attr);
                        this.value = value = new EventRecordValue();
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    default:
                        throw new TypeError('ClientChannel: Invalid event type: ' + type);
                    }
                    var _a;
                }
                return EventRecord;
            }();
            var UnstoredEventRecord = function (_super) {
                __extends(UnstoredEventRecord, _super);
                function UnstoredEventRecord(key, value, type, date) {
                    if (type === void 0) {
                        type = exports.EventRecordType.put;
                    }
                    if (date === void 0) {
                        date = Date.now();
                    }
                    var _this = _super.call(this, identifier_1.makeEventId(0), type, key, value, date) || this;
                    _this.EVENT_RECORD;
                    if (_this.id !== 0)
                        throw new TypeError('ClientChannel: UnsavedEventRecord: Invalid event id: ' + _this.id);
                    return _this;
                }
                return UnstoredEventRecord;
            }(EventRecord);
            exports.UnstoredEventRecord = UnstoredEventRecord;
            var StoredEventRecord = function (_super) {
                __extends(StoredEventRecord, _super);
                function StoredEventRecord(id, key, value, type, date) {
                    var _this = _super.call(this, id, type, key, value, date) || this;
                    if (_this.id > 0 === false)
                        throw new TypeError('ClientChannel: SavedEventRecord: Invalid event id: ' + _this.id);
                    return _this;
                }
                return StoredEventRecord;
            }(EventRecord);
            exports.StoredEventRecord = StoredEventRecord;
            var LoadedEventRecord = function (_super) {
                __extends(LoadedEventRecord, _super);
                function LoadedEventRecord(id, key, value, type, date) {
                    var _this = _super.call(this, id, key, value, type, date) || this;
                    _this.EVENT_RECORD;
                    return _this;
                }
                return LoadedEventRecord;
            }(StoredEventRecord);
            exports.LoadedEventRecord = LoadedEventRecord;
            var SavedEventRecord = function (_super) {
                __extends(SavedEventRecord, _super);
                function SavedEventRecord(id, key, value, type, date) {
                    var _this = _super.call(this, id, key, value, type, date) || this;
                    _this.EVENT_RECORD;
                    return _this;
                }
                return SavedEventRecord;
            }(StoredEventRecord);
            exports.SavedEventRecord = SavedEventRecord;
            var EventRecordValue = function () {
                function EventRecordValue() {
                    var sources = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        sources[_i] = arguments[_i];
                    }
                    void spica_1.clone.apply(void 0, [this].concat(sources));
                }
                return EventRecordValue;
            }();
            exports.EventRecordValue = EventRecordValue;
            var RegValidValueNameFormat = /^[a-zA-Z][0-9a-zA-Z_]*$/;
            var RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;
            function isValidPropertyName(prop) {
                return prop.length > 0 && !prop.startsWith('_') && !prop.endsWith('_') && !RegInvalidValueNameFormat.test(prop) && RegValidValueNameFormat.test(prop);
            }
            exports.isValidPropertyName = isValidPropertyName;
            function isValidPropertyValue(dao) {
                return function (prop) {
                    return value_1.isStorable(dao[prop]);
                };
            }
            exports.isValidPropertyValue = isValidPropertyValue;
        },
        {
            '../database/value': 5,
            './identifier': 7,
            'spica': undefined
        }
    ],
    7: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var Identifier;
            (function (Identifier) {
            }(Identifier || (Identifier = {})));
            function makeEventId(id) {
                return id;
            }
            exports.makeEventId = makeEventId;
        },
        {}
    ],
    8: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            var __assign = this && this.__assign || Object.assign || function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
                }
                return t;
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var api_1 = require('../../infrastructure/indexeddb/api');
            var identifier_1 = require('./identifier');
            var event_1 = require('./event');
            var noop_1 = require('../../../lib/noop');
            var EventStoreSchema;
            (function (EventStoreSchema) {
                EventStoreSchema.id = 'id';
                EventStoreSchema.key = 'key';
                EventStoreSchema.type = 'type';
                EventStoreSchema.attr = 'attr';
                EventStoreSchema.value = 'value';
                EventStoreSchema.date = 'date';
                EventStoreSchema.surrogateKeyDateField = 'key+date';
            }(EventStoreSchema || (EventStoreSchema = {})));
            var EventStore = function () {
                function EventStore(database, name, attrs) {
                    var _this = this;
                    this.database = database;
                    this.name = name;
                    this.attrs = attrs;
                    this.memory = new spica_1.Observation();
                    this.events = Object.freeze({
                        load: new spica_1.Observation(),
                        save: new spica_1.Observation(),
                        loss: new spica_1.Observation()
                    });
                    this.events_ = Object.freeze({
                        memory: new spica_1.Observation(),
                        access: new spica_1.Observation()
                    });
                    this.syncState = new Map();
                    this.syncWaits = new spica_1.Observation();
                    this.snapshotCycle = 9;
                    var states = new (function () {
                        function class_1() {
                            this.ids = new Map();
                            this.dates = new Map();
                        }
                        class_1.prototype.update = function (event) {
                            void this.ids.set(event.key, identifier_1.makeEventId(Math.max(event.id, this.ids.get(event.key) || 0)));
                            void this.dates.set(event.key, Math.max(event.date, this.dates.get(event.key) || 0));
                        };
                        return class_1;
                    }())();
                    void this.events_.memory.monitor([], function (event) {
                        if (event.date <= states.dates.get(event.key) && event.id <= states.ids.get(event.key))
                            return;
                        if (event instanceof event_1.LoadedEventRecord) {
                            return void _this.events.load.emit([
                                event.key,
                                event.attr,
                                event.type
                            ], new EventStore.Event(event.type, event.id, event.key, event.attr, event.date));
                        }
                        if (event instanceof event_1.SavedEventRecord) {
                            return void _this.events.save.emit([
                                event.key,
                                event.attr,
                                event.type
                            ], new EventStore.Event(event.type, event.id, event.key, event.attr, event.date));
                        }
                        return;
                    });
                    void this.events_.memory.monitor([], function (event) {
                        return void states.update(new EventStore.Event(event.type, event.id, event.key, event.attr, event.date));
                    });
                    void this.events.load.monitor([], function (event) {
                        return void states.update(event);
                    });
                    void this.events.save.monitor([], function (event) {
                        return void states.update(event);
                    });
                    void this.events.save.monitor([], function (event) {
                        switch (event.type) {
                        case EventStore.EventType.delete:
                        case EventStore.EventType.snapshot:
                            void _this.clean(event.key);
                        }
                    });
                }
                EventStore.configure = function (name) {
                    return {
                        make: function (tx) {
                            var store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: EventStoreSchema.id,
                                autoIncrement: true
                            });
                            if (!store.indexNames.contains(EventStoreSchema.id)) {
                                void store.createIndex(EventStoreSchema.id, EventStoreSchema.id, { unique: true });
                            }
                            if (!store.indexNames.contains(EventStoreSchema.key)) {
                                void store.createIndex(EventStoreSchema.key, EventStoreSchema.key);
                            }
                            if (!store.indexNames.contains(EventStoreSchema.type)) {
                                void store.createIndex(EventStoreSchema.type, EventStoreSchema.type);
                            }
                            if (!store.indexNames.contains(EventStoreSchema.attr)) {
                                void store.createIndex(EventStoreSchema.attr, EventStoreSchema.attr);
                            }
                            if (!store.indexNames.contains(EventStoreSchema.value)) {
                                void store.createIndex(EventStoreSchema.value, EventStoreSchema.value);
                            }
                            if (!store.indexNames.contains(EventStoreSchema.date)) {
                                void store.createIndex(EventStoreSchema.date, EventStoreSchema.date);
                            }
                            if (!store.indexNames.contains(EventStoreSchema.surrogateKeyDateField)) {
                                void store.createIndex(EventStoreSchema.surrogateKeyDateField, [
                                    EventStoreSchema.key,
                                    EventStoreSchema.date
                                ]);
                            }
                            return true;
                        },
                        verify: function (db) {
                            return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.id) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.key) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.type) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.attr) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.value) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.date) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.surrogateKeyDateField);
                        },
                        destroy: function () {
                            return true;
                        }
                    };
                };
                EventStore.prototype.sync = function (keys, cb) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    return void Promise.all(keys.map(function (key) {
                        switch (_this.syncState.get(key)) {
                        case true:
                            return Promise.resolve();
                        case false:
                            return new Promise(function (resolve) {
                                return void void _this.syncWaits.once([key], function (err) {
                                    return void resolve(err ? [
                                        key,
                                        err
                                    ] : void 0);
                                });
                            });
                        default:
                            return new Promise(function (resolve) {
                                return void (void _this.syncWaits.once([key], function (err) {
                                    return void resolve(err ? [
                                        key,
                                        err
                                    ] : void 0);
                                }), void _this.fetch(key, function (err) {
                                    return void _this.syncWaits.emit([key], err);
                                }));
                            });
                        }
                    })).then(function (rs) {
                        return void cb(rs.filter(function (r) {
                            return r;
                        }));
                    });
                };
                EventStore.prototype.fetch = function (key, cb, after) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    if (after === void 0) {
                        after = noop_1.noop;
                    }
                    void this.syncState.set(key, this.syncState.get(key) === true);
                    var events = [];
                    return void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, after ? 'readwrite' : 'readonly');
                        var req = tx.objectStore(_this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
                        var unbind = function () {
                            req.onsuccess = tx.onerror = tx.onabort = null;
                        };
                        var proc = function (cursor, err) {
                            if (err)
                                return void cb(err), void unbind(), void after(tx, err);
                            if (!cursor || cursor.value.date < _this.meta(key).date) {
                                void _this.syncState.set(key, true);
                                void Array.from(events.reduceRight(function (acc, e) {
                                    return acc.length === 0 || acc[0].type === EventStore.EventType.put ? spica_1.concat(acc, [e]) : acc;
                                }, []).reduceRight(function (dict, e) {
                                    return dict.set(e.attr, e);
                                }, new Map()).values()).sort(function (a, b) {
                                    return a.date - b.date || a.id - b.id;
                                }).forEach(function (e) {
                                    void _this.memory.off([
                                        e.key,
                                        e.attr,
                                        spica_1.sqid(e.id)
                                    ]);
                                    void _this.memory.on([
                                        e.key,
                                        e.attr,
                                        spica_1.sqid(e.id)
                                    ], function () {
                                        return e;
                                    });
                                    void _this.events_.memory.emit([
                                        e.key,
                                        e.attr,
                                        spica_1.sqid(e.id)
                                    ], e);
                                });
                                try {
                                    void cb();
                                } catch (reason) {
                                    void new Promise(function (_, reject) {
                                        return void reject(reason);
                                    });
                                }
                                void unbind();
                                void after(tx);
                                void _this.events_.access.emit([key], new EventStore.InternalEvent(EventStore.InternalEventType.query, identifier_1.makeEventId(0), key, ''));
                                if (events.length >= _this.snapshotCycle) {
                                    void _this.snapshot(key);
                                }
                                return;
                            } else {
                                var event_2 = cursor.value;
                                if (_this.memory.refs([
                                        event_2.key,
                                        event_2.attr,
                                        spica_1.sqid(event_2.id)
                                    ]).length > 0)
                                    return void proc(null, err);
                                try {
                                    void events.unshift(new event_1.LoadedEventRecord(event_2.id, event_2.key, event_2.value, event_2.type, event_2.date));
                                } catch (err) {
                                    void tx.objectStore(_this.name).delete(cursor.primaryKey);
                                    void new Promise(function (_, reject) {
                                        return void reject(err);
                                    });
                                }
                                if (event_2.type !== EventStore.EventType.put)
                                    return void proc(null, err);
                                return void cursor.continue();
                            }
                        };
                        req.onsuccess = function () {
                            return void proc(req.result, req.error);
                        };
                        tx.onerror = tx.onabort = function () {
                            return void cb(tx.error);
                        };
                    });
                };
                EventStore.prototype.transaction = function (key, cb, complete) {
                    var _this = this;
                    return void this.fetch(key, noop_1.noop, function (tx, err) {
                        try {
                            if (err)
                                throw err;
                            _this.tx = tx;
                            void cb();
                            void tx.addEventListener('complete', function () {
                                return void complete();
                            });
                            void tx.addEventListener('abort', function () {
                                return void complete(tx.error);
                            });
                            void tx.addEventListener('error', function () {
                                return void complete(tx.error);
                            });
                        } catch (e) {
                            void tx.abort();
                            void complete(e instanceof Error || e instanceof DOMError ? e : new Error());
                        } finally {
                            _this.tx = void 0;
                        }
                    });
                };
                EventStore.prototype.keys = function () {
                    return this.memory.reflect([]).reduce(function (keys, e) {
                        return keys.length === 0 || keys[keys.length - 1] !== e.key ? spica_1.concat(keys, [e.key]) : keys;
                    }, []).sort();
                };
                EventStore.prototype.observes = function (key) {
                    return this.syncState.has(key);
                };
                EventStore.prototype.has = function (key) {
                    return compose(key, this.attrs, this.memory.reflect([key])).type !== EventStore.EventType.delete;
                };
                EventStore.prototype.meta = function (key) {
                    var events = this.memory.reflect([key]);
                    return Object.freeze({
                        key: key,
                        id: events.reduce(function (id, e) {
                            return e.id > id ? e.id : id;
                        }, 0),
                        date: events.reduce(function (date, e) {
                            return e.date > date ? e.date : date;
                        }, 0)
                    });
                };
                EventStore.prototype.get = function (key) {
                    if (!this.observes(key)) {
                        void this.fetch(key);
                    }
                    void this.events_.access.emit([key], new EventStore.InternalEvent(EventStore.InternalEventType.query, identifier_1.makeEventId(0), key, ''));
                    return Object.assign(Object.create(null), compose(key, this.attrs, this.memory.reflect([key])).value);
                };
                EventStore.prototype.add = function (event, tx) {
                    var _this = this;
                    if (tx === void 0) {
                        tx = this.tx;
                    }
                    void this.events_.access.emit([
                        event.key,
                        event.attr,
                        event.type
                    ], new EventStore.InternalEvent(event.type, identifier_1.makeEventId(0), event.key, event.attr));
                    if (!(event instanceof event_1.UnstoredEventRecord))
                        throw new Error('ClientChannel: Cannot add a saved event: ' + JSON.stringify(event));
                    if (!this.observes(event.key)) {
                        void this.fetch(event.key);
                    }
                    switch (event.type) {
                    case EventStore.EventType.put: {
                            void this.memory.off([
                                event.key,
                                event.attr,
                                spica_1.sqid(0)
                            ]);
                            void this.events_.memory.off([
                                event.key,
                                event.attr,
                                spica_1.sqid(0)
                            ]);
                            break;
                        }
                    case EventStore.EventType.delete:
                    case EventStore.EventType.snapshot: {
                            void this.memory.refs([event.key]).filter(function (_a) {
                                var _b = _a.namespace, id = _b[2];
                                return id === spica_1.sqid(0);
                            }).forEach(function (_a) {
                                var _b = _a.namespace, key = _b[0], attr = _b[1], id = _b[2];
                                return void _this.memory.off([
                                    key,
                                    attr,
                                    id
                                ]), void _this.events_.memory.off([
                                    key,
                                    attr,
                                    id
                                ]);
                            });
                            break;
                        }
                    }
                    var clean = this.memory.on([
                        event.key,
                        event.attr,
                        spica_1.sqid(0),
                        spica_1.sqid()
                    ], function () {
                        return event;
                    });
                    void this.events_.memory.emit([
                        event.key,
                        event.attr,
                        spica_1.sqid(0)
                    ], event);
                    return void new Promise(function (resolve, reject) {
                        var cont = function (tx) {
                            var active = function () {
                                return _this.memory.refs([
                                    event.key,
                                    event.attr,
                                    spica_1.sqid(0)
                                ]).some(function (_a) {
                                    var listener = _a.listener;
                                    return listener(void 0, [
                                        event.key,
                                        event.attr,
                                        spica_1.sqid(0)
                                    ]) === event;
                                });
                            };
                            if (!active())
                                return void resolve();
                            var req = tx.objectStore(_this.name).add(adjust(event));
                            tx.oncomplete = function () {
                                void clean();
                                var savedEvent = new event_1.SavedEventRecord(identifier_1.makeEventId(req.result), event.key, event.value, event.type, event.date);
                                void _this.memory.off([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    spica_1.sqid(savedEvent.id)
                                ]);
                                void _this.memory.on([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    spica_1.sqid(savedEvent.id)
                                ], function () {
                                    return savedEvent;
                                });
                                void _this.events_.memory.emit([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    spica_1.sqid(savedEvent.id)
                                ], savedEvent);
                                void resolve();
                                var events = _this.memory.refs([savedEvent.key]).map(function (_a) {
                                    var listener = _a.listener;
                                    return listener(void 0, [savedEvent.key]);
                                }).reduce(function (acc, event) {
                                    return event instanceof event_1.StoredEventRecord ? spica_1.concat(acc, [event]) : acc;
                                }, []);
                                if (events.length >= _this.snapshotCycle) {
                                    void _this.snapshot(savedEvent.key);
                                }
                            };
                            tx.onerror = tx.onabort = function () {
                                return active() ? void reject() : void resolve(), void clean();
                            };
                        };
                        if (tx)
                            return void cont(tx);
                        var cancellation = new spica_1.Cancellation();
                        void cancellation.register(reject);
                        void cancellation.register(clean);
                        void spica_1.tick(function () {
                            return void setTimeout(cancellation.cancel, 1000), void api_1.listen(_this.database)(function (db) {
                                return void cancellation.close(), void cancellation.maybe(db).fmap(function (db) {
                                    return void cont(db.transaction(_this.name, 'readwrite'));
                                }).extract(function () {
                                    return void 0;
                                });
                            });
                        });
                    }).catch(function () {
                        return void _this.events.loss.emit([
                            event.key,
                            event.attr,
                            event.type
                        ], new EventStore.Event(event.type, identifier_1.makeEventId(0), event.key, event.attr, event.date));
                    });
                };
                EventStore.prototype.delete = function (key) {
                    return void this.add(new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete));
                };
                EventStore.prototype.snapshot = function (key) {
                    var _this = this;
                    return void api_1.listen(this.database)(function (db) {
                        if (!_this.observes(key))
                            return;
                        var tx = db.transaction(_this.name, 'readwrite');
                        var store = tx.objectStore(_this.name);
                        var req = store.index(EventStoreSchema.key).openCursor(key, 'prev');
                        var events = [];
                        req.onsuccess = function () {
                            var cursor = req.result;
                            if (cursor) {
                                var event_3 = cursor.value;
                                try {
                                    void events.unshift(new event_1.StoredEventRecord(event_3.id, event_3.key, event_3.value, event_3.type, event_3.date));
                                } catch (err) {
                                    void cursor.delete();
                                    void new Promise(function (_, reject) {
                                        return void reject(err);
                                    });
                                }
                            }
                            if (!cursor) {
                                if (events.length === 0)
                                    return;
                                var composedEvent = compose(key, _this.attrs, events);
                                if (composedEvent instanceof event_1.StoredEventRecord)
                                    return;
                                switch (composedEvent.type) {
                                case EventStore.EventType.snapshot:
                                    return void _this.add(new event_1.UnstoredEventRecord(composedEvent.key, composedEvent.value, composedEvent.type, events.reduce(function (date, e) {
                                        return e.date > date ? e.date : date;
                                    }, 0)), tx);
                                case EventStore.EventType.delete:
                                    return;
                                }
                                throw new TypeError('ClientChannel: Invalid event type: ' + composedEvent.type);
                            } else {
                                return void cursor.continue();
                            }
                        };
                    });
                };
                EventStore.prototype.clean = function (key) {
                    var _this = this;
                    var removedEvents = [];
                    var cleanState = new Map();
                    return void this.cursor(key ? api_1.IDBKeyRange.bound(key, key) : api_1.IDBKeyRange.upperBound(Infinity), key ? EventStoreSchema.key : EventStoreSchema.date, 'prev', 'readwrite', function (cursor) {
                        if (!cursor) {
                            return void removedEvents.reduce(function (_, event) {
                                return void _this.memory.off([
                                    event.key,
                                    event.attr,
                                    spica_1.sqid(event.id)
                                ]), void _this.events_.memory.off([
                                    event.key,
                                    event.attr,
                                    spica_1.sqid(event.id)
                                ]);
                            }, void 0);
                        } else {
                            var event_4 = cursor.value;
                            switch (event_4.type) {
                            case EventStore.EventType.put: {
                                    void cleanState.set(event_4.key, cleanState.get(event_4.key) || false);
                                    break;
                                }
                            case EventStore.EventType.snapshot: {
                                    if (!cleanState.get(event_4.key)) {
                                        void cleanState.set(event_4.key, true);
                                        void cursor.continue();
                                        return;
                                    }
                                    break;
                                }
                            case EventStore.EventType.delete: {
                                    void cleanState.set(event_4.key, true);
                                    break;
                                }
                            }
                            if (cleanState.get(event_4.key)) {
                                void cursor.delete();
                                void removedEvents.unshift(event_4);
                            }
                            return void cursor.continue();
                        }
                    });
                };
                EventStore.prototype.cursor = function (query, index, direction, mode, cb) {
                    var _this = this;
                    return void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, mode);
                        var req = index ? tx.objectStore(_this.name).index(index).openCursor(query, direction) : tx.objectStore(_this.name).openCursor(query, direction);
                        req.onsuccess = function () {
                            return req.result && void cb(req.result, req.error);
                        };
                        tx.oncomplete = function () {
                            return void cb(null, tx.error);
                        };
                        tx.onerror = tx.onabort = function () {
                            return void cb(null, tx.error);
                        };
                    });
                };
                return EventStore;
            }();
            exports.EventStore = EventStore;
            (function (EventStore) {
                var Event = function () {
                    function Event(type, id, key, attr, date) {
                        this.type = type;
                        this.id = id;
                        this.key = key;
                        this.attr = attr;
                        this.date = date;
                        this.EVENT;
                        void Object.freeze(this);
                    }
                    return Event;
                }();
                EventStore.Event = Event;
                EventStore.EventType = event_1.EventRecordType;
                var Record = function (_super) {
                    __extends(Record, _super);
                    function Record() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return Record;
                }(event_1.UnstoredEventRecord);
                EventStore.Record = Record;
                var Value = function (_super) {
                    __extends(Value, _super);
                    function Value() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return Value;
                }(event_1.EventRecordValue);
                EventStore.Value = Value;
                var InternalEvent = function () {
                    function InternalEvent(type, id, key, attr) {
                        this.type = type;
                        this.id = id;
                        this.key = key;
                        this.attr = attr;
                        void Object.freeze(this);
                    }
                    return InternalEvent;
                }();
                EventStore.InternalEvent = InternalEvent;
                EventStore.InternalEventType = __assign({}, event_1.EventRecordType, { query: 'query' });
            }(EventStore = exports.EventStore || (exports.EventStore = {})));
            exports.EventStore = EventStore;
            function adjust(event) {
                var ret = __assign({}, event);
                delete ret.id;
                return ret;
            }
            exports.adjust = adjust;
            function compose(key, attrs, events) {
                return group(events).map(function (events) {
                    return events.reduceRight(compose, new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete, 0));
                }).reduce(function (e) {
                    return e;
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
                        return indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id - a.id || bi - ai;
                    }).reduceRight(function (_a, _b) {
                        var head = _a[0], tail = _a.slice(1);
                        var event = _b[0];
                        var prev = head[0];
                        if (!prev)
                            return [[event]];
                        return prev.key === event.key ? spica_1.concat([spica_1.concat([event], head)], tail) : spica_1.concat([[event]], spica_1.concat([head], tail));
                    }, [[]]);
                }
                function compose(target, source) {
                    switch (source.type) {
                    case EventStore.EventType.put:
                        return new event_1.UnstoredEventRecord(source.key, new EventStore.Value(target.value, (_a = {}, _a[source.attr] = source.value[source.attr], _a)), EventStore.EventType.snapshot);
                    case EventStore.EventType.snapshot:
                        return source;
                    case EventStore.EventType.delete:
                        return source;
                    }
                    throw new TypeError('ClientChannel: Invalid event type: ' + source);
                    var _a;
                }
            }
            exports.compose = compose;
        },
        {
            '../../../lib/noop': 30,
            '../../infrastructure/indexeddb/api': 22,
            './event': 6,
            './identifier': 7,
            'spica': undefined
        }
    ],
    9: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var api_1 = require('../../infrastructure/indexeddb/api');
            var noop_1 = require('../../../lib/noop');
            var KeyValueStore = function () {
                function KeyValueStore(database, name, index) {
                    this.database = database;
                    this.name = name;
                    this.index = index;
                    this.cache = new Map();
                    this.events = { access: new spica_1.Observation() };
                    if (typeof index !== 'string')
                        throw new TypeError();
                }
                KeyValueStore.configure = function () {
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
                KeyValueStore.prototype.get = function (key, cb) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    void this.events.access.emit([key], [
                        [key],
                        KeyValueStore.EventType.get
                    ]);
                    void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, 'readonly');
                        var req = _this.index ? tx.objectStore(_this.name).index(_this.index).get(key) : tx.objectStore(_this.name).get(key);
                        var result;
                        req.onsuccess = function () {
                            return result = req.result !== void 0 && req.result !== null ? req.result : _this.cache.get(key);
                        };
                        tx.oncomplete = function () {
                            return cb(result, tx.error);
                        };
                        tx.onerror = tx.onabort = function () {
                            return cb(void 0, tx.error);
                        };
                    });
                    return this.cache.get(key);
                };
                KeyValueStore.prototype.set = function (key, value, cb) {
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    return this.put(value, key, cb);
                };
                KeyValueStore.prototype.put = function (value, key, cb) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    void this.cache.set(key, value);
                    void this.events.access.emit([key], [
                        [key],
                        KeyValueStore.EventType.put
                    ]);
                    void api_1.listen(this.database)(function (db) {
                        if (!_this.cache.has(key))
                            return;
                        var tx = db.transaction(_this.name, 'readwrite');
                        _this.index ? tx.objectStore(_this.name).put(_this.cache.get(key)) : tx.objectStore(_this.name).put(_this.cache.get(key), key);
                        tx.oncomplete = tx.onerror = tx.onabort = function () {
                            return void cb(key, tx.error);
                        };
                    });
                    return this.cache.get(key);
                };
                KeyValueStore.prototype.delete = function (key, cb) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    void this.cache.delete(key);
                    void this.events.access.emit([key], [
                        [key],
                        KeyValueStore.EventType.delete
                    ]);
                    void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, 'readwrite');
                        void tx.objectStore(_this.name).delete(key);
                        tx.oncomplete = tx.onerror = tx.onabort = function () {
                            return void cb(tx.error);
                        };
                    });
                };
                KeyValueStore.prototype.cursor = function (query, index, direction, mode, cb) {
                    var _this = this;
                    void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, mode);
                        var req = index ? tx.objectStore(_this.name).index(index).openCursor(query, direction) : tx.objectStore(_this.name).openCursor(query, direction);
                        req.onsuccess = function () {
                            return req.result && void cb(req.result, req.error);
                        };
                        tx.oncomplete = function () {
                            return void cb(null, tx.error);
                        };
                        tx.onerror = tx.onabort = function () {
                            return void cb(null, tx.error);
                        };
                    });
                };
                return KeyValueStore;
            }();
            exports.KeyValueStore = KeyValueStore;
            (function (KeyValueStore) {
                KeyValueStore.EventType = {
                    get: 'get',
                    put: 'put',
                    delete: 'delete'
                };
            }(KeyValueStore = exports.KeyValueStore || (exports.KeyValueStore = {})));
            exports.KeyValueStore = KeyValueStore;
        },
        {
            '../../../lib/noop': 30,
            '../../infrastructure/indexeddb/api': 22,
            'spica': undefined
        }
    ],
    10: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var api_1 = require('../../infrastructure/webstorage/api');
            var Channel = function () {
                function Channel(name) {
                    this.name = name;
                    return typeof BroadcastChannel === 'function' ? new Broadcast(name) : new Storage(name);
                }
                Channel.prototype.listen = function (_listener) {
                    return function () {
                        return void 0;
                    };
                };
                Channel.prototype.post = function (_message) {
                };
                Channel.prototype.close = function () {
                };
                return Channel;
            }();
            exports.BroadcastChannel = Channel;
            var Broadcast = function () {
                function Broadcast(name) {
                    this.name = name;
                    this.channel = new BroadcastChannel(this.name);
                    this.listeners = new Set();
                }
                Broadcast.prototype.listen = function (listener) {
                    var _this = this;
                    void this.listeners.add(listener);
                    void this.channel.addEventListener('message', listener);
                    return function () {
                        return void _this.listeners.delete(listener), void _this.channel.removeEventListener('message', listener);
                    };
                };
                Broadcast.prototype.post = function (message) {
                    void this.channel.postMessage(message);
                };
                Broadcast.prototype.close = function () {
                    var _this = this;
                    void this.listeners.forEach(function (listener) {
                        return void _this.channel.removeEventListener('message', listener);
                    });
                    void this.listeners.clear();
                };
                return Broadcast;
            }();
            var Storage = function () {
                function Storage(name) {
                    var _this = this;
                    this.name = name;
                    this.storage = api_1.localStorage;
                    this.listeners = new Set();
                    void self.addEventListener('unload', function () {
                        return void _this.storage.removeItem(_this.name);
                    }, true);
                }
                Storage.prototype.listen = function (listener_) {
                    var _this = this;
                    var listener = function (ev) {
                        return typeof ev.newValue === 'string' && void listener_(ev);
                    };
                    void this.listeners.add(listener);
                    void api_1.eventstream.on([
                        'local',
                        this.name
                    ], listener);
                    return function () {
                        return void _this.listeners.delete(listener), void api_1.eventstream.off([
                            'local',
                            _this.name
                        ], listener);
                    };
                };
                Storage.prototype.post = function (message) {
                    void this.storage.removeItem(this.name);
                    void this.storage.setItem(this.name, message);
                };
                Storage.prototype.close = function () {
                    var _this = this;
                    void this.listeners.forEach(function (listener) {
                        return void api_1.eventstream.off([
                            'local',
                            _this.name
                        ], listener);
                    });
                    void this.listeners.clear();
                    void this.storage.removeItem(this.name);
                };
                return Storage;
            }();
        },
        { '../../infrastructure/webstorage/api': 26 }
    ],
    11: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var builder_1 = require('./module/builder');
            exports.SCHEMA = builder_1.SCHEMA;
            exports.build = builder_1.build;
            exports.isValidPropertyName = builder_1.isValidPropertyName;
            exports.isValidPropertyValue = builder_1.isValidPropertyValue;
        },
        { './module/builder': 12 }
    ],
    12: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var event_1 = require('../../../data/es/event');
            exports.isValidPropertyName = event_1.isValidPropertyName;
            exports.isValidPropertyValue = event_1.isValidPropertyValue;
            var noop_1 = require('../../../../lib/noop');
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
                    throw new TypeError('ClientChannel: Invalid key: ' + source[exports.SCHEMA.KEY.NAME]);
                var descmap = Object.assign(Object.keys(dao).filter(event_1.isValidPropertyName).filter(event_1.isValidPropertyValue(dao)).reduce(function (map, prop) {
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
                            if (!event_1.isValidPropertyValue((_a = {}, _a[prop] = newVal, _a))(prop))
                                throw new TypeError('ClientChannel: Invalid value: ' + JSON.stringify(newVal));
                            var oldVal = source[prop];
                            source[prop] = newVal === void 0 ? iniVal : newVal;
                            void update(prop, newVal, oldVal);
                            var _a;
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
        },
        {
            '../../../../lib/noop': 30,
            '../../../data/es/event': 6
        }
    ],
    13: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var channel_1 = require('./service/channel');
            exports.StoreChannel = channel_1.StoreChannel;
        },
        { './service/channel': 18 }
    ],
    14: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var api_1 = require('../../../infrastructure/indexeddb/api');
            var data_1 = require('./channel/data');
            var access_1 = require('./channel/access');
            var expiry_1 = require('./channel/expiry');
            var noop_1 = require('../../../../lib/noop');
            var cache = new Map();
            var ChannelStore = function () {
                function ChannelStore(name, attrs, destroy, size, expiry) {
                    var _this = this;
                    this.name = name;
                    this.size = size;
                    this.expiry = expiry;
                    this.cancellation = new spica_1.Cancellation();
                    this.events_ = Object.freeze({
                        load: new spica_1.Observation(),
                        save: new spica_1.Observation()
                    });
                    this.events = Object.freeze({
                        load: new spica_1.Observation(),
                        save: new spica_1.Observation(),
                        loss: new spica_1.Observation()
                    });
                    this.ages = new Map();
                    if (cache.has(name))
                        throw new Error('ClientChannel: IndexedDB: Specified channel ' + name + ' is already created.');
                    void cache.set(name, this);
                    void this.cancellation.register(function () {
                        return void cache.delete(name);
                    });
                    void api_1.open(name, {
                        make: function (db) {
                            return data_1.DataStore.configure().make(db) && access_1.AccessStore.configure().make(db) && expiry_1.ExpiryStore.configure().make(db);
                        },
                        verify: function (db) {
                            return data_1.DataStore.configure().verify(db) && access_1.AccessStore.configure().verify(db) && expiry_1.ExpiryStore.configure().verify(db);
                        },
                        destroy: function (err, ev) {
                            return data_1.DataStore.configure().destroy(err, ev) && access_1.AccessStore.configure().destroy(err, ev) && expiry_1.ExpiryStore.configure().destroy(err, ev) && destroy(err, ev);
                        }
                    });
                    this.schema = new Schema(this, attrs, this.ages);
                    void this.cancellation.register(function () {
                        return void _this.schema.close();
                    });
                    void this.cancellation.register(api_1.event.on([
                        name,
                        api_1.IDBEventType.destroy
                    ], function () {
                        return cache.get(name) === _this && void _this.schema.rebuild();
                    }));
                    if (size < Infinity) {
                        var keys_1 = new spica_1.Cache(this.size, function (k) {
                            return void _this.delete(k);
                        });
                        void this.events_.load.monitor([], function (_a) {
                            var key = _a.key, type = _a.type;
                            return type === ChannelStore.EventType.delete ? void keys_1.delete(key) : void keys_1.put(key);
                        });
                        void this.events_.save.monitor([], function (_a) {
                            var key = _a.key, type = _a.type;
                            return type === ChannelStore.EventType.delete ? void keys_1.delete(key) : void keys_1.put(key);
                        });
                        var limit_1 = function () {
                            return cache.get(name) === _this && void _this.recent(Infinity, function (ks, err) {
                                if (cache.get(name) !== _this)
                                    return;
                                if (err)
                                    return void setTimeout(limit_1, 1000);
                                return void ks.reverse().forEach(function (k) {
                                    return void keys_1.put(k);
                                });
                            });
                        };
                        void limit_1();
                    }
                }
                ChannelStore.prototype.sync = function (keys, cb) {
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    return this.schema.data.sync(keys, cb);
                };
                ChannelStore.prototype.fetch = function (key, cb) {
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    return this.schema.data.fetch(key, cb);
                };
                ChannelStore.prototype.transaction = function (key, cb, complete) {
                    return this.schema.data.transaction(key, cb, complete);
                };
                ChannelStore.prototype.has = function (key) {
                    return this.schema.data.has(key);
                };
                ChannelStore.prototype.meta = function (key) {
                    return this.schema.data.meta(key);
                };
                ChannelStore.prototype.get = function (key) {
                    return this.schema.data.get(key);
                };
                ChannelStore.prototype.add = function (record) {
                    return this.schema.data.add(record);
                };
                ChannelStore.prototype.delete = function (key) {
                    return this.schema.data.delete(key);
                };
                ChannelStore.prototype.expire = function (key, age) {
                    if (age === void 0) {
                        age = this.expiry;
                    }
                    if (!isFinite(age))
                        return;
                    return void this.ages.set(key, age);
                };
                ChannelStore.prototype.recent = function (limit, cb) {
                    return this.schema.access.recent(limit, cb);
                };
                ChannelStore.prototype.close = function () {
                    void this.cancellation.cancel();
                    return void api_1.close(this.name);
                };
                ChannelStore.prototype.destroy = function () {
                    void this.cancellation.cancel();
                    return void api_1.destroy(this.name);
                };
                return ChannelStore;
            }();
            exports.ChannelStore = ChannelStore;
            (function (ChannelStore) {
                ChannelStore.Event = data_1.DataStore.Event;
                ChannelStore.EventType = data_1.DataStore.EventType;
                ChannelStore.Record = data_1.DataStore.Record;
            }(ChannelStore = exports.ChannelStore || (exports.ChannelStore = {})));
            exports.ChannelStore = ChannelStore;
            var Schema = function () {
                function Schema(store_, attrs_, expiries_) {
                    this.store_ = store_;
                    this.attrs_ = attrs_;
                    this.expiries_ = expiries_;
                    this.cancellation_ = new spica_1.Cancellation();
                    void this.build();
                }
                Schema.prototype.build = function () {
                    var keys = this.data ? this.data.keys() : [];
                    this.data = new data_1.DataStore(this.store_.name, this.attrs_);
                    this.access = new access_1.AccessStore(this.store_.name, this.data.events_.access);
                    this.expire = new expiry_1.ExpiryStore(this.store_.name, this.store_, this.data.events_.access, this.expiries_, this.cancellation_);
                    void this.cancellation_.register(this.store_.events_.load.relay(this.data.events.load));
                    void this.cancellation_.register(this.store_.events_.save.relay(this.data.events.save));
                    void this.cancellation_.register(this.store_.events.load.relay(this.data.events.load));
                    void this.cancellation_.register(this.store_.events.save.relay(this.data.events.save));
                    void this.cancellation_.register(this.store_.events.loss.relay(this.data.events.loss));
                    void this.data.sync(keys);
                };
                Schema.prototype.rebuild = function () {
                    void this.close();
                    void this.build();
                };
                Schema.prototype.close = function () {
                    void this.cancellation_.cancel();
                    this.cancellation_ = new spica_1.Cancellation();
                };
                return Schema;
            }();
        },
        {
            '../../../../lib/noop': 30,
            '../../../infrastructure/indexeddb/api': 22,
            './channel/access': 15,
            './channel/data': 16,
            './channel/expiry': 17,
            'spica': undefined
        }
    ],
    15: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var store_1 = require('../../../../data/kvs/store');
            var store_2 = require('../../../../data/es/store');
            exports.name = 'access';
            var AccessStoreSchema;
            (function (AccessStoreSchema) {
                AccessStoreSchema.key = 'key';
                AccessStoreSchema.date = 'date';
            }(AccessStoreSchema || (AccessStoreSchema = {})));
            var AccessStore = function (_super) {
                __extends(AccessStore, _super);
                function AccessStore(database, access) {
                    var _this = _super.call(this, database, exports.name, AccessStoreSchema.key) || this;
                    void Object.freeze(_this);
                    void access.monitor([], function (_a) {
                        var key = _a.key, type = _a.type;
                        return type === store_2.EventStore.EventType.delete ? void _this.delete(key) : void _this.set(key, new AccessRecord(key, Date.now()));
                    });
                    return _this;
                }
                AccessStore.configure = function () {
                    return {
                        make: function (tx) {
                            var store = tx.db.objectStoreNames.contains(exports.name) ? tx.objectStore(exports.name) : tx.db.createObjectStore(exports.name, {
                                keyPath: AccessStoreSchema.key,
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains(AccessStoreSchema.key)) {
                                void store.createIndex(AccessStoreSchema.key, AccessStoreSchema.key, { unique: true });
                            }
                            if (!store.indexNames.contains(AccessStoreSchema.date)) {
                                void store.createIndex(AccessStoreSchema.date, AccessStoreSchema.date);
                            }
                            return true;
                        },
                        verify: function (db) {
                            return db.objectStoreNames.contains(exports.name) && db.transaction(exports.name).objectStore(exports.name).indexNames.contains(AccessStoreSchema.key) && db.transaction(exports.name).objectStore(exports.name).indexNames.contains(AccessStoreSchema.date);
                        },
                        destroy: function () {
                            return true;
                        }
                    };
                };
                AccessStore.prototype.recent = function (limit, cb) {
                    var keys = [];
                    return void this.cursor(null, AccessStoreSchema.date, 'prev', 'readonly', function (cursor, err) {
                        if (!cursor)
                            return void cb(keys, err);
                        if (--limit < 0)
                            return;
                        void keys.push(cursor.primaryKey);
                        void cursor.continue();
                    });
                };
                return AccessStore;
            }(store_1.KeyValueStore);
            exports.AccessStore = AccessStore;
            var AccessRecord = function () {
                function AccessRecord(key, date) {
                    this.key = key;
                    this.date = date;
                }
                return AccessRecord;
            }();
        },
        {
            '../../../../data/es/store': 8,
            '../../../../data/kvs/store': 9
        }
    ],
    16: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var store_1 = require('../../../../data/es/store');
            exports.name = 'data';
            var DataStore = function (_super) {
                __extends(DataStore, _super);
                function DataStore(database, attrs) {
                    var _this = _super.call(this, database, exports.name, attrs) || this;
                    void Object.freeze(_this);
                    return _this;
                }
                DataStore.configure = function () {
                    return store_1.EventStore.configure(exports.name);
                };
                return DataStore;
            }(store_1.EventStore);
            exports.DataStore = DataStore;
            (function (DataStore) {
                DataStore.Event = store_1.EventStore.Event;
                DataStore.EventType = store_1.EventStore.EventType;
                DataStore.Record = store_1.EventStore.Record;
                DataStore.Value = store_1.EventStore.Value;
            }(DataStore = exports.DataStore || (exports.DataStore = {})));
            exports.DataStore = DataStore;
        },
        { '../../../../data/es/store': 8 }
    ],
    17: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var store_1 = require('../../../../data/kvs/store');
            var store_2 = require('../../../../data/es/store');
            var name = 'expiry';
            var ExpiryStoreSchema;
            (function (ExpiryStoreSchema) {
                ExpiryStoreSchema.key = 'key';
                ExpiryStoreSchema.expiry = 'expiry';
            }(ExpiryStoreSchema || (ExpiryStoreSchema = {})));
            var ExpiryStore = function (_super) {
                __extends(ExpiryStore, _super);
                function ExpiryStore(database, store, access, ages, cancellation) {
                    var _this = _super.call(this, database, name, ExpiryStoreSchema.key) || this;
                    void Object.freeze(_this);
                    var timer = 0;
                    var scheduled = Infinity;
                    var schedule = function (date) {
                        if (scheduled < date)
                            return;
                        void clearTimeout(timer);
                        scheduled = date;
                        timer = setTimeout(function () {
                            scheduled = Infinity;
                            void _this.cursor(null, ExpiryStoreSchema.expiry, 'next', 'readonly', function (cursor) {
                                if (!cursor)
                                    return;
                                var record = cursor.value;
                                if (record.expiry > Date.now() && isFinite(record.expiry))
                                    return void schedule(record.expiry);
                                void store.delete(record.key);
                                return void cursor.continue();
                            });
                        }, date - Date.now());
                    };
                    void cancellation.register(function () {
                        return void clearTimeout(timer);
                    });
                    void schedule(Date.now());
                    void access.monitor([], function (_a) {
                        var key = _a.key, type = _a.type;
                        switch (type) {
                        case store_2.EventStore.EventType.delete:
                            return void _this.delete(key);
                        default:
                            if (!ages.has(key))
                                return;
                            var expiry = Date.now() + ages.get(key);
                            void _this.set(key, new ExpiryRecord(key, expiry));
                            return void schedule(expiry);
                        }
                    });
                    return _this;
                }
                ExpiryStore.configure = function () {
                    return {
                        make: function (tx) {
                            var store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: ExpiryStoreSchema.key,
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains(ExpiryStoreSchema.key)) {
                                void store.createIndex(ExpiryStoreSchema.key, ExpiryStoreSchema.key, { unique: true });
                            }
                            if (!store.indexNames.contains(ExpiryStoreSchema.expiry)) {
                                void store.createIndex(ExpiryStoreSchema.expiry, ExpiryStoreSchema.expiry);
                            }
                            return true;
                        },
                        verify: function (db) {
                            return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains(ExpiryStoreSchema.key) && db.transaction(name).objectStore(name).indexNames.contains(ExpiryStoreSchema.expiry);
                        },
                        destroy: function () {
                            return true;
                        }
                    };
                };
                return ExpiryStore;
            }(store_1.KeyValueStore);
            exports.ExpiryStore = ExpiryStore;
            var ExpiryRecord = function () {
                function ExpiryRecord(key, expiry) {
                    this.key = key;
                    this.expiry = expiry;
                }
                return ExpiryRecord;
            }();
        },
        {
            '../../../../data/es/store': 8,
            '../../../../data/kvs/store': 9
        }
    ],
    18: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var api_1 = require('../../dao/api');
            var channel_1 = require('../model/channel');
            var api_2 = require('../../webstorage/api');
            var api_3 = require('../../broadcast/api');
            var StoreChannel = function (_super) {
                __extends(StoreChannel, _super);
                function StoreChannel(name, factory, migrate, destroy, size, expiry) {
                    if (migrate === void 0) {
                        migrate = function () {
                            return void 0;
                        };
                    }
                    if (destroy === void 0) {
                        destroy = function () {
                            return true;
                        };
                    }
                    if (size === void 0) {
                        size = Infinity;
                    }
                    if (expiry === void 0) {
                        expiry = Infinity;
                    }
                    var _this = _super.call(this, name, Object.keys(factory()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(factory())), destroy, size, expiry) || this;
                    _this.factory = factory;
                    _this.broadcast = new api_3.BroadcastChannel(_this.name);
                    _this.links = new Map();
                    _this.sources = new Map();
                    var attrs = Object.keys(_this.factory()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(_this.factory()));
                    void _this.broadcast.listen(function (ev) {
                        return void _this.fetch(ev instanceof MessageEvent ? ev.data : ev.newValue);
                    });
                    void _this.events_.save.monitor([], function (_a) {
                        var key = _a.key;
                        return void _this.broadcast.post(key);
                    });
                    void _this.events_.load.monitor([], function (_a) {
                        var key = _a.key, attr = _a.attr, type = _a.type;
                        var source = _this.sources.get(key);
                        var memory = _this.get(key);
                        var link = _this.link(key);
                        if (!source)
                            return;
                        switch (type) {
                        case channel_1.ChannelStore.EventType.put:
                            return void update(attrs.filter(function (a) {
                                return a === attr;
                            }), source, memory, link);
                        case channel_1.ChannelStore.EventType.delete:
                        case channel_1.ChannelStore.EventType.snapshot:
                            return void update(attrs, source, memory, link);
                        }
                        return;
                        function update(attrs, source, memory, link) {
                            var changes = attrs.filter(function (attr) {
                                return attr in memory;
                            }).map(function (attr) {
                                var newVal = memory[attr];
                                var oldVal = source[attr];
                                source[attr] = newVal;
                                return {
                                    attr: attr,
                                    newVal: newVal,
                                    oldVal: oldVal
                                };
                            }).filter(function (_a) {
                                var newVal = _a.newVal, oldVal = _a.oldVal;
                                return newVal !== oldVal || !(Number.isNaN(newVal) && Number.isNaN(oldVal));
                            });
                            if (changes.length === 0)
                                return;
                            void migrate(link);
                            void changes.forEach(function (_a) {
                                var attr = _a.attr, oldVal = _a.oldVal;
                                return void cast(source).__event.emit([
                                    api_2.StorageChannel.EventType.recv,
                                    attr
                                ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.recv, attr, memory[attr], oldVal));
                            });
                        }
                    });
                    void Object.freeze(_this);
                    return _this;
                }
                StoreChannel.prototype.link = function (key, expiry) {
                    var _this = this;
                    void this.expire(key, expiry);
                    return this.links.has(key) ? this.links.get(key) : this.links.set(key, api_1.build(Object.defineProperties(this.sources.set(key, this.get(key)).get(key), {
                        __meta: {
                            get: function () {
                                return _this.meta(key);
                            }
                        },
                        __id: {
                            get: function () {
                                return _this.meta(key).id;
                            }
                        },
                        __key: {
                            get: function () {
                                return _this.meta(key).key;
                            }
                        },
                        __date: {
                            get: function () {
                                return _this.meta(key).date;
                            }
                        },
                        __event: { value: new spica_1.Observation() },
                        __transaction: {
                            value: function (cb, complete) {
                                return _this.transaction(key, cb, complete);
                            }
                        }
                    }), this.factory, function (attr, newValue, oldValue) {
                        return void _this.add(new channel_1.ChannelStore.Record(key, (_a = {}, _a[attr] = newValue, _a))), void cast(_this.sources.get(key)).__event.emit([
                            api_2.StorageChannel.EventType.send,
                            attr
                        ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.send, attr, newValue, oldValue));
                        var _a;
                    })).get(key);
                };
                StoreChannel.prototype.destroy = function () {
                    void this.broadcast.close();
                    void _super.prototype.destroy.call(this);
                };
                return StoreChannel;
            }(channel_1.ChannelStore);
            exports.StoreChannel = StoreChannel;
            function cast(source) {
                return source;
            }
        },
        {
            '../../broadcast/api': 10,
            '../../dao/api': 11,
            '../../webstorage/api': 19,
            '../model/channel': 14,
            'spica': undefined
        }
    ],
    19: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var channel_1 = require('./service/channel');
            exports.StorageChannel = channel_1.StorageChannel;
            var api_1 = require('../../infrastructure/webstorage/api');
            exports.localStorage = api_1.localStorage;
            exports.sessionStorage = api_1.sessionStorage;
        },
        {
            '../../infrastructure/webstorage/api': 26,
            './service/channel': 21
        }
    ],
    20: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var Storage = function () {
                function Storage() {
                    this.store = new Map();
                }
                Object.defineProperty(Storage.prototype, 'length', {
                    get: function () {
                        return this.store.size;
                    },
                    enumerable: true,
                    configurable: true
                });
                Storage.prototype.getItem = function (key) {
                    return this.store.has(key) ? this.store.get(key) : null;
                };
                Storage.prototype.setItem = function (key, data) {
                    void this.store.set(key, data);
                };
                Storage.prototype.removeItem = function (key) {
                    void this.store.delete(key);
                };
                Storage.prototype.clear = function () {
                    void this.store.clear();
                };
                return Storage;
            }();
            exports.fakeStorage = new Storage();
        },
        {}
    ],
    21: [
        function (require, module, exports) {
            'use strict';
            var __assign = this && this.__assign || Object.assign || function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
                }
                return t;
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var api_1 = require('../../dao/api');
            var api_2 = require('../../../infrastructure/webstorage/api');
            var storage_1 = require('../model/storage');
            var cache = new Map();
            var StorageChannel = function () {
                function StorageChannel(name, storage, factory, migrate, log) {
                    if (storage === void 0) {
                        storage = api_2.sessionStorage || storage_1.fakeStorage;
                    }
                    if (migrate === void 0) {
                        migrate = function () {
                            return void 0;
                        };
                    }
                    if (log === void 0) {
                        log = {
                            update: function (_name) {
                            },
                            delete: function (_name) {
                            }
                        };
                    }
                    var _this = this;
                    this.name = name;
                    this.storage = storage;
                    this.factory = factory;
                    this.log = log;
                    this.cancellation = new spica_1.Cancellation();
                    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
                    this.events = Object.freeze({
                        send: new spica_1.Observation(),
                        recv: new spica_1.Observation()
                    });
                    if (cache.has(name))
                        throw new Error('ClientChannel: WebStorage: Specified channel ' + name + ' is already created.');
                    void cache.set(name, this);
                    void this.cancellation.register(function () {
                        return void cache.delete(name);
                    });
                    var source = __assign((_a = {}, _a[api_1.SCHEMA.KEY.NAME] = this.name, _a[api_1.SCHEMA.EVENT.NAME] = new spica_1.Observation(), _a), parse(this.storage.getItem(this.name)));
                    this.link_ = api_1.build(source, this.factory, function (attr, newValue, oldValue) {
                        void _this.log.update(_this.name);
                        void _this.storage.setItem(_this.name, JSON.stringify(Object.keys(source).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(source)).reduce(function (acc, attr) {
                            acc[attr] = source[attr];
                            return acc;
                        }, {})));
                        var event = new StorageChannel.Event(StorageChannel.EventType.send, attr, newValue, oldValue);
                        void source.__event.emit([
                            event.type,
                            event.attr
                        ], event);
                        void _this.events.send.emit([event.attr], event);
                    });
                    void migrate(this.link_);
                    void this.cancellation.register(api_2.eventstream.on([
                        this.mode,
                        this.name
                    ], function (_a) {
                        var newValue = _a.newValue;
                        var item = parse(newValue);
                        void Object.keys(item).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(item)).reduce(function (_, attr) {
                            var oldVal = source[attr];
                            var newVal = item[attr];
                            if (newVal === oldVal || Number.isNaN(newVal) && Number.isNaN(oldVal))
                                return;
                            source[attr] = newVal;
                            void migrate(_this.link_);
                            var event = new StorageChannel.Event(StorageChannel.EventType.recv, attr, source[attr], oldVal);
                            void source.__event.emit([
                                event.type,
                                event.attr
                            ], event);
                            void _this.events.recv.emit([event.attr], event);
                        }, void 0);
                    }));
                    void this.log.update(this.name);
                    void this.cancellation.register(function () {
                        return void _this.log.delete(_this.name);
                    });
                    void this.cancellation.register(function () {
                        return void _this.storage.removeItem(_this.name);
                    });
                    void Object.freeze(this);
                    var _a;
                }
                StorageChannel.prototype.link = function () {
                    return this.link_;
                };
                StorageChannel.prototype.destroy = function () {
                    void this.cancellation.cancel();
                };
                return StorageChannel;
            }();
            exports.StorageChannel = StorageChannel;
            (function (StorageChannel) {
                var Event = function () {
                    function Event(type, attr, newValue, oldValue) {
                        this.type = type;
                        this.attr = attr;
                        this.newValue = newValue;
                        this.oldValue = oldValue;
                        void Object.freeze(this);
                    }
                    return Event;
                }();
                StorageChannel.Event = Event;
                var EventType;
                (function (EventType) {
                    EventType.send = 'send';
                    EventType.recv = 'recv';
                }(EventType = StorageChannel.EventType || (StorageChannel.EventType = {})));
            }(StorageChannel = exports.StorageChannel || (exports.StorageChannel = {})));
            exports.StorageChannel = StorageChannel;
            function parse(item) {
                try {
                    return JSON.parse(item || '{}') || {};
                } catch (_) {
                    return {};
                }
            }
        },
        {
            '../../../infrastructure/webstorage/api': 26,
            '../../dao/api': 11,
            '../model/storage': 20,
            'spica': undefined
        }
    ],
    22: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var global_1 = require('./module/global');
            exports.indexedDB = global_1.indexedDB;
            exports.IDBKeyRange = global_1.IDBKeyRange;
            var access_1 = require('./model/access');
            exports.open = access_1.open;
            exports.listen = access_1.listen;
            exports.close = access_1.close;
            exports.destroy = access_1.destroy;
            exports.event = access_1.event;
            var event_1 = require('./model/event');
            exports.IDBEvent = event_1.IDBEvent;
            exports.IDBEventType = event_1.IDBEventType;
        },
        {
            './model/access': 23,
            './model/event': 24,
            './module/global': 25
        }
    ],
    23: [
        function (require, module, exports) {
            'use strict';
            var __extends = this && this.__extends || function () {
                var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
                    d.__proto__ = b;
                } || function (d, b) {
                    for (var p in b)
                        if (b.hasOwnProperty(p))
                            d[p] = b[p];
                };
                return function (d, b) {
                    extendStatics(d, b);
                    function __() {
                        this.constructor = d;
                    }
                    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
                };
            }();
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var global_1 = require('../module/global');
            var event_1 = require('./event');
            var IDBEventObserver = new spica_1.Observation();
            exports.event = IDBEventObserver;
            var configs = new Map();
            var commands = new Map();
            var Command;
            (function (Command) {
                Command[Command['open'] = 0] = 'open';
                Command[Command['close'] = 1] = 'close';
                Command[Command['destroy'] = 2] = 'destroy';
            }(Command || (Command = {})));
            var states = new Map();
            var State;
            (function (State_1) {
                var State = function () {
                    function State(database) {
                        this.database = database;
                        if (states.has(database)) {
                            var state = states.get(database);
                            if (Object.isFrozen(state))
                                throw new TypeError('ClientChannel: Split mutation: ' + state + ' => ' + this + '.');
                            void Object.freeze(state);
                        }
                    }
                    return State;
                }();
                var Initial = function (_super) {
                    __extends(Initial, _super);
                    function Initial(database) {
                        var _this = _super.call(this, database) || this;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Initial;
                }(State);
                State_1.Initial = Initial;
                var Block = function (_super) {
                    __extends(Block, _super);
                    function Block(database, session) {
                        var _this = _super.call(this, database) || this;
                        _this.session = session;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Block;
                }(State);
                State_1.Block = Block;
                var Upgrade = function (_super) {
                    __extends(Upgrade, _super);
                    function Upgrade(database, session) {
                        var _this = _super.call(this, database) || this;
                        _this.session = session;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Upgrade;
                }(State);
                State_1.Upgrade = Upgrade;
                var Success = function (_super) {
                    __extends(Success, _super);
                    function Success(database, connection) {
                        var _this = _super.call(this, database) || this;
                        _this.connection = connection;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Success;
                }(State);
                State_1.Success = Success;
                var Error = function (_super) {
                    __extends(Error, _super);
                    function Error(database, error, event) {
                        var _this = _super.call(this, database) || this;
                        _this.error = error;
                        _this.event = event;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Error;
                }(State);
                State_1.Error = Error;
                var Abort = function (_super) {
                    __extends(Abort, _super);
                    function Abort(database, error, event) {
                        var _this = _super.call(this, database) || this;
                        _this.error = error;
                        _this.event = event;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Abort;
                }(State);
                State_1.Abort = Abort;
                var Crash = function (_super) {
                    __extends(Crash, _super);
                    function Crash(database, error) {
                        var _this = _super.call(this, database) || this;
                        _this.error = error;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Crash;
                }(State);
                State_1.Crash = Crash;
                var Destroy = function (_super) {
                    __extends(Destroy, _super);
                    function Destroy(database) {
                        var _this = _super.call(this, database) || this;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return Destroy;
                }(State);
                State_1.Destroy = Destroy;
                var End = function (_super) {
                    __extends(End, _super);
                    function End(database) {
                        var _this = _super.call(this, database) || this;
                        _this.STATE;
                        void states.set(database, _this);
                        return _this;
                    }
                    return End;
                }(State);
                State_1.End = End;
            }(State || (State = {})));
            var requests = new Map();
            function open(name, config) {
                void commands.set(name, 0);
                void configs.set(name, config);
                if (states.has(name))
                    return;
                void handleFromInitialState(new State.Initial(name));
            }
            exports.open = open;
            function listen(name) {
                return function (req) {
                    var queue = requests.get(name) || requests.set(name, []).get(name);
                    void queue.push(req);
                    if (!states.has(name))
                        return;
                    var state = states.get(name);
                    if (state instanceof State.Success) {
                        void state.drain();
                    }
                };
            }
            exports.listen = listen;
            function close(name) {
                void commands.set(name, 1);
                void configs.set(name, {
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
                if (!states.has(name))
                    return void handleFromInitialState(new State.Initial(name));
                var state = states.get(name);
                if (state instanceof State.Success) {
                    state.end();
                }
            }
            exports.close = close;
            function destroy(name) {
                void commands.set(name, 2);
                void configs.set(name, {
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
                if (!states.has(name))
                    return void handleFromInitialState(new State.Initial(name));
                var state = states.get(name);
                if (state instanceof State.Success) {
                    state.destroy();
                }
            }
            exports.destroy = destroy;
            function handleFromInitialState(_a, version) {
                var database = _a.database;
                if (version === void 0) {
                    version = 0;
                }
                var config = configs.get(database);
                try {
                    var openRequest_1 = version ? global_1.indexedDB.open(database, version) : global_1.indexedDB.open(database);
                    var clear_1 = function () {
                        return openRequest_1.onblocked = void 0, openRequest_1.onupgradeneeded = void 0, openRequest_1.onsuccess = void 0, openRequest_1.onerror = void 0;
                    };
                    openRequest_1.onblocked = function () {
                        return void clear_1(), void handleFromBlockedState(new State.Block(database, openRequest_1));
                    };
                    openRequest_1.onupgradeneeded = function () {
                        return void clear_1(), void handleFromUpgradeState(new State.Upgrade(database, openRequest_1));
                    };
                    openRequest_1.onsuccess = function () {
                        return void clear_1(), void handleFromSuccessState(new State.Success(database, openRequest_1.result));
                    };
                    openRequest_1.onerror = function (event) {
                        return void clear_1(), void handleFromErrorState(new State.Error(database, openRequest_1.error, event));
                    };
                } catch (err) {
                    void handleFromCrashState(new State.Crash(database, err));
                }
                return;
                function handleFromBlockedState(_a) {
                    var database = _a.database, session = _a.session;
                    var clear = function () {
                        return session.onblocked = void 0, session.onupgradeneeded = void 0, session.onsuccess = void 0, session.onerror = void 0;
                    };
                    session.onblocked = function () {
                        return void clear(), void handleFromBlockedState(new State.Block(database, session));
                    };
                    session.onupgradeneeded = function () {
                        return void clear(), void handleFromUpgradeState(new State.Upgrade(database, session));
                    };
                    session.onsuccess = function () {
                        return void clear(), void handleFromSuccessState(new State.Success(database, session.result));
                    };
                    session.onerror = function (event) {
                        return void clear(), void handleFromErrorState(new State.Error(database, session.error, event));
                    };
                    void IDBEventObserver.emit([
                        database,
                        event_1.IDBEventType.block
                    ], new event_1.IDBEvent(event_1.IDBEventType.block, database));
                }
                function handleFromUpgradeState(_a) {
                    var database = _a.database, session = _a.session;
                    var db = session.transaction.db;
                    var _b = configs.get(database), make = _b.make, destroy = _b.destroy;
                    try {
                        if (make(session.transaction)) {
                            session.onsuccess = function () {
                                return void handleFromSuccessState(new State.Success(database, db));
                            };
                            session.onerror = function (event) {
                                return void handleFromErrorState(new State.Error(database, session.error, event));
                            };
                        } else {
                            session.onsuccess = session.onerror = function (event) {
                                return void db.close(), destroy(session.error, event) ? void handleFromDestroyState(new State.Destroy(database)) : void handleFromEndState(new State.End(database));
                            };
                        }
                    } catch (err) {
                        void handleFromCrashState(new State.Crash(database, err));
                    }
                }
                function handleFromSuccessState(state) {
                    var database = state.database, connection = state.connection;
                    var closed = false;
                    var close = function () {
                        return void connection.close(), closed = true, connection.onversionchange = void 0, connection.onerror = void 0, connection.onabort = void 0, connection.onclose = void 0, state.drain = function () {
                            return void 0;
                        }, state.destroy = function () {
                            return void 0;
                        }, state.end = function () {
                            return void 0;
                        };
                    };
                    connection.onversionchange = function (_a) {
                        var newVersion = _a.newVersion;
                        void close();
                        void requests.delete(database);
                        void IDBEventObserver.emit([
                            database,
                            event_1.IDBEventType.destroy
                        ], new event_1.IDBEvent(event_1.IDBEventType.destroy, database));
                        if (states.get(database) !== state)
                            return;
                        void handleFromEndState(new State.End(database));
                    };
                    connection.onerror = function (event) {
                        return void close(), void handleFromErrorState(new State.Error(database, event.target.error, event));
                    };
                    connection.onabort = function (event) {
                        return void close(), void handleFromAbortState(new State.Abort(database, event.target.error, event));
                    };
                    connection.onclose = function () {
                        return void close(), void handleFromEndState(new State.End(database));
                    };
                    state.destroy = function () {
                        return void close(), void handleFromDestroyState(new State.Destroy(database));
                    };
                    state.end = function () {
                        return void close(), void handleFromEndState(new State.End(database));
                    };
                    state.drain = function () {
                        var reqs = requests.get(database) || [];
                        try {
                            while (reqs.length > 0 && !closed) {
                                void reqs.shift()(connection);
                            }
                        } catch (err) {
                            void new Promise(function (_, reject) {
                                return void reject(err);
                            });
                            void close();
                            if (states.get(database) !== state)
                                return;
                            void handleFromCrashState(new State.Crash(database, err));
                        }
                    };
                    switch (commands.get(database)) {
                    case 0: {
                            var verify = configs.get(database).verify;
                            VERIFY: {
                                try {
                                    if (verify(connection))
                                        break VERIFY;
                                    void close();
                                    return void handleFromEndState(new State.End(database), connection.version + 1);
                                } catch (err) {
                                    void close();
                                    return void handleFromCrashState(new State.Crash(database, err));
                                }
                            }
                            void IDBEventObserver.emit([
                                database,
                                event_1.IDBEventType.connect
                            ], new event_1.IDBEvent(event_1.IDBEventType.connect, database));
                            return void state.drain();
                        }
                    case 1:
                        return void state.end();
                    case 2:
                        return void state.destroy();
                    }
                    throw new TypeError('ClientChannel: Invalid command ' + commands.get(database) + '.');
                }
                function handleFromErrorState(_a) {
                    var database = _a.database, error = _a.error, event = _a.event;
                    void event.preventDefault();
                    void IDBEventObserver.emit([
                        database,
                        event_1.IDBEventType.error
                    ], new event_1.IDBEvent(event_1.IDBEventType.error, database));
                    var destroy = configs.get(database).destroy;
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
                        event_1.IDBEventType.abort
                    ], new event_1.IDBEvent(event_1.IDBEventType.abort, database));
                    var destroy = configs.get(database).destroy;
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
                        event_1.IDBEventType.crash
                    ], new event_1.IDBEvent(event_1.IDBEventType.crash, database));
                    var destroy = configs.get(database).destroy;
                    if (destroy(error, null)) {
                        return void handleFromDestroyState(new State.Destroy(database));
                    } else {
                        return void handleFromEndState(new State.End(database));
                    }
                }
                function handleFromDestroyState(_a) {
                    var database = _a.database;
                    var deleteRequest = global_1.indexedDB.deleteDatabase(database);
                    deleteRequest.onsuccess = function () {
                        return void requests.delete(database), void IDBEventObserver.emit([
                            database,
                            event_1.IDBEventType.destroy
                        ], new event_1.IDBEvent(event_1.IDBEventType.destroy, database)), void handleFromEndState(new State.End(database));
                    };
                    deleteRequest.onerror = function (event) {
                        return void handleFromErrorState(new State.Error(database, deleteRequest.error, event));
                    };
                }
                function handleFromEndState(_a, version) {
                    var database = _a.database;
                    if (version === void 0) {
                        version = 0;
                    }
                    void states.delete(database);
                    switch (commands.get(database)) {
                    case 0:
                        return void IDBEventObserver.emit([
                            database,
                            event_1.IDBEventType.disconnect
                        ], new event_1.IDBEvent(event_1.IDBEventType.disconnect, database)), states.has(database) ? void 0 : void handleFromInitialState(new State.Initial(database), version);
                    case 1:
                        return void commands.delete(database), void configs.delete(database), void IDBEventObserver.emit([
                            database,
                            event_1.IDBEventType.disconnect
                        ], new event_1.IDBEvent(event_1.IDBEventType.disconnect, database));
                    case 2:
                        return void commands.delete(database), void configs.delete(database), void requests.delete(database), void IDBEventObserver.emit([
                            database,
                            event_1.IDBEventType.disconnect
                        ], new event_1.IDBEvent(event_1.IDBEventType.disconnect, database));
                    }
                    throw new TypeError('ClientChannel: Invalid command ' + commands.get(database) + '.');
                }
            }
        },
        {
            '../module/global': 25,
            './event': 24,
            'spica': undefined
        }
    ],
    24: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
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
        },
        {}
    ],
    25: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.indexedDB = self.indexedDB;
            exports.IDBKeyRange = self.IDBKeyRange;
        },
        {}
    ],
    26: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var global_1 = require('./module/global');
            exports.localStorage = global_1.localStorage;
            exports.sessionStorage = global_1.sessionStorage;
            var event_1 = require('./model/event');
            exports.eventstream = event_1.eventstream;
            exports.eventstream_ = event_1.eventstream_;
        },
        {
            './model/event': 27,
            './module/global': 28
        }
    ],
    27: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var global_1 = require('../module/global');
            var storageEventStream = new spica_1.Observation();
            exports.eventstream = storageEventStream;
            exports.eventstream_ = storageEventStream;
            void self.addEventListener('storage', function (event) {
                switch (event.storageArea) {
                case global_1.localStorage:
                    return void storageEventStream.emit(typeof event.key === 'string' ? [
                        'local',
                        event.key
                    ] : ['local'], event);
                case global_1.sessionStorage:
                    return void storageEventStream.emit(typeof event.key === 'string' ? [
                        'session',
                        event.key
                    ] : ['session'], event);
                default:
                    return;
                }
            });
        },
        {
            '../module/global': 28,
            'spica': undefined
        }
    ],
    28: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var spica_1 = require('spica');
            var supportsWebStorage = function () {
                try {
                    if (!self.navigator.cookieEnabled)
                        throw void 0;
                    var key = 'clientchannel#' + spica_1.uuid();
                    void self.sessionStorage.setItem(key, key);
                    if (key !== self.sessionStorage.getItem(key))
                        throw void 0;
                    void self.sessionStorage.removeItem(key);
                    return true;
                } catch (_) {
                    return false;
                }
            }();
            exports.localStorage = supportsWebStorage ? self.localStorage : void 0;
            exports.sessionStorage = supportsWebStorage ? self.sessionStorage : void 0;
        },
        { 'spica': undefined }
    ],
    29: [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            __export(require('../application/api'));
        },
        { '../application/api': 4 }
    ],
    30: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function noop() {
                ;
            }
            exports.noop = noop;
        },
        {}
    ],
    'clientchannel': [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            __export(require('./src/export'));
            var export_1 = require('./src/export');
            exports.default = export_1.default;
        },
        { './src/export': 3 }
    ]
}, {}, [
    1,
    2,
    'clientchannel'
]);