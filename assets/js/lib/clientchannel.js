/*! clientchannel v0.29.7 https://github.com/falsandtru/clientchannel | (c) 2016, falsandtru | (Apache-2.0 AND MPL-2.0) License */
require = function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = 'function' == typeof require && require;
                    if (!f && c)
                        return c(i, !0);
                    if (u)
                        return u(i, !0);
                    var a = new Error('Cannot find module \'' + i + '\'');
                    throw a.code = 'MODULE_NOT_FOUND', a;
                }
                var p = n[i] = { exports: {} };
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r);
                }, p, p.exports, r, e, n, t);
            }
            return n[i].exports;
        }
        for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++)
            o(t[i]);
        return o;
    }
    return r;
}()({
    1: [
        function (_dereq_, module, exports) {
        },
        {}
    ],
    2: [
        function (_dereq_, module, exports) {
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    3: [
        function (_dereq_, module, exports) {
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    4: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isArray = exports.ObjectValues = exports.ObjectSetPrototypeOf = exports.ObjectSeal = exports.ObjectPreventExtensions = exports.ObjectKeys = exports.isSealed = exports.isFrozen = exports.isExtensible = exports.ObjectIs = exports.ObjectGetPrototypeOf = exports.ObjectGetOwnPropertySymbols = exports.ObjectGetOwnPropertyNames = exports.ObjectGetOwnPropertyDescriptors = exports.ObjectGetOwnPropertyDescriptor = exports.ObjectFromEntries = exports.ObjectFreeze = exports.ObjectEntries = exports.ObjectDefineProperty = exports.ObjectDefineProperties = exports.ObjectCreate = exports.ObjectAssign = exports.toString = exports.isEnumerable = exports.isPrototypeOf = exports.hasOwnProperty = exports.SymbolKeyFor = exports.SymbolFor = exports.sign = exports.round = exports.random = exports.min = exports.max = exports.floor = exports.ceil = exports.abs = exports.parseInt = exports.parseFloat = exports.isSafeInteger = exports.isNaN = exports.isInteger = exports.isFinite = exports.NaN = void 0;
            exports.NaN = Number.NaN, exports.isFinite = Number.isFinite, exports.isInteger = Number.isInteger, exports.isNaN = Number.isNaN, exports.isSafeInteger = Number.isSafeInteger, exports.parseFloat = Number.parseFloat, exports.parseInt = Number.parseInt;
            exports.abs = Math.abs, exports.ceil = Math.ceil, exports.floor = Math.floor, exports.max = Math.max, exports.min = Math.min, exports.random = Math.random, exports.round = Math.round, exports.sign = Math.sign;
            exports.SymbolFor = Symbol.for;
            exports.SymbolKeyFor = Symbol.keyFor;
            exports.hasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
            exports.isPrototypeOf = Object.prototype.isPrototypeOf.call.bind(Object.prototype.isPrototypeOf);
            exports.isEnumerable = Object.prototype.propertyIsEnumerable.call.bind(Object.prototype.propertyIsEnumerable);
            exports.toString = Object.prototype.toString.call.bind(Object.prototype.toString);
            exports.ObjectAssign = Object.assign;
            exports.ObjectCreate = Object.create;
            exports.ObjectDefineProperties = Object.defineProperties;
            exports.ObjectDefineProperty = Object.defineProperty;
            exports.ObjectEntries = Object.entries;
            exports.ObjectFreeze = Object.freeze;
            exports.ObjectFromEntries = Object.fromEntries;
            exports.ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
            exports.ObjectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
            exports.ObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
            exports.ObjectGetOwnPropertySymbols = Object.getOwnPropertySymbols;
            exports.ObjectGetPrototypeOf = Object.getPrototypeOf;
            exports.ObjectIs = Object.is;
            exports.isExtensible = Object.isExtensible;
            exports.isFrozen = Object.isFrozen;
            exports.isSealed = Object.isSealed;
            exports.ObjectKeys = Object.keys;
            exports.ObjectPreventExtensions = Object.preventExtensions;
            exports.ObjectSeal = Object.seal;
            exports.ObjectSetPrototypeOf = Object.setPrototypeOf;
            exports.ObjectValues = Object.values;
            exports.isArray = Array.isArray;
        },
        {}
    ],
    5: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.join = exports.splice = exports.pop = exports.push = exports.shift = exports.unshift = exports.indexOf = void 0;
            const global_1 = _dereq_('./global');
            function indexOf(as, a) {
                if (as.length === 0)
                    return -1;
                return a === a ? as.indexOf(a) : as.findIndex(a => a !== a);
            }
            exports.indexOf = indexOf;
            function unshift(as, bs) {
                if ('length' in as) {
                    for (let i = as.length - 1; i >= 0; --i) {
                        bs.unshift(as[i]);
                    }
                } else {
                    bs.unshift(...as);
                }
                return bs;
            }
            exports.unshift = unshift;
            function shift(as, count) {
                if (count < 0)
                    throw new Error('Unexpected negative number');
                return count === void 0 ? [
                    as.shift(),
                    as
                ] : [
                    splice(as, 0, count),
                    as
                ];
            }
            exports.shift = shift;
            function push(as, bs) {
                if ('length' in bs) {
                    for (let i = 0, len = bs.length; i < len; ++i) {
                        as.push(bs[i]);
                    }
                } else {
                    for (const b of bs) {
                        as.push(b);
                    }
                }
                return as;
            }
            exports.push = push;
            function pop(as, count) {
                if (count < 0)
                    throw new Error('Unexpected negative number');
                return count === void 0 ? [
                    as,
                    as.pop()
                ] : [
                    as,
                    splice(as, as.length - count, count)
                ];
            }
            exports.pop = pop;
            function splice(as, index, count, ...inserts) {
                if (count === 0 && inserts.length === 0)
                    return [];
                count = count > as.length ? as.length : count;
                switch (index) {
                case 0:
                    switch (count) {
                    case 0:
                        return [
                            [],
                            unshift(inserts, as)
                        ][0];
                    case 1:
                        return as.length === 0 ? [
                            [],
                            unshift(inserts, as)
                        ][0] : [
                            [as.shift()],
                            unshift(inserts, as)
                        ][0];
                    case void 0:
                        if (as.length > 1 || arguments.length > 2)
                            break;
                        return as.length === 0 ? [] : splice(as, index, 1);
                    }
                    break;
                case -1:
                case as.length - 1:
                    switch (count) {
                    case 1:
                        return as.length === 0 ? [
                            [],
                            push(as, inserts)
                        ][0] : [
                            [as.pop()],
                            push(as, inserts)
                        ][0];
                    case void 0:
                        if (as.length > 1 || arguments.length > 2)
                            break;
                        return as.length === 0 ? [] : splice(as, index, 1);
                    }
                    break;
                case as.length:
                case global_1.Infinity:
                    return [
                        [],
                        push(as, inserts)
                    ][0];
                }
                return arguments.length > 2 ? as.splice(index, count, ...inserts) : as.splice(index);
            }
            exports.splice = splice;
            function join(as, sep = '') {
                let acc = '';
                for (let i = 0; i < as.length; ++i) {
                    acc += i === 0 ? as[i] : sep + as[i];
                }
                return acc;
            }
            exports.join = join;
        },
        { './global': 15 }
    ],
    6: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.template = exports.overwrite = exports.inherit = exports.merge = exports.extend = exports.clone = exports.assign = void 0;
            const type_1 = _dereq_('./type');
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const array_1 = _dereq_('./array');
            exports.assign = template((prop, target, source) => target[prop] = source[prop]);
            exports.clone = template((prop, target, source) => {
                switch (type_1.type(source[prop])) {
                case 'Array':
                    return target[prop] = source[prop].slice();
                case 'Object':
                    switch (type_1.type(target[prop])) {
                    case 'Object':
                        return target[prop] = exports.clone(empty(source[prop]), source[prop]);
                    default:
                        return target[prop] = source[prop];
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.extend = template((prop, target, source) => {
                switch (type_1.type(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    return target[prop] = source[prop];
                case 'Object':
                    switch (type_1.type(target[prop])) {
                    case 'Object':
                        return target[prop] = exports.extend(target[prop], source[prop]);
                    default:
                        return target[prop] = exports.extend(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.merge = template((prop, target, source) => {
                switch (type_1.type(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    switch (type_1.type(target[prop])) {
                    case 'Array':
                        return target[prop] = array_1.push(target[prop], source[prop]);
                    default:
                        return target[prop] = source[prop].slice();
                    }
                case 'Object':
                    switch (type_1.type(target[prop])) {
                    case 'Object':
                        return target[prop] = exports.merge(target[prop], source[prop]);
                    default:
                        return target[prop] = exports.merge(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.inherit = template((prop, target, source) => {
                switch (type_1.type(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    return target[prop] = source[prop].slice();
                case 'Object':
                    switch (type_1.type(target[prop])) {
                    case 'Object':
                        return target[prop] = alias_1.hasOwnProperty(target, prop) ? exports.inherit(target[prop], source[prop]) : exports.inherit(alias_1.ObjectCreate(target[prop]), source[prop]);
                    default:
                        return target[prop] = alias_1.ObjectCreate(source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.overwrite = template((prop, target, source) => {
                switch (type_1.type(source[prop])) {
                case 'Array':
                    return target[prop] = source[prop];
                case 'Object':
                    switch (type_1.type(target[prop])) {
                    case 'Object':
                        return target[prop] = exports.overwrite(target[prop], source[prop]);
                    default:
                        return target[prop] = exports.overwrite(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            function template(strategy) {
                return walk;
                function walk(target, ...sources) {
                    if (type_1.isPrimitive(target))
                        return target;
                    for (let i = 0; i < sources.length; ++i) {
                        const source = sources[i];
                        if (source === target)
                            continue;
                        if (type_1.isPrimitive(source))
                            continue;
                        const keys = alias_1.ObjectKeys(source);
                        for (let i = 0; i < keys.length; ++i) {
                            strategy(keys[i], target, source);
                        }
                    }
                    return target;
                }
            }
            exports.template = template;
            function empty(source) {
                switch (type_1.type(source)) {
                case 'Array':
                    return [];
                case 'Object':
                    return source instanceof global_1.Object ? {} : alias_1.ObjectCreate(null);
                default:
                    return source;
                }
            }
        },
        {
            './alias': 4,
            './array': 5,
            './global': 15,
            './type': 31
        }
    ],
    7: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Cache = void 0;
            const global_1 = _dereq_('./global');
            const assign_1 = _dereq_('./assign');
            const array_1 = _dereq_('./array');
            class Cache {
                constructor(capacity, opts = {}) {
                    this.capacity = capacity;
                    this.settings = {
                        capture: {
                            delete: true,
                            clear: true
                        }
                    };
                    this.nullish = false;
                    this.store = new global_1.Map();
                    this.indexes = {
                        LRU: [],
                        LFU: []
                    };
                    this.stats = {
                        LRU: [
                            0,
                            0
                        ],
                        LFU: [
                            0,
                            0
                        ],
                        miss: 0
                    };
                    this.ratio = 50;
                    if (capacity > 0 === false)
                        throw new Error(`Spica: Cache: Cache capacity must be greater than 0.`);
                    assign_1.extend(this.settings, opts);
                }
                put(key, value) {
                    value === void 0 ? this.nullish || (this.nullish = true) : void 0;
                    if (this.has(key))
                        return this.store.set(key, value), true;
                    const {LRU, LFU} = this.indexes;
                    if (this.size === this.capacity) {
                        let key;
                        if (LFU.length > this.capacity * this.ratio / 100 || LFU.length === this.capacity) {
                            key = LFU.pop();
                        } else {
                            key = LRU.pop();
                        }
                        if (this.settings.disposer) {
                            const val = this.store.get(key);
                            this.store.delete(key);
                            this.settings.disposer(key, val);
                        } else {
                            this.store.delete(key);
                        }
                    }
                    LRU.unshift(key);
                    this.store.set(key, value);
                    return false;
                }
                set(key, value) {
                    this.put(key, value);
                    return this;
                }
                get(key) {
                    const val = this.store.get(key);
                    if (val !== void 0 || this.nullish && this.has(key)) {
                        this.access(key);
                    } else {
                        ++this.stats.miss;
                        this.slide();
                    }
                    return val;
                }
                has(key) {
                    return this.store.has(key);
                }
                delete(key) {
                    if (!this.has(key))
                        return false;
                    const {LRU, LFU} = this.indexes;
                    for (const index of [
                            LFU,
                            LRU
                        ]) {
                        const i = array_1.indexOf(index, key);
                        if (i === -1)
                            continue;
                        if (!this.settings.disposer || !this.settings.capture.delete) {
                            this.store.delete(array_1.splice(index, i, 1)[0]);
                        } else {
                            const val = this.store.get(key);
                            this.store.delete(array_1.splice(index, i, 1)[0]);
                            this.settings.disposer(key, val);
                        }
                        return true;
                    }
                    return false;
                }
                clear() {
                    var _a;
                    this.nullish = false;
                    this.ratio = 50;
                    this.indexes = {
                        LRU: [],
                        LFU: []
                    };
                    this.stats = {
                        LRU: [
                            0,
                            0
                        ],
                        LFU: [
                            0,
                            0
                        ],
                        miss: 0
                    };
                    const store = this.store;
                    this.store = new global_1.Map();
                    if (!this.settings.disposer || !((_a = this.settings.capture) === null || _a === void 0 ? void 0 : _a.clear))
                        return;
                    for (const [key, value] of store) {
                        this.settings.disposer(key, value);
                    }
                }
                get size() {
                    return this.indexes.LRU.length + this.indexes.LFU.length;
                }
                [Symbol.iterator]() {
                    return this.store[Symbol.iterator]();
                }
                slide() {
                    const {LRU, LFU, miss} = this.stats;
                    const capacity = this.capacity;
                    const window = capacity;
                    const rateR = rate(window, LRU[0], LRU[0] + LFU[0], LRU[1], LRU[1] + LFU[1]);
                    const rateF = 100 - rateR;
                    const ratio = this.ratio;
                    const step = 1;
                    if (ratio < 90 && rateF > rateR * 1.2) {
                        this.ratio += step;
                    } else if (ratio > 50 && rateR > rateF * 1.2) {
                        this.ratio -= step;
                    } else if (ratio <= 50 && rateR > rateF * 1.5 && this.indexes.LRU.length > capacity / 100 * (100 - ratio) - 1) {
                        if (ratio > 10 && miss > capacity / 2) {
                            this.ratio = 50;
                        } else if (ratio > 10 && miss > 5 && this.indexes.LRU.length < miss * 5) {
                            this.ratio -= step;
                        } else if (ratio < 50) {
                            this.ratio += step;
                        }
                    }
                    if (LRU[0] + LFU[0] === window) {
                        this.stats = {
                            LRU: [
                                0,
                                LRU[0]
                            ],
                            LFU: [
                                0,
                                LFU[0]
                            ],
                            miss
                        };
                    }
                }
                access(key) {
                    const stats = this.stats;
                    const hit = false || this.accessLFU(key, stats) || this.accessLRU(key, stats);
                    stats.miss = 0;
                    this.slide();
                    return hit;
                }
                accessLRU(key, stats) {
                    const {LRU, LFU} = this.indexes;
                    const index = array_1.indexOf(LRU, key);
                    if (index === -1)
                        return false;
                    stats && ++stats.LRU[0];
                    if (index === 0)
                        return LFU.unshift(LRU.shift()), true;
                    [LRU[index - 1], LRU[index]] = [
                        LRU[index],
                        LRU[index - 1]
                    ];
                    return true;
                }
                accessLFU(key, stats) {
                    const {LFU} = this.indexes;
                    const index = array_1.indexOf(LFU, key);
                    if (index === -1)
                        return false;
                    stats && ++stats.LFU[0];
                    if (index === 0)
                        return true;
                    [LFU[index - 1], LFU[index]] = [
                        LFU[index],
                        LFU[index - 1]
                    ];
                    return true;
                }
            }
            exports.Cache = Cache;
            function rate(window, currHits, currTotal, prevHits, prevTotal) {
                const currRate = currHits * 100 / currTotal | 0;
                const currRatio = currTotal / window;
                const prevRate = prevHits * 100 / prevTotal | 0;
                const prevRatio = 1 - currRatio;
                return currRate * currRatio + prevRate * prevRatio | 0;
            }
        },
        {
            './array': 5,
            './assign': 6,
            './global': 15
        }
    ],
    8: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Cancellation = void 0;
            const global_1 = _dereq_('./global');
            const function_1 = _dereq_('./function');
            const noop_1 = _dereq_('./noop');
            const promise_1 = _dereq_('./promise');
            const exception_1 = _dereq_('./exception');
            const maybe_1 = _dereq_('./monad/maybe');
            const either_1 = _dereq_('./monad/either');
            const internal = Symbol.for('spica/cancellation::internal');
            class Cancellation extends promise_1.AtomicPromise {
                constructor(cancelees = []) {
                    super(res => resolve = res);
                    var resolve;
                    this[internal] = new Internal(resolve);
                    for (const cancellee of cancelees) {
                        cancellee.register(this.cancel);
                    }
                }
                get alive() {
                    return this[internal].alive;
                }
                get cancelled() {
                    return this[internal].cancelled;
                }
                get register() {
                    return listener => this[internal].register(listener);
                }
                get cancel() {
                    return reason => this[internal].cancel(reason);
                }
                get close() {
                    return reason => this[internal].close(reason);
                }
                get promise() {
                    return val => this[internal].promise(val);
                }
                get maybe() {
                    return val => this[internal].maybe(val);
                }
                get either() {
                    return val => this[internal].either(val);
                }
            }
            exports.Cancellation = Cancellation;
            class Internal {
                constructor(resolve) {
                    this.resolve = resolve;
                    this.alive = true;
                    this.available = true;
                    this.listeners = new global_1.Set();
                }
                get cancelled() {
                    return 'reason' in this;
                }
                register(listener) {
                    if (!this.alive) {
                        this.cancelled && handler(this.reason);
                        return noop_1.noop;
                    }
                    this.listeners.add(handler);
                    return function_1.once(() => void this.listeners.delete(handler));
                    function handler(reason) {
                        try {
                            listener(reason);
                        } catch (reason) {
                            exception_1.causeAsyncException(reason);
                        }
                    }
                }
                cancel(reason) {
                    if (!this.available)
                        return;
                    this.available = false;
                    this.reason = reason;
                    for (const listener of this.listeners) {
                        listener(reason);
                    }
                    this.resolve(this.reason);
                    this.alive = false;
                }
                close(reason) {
                    if (!this.available)
                        return;
                    this.available = false;
                    this.resolve(promise_1.AtomicPromise.reject(reason));
                    this.alive = false;
                }
                promise(val) {
                    return this.cancelled ? promise_1.AtomicPromise.reject(this.reason) : promise_1.AtomicPromise.resolve(val);
                }
                maybe(val) {
                    return maybe_1.Just(val).bind(val => this.cancelled ? maybe_1.Nothing : maybe_1.Just(val));
                }
                either(val) {
                    return either_1.Right(val).bind(val => this.cancelled ? either_1.Left(this.reason) : either_1.Right(val));
                }
            }
        },
        {
            './exception': 13,
            './function': 14,
            './global': 15,
            './monad/either': 19,
            './monad/maybe': 23,
            './noop': 26,
            './promise': 28
        }
    ],
    9: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.tick = void 0;
            const alias_1 = _dereq_('./alias');
            const exception_1 = _dereq_('./exception');
            let queue = [];
            let jobs = [];
            let index = 0;
            const scheduler = Promise.resolve();
            function tick(cb) {
                index === 0 && scheduler.then(run);
                index++ === queue.length ? queue.push(cb) : queue[index - 1] = cb;
            }
            exports.tick = tick;
            function run() {
                const count = index;
                [index, queue, jobs] = [
                    0,
                    jobs,
                    queue
                ];
                for (let i = 0; i < count; ++i) {
                    try {
                        jobs[i]();
                        jobs[i] = void 0;
                    } catch (reason) {
                        exception_1.causeAsyncException(reason);
                    }
                }
                jobs.length > 1000 && count < jobs.length * 0.5 && jobs.splice(alias_1.floor(jobs.length * 0.9), jobs.length);
            }
        },
        {
            './alias': 4,
            './exception': 13
        }
    ],
    10: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.never = exports.wait = exports.clock = exports.tick = void 0;
            const global_1 = _dereq_('./global');
            const promise_1 = _dereq_('./promise');
            var clock_tick_1 = _dereq_('./clock.tick');
            Object.defineProperty(exports, 'tick', {
                enumerable: true,
                get: function () {
                    return clock_tick_1.tick;
                }
            });
            exports.clock = Promise.resolve(undefined);
            function wait(ms) {
                return ms === 0 ? promise_1.AtomicPromise.resolve(exports.clock) : new promise_1.AtomicPromise(resolve => void global_1.setTimeout(resolve, ms));
            }
            exports.wait = wait;
            exports.never = new class Never extends promise_1.AtomicPromise {
                static get [Symbol.species]() {
                    return Never;
                }
                constructor() {
                    super(() => void 0);
                }
                then() {
                    return this;
                }
                catch() {
                    return this;
                }
                finally() {
                    return this;
                }
            }();
        },
        {
            './clock.tick': 9,
            './global': 15,
            './promise': 28
        }
    ],
    11: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.concat = void 0;
            const alias_1 = _dereq_('./alias');
            function concat(target, source) {
                if (alias_1.isArray(source)) {
                    for (let i = 0; i < source.length; ++i) {
                        void target.push(source[i]);
                    }
                } else {
                    void target.push(...source);
                }
                return target;
            }
            exports.concat = concat;
        },
        { './alias': 4 }
    ],
    12: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.uncurry = exports.curry = void 0;
            const array_1 = _dereq_('./array');
            exports.curry = f => curry_(f, f.length);
            function curry_(f, arity, ...xs) {
                let g;
                return xs.length < arity ? (...ys) => curry_(g !== null && g !== void 0 ? g : g = xs.length && f.bind(void 0, ...xs) || f, arity - xs.length, ...ys) : f(...xs);
            }
            const uncurry = f => uncurry_(f);
            exports.uncurry = uncurry;
            function uncurry_(f) {
                const arity = f.length;
                return (...xs) => arity === 0 || xs.length < 2 || xs.length <= arity ? f(...xs) : uncurry_(f(...array_1.shift(xs, arity)[0]))(...xs);
            }
        },
        { './array': 5 }
    ],
    13: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.causeAsyncException = void 0;
            function causeAsyncException(reason) {
                void Promise.reject(reason);
            }
            exports.causeAsyncException = causeAsyncException;
        },
        {}
    ],
    14: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.run = exports.once = exports.clear = exports.mapReturn = exports.mapParameters = void 0;
            const global_1 = _dereq_('./global');
            const noop_1 = _dereq_('./noop');
            function mapParameters(f, g) {
                return (...as) => f(...g(...as));
            }
            exports.mapParameters = mapParameters;
            function mapReturn(f, g) {
                return (...as) => g(f(...as));
            }
            exports.mapReturn = mapReturn;
            function clear(f) {
                return (...as) => void f(...as);
            }
            exports.clear = clear;
            function once(f) {
                return (...as) => {
                    if (f === noop_1.noop)
                        return;
                    f(...as);
                    f = noop_1.noop;
                    as = [];
                };
            }
            exports.once = once;
            function run(fs) {
                const gs = global_1.Array(fs.length);
                try {
                    for (let i = 0; i < fs.length; ++i) {
                        gs[i] = fs[i]();
                    }
                } catch (reason) {
                    for (let i = 0; gs[i]; ++i) {
                        gs[i]();
                    }
                    throw reason;
                }
                return once(() => {
                    for (let i = 0; gs[i]; ++i) {
                        gs[i]();
                    }
                });
            }
            exports.run = run;
        },
        {
            './global': 15,
            './noop': 26
        }
    ],
    15: [
        function (_dereq_, module, exports) {
            'use strict';
            const global = void 0 || typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || Function('return this')();
            eval('global.global = global');
            module.exports = global;
        },
        {}
    ],
    16: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.MList = exports.List = void 0;
            function List(...values) {
                let node = Nil();
                for (let i = values.length - 1; i >= 0; --i) {
                    node = node.add(values[i]);
                }
                return node;
            }
            exports.List = List;
            function Nil() {
                return new Cons(void 0, void 0);
            }
            class Cons {
                constructor(head, tail) {
                    this.head = head;
                    this.tail = tail;
                }
                append(value) {
                    return this.replaceWith(value, List()).tail;
                }
                add(value) {
                    return new Cons(value, this);
                }
                foldl(f, acc) {
                    for (let node = this; node.tail; node = node.tail) {
                        acc = f(acc, node.head);
                    }
                    return acc;
                }
                foldr(f, acc) {
                    for (let node = this.reverse(); node.tail; node = node.tail) {
                        acc = f(node.head, acc);
                    }
                    return acc;
                }
                map(f) {
                    const node = List();
                    this.foldl((acc, value) => acc.append(f(value)), node);
                    return node;
                }
                replaceWith(head, tail) {
                    this.head = head;
                    this.tail = tail;
                    return this;
                }
                reverse() {
                    return this.foldl((acc, value) => acc.add(value), List());
                }
                get length() {
                    return this.foldl(acc => acc + 1, 0);
                }
                *[Symbol.iterator]() {
                    for (let node = this; node.tail; node = node.tail) {
                        yield node.head;
                    }
                }
            }
            function MList(...values) {
                let node = MNil();
                for (let i = values.length - 1; i >= 0; --i) {
                    node = node.add(values[i]);
                }
                return node;
            }
            exports.MList = MList;
            function MNil() {
                return new MCons(void 0, void 0);
            }
            class MCons {
                constructor(head, tail) {
                    this.head = head;
                    this.tail = tail;
                }
                take(count) {
                    if (count === 0)
                        return MList();
                    let node = this;
                    for (let i = 0; i + 1 < count && node.tail; ++i, node = node.tail);
                    const tail = node.tail;
                    node.tail && node.replaceWith(node.head, MList());
                    const dels = new MCons(this.head, this.tail);
                    this.tail && this.replaceWith(tail === null || tail === void 0 ? void 0 : tail.head, tail === null || tail === void 0 ? void 0 : tail.tail);
                    return dels;
                }
                prepend(value) {
                    return this.replaceWith(value, new MCons(this.head, this.tail));
                }
                append(value) {
                    return this.replaceWith(value, MList()).tail;
                }
                replace(node, count, adds) {
                    const dels = node.take(count);
                    const {head, tail} = node;
                    if (adds === null || adds === void 0 ? void 0 : adds.tail) {
                        node.replaceWith(adds.head, adds.tail);
                        for (; node.tail; node = node.tail);
                    }
                    node.replaceWith(head, tail);
                    return dels;
                }
                splice(index, count = 0, adds) {
                    let node = this;
                    for (let i = 0; i < index && node.tail; ++i, node = node.tail);
                    return this.replace(node, count, adds);
                }
                interleave(find, count, adds) {
                    let node = this;
                    let index = 0;
                    for (;; ++index, node = node.tail) {
                        if (find(node.head, node.tail ? index : -1))
                            break;
                        if (!node.tail)
                            return;
                    }
                    return this.replace(node, count, adds);
                }
                convert(f) {
                    for (let node = this; node.tail; node = node.tail) {
                        node.replaceWith(f(node.head), node.tail);
                    }
                    return this;
                }
                clear() {
                    return this.replaceWith(void 0, void 0);
                }
                freeze() {
                    const first = List();
                    for (let last = first, tail = this; tail.tail; tail = tail.tail) {
                        last = last['append'](tail.head);
                    }
                    return first;
                }
                add(value) {
                    return new MCons(value, this);
                }
                foldl(f, acc) {
                    for (let node = this; node.tail; node = node.tail) {
                        acc = f(acc, node.head);
                    }
                    return acc;
                }
                foldr(f, acc) {
                    for (let node = this.reverse(); node.tail; node = node.tail) {
                        acc = f(node.head, acc);
                    }
                    return acc;
                }
                map(f) {
                    const node = MList();
                    this.foldl((acc, value) => acc.append(f(value)), node);
                    return node;
                }
                replaceWith(head, tail) {
                    this.head = head;
                    this.tail = tail;
                    return this;
                }
                reverse() {
                    if (!this.tail)
                        return this;
                    for (let prev = MList(), node = this, next;;) {
                        next = node.tail;
                        node.replaceWith(node.head, prev);
                        if (!next.tail)
                            return node;
                        prev = node;
                        node = next;
                    }
                }
                get length() {
                    return this.foldl(acc => acc + 1, 0);
                }
                *[Symbol.iterator]() {
                    for (let node = this; node.tail; node = node.tail) {
                        yield node.head;
                    }
                }
            }
        },
        {}
    ],
    17: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Applicative = void 0;
            const functor_1 = _dereq_('./functor');
            const curry_1 = _dereq_('../curry');
            class Applicative extends functor_1.Functor {
            }
            exports.Applicative = Applicative;
            (function (Applicative) {
                function ap(af, aa) {
                    return aa ? af.bind(f => aa.fmap(curry_1.curry(f))) : aa => ap(af, aa);
                }
                Applicative.ap = ap;
            }(Applicative = exports.Applicative || (exports.Applicative = {})));
        },
        {
            '../curry': 12,
            './functor': 20
        }
    ],
    18: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Right = exports.Left = exports.Either = void 0;
            const monad_1 = _dereq_('./monad');
            const promise_1 = _dereq_('../promise');
            class Either extends monad_1.Monad {
                constructor(thunk) {
                    super(thunk);
                    void this.EITHER;
                }
                fmap(f) {
                    return this.bind(b => new Right(f(b)));
                }
                ap(b) {
                    return Either.ap(this, b);
                }
                bind(f) {
                    return new Either(() => {
                        const m = this.evaluate();
                        if (m instanceof Left) {
                            return m;
                        }
                        if (m instanceof Right) {
                            return f(m.extract());
                        }
                        if (m instanceof Either) {
                            return m.bind(f);
                        }
                        throw new TypeError(`Spica: Either: Invalid monad value.\n\t${ m }`);
                    });
                }
                join() {
                    return this.bind(m => m);
                }
                extract(left, right) {
                    return !right ? this.evaluate().extract(left) : this.fmap(right).extract(left);
                }
                static do(block) {
                    const iter = block();
                    let val;
                    while (true) {
                        const {
                            value: m,
                            done
                        } = iter.next(val);
                        if (done)
                            return m;
                        const r = m.extract(() => void 0, a => [a]);
                        if (!r)
                            return m;
                        val = r[0];
                    }
                }
            }
            exports.Either = Either;
            (function (Either) {
                function pure(b) {
                    return new Right(b);
                }
                Either.pure = pure;
                Either.Return = pure;
                function sequence(fm) {
                    return fm instanceof Either ? fm.extract(b => promise_1.AtomicPromise.resolve(new Left(b)), a => promise_1.AtomicPromise.resolve(a).then(Either.Return)) : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => [
                        ...as,
                        a
                    ])), Either.Return([]));
                }
                Either.sequence = sequence;
            }(Either = exports.Either || (exports.Either = {})));
            class Left extends Either {
                constructor(a) {
                    super(throwCallError);
                    this.a = a;
                    void this.LEFT;
                }
                bind(_) {
                    return this;
                }
                extract(left) {
                    if (!left)
                        throw this.a;
                    return left(this.a);
                }
            }
            exports.Left = Left;
            class Right extends Either {
                constructor(b) {
                    super(throwCallError);
                    this.b = b;
                    void this.RIGHT;
                }
                bind(f) {
                    return new Either(() => f(this.extract()));
                }
                extract(_, right) {
                    return !right ? this.b : right(this.b);
                }
            }
            exports.Right = Right;
            function throwCallError() {
                throw new Error(`Spica: Either: Invalid thunk call.`);
            }
        },
        {
            '../promise': 28,
            './monad': 24
        }
    ],
    19: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
                Object.defineProperty(o, 'default', {
                    enumerable: true,
                    value: v
                });
            } : function (o, v) {
                o['default'] = v;
            });
            var __importStar = this && this.__importStar || function (mod) {
                if (mod && mod.__esModule)
                    return mod;
                var result = {};
                if (mod != null)
                    for (var k in mod)
                        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
                            __createBinding(result, mod, k);
                __setModuleDefault(result, mod);
                return result;
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Right = exports.Left = exports.Either = void 0;
            const Monad = __importStar(_dereq_('./either.impl'));
            class Either extends Monad.Either {
                constructor() {
                    super(() => void 0);
                }
            }
            exports.Either = Either;
            function Left(a) {
                return new Monad.Left(a);
            }
            exports.Left = Left;
            function Right(b) {
                return new Monad.Right(b);
            }
            exports.Right = Right;
        },
        { './either.impl': 18 }
    ],
    20: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Functor = void 0;
            const lazy_1 = _dereq_('./lazy');
            class Functor extends lazy_1.Lazy {
            }
            exports.Functor = Functor;
            (function (Functor) {
                function fmap(m, f) {
                    return f ? m.fmap(f) : f => m.fmap(f);
                }
                Functor.fmap = fmap;
            }(Functor = exports.Functor || (exports.Functor = {})));
        },
        { './lazy': 21 }
    ],
    21: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Lazy = void 0;
            class Lazy {
                constructor(thunk) {
                    this.thunk = thunk;
                    this.memory_ = void 0;
                }
                evaluate() {
                    var _a;
                    return (_a = this.memory_) !== null && _a !== void 0 ? _a : this.memory_ = this.thunk();
                }
            }
            exports.Lazy = Lazy;
        },
        {}
    ],
    22: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Nothing = exports.Just = exports.Maybe = void 0;
            const monadplus_1 = _dereq_('./monadplus');
            const promise_1 = _dereq_('../promise');
            class Maybe extends monadplus_1.MonadPlus {
                constructor(thunk) {
                    super(thunk);
                    void this.MAYBE;
                }
                fmap(f) {
                    return this.bind(a => new Just(f(a)));
                }
                ap(a) {
                    return Maybe.ap(this, a);
                }
                bind(f) {
                    return new Maybe(() => {
                        const m = this.evaluate();
                        if (m instanceof Just) {
                            return f(m.extract());
                        }
                        if (m instanceof Nothing) {
                            return m;
                        }
                        if (m instanceof Maybe) {
                            return m.bind(f);
                        }
                        throw new TypeError(`Spica: Maybe: Invalid monad value.\n\t${ m }`);
                    });
                }
                guard(cond) {
                    return cond ? this : Maybe.mzero;
                }
                join() {
                    return this.bind(m => m);
                }
                extract(nothing, just) {
                    return !just ? this.evaluate().extract(nothing) : this.fmap(just).extract(nothing);
                }
                static do(block) {
                    const iter = block();
                    let val;
                    while (true) {
                        const {
                            value: m,
                            done
                        } = iter.next(val);
                        if (done)
                            return m;
                        const r = m.extract(() => void 0, a => [a]);
                        if (!r)
                            return m;
                        val = r[0];
                    }
                }
            }
            exports.Maybe = Maybe;
            (function (Maybe) {
                function pure(a) {
                    return new Just(a);
                }
                Maybe.pure = pure;
                Maybe.Return = pure;
                function sequence(fm) {
                    return fm instanceof Maybe ? fm.extract(() => promise_1.AtomicPromise.resolve(Maybe.mzero), a => promise_1.AtomicPromise.resolve(a).then(Maybe.Return)) : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => [
                        ...as,
                        a
                    ])), Maybe.Return([]));
                }
                Maybe.sequence = sequence;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            class Just extends Maybe {
                constructor(a) {
                    super(throwCallError);
                    this.a = a;
                    void this.JUST;
                }
                bind(f) {
                    return new Maybe(() => f(this.extract()));
                }
                extract(_, just) {
                    return !just ? this.a : just(this.a);
                }
            }
            exports.Just = Just;
            class Nothing extends Maybe {
                constructor() {
                    super(throwCallError);
                    void this.NOTHING;
                }
                bind(_) {
                    return this;
                }
                extract(nothing) {
                    if (!nothing)
                        throw void 0;
                    return nothing();
                }
            }
            exports.Nothing = Nothing;
            (function (Maybe) {
                Maybe.mzero = new Nothing();
                function mplus(ml, mr) {
                    return new Maybe(() => ml.fmap(() => ml).extract(() => mr));
                }
                Maybe.mplus = mplus;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            function throwCallError() {
                throw new Error(`Spica: Maybe: Invalid thunk call.`);
            }
        },
        {
            '../promise': 28,
            './monadplus': 25
        }
    ],
    23: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
                Object.defineProperty(o, 'default', {
                    enumerable: true,
                    value: v
                });
            } : function (o, v) {
                o['default'] = v;
            });
            var __importStar = this && this.__importStar || function (mod) {
                if (mod && mod.__esModule)
                    return mod;
                var result = {};
                if (mod != null)
                    for (var k in mod)
                        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
                            __createBinding(result, mod, k);
                __setModuleDefault(result, mod);
                return result;
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Nothing = exports.Just = exports.Maybe = void 0;
            const Monad = __importStar(_dereq_('./maybe.impl'));
            class Maybe extends Monad.Maybe {
                constructor() {
                    super(() => void 0);
                }
            }
            exports.Maybe = Maybe;
            function Just(a) {
                return new Monad.Just(a);
            }
            exports.Just = Just;
            exports.Nothing = Monad.Maybe.mzero;
        },
        { './maybe.impl': 22 }
    ],
    24: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Monad = void 0;
            const applicative_1 = _dereq_('./applicative');
            class Monad extends applicative_1.Applicative {
            }
            exports.Monad = Monad;
            (function (Monad) {
                function bind(m, f) {
                    return f ? m.bind(f) : f => bind(m, f);
                }
                Monad.bind = bind;
            }(Monad = exports.Monad || (exports.Monad = {})));
        },
        { './applicative': 17 }
    ],
    25: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.MonadPlus = void 0;
            const monad_1 = _dereq_('./monad');
            class MonadPlus extends monad_1.Monad {
            }
            exports.MonadPlus = MonadPlus;
            (function (MonadPlus) {
            }(MonadPlus = exports.MonadPlus || (exports.MonadPlus = {})));
        },
        { './monad': 24 }
    ],
    26: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.noop = void 0;
            function noop() {
            }
            exports.noop = noop;
        },
        {}
    ],
    27: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Observation = void 0;
            const global_1 = _dereq_('./global');
            const assign_1 = _dereq_('./assign');
            const array_1 = _dereq_('./array');
            const exception_1 = _dereq_('./exception');
            class ListenerNode {
                constructor(parent, index) {
                    this.parent = parent;
                    this.index = index;
                    this.children = new global_1.Map();
                    this.childrenIndexes = [];
                    this.monitors = [];
                    this.subscribers = [];
                }
            }
            class Observation {
                constructor(opts = {}) {
                    this.id = 0;
                    this.node = new ListenerNode(void 0, void 0);
                    this.settings = {
                        limit: 10,
                        cleanup: false
                    };
                    this.unrelaies = new global_1.WeakMap();
                    assign_1.extend(this.settings, opts);
                }
                monitor(namespace, monitor, {
                    once = false
                } = {}) {
                    if (typeof monitor !== 'function')
                        throw new global_1.Error(`Spica: Observation: Invalid listener: ${ monitor }`);
                    const {monitors} = this.seekNode(namespace, 0);
                    if (monitors.length === this.settings.limit)
                        throw new global_1.Error(`Spica: Observation: Exceeded max listener limit.`);
                    if (this.id === global_1.Number.MAX_SAFE_INTEGER)
                        throw new global_1.Error(`Spica: Observation: Max listener ID reached max safe integer.`);
                    const item = {
                        id: ++this.id,
                        type: 0,
                        namespace,
                        listener: monitor,
                        options: { once }
                    };
                    monitors.push(item);
                    return () => void this.off(namespace, item);
                }
                on(namespace, subscriber, {
                    once = false
                } = {}) {
                    if (typeof subscriber !== 'function')
                        throw new global_1.Error(`Spica: Observation: Invalid listener: ${ subscriber }`);
                    const {subscribers} = this.seekNode(namespace, 0);
                    if (subscribers.length === this.settings.limit)
                        throw new global_1.Error(`Spica: Observation: Exceeded max listener limit.`);
                    if (this.id === global_1.Number.MAX_SAFE_INTEGER)
                        throw new global_1.Error(`Spica: Observation: Max listener ID reached max safe integer.`);
                    const item = {
                        id: ++this.id,
                        type: 1,
                        namespace,
                        listener: subscriber,
                        options: { once }
                    };
                    subscribers.push(item);
                    return () => void this.off(namespace, item);
                }
                once(namespace, subscriber) {
                    return this.on(namespace, subscriber, { once: true });
                }
                off(namespace, subscriber) {
                    const node = this.seekNode(namespace, 1);
                    if (!node)
                        return;
                    switch (typeof subscriber) {
                    case 'object': {
                            const items = subscriber.type === 0 ? node.monitors : node.subscribers;
                            if (items.length === 0 || subscriber.id < items[0].id || subscriber.id > items[items.length - 1].id)
                                return;
                            return void array_1.splice(items, items.indexOf(subscriber), 1);
                        }
                    case 'function': {
                            const items = node.subscribers;
                            return void array_1.splice(items, items.findIndex(item => item.listener === subscriber), 1);
                        }
                    case 'undefined':
                        return void clear(node);
                    }
                }
                emit(namespace, data, tracker) {
                    this.drain(namespace, data, tracker);
                }
                reflect(namespace, data) {
                    let results;
                    this.emit(namespace, data, (_, r) => results = r);
                    return results;
                }
                relay(source) {
                    if (this.unrelaies.has(source))
                        return this.unrelaies.get(source);
                    const unbind = source.monitor([], (data, namespace) => void this.emit(namespace, data));
                    const unrelay = () => (void this.unrelaies.delete(source), void unbind());
                    this.unrelaies.set(source, unrelay);
                    return unrelay;
                }
                refs(namespace) {
                    const node = this.seekNode(namespace, 1);
                    if (!node)
                        return [];
                    return array_1.push(this.refsBelow(node, 0), this.refsBelow(node, 1)).reduce((acc, rs) => array_1.push(acc, rs), []);
                }
                drain(namespace, data, tracker) {
                    const node = this.seekNode(namespace, 1);
                    const results = [];
                    const sss = node ? this.refsBelow(node, 1) : [];
                    for (let i = 0; i < sss.length; ++i) {
                        const items = sss[i];
                        if (items.length === 0)
                            continue;
                        for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
                            const item = items[i];
                            if (item.options.once) {
                                this.off(item.namespace, item);
                            }
                            try {
                                const result = item.listener(data, namespace);
                                tracker && results.push(result);
                            } catch (reason) {
                                exception_1.causeAsyncException(reason);
                            }
                            i = i < items.length ? i : items.length - 1;
                            for (; i >= 0 && items[i].id > item.id; --i);
                        }
                    }
                    const mss = this.refsAbove(node || this.seekNode(namespace, 2), 0);
                    for (let i = 0; i < mss.length; ++i) {
                        const items = mss[i];
                        if (items.length === 0)
                            continue;
                        for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
                            const item = items[i];
                            if (item.options.once) {
                                this.off(item.namespace, item);
                            }
                            try {
                                item.listener(data, namespace);
                            } catch (reason) {
                                exception_1.causeAsyncException(reason);
                            }
                            i = i < items.length ? i : items.length - 1;
                            for (; i >= 0 && items[i].id > item.id; --i);
                        }
                    }
                    if (tracker) {
                        try {
                            tracker(data, results);
                        } catch (reason) {
                            exception_1.causeAsyncException(reason);
                        }
                    }
                }
                refsAbove({parent, monitors, subscribers}, type) {
                    const acc = type === 0 ? [monitors] : [subscribers];
                    while (parent) {
                        type === 0 ? acc.push(parent.monitors) : acc.push(parent.subscribers);
                        parent = parent.parent;
                    }
                    return acc;
                }
                refsBelow(node, type) {
                    return this.refsBelow_(node, type, [])[0];
                }
                refsBelow_({monitors, subscribers, childrenIndexes, children}, type, acc) {
                    type === 0 ? acc.push(monitors) : acc.push(subscribers);
                    let count = 0;
                    for (let i = 0; i < childrenIndexes.length; ++i) {
                        const index = childrenIndexes[i];
                        const cnt = this.refsBelow_(children.get(index), type, acc)[1];
                        count += cnt;
                        if (cnt === 0 && this.settings.cleanup) {
                            children.delete(index);
                            array_1.splice(childrenIndexes, i, 1);
                            --i;
                        }
                    }
                    return [
                        acc,
                        monitors.length + subscribers.length + count
                    ];
                }
                seekNode(namespace, mode) {
                    let node = this.node;
                    for (let i = 0; i < namespace.length; ++i) {
                        const index = namespace[i];
                        const {childrenIndexes, children} = node;
                        let child = children.get(index);
                        if (!child) {
                            switch (mode) {
                            case 1:
                                return;
                            case 2:
                                return node;
                            }
                            child = new ListenerNode(node, index);
                            childrenIndexes.push(index);
                            children.set(index, child);
                        }
                        node = child;
                    }
                    return node;
                }
            }
            exports.Observation = Observation;
            function clear({monitors, subscribers, childrenIndexes, children}) {
                for (let i = 0; i < childrenIndexes.length; ++i) {
                    if (!clear(children.get(childrenIndexes[i])))
                        continue;
                    children.delete(childrenIndexes[i]);
                    array_1.splice(childrenIndexes, i, 1);
                    --i;
                }
                array_1.splice(subscribers, 0);
                return monitors.length === 0;
            }
        },
        {
            './array': 5,
            './assign': 6,
            './exception': 13,
            './global': 15
        }
    ],
    28: [
        function (_dereq_, module, exports) {
            'use strict';
            var _a;
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isPromiseLike = exports.Internal = exports.AtomicPromise = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const array_1 = _dereq_('./array');
            const internal = Symbol.for('spica/promise::internal');
            class AtomicPromise {
                constructor(executor) {
                    this[Symbol.toStringTag] = 'Promise';
                    this[_a] = new Internal();
                    try {
                        executor(value => this[internal].resolve(value), reason => this[internal].reject(reason));
                    } catch (reason) {
                        this[internal].reject(reason);
                    }
                }
                static get [Symbol.species]() {
                    return AtomicPromise;
                }
                static all(vs) {
                    return new AtomicPromise((resolve, reject) => {
                        const values = alias_1.isArray(vs) ? vs : [...vs];
                        const results = global_1.Array(values.length);
                        let count = 0;
                        for (let i = 0; i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                results[i] = value;
                                ++count;
                                continue;
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[internal];
                                switch (status.state) {
                                case 2:
                                    results[i] = status.value;
                                    ++count;
                                    continue;
                                case 3:
                                    reject(status.reason);
                                    i = values.length;
                                    continue;
                                }
                            }
                            value.then(value => {
                                results[i] = value;
                                ++count;
                                count === values.length && resolve(results);
                            }, reason => {
                                reject(reason);
                                i = values.length;
                            });
                        }
                        count === values.length && resolve(results);
                    });
                }
                static race(vs) {
                    return new AtomicPromise((resolve, reject) => {
                        const values = alias_1.isArray(vs) ? vs : [...vs];
                        for (let i = 0; i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                return resolve(value);
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[internal];
                                switch (status.state) {
                                case 2:
                                    return resolve(status.value);
                                case 3:
                                    return reject(status.reason);
                                }
                            }
                        }
                        let done = false;
                        for (let i = 0; i < values.length; ++i) {
                            const value = values[i];
                            value.then(value => {
                                resolve(value);
                                done = true;
                            }, reason => {
                                reject(reason);
                                done = true;
                            });
                            if (done)
                                return;
                        }
                    });
                }
                static allSettled(vs) {
                    return new AtomicPromise(resolve => {
                        const values = alias_1.isArray(vs) ? vs : [...vs];
                        const results = global_1.Array(values.length);
                        let count = 0;
                        for (let i = 0; i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                results[i] = {
                                    status: 'fulfilled',
                                    value: value
                                };
                                ++count;
                                continue;
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[internal];
                                switch (status.state) {
                                case 2:
                                    results[i] = {
                                        status: 'fulfilled',
                                        value: status.value
                                    };
                                    ++count;
                                    continue;
                                case 3:
                                    results[i] = {
                                        status: 'rejected',
                                        reason: status.reason
                                    };
                                    ++count;
                                    continue;
                                }
                            }
                            value.then(value => {
                                results[i] = {
                                    status: 'fulfilled',
                                    value: value
                                };
                                ++count;
                                count === values.length && resolve(results);
                            }, reason => {
                                results[i] = {
                                    status: 'rejected',
                                    reason
                                };
                                ++count;
                                count === values.length && resolve(results);
                            });
                        }
                        count === values.length && resolve(results);
                    });
                }
                static resolve(value) {
                    return new AtomicPromise(resolve => resolve(value));
                }
                static reject(reason) {
                    return new AtomicPromise((_, reject) => reject(reason));
                }
                then(onfulfilled, onrejected) {
                    return new AtomicPromise((resolve, reject) => this[internal].then(onfulfilled, onrejected, resolve, reject));
                }
                catch(onrejected) {
                    return this.then(void 0, onrejected);
                }
                finally(onfinally) {
                    return this.then(onfinally, onfinally).then(() => this);
                }
            }
            exports.AtomicPromise = AtomicPromise;
            _a = internal;
            class Internal {
                constructor() {
                    this.status = { state: 0 };
                    this.reactable = true;
                    this.fulfillReactions = [];
                    this.rejectReactions = [];
                    this.isHandled = false;
                }
                get isPending() {
                    return this.status.state === 0;
                }
                resolve(value) {
                    if (this.status.state !== 0)
                        return;
                    if (!isPromiseLike(value)) {
                        this.status = {
                            state: 2,
                            value: value
                        };
                        return this.resume();
                    }
                    this.status = {
                        state: 1,
                        promise: value
                    };
                    return void value.then(value => {
                        this.status = {
                            state: 2,
                            value: value
                        };
                        this.resume();
                    }, reason => {
                        this.status = {
                            state: 3,
                            reason: reason
                        };
                        this.resume();
                    });
                }
                reject(reason) {
                    if (this.status.state !== 0)
                        return;
                    this.status = {
                        state: 3,
                        reason: reason
                    };
                    return this.resume();
                }
                then(onfulfilled, onrejected, resolve, reject) {
                    const {status, fulfillReactions, rejectReactions} = this;
                    switch (status.state) {
                    case 2:
                        if (fulfillReactions.length > 0)
                            break;
                        try {
                            return onfulfilled ? resolve(onfulfilled(status.value)) : resolve(status.value);
                        } catch (reason) {
                            return reject(reason);
                        }
                    case 3:
                        if (rejectReactions.length > 0)
                            break;
                        try {
                            return onrejected ? resolve(onrejected(status.reason)) : reject(status.reason);
                        } catch (reason) {
                            return reject(reason);
                        }
                    default:
                        fulfillReactions.push(value => {
                            try {
                                onfulfilled ? resolve(onfulfilled(value)) : resolve(value);
                            } catch (reason) {
                                reject(reason);
                            }
                        });
                        rejectReactions.push(reason => {
                            try {
                                onrejected ? resolve(onrejected(reason)) : reject(reason);
                            } catch (reason) {
                                reject(reason);
                            }
                        });
                        return this.resume();
                    }
                }
                resume() {
                    if (!this.reactable)
                        return;
                    const {status, fulfillReactions, rejectReactions} = this;
                    switch (status.state) {
                    case 0:
                    case 1:
                        return;
                    case 2:
                        if (this.isHandled && rejectReactions.length > 0) {
                            array_1.splice(rejectReactions, 0);
                        }
                        if (fulfillReactions.length === 0)
                            return;
                        this.isHandled = true;
                        this.react(fulfillReactions, status.value);
                        return;
                    case 3:
                        if (this.isHandled && fulfillReactions.length > 0) {
                            array_1.splice(fulfillReactions, 0);
                        }
                        if (rejectReactions.length === 0)
                            return;
                        this.isHandled = true;
                        this.react(rejectReactions, status.reason);
                        return;
                    }
                }
                react(reactions, param) {
                    this.reactable = false;
                    if (reactions.length < 5) {
                        while (reactions.length > 0) {
                            reactions.shift()(param);
                        }
                    } else {
                        for (let i = 0; i < reactions.length; ++i) {
                            reactions[i](param);
                        }
                        array_1.splice(reactions, 0);
                    }
                    this.reactable = true;
                }
            }
            exports.Internal = Internal;
            function isPromiseLike(value) {
                return value !== null && typeof value === 'object' && 'then' in value && typeof value.then === 'function';
            }
            exports.isPromiseLike = isPromiseLike;
            function isAtomicPromiseLike(value) {
                return internal in value;
            }
        },
        {
            './alias': 4,
            './array': 5,
            './global': 15
        }
    ],
    29: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.sqid = void 0;
            const global_1 = _dereq_('./global');
            const zeros = '0'.repeat(15);
            let cnt = 0;
            function sqid(id) {
                if (arguments.length === 0) {
                    if (cnt === global_1.Number.MAX_SAFE_INTEGER)
                        throw new TypeError(`Spica: sqid: sqid reached max safe integer.`);
                    return sqid(++cnt);
                } else {
                    if (typeof id !== 'number')
                        throw new TypeError(`Spica: sqid: A parameter value must be a number: ${ id }`);
                    if (id >= 0 === false)
                        throw new TypeError(`Spica: sqid: A parameter value must be a positive number: ${ id }`);
                    if (id % 1 !== 0)
                        throw new TypeError(`Spica: sqid: A parameter value must be an integer: ${ id }`);
                    return (zeros + id).slice(-16);
                }
            }
            exports.sqid = sqid;
        },
        { './global': 15 }
    ],
    30: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.debounce = exports.throttle = void 0;
            const list_1 = _dereq_('./list');
            const global_1 = _dereq_('./global');
            function throttle(interval, callback) {
                let timer = 0;
                let buffer = list_1.MList();
                return arg => {
                    buffer.prepend(arg);
                    if (timer > 0)
                        return;
                    timer = global_1.setTimeout(() => {
                        timer = 0;
                        const buf = buffer;
                        buffer = list_1.MList();
                        void callback(buf.head, buf);
                    }, interval);
                };
            }
            exports.throttle = throttle;
            function debounce(delay, callback) {
                let timer = 0;
                let buffer = list_1.MList();
                return arg => {
                    buffer.prepend(arg);
                    if (timer > 0)
                        return;
                    timer = global_1.setTimeout(() => {
                        timer = 0;
                        void global_1.setTimeout(() => {
                            if (timer > 0)
                                return;
                            const buf = buffer;
                            buffer = list_1.MList();
                            void callback(buf.head, buf);
                        }, buffer.length > 1 ? delay : 0);
                    }, delay);
                };
            }
            exports.debounce = debounce;
        },
        {
            './global': 15,
            './list': 16
        }
    ],
    31: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isPrimitive = exports.isType = exports.type = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const toString = global_1.Object.prototype.toString.call.bind(global_1.Object.prototype.toString);
            function type(value) {
                if (value === void 0)
                    return 'undefined';
                if (value === null)
                    return 'null';
                const type = typeof value;
                if (type === 'object') {
                    const proto = alias_1.ObjectGetPrototypeOf(value);
                    if (proto === global_1.Object.prototype || proto === null)
                        return 'Object';
                    if (proto === global_1.Array.prototype)
                        return 'Array';
                    return toString(value).slice(8, -1);
                }
                if (type === 'function')
                    return 'Function';
                return type;
            }
            exports.type = type;
            function isType(value, name) {
                if (name === 'object')
                    return value !== null && typeof value === name;
                if (name === 'function')
                    return typeof value === name;
                return type(value) === name;
            }
            exports.isType = isType;
            function isPrimitive(value) {
                const type = typeof value;
                return type === 'object' || type === 'function' ? value === null : true;
            }
            exports.isPrimitive = isPrimitive;
        },
        {
            './alias': 4,
            './global': 15
        }
    ],
    32: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.uuid = void 0;
            const global_1 = _dereq_('./global');
            const FORMAT_V4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            function uuid() {
                return body(rnd16, hex);
            }
            exports.uuid = uuid;
            const body = Function('rnd16', 'hex', [
                '"use strict";',
                'return ""',
                FORMAT_V4.replace(/./g, c => {
                    switch (c) {
                    case 'x':
                        return `+ hex[rnd16()]`;
                    case 'y':
                        return `+ hex[rnd16() & 0x03 | 0x08]`;
                    default:
                        return `+ '${ c }'`;
                    }
                })
            ].join(''));
            const buffer = new Uint16Array(512);
            const digit = 16;
            const mask = 15;
            let index = buffer.length;
            let offset = digit;
            function rnd16() {
                if (index === buffer.length) {
                    global_1.crypto.getRandomValues(buffer);
                    index = 0;
                }
                if (offset > 4) {
                    offset -= 4;
                    return buffer[index] >> offset & mask;
                } else {
                    offset = digit;
                    return buffer[index++] & mask;
                }
            }
            const hex = [...Array(16)].map((_, i) => i.toString(16));
        },
        { './global': 15 }
    ],
    33: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function (m, exports) {
                for (var p in m)
                    if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
                        __createBinding(exports, m, p);
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            __exportStar(_dereq_('./layer/interface/api'), exports);
        },
        { './layer/interface/api': 64 }
    ],
    34: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function (m, exports) {
                for (var p in m)
                    if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
                        __createBinding(exports, m, p);
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Ownership = exports.StorageChannel = exports.StoreChannel = exports.ChannelObject = void 0;
            const api_1 = _dereq_('../domain/indexeddb/api');
            const api_2 = _dereq_('../domain/webstorage/api');
            const channel_1 = _dereq_('../domain/broadcast/channel');
            const channel_2 = _dereq_('../domain/ownership/channel');
            __exportStar(_dereq_('../domain/indexeddb/api'), exports);
            __exportStar(_dereq_('../domain/webstorage/api'), exports);
            var api_3 = _dereq_('../domain/dao/api');
            Object.defineProperty(exports, 'ChannelObject', {
                enumerable: true,
                get: function () {
                    return api_3.Schema;
                }
            });
            class StoreChannel extends api_1.StoreChannel {
                constructor(name, config) {
                    super(name, config.schema, config);
                }
            }
            exports.StoreChannel = StoreChannel;
            class StorageChannel extends api_2.StorageChannel {
                constructor(name, {
                    schema: schema,
                    migrate = () => void 0
                }) {
                    super(name, api_2.localStorage, schema, migrate);
                }
            }
            exports.StorageChannel = StorageChannel;
            class Ownership extends channel_2.Ownership {
                constructor(name) {
                    super(new channel_1.Channel(name, false));
                }
            }
            exports.Ownership = Ownership;
        },
        {
            '../domain/broadcast/channel': 40,
            '../domain/dao/api': 41,
            '../domain/indexeddb/api': 43,
            '../domain/ownership/channel': 49,
            '../domain/webstorage/api': 50
        }
    ],
    35: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.hasBinary = exports.isStorable = void 0;
            const alias_1 = _dereq_('spica/alias');
            const type_1 = _dereq_('spica/type');
            function isStorable(value) {
                switch (typeof value) {
                case 'undefined':
                case 'boolean':
                case 'number':
                case 'string':
                    return true;
                case 'object':
                    try {
                        return value === null || isBinary(value) || alias_1.ObjectKeys(value).every(key => isStorable(value[key]));
                    } catch (_a) {
                        return false;
                    }
                default:
                    return false;
                }
            }
            exports.isStorable = isStorable;
            function hasBinary(value) {
                return !type_1.isPrimitive(value) ? isBinary(value) || alias_1.ObjectKeys(value).some(key => hasBinary(value[key])) : false;
            }
            exports.hasBinary = hasBinary;
            function isBinary(value) {
                return value instanceof Int8Array || value instanceof Int16Array || value instanceof Int32Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Uint16Array || value instanceof Uint32Array || value instanceof ArrayBuffer || value instanceof Blob;
            }
        },
        {
            'spica/alias': 4,
            'spica/type': 31
        }
    ],
    36: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isValidPropertyValue = exports.isValidPropertyName = exports.EventRecordValue = exports.SavedEventRecord = exports.LoadedEventRecord = exports.StoredEventRecord = exports.UnstoredEventRecord = exports.EventRecordType = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const assign_1 = _dereq_('spica/assign');
            const identifier_1 = _dereq_('./identifier');
            const value_1 = _dereq_('../database/value');
            exports.EventRecordType = {
                put: 'put',
                delete: 'delete',
                snapshot: 'snapshot'
            };
            class EventRecord {
                constructor(id, type, key, value, date) {
                    this.id = id;
                    this.type = type;
                    this.key = key;
                    this.value = value;
                    this.date = date;
                    if (typeof this.id !== 'number' || this.id >= 0 === false || !global_1.Number.isSafeInteger(this.id))
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${ this.id }`);
                    if (typeof this.type !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${ this.type }`);
                    if (typeof this.key !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${ this.key }`);
                    if (typeof this.value !== 'object' || !this.value)
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${ JSON.stringify(this.value) }`);
                    if (typeof this.date !== 'number' || this.date >= 0 === false || !global_1.Number.isFinite(this.date))
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${ this.date }`);
                    this.attr = this.type === exports.EventRecordType.put ? alias_1.ObjectKeys(value).filter(isValidPropertyName)[0] : '';
                    if (typeof this.attr !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event attr: ${ this.key }`);
                    switch (type) {
                    case exports.EventRecordType.put:
                        if (!isValidPropertyName(this.attr))
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue({ [this.attr]: value[this.attr] });
                        return;
                    case exports.EventRecordType.snapshot:
                        if (this.attr !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue(value);
                        return;
                    case exports.EventRecordType.delete:
                        if (this.attr !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue();
                        return;
                    default:
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${ type }`);
                    }
                }
            }
            class UnstoredEventRecord extends EventRecord {
                constructor(key, value, type = exports.EventRecordType.put, date = global_1.Date.now()) {
                    super(identifier_1.makeEventId(0), type, key, value, date);
                    this.EVENT_RECORD;
                    if (this.id !== 0)
                        throw new TypeError(`ClientChannel: UnstoredEventRecord: Invalid event id: ${ this.id }`);
                }
            }
            exports.UnstoredEventRecord = UnstoredEventRecord;
            class StoredEventRecord extends EventRecord {
                constructor(id, key, value, type, date) {
                    super(id, type, key, value, date);
                    if (this.id > 0 === false)
                        throw new TypeError(`ClientChannel: StoredEventRecord: Invalid event id: ${ this.id }`);
                }
            }
            exports.StoredEventRecord = StoredEventRecord;
            class LoadedEventRecord extends StoredEventRecord {
                constructor({id, key, value, type, date}) {
                    super(id, key, value, type, date);
                    this.EVENT_RECORD;
                }
            }
            exports.LoadedEventRecord = LoadedEventRecord;
            class SavedEventRecord extends StoredEventRecord {
                constructor(id, key, value, type, date) {
                    super(id, key, value, type, date);
                    this.EVENT_RECORD;
                }
            }
            exports.SavedEventRecord = SavedEventRecord;
            class EventRecordValue {
                constructor(...sources) {
                    void assign_1.clone(this, ...sources);
                }
            }
            exports.EventRecordValue = EventRecordValue;
            const RegValidValueNameFormat = /^[a-zA-Z][0-9a-zA-Z_]*$/;
            const RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;
            function isValidPropertyName(prop) {
                return prop.length > 0 && !prop.startsWith('_') && !prop.endsWith('_') && !RegInvalidValueNameFormat.test(prop) && RegValidValueNameFormat.test(prop);
            }
            exports.isValidPropertyName = isValidPropertyName;
            function isValidPropertyValue(dao) {
                return prop => value_1.isStorable(dao[prop]);
            }
            exports.isValidPropertyValue = isValidPropertyValue;
        },
        {
            '../database/value': 35,
            './identifier': 37,
            'spica/alias': 4,
            'spica/assign': 6,
            'spica/global': 15
        }
    ],
    37: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.makeEventId = void 0;
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
    38: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.compose = exports.record = exports.EventStore = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const observer_1 = _dereq_('spica/observer');
            const clock_1 = _dereq_('spica/clock');
            const sqid_1 = _dereq_('spica/sqid');
            const concat_1 = _dereq_('spica/concat');
            const exception_1 = _dereq_('spica/exception');
            const noop_1 = _dereq_('spica/noop');
            const api_1 = _dereq_('../../infrastructure/indexeddb/api');
            const identifier_1 = _dereq_('./identifier');
            const event_1 = _dereq_('./event');
            const value_1 = _dereq_('../database/value');
            var EventStoreSchema;
            (function (EventStoreSchema) {
                EventStoreSchema.id = 'id';
                EventStoreSchema.key = 'key';
            }(EventStoreSchema || (EventStoreSchema = {})));
            class EventStore {
                constructor(name, attrs, listen) {
                    this.name = name;
                    this.attrs = attrs;
                    this.listen = listen;
                    this.alive = true;
                    this.memory = new observer_1.Observation();
                    this.events = {
                        load: new observer_1.Observation(),
                        save: new observer_1.Observation(),
                        loss: new observer_1.Observation(),
                        clean: new observer_1.Observation()
                    };
                    this.events_ = { memory: new observer_1.Observation({ limit: Infinity }) };
                    this.tx = { rwc: 0 };
                    this.snapshotCycle = 9;
                    const states = new class {
                        constructor() {
                            this.ids = new global_1.Map();
                            this.dates = new global_1.Map();
                        }
                        update(event) {
                            void this.ids.set(event.key, identifier_1.makeEventId(global_1.Math.max(event.id, this.ids.get(event.key) || 0)));
                            void this.dates.set(event.key, global_1.Math.max(event.date, this.dates.get(event.key) || 0));
                        }
                    }();
                    void this.events_.memory.monitor([], event => {
                        if (event.date <= states.dates.get(event.key) && event.id <= states.ids.get(event.key))
                            return;
                        if (event instanceof event_1.LoadedEventRecord) {
                            return void this.events.load.emit([
                                event.key,
                                event.attr,
                                event.type
                            ], new EventStore.Event(event.type, event.id, event.key, event.attr, event.date));
                        }
                        if (event instanceof event_1.SavedEventRecord) {
                            return void this.events.save.emit([
                                event.key,
                                event.attr,
                                event.type
                            ], new EventStore.Event(event.type, event.id, event.key, event.attr, event.date));
                        }
                        return;
                    });
                    void this.events_.memory.monitor([], event => void states.update(new EventStore.Event(event.type, event.id, event.key, event.attr, event.date)));
                    void this.events.load.monitor([], event => void states.update(event));
                    void this.events.save.monitor([], event => void states.update(event));
                    void this.events.save.monitor([], event => {
                        switch (event.type) {
                        case EventStore.EventType.delete:
                        case EventStore.EventType.snapshot:
                            void this.clean(event.key);
                        }
                    });
                }
                static configure(name) {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: EventStoreSchema.id,
                                autoIncrement: true
                            });
                            if (!store.indexNames.contains(EventStoreSchema.id)) {
                                void store.createIndex(EventStoreSchema.id, EventStoreSchema.id, { unique: true });
                            }
                            if (!store.indexNames.contains(EventStoreSchema.key)) {
                                void store.createIndex(EventStoreSchema.key, EventStoreSchema.key);
                            }
                            return true;
                        },
                        verify(db) {
                            return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.id) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.key);
                        },
                        destroy() {
                            return true;
                        }
                    };
                }
                get txrw() {
                    if (++this.tx.rwc > 25) {
                        this.tx.rwc = 0;
                        this.tx.rw = void 0;
                        return;
                    }
                    return this.tx.rw;
                }
                set txrw(tx) {
                    if (!tx)
                        return;
                    if (this.tx.rw && this.tx.rw === tx)
                        return;
                    this.tx.rwc = 0;
                    this.tx.rw = tx;
                    void clock_1.tick(() => this.tx.rw = void 0);
                }
                fetch(key, cb = noop_1.noop, cancellation) {
                    if (!this.alive)
                        return void cb(new Error('Session is already closed.'));
                    const events = [];
                    return void this.listen(db => {
                        if (!this.alive)
                            return void cb(new Error('Session is already closed.'));
                        if (cancellation === null || cancellation === void 0 ? void 0 : cancellation.cancelled)
                            return void cb(new Error('Request is cancelled.'));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = tx.objectStore(this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
                        const proc = (cursor, error) => {
                            if (error)
                                return;
                            if (cursor) {
                                try {
                                    new event_1.LoadedEventRecord(cursor.value);
                                } catch (reason) {
                                    void cursor.delete();
                                    void exception_1.causeAsyncException(reason);
                                    return void cursor.continue();
                                }
                            }
                            if (!cursor || new event_1.LoadedEventRecord(cursor.value).date < this.meta(key).date) {
                                void [...events.reduceRight((es, e) => es.length === 0 || es[0].type === EventStore.EventType.put ? concat_1.concat(es, [e]) : es, []).reduceRight((dict, e) => dict.set(e.attr, e), new global_1.Map()).values()].sort((a, b) => a.date - b.date || a.id - b.id).forEach(e => (void this.memory.off([
                                    e.key,
                                    e.attr,
                                    sqid_1.sqid(e.id)
                                ]), void this.memory.on([
                                    e.key,
                                    e.attr,
                                    sqid_1.sqid(e.id)
                                ], () => e), void this.events_.memory.emit([
                                    e.key,
                                    e.attr,
                                    sqid_1.sqid(e.id)
                                ], e)));
                                try {
                                    void cb(req.error);
                                } catch (reason) {
                                    void exception_1.causeAsyncException(reason);
                                }
                                if (events.length >= this.snapshotCycle) {
                                    void this.snapshot(key);
                                }
                                return;
                            } else {
                                const event = new event_1.LoadedEventRecord(cursor.value);
                                if (this.memory.refs([
                                        event.key,
                                        event.attr,
                                        sqid_1.sqid(event.id)
                                    ]).length > 0)
                                    return void proc(null, null);
                                void events.unshift(event);
                                if (event.type !== EventStore.EventType.put)
                                    return void proc(null, null);
                                return void cursor.continue();
                            }
                        };
                        void req.addEventListener('success', () => void proc(req.result, req.error));
                        void tx.addEventListener('complete', () => void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()));
                        void tx.addEventListener('error', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void cb(tx.error || req.error)));
                        void tx.addEventListener('abort', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void cb(tx.error || req.error)));
                        void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.register(() => void tx.abort()));
                    }, () => void cb(new Error('Request has failed.')));
                }
                keys() {
                    return this.memory.reflect([]).reduce((keys, e) => keys.length === 0 || keys[keys.length - 1] !== e.key ? concat_1.concat(keys, [e.key]) : keys, []).sort();
                }
                has(key) {
                    return compose(key, this.attrs, this.memory.reflect([key])).type !== EventStore.EventType.delete;
                }
                meta(key) {
                    const events = this.memory.reflect([key]);
                    return alias_1.ObjectFreeze({
                        key: key,
                        id: events.reduce((id, e) => e.id > id ? e.id : id, 0),
                        date: events.reduce((date, e) => e.date > date ? e.date : date, 0)
                    });
                }
                get(key) {
                    return alias_1.ObjectAssign(alias_1.ObjectCreate(null), compose(key, this.attrs, this.memory.reflect([key])).value);
                }
                add(event, tx) {
                    if (!this.alive)
                        return;
                    switch (event.type) {
                    case EventStore.EventType.put:
                        void this.memory.off([
                            event.key,
                            event.attr,
                            sqid_1.sqid(0)
                        ]);
                        void this.events_.memory.off([
                            event.key,
                            event.attr,
                            sqid_1.sqid(0)
                        ]);
                        break;
                    case EventStore.EventType.delete:
                    case EventStore.EventType.snapshot:
                        void this.memory.refs([event.key]).filter(({
                            namespace: [, , id]
                        }) => id === sqid_1.sqid(0)).forEach(({
                            namespace: [key, attr, id]
                        }) => (void this.memory.off([
                            key,
                            attr,
                            id
                        ]), void this.events_.memory.off([
                            key,
                            attr,
                            id
                        ])));
                        break;
                    }
                    const clean = this.memory.on([
                        event.key,
                        event.attr,
                        sqid_1.sqid(0),
                        sqid_1.sqid()
                    ], () => event);
                    void this.events_.memory.emit([
                        event.key,
                        event.attr,
                        sqid_1.sqid(0)
                    ], event);
                    const loss = () => void this.events.loss.emit([
                        event.key,
                        event.attr,
                        event.type
                    ], new EventStore.Event(event.type, identifier_1.makeEventId(0), event.key, event.attr, event.date));
                    return void this.listen(db => {
                        if (!this.alive)
                            return;
                        tx = this.txrw = tx || this.txrw || db.transaction(this.name, 'readwrite');
                        const active = () => this.memory.refs([
                            event.key,
                            event.attr,
                            sqid_1.sqid(0)
                        ]).some(({listener}) => listener(void 0, [
                            event.key,
                            event.attr,
                            sqid_1.sqid(0)
                        ]) === event);
                        if (!active())
                            return;
                        const req = tx.objectStore(this.name).add(record(event));
                        void tx.addEventListener('complete', () => {
                            void clean();
                            const savedEvent = new event_1.SavedEventRecord(identifier_1.makeEventId(req.result), event.key, event.value, event.type, event.date);
                            void this.memory.off([
                                savedEvent.key,
                                savedEvent.attr,
                                sqid_1.sqid(savedEvent.id)
                            ]);
                            void this.memory.on([
                                savedEvent.key,
                                savedEvent.attr,
                                sqid_1.sqid(savedEvent.id)
                            ], () => savedEvent);
                            void this.events_.memory.emit([
                                savedEvent.key,
                                savedEvent.attr,
                                sqid_1.sqid(savedEvent.id)
                            ], savedEvent);
                            const events = this.memory.refs([savedEvent.key]).map(({listener}) => listener(void 0, [savedEvent.key])).reduce((es, e) => e instanceof event_1.StoredEventRecord ? concat_1.concat(es, [e]) : es, []);
                            if (events.length >= this.snapshotCycle || value_1.hasBinary(event.value)) {
                                void this.snapshot(savedEvent.key);
                            }
                        });
                        const fail = () => (void clean(), active() ? void loss() : void 0);
                        void tx.addEventListener('error', fail);
                        void tx.addEventListener('abort', fail);
                    }, () => void clean() || void loss());
                }
                delete(key) {
                    return void this.add(new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete));
                }
                snapshot(key) {
                    if (!this.alive)
                        return;
                    return void this.listen(db => {
                        if (!this.alive)
                            return;
                        if (!this.has(key) || this.meta(key).id === 0)
                            return;
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        const store = tx.objectStore(this.name);
                        const req = store.index(EventStoreSchema.key).openCursor(key, 'prev');
                        const events = [];
                        void req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (cursor) {
                                try {
                                    const event = new event_1.LoadedEventRecord(cursor.value);
                                    void events.unshift(event);
                                } catch (reason) {
                                    void cursor.delete();
                                    void exception_1.causeAsyncException(reason);
                                }
                            }
                            if (!cursor) {
                                if (events.length === 0)
                                    return;
                                const composedEvent = compose(key, this.attrs, events);
                                if (composedEvent instanceof event_1.StoredEventRecord)
                                    return;
                                switch (composedEvent.type) {
                                case EventStore.EventType.snapshot:
                                    return void this.add(new event_1.UnstoredEventRecord(composedEvent.key, composedEvent.value, composedEvent.type, events.reduce((date, e) => e.date > date ? e.date : date, 0)), tx);
                                case EventStore.EventType.delete:
                                    return;
                                }
                                throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${ composedEvent.type }`);
                            } else {
                                return void cursor.continue();
                            }
                        });
                    });
                }
                clean(key) {
                    if (!this.alive)
                        return;
                    const events = [];
                    let deletion = false;
                    let clean = false;
                    return void this.cursor(api_1.IDBKeyRange.only(key), EventStoreSchema.key, 'prev', 'readwrite', (cursor, error) => {
                        if (!this.alive)
                            return;
                        if (error)
                            return;
                        if (!cursor) {
                            for (const event of events) {
                                void this.memory.off([
                                    event.key,
                                    event.attr,
                                    sqid_1.sqid(event.id)
                                ]);
                                void this.events_.memory.off([
                                    event.key,
                                    event.attr,
                                    sqid_1.sqid(event.id)
                                ]);
                            }
                            clean && void this.events.clean.emit([key]);
                            return;
                        } else {
                            try {
                                const event = new event_1.LoadedEventRecord(cursor.value);
                                switch (event.type) {
                                case EventStore.EventType.put:
                                    if (deletion)
                                        break;
                                    return void cursor.continue();
                                case EventStore.EventType.snapshot:
                                    if (deletion)
                                        break;
                                    deletion = true;
                                    return void cursor.continue();
                                case EventStore.EventType.delete:
                                    clean = true;
                                    break;
                                }
                                void events.unshift(event);
                            } catch (reason) {
                                void exception_1.causeAsyncException(reason);
                            }
                            deletion = true;
                            void cursor.delete();
                            return void cursor.continue();
                        }
                    });
                }
                cursor(query, index, direction, mode, cb) {
                    if (!this.alive)
                        return void cb(null, new Error('Session is already closed.'));
                    return void this.listen(db => {
                        if (!this.alive)
                            return void cb(null, new Error('Session is already closed.'));
                        const tx = db.transaction(this.name, mode);
                        const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
                        void req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (!cursor)
                                return;
                            void cb(cursor, req.error);
                        });
                        void tx.addEventListener('complete', () => void cb(null, tx.error || req.error));
                        void tx.addEventListener('error', () => void cb(null, tx.error || req.error));
                        void tx.addEventListener('abort ', () => void cb(null, tx.error || req.error));
                    }, () => void cb(null, new Error('Request has failed.')));
                }
                close() {
                    this.alive = false;
                }
            }
            exports.EventStore = EventStore;
            (function (EventStore) {
                class Event {
                    constructor(type, id, key, attr, date) {
                        this.type = type;
                        this.id = id;
                        this.key = key;
                        this.attr = attr;
                        this.date = date;
                        this.EVENT;
                    }
                }
                EventStore.Event = Event;
                EventStore.EventType = event_1.EventRecordType;
                class Record extends event_1.UnstoredEventRecord {
                    constructor(key, value) {
                        super(key, value);
                    }
                }
                EventStore.Record = Record;
                class Value extends event_1.EventRecordValue {
                }
                EventStore.Value = Value;
            }(EventStore = exports.EventStore || (exports.EventStore = {})));
            function record(event) {
                const record = { ...event };
                delete record.id;
                return record;
            }
            exports.record = record;
            function compose(key, attrs, events) {
                return group(events).map(events => events.reduceRight(compose, new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete, 0))).reduce(e => e);
                function group(events) {
                    return events.map((e, i) => [
                        e,
                        i
                    ]).sort(([a, ai], [b, bi]) => void 0 || indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id * a.id > 0 && b.id - a.id || bi - ai).reduceRight(([head, ...tail], [event]) => {
                        const prev = head[0];
                        if (!prev)
                            return [[event]];
                        return prev.key === event.key ? concat_1.concat([concat_1.concat([event], head)], tail) : concat_1.concat([[event]], concat_1.concat([head], tail));
                    }, [[]]);
                }
                function compose(target, source) {
                    switch (source.type) {
                    case EventStore.EventType.put:
                        return new event_1.UnstoredEventRecord(source.key, new EventStore.Value(target.value, { [source.attr]: source.value[source.attr] }), EventStore.EventType.snapshot);
                    case EventStore.EventType.snapshot:
                        return source;
                    case EventStore.EventType.delete:
                        return source;
                    }
                    throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${ source }`);
                }
            }
            exports.compose = compose;
        },
        {
            '../../infrastructure/indexeddb/api': 55,
            '../database/value': 35,
            './event': 36,
            './identifier': 37,
            'spica/alias': 4,
            'spica/clock': 10,
            'spica/concat': 11,
            'spica/exception': 13,
            'spica/global': 15,
            'spica/noop': 26,
            'spica/observer': 27,
            'spica/sqid': 29
        }
    ],
    39: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.KeyValueStore = void 0;
            const clock_1 = _dereq_('spica/clock');
            const exception_1 = _dereq_('spica/exception');
            const noop_1 = _dereq_('spica/noop');
            class KeyValueStore {
                constructor(name, index, listen) {
                    this.name = name;
                    this.index = index;
                    this.listen = listen;
                    this.alive = true;
                    this.cache = new Map();
                    this.tx = { rwc: 0 };
                }
                static configure() {
                    return {
                        make() {
                            return true;
                        },
                        verify() {
                            return true;
                        },
                        destroy() {
                            return true;
                        }
                    };
                }
                get txrw() {
                    if (++this.tx.rwc > 25) {
                        this.tx.rwc = 0;
                        this.tx.rw = void 0;
                        return;
                    }
                    return this.tx.rw;
                }
                set txrw(tx) {
                    if (!tx)
                        return;
                    if (this.tx.rw && this.tx.rw === tx)
                        return;
                    this.tx.rwc = 0;
                    this.tx.rw = tx;
                    void clock_1.tick(() => this.tx.rw = void 0);
                }
                fetch(key, cb = noop_1.noop, cancellation) {
                    if (!this.alive)
                        return void cb(new Error('Session is already closed.'));
                    return void this.listen(db => {
                        if (!this.alive)
                            return void cb(new Error('Session is already closed.'));
                        if (cancellation === null || cancellation === void 0 ? void 0 : cancellation.cancelled)
                            return void cb(new Error('Request is cancelled.'));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = this.index ? tx.objectStore(this.name).index(this.index).getKey(key) : tx.objectStore(this.name).getKey(key);
                        void req.addEventListener('success', () => void cb(req.error));
                        void tx.addEventListener('complete', () => void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()));
                        void tx.addEventListener('error', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void cb(tx.error || req.error)));
                        void tx.addEventListener('abort', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void cb(tx.error || req.error)));
                        void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.register(() => void tx.abort()));
                    }, () => void cb(new Error('Request has failed.')));
                }
                has(key) {
                    return this.cache.has(key);
                }
                get(key) {
                    return this.cache.get(key);
                }
                set(key, value, cb = noop_1.noop) {
                    return this.put(value, key, cb);
                }
                put(value, key, cb = noop_1.noop) {
                    void this.cache.set(key, value);
                    if (!this.alive)
                        return value;
                    void this.listen(db => {
                        if (!this.alive)
                            return;
                        if (!this.cache.has(key))
                            return;
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        this.index ? tx.objectStore(this.name).put(this.cache.get(key)) : tx.objectStore(this.name).put(this.cache.get(key), key);
                        void tx.addEventListener('complete', () => void cb(key, tx.error));
                        void tx.addEventListener('error', () => void cb(key, tx.error));
                        void tx.addEventListener('abort', () => void cb(key, tx.error));
                    }, () => void cb(key, new Error('Request has failed.')));
                    return value;
                }
                delete(key, cb = noop_1.noop) {
                    void this.cache.delete(key);
                    if (!this.alive)
                        return;
                    void this.listen(db => {
                        if (!this.alive)
                            return;
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        void tx.objectStore(this.name).delete(key);
                        void tx.addEventListener('complete', () => void cb(tx.error));
                        void tx.addEventListener('error', () => void cb(tx.error));
                        void tx.addEventListener('abort', () => void cb(tx.error));
                    }, () => void cb(new Error('Request has failed.')));
                }
                cursor(query, index, direction, mode, cb) {
                    if (!this.alive)
                        return;
                    void this.listen(db => {
                        if (!this.alive)
                            return;
                        const tx = db.transaction(this.name, mode);
                        const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
                        void req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (!cursor)
                                return;
                            try {
                                void this.cache.set(cursor.primaryKey, { ...cursor.value });
                                void cb(cursor, req.error);
                            } catch (reason) {
                                void cursor.delete();
                                void exception_1.causeAsyncException(reason);
                            }
                        });
                        void tx.addEventListener('complete', () => void cb(null, req.error));
                        void tx.addEventListener('error', () => void cb(null, req.error));
                        void tx.addEventListener('abort', () => void cb(null, req.error));
                    }, () => void cb(null, new Error('Request has failed.')));
                }
                close() {
                    this.alive = false;
                }
            }
            exports.KeyValueStore = KeyValueStore;
        },
        {
            'spica/clock': 10,
            'spica/exception': 13,
            'spica/noop': 26
        }
    ],
    40: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Channel = exports.ChannelMessage = void 0;
            const version = 1;
            class ChannelMessage {
                constructor(key, type) {
                    this.key = key;
                    this.type = type;
                    this.version = version;
                }
            }
            exports.ChannelMessage = ChannelMessage;
            function parse(msg) {
                if (msg.version !== version)
                    return;
                return msg;
            }
            const cache = new Set();
            class Channel {
                constructor(name, debug) {
                    this.name = name;
                    this.debug = debug;
                    this.channel = new BroadcastChannel(this.name);
                    this.listeners = new Set();
                    this.alive = true;
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Broadcast channel "${ name }" is already open.`);
                    void cache.add(this.name);
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Broadcast channel "${ this.name }" is already closed.`);
                }
                listen(type, listener) {
                    void this.ensureAliveness();
                    void this.listeners.add(handler);
                    void this.channel.addEventListener('message', handler);
                    const {debug} = this;
                    return () => (void this.listeners.delete(handler), void this.channel.removeEventListener('message', handler));
                    function handler(ev) {
                        const msg = parse(ev.data);
                        if (!msg || msg.type !== type)
                            return;
                        debug && console.log('recv', msg);
                        return void listener(msg);
                    }
                }
                post(msg) {
                    void this.ensureAliveness();
                    this.debug && console.log('send', msg);
                    void this.channel.postMessage(msg);
                }
                close() {
                    void this.channel.close();
                    void this.listeners.clear();
                    void cache.delete(this.name);
                    this.alive = false;
                }
            }
            exports.Channel = Channel;
        },
        {}
    ],
    41: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isValidPropertyValue = exports.isValidPropertyName = exports.build = exports.Schema = void 0;
            var builder_1 = _dereq_('./module/builder');
            Object.defineProperty(exports, 'Schema', {
                enumerable: true,
                get: function () {
                    return builder_1.Schema;
                }
            });
            Object.defineProperty(exports, 'build', {
                enumerable: true,
                get: function () {
                    return builder_1.build;
                }
            });
            Object.defineProperty(exports, 'isValidPropertyName', {
                enumerable: true,
                get: function () {
                    return builder_1.isValidPropertyName;
                }
            });
            Object.defineProperty(exports, 'isValidPropertyValue', {
                enumerable: true,
                get: function () {
                    return builder_1.isValidPropertyValue;
                }
            });
        },
        { './module/builder': 42 }
    ],
    42: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.build = exports.Schema = exports.isValidPropertyValue = exports.isValidPropertyName = void 0;
            const alias_1 = _dereq_('spica/alias');
            const event_1 = _dereq_('../../../data/es/event');
            Object.defineProperty(exports, 'isValidPropertyName', {
                enumerable: true,
                get: function () {
                    return event_1.isValidPropertyName;
                }
            });
            Object.defineProperty(exports, 'isValidPropertyValue', {
                enumerable: true,
                get: function () {
                    return event_1.isValidPropertyValue;
                }
            });
            const noop_1 = _dereq_('spica/noop');
            var Schema;
            (function (Schema) {
                Schema.meta = Symbol.for('clientchannel/ChannelObject.meta');
                Schema.id = Symbol.for('clientchannel/ChannelObject.id');
                Schema.key = Symbol.for('clientchannel/ChannelObject.key');
                Schema.date = Symbol.for('clientchannel/ChannelObject.data');
                Schema.event = Symbol.for('clientchannel/ChannelObject.event');
            }(Schema = exports.Schema || (exports.Schema = {})));
            function build(source, factory, set = noop_1.noop, get = noop_1.noop) {
                const dao = factory();
                for (const prop of alias_1.ObjectValues(Schema)) {
                    delete dao[prop];
                }
                if (typeof source[Schema.key] !== 'string')
                    throw new TypeError(`ClientChannel: DAO: Invalid key: ${ source[Schema.key] }`);
                const descmap = {
                    ...alias_1.ObjectKeys(dao).filter(event_1.isValidPropertyName).filter(event_1.isValidPropertyValue(dao)).reduce((map, prop) => {
                        {
                            const desc = alias_1.ObjectGetOwnPropertyDescriptor(dao, prop);
                            if (desc && (desc.get || desc.set))
                                return map;
                        }
                        const iniVal = dao[prop];
                        if (source[prop] === void 0) {
                            source[prop] = iniVal;
                        }
                        map[prop] = {
                            enumerable: true,
                            get: () => {
                                const val = source[prop] === void 0 ? iniVal : source[prop];
                                void get(prop, val);
                                return val;
                            },
                            set: newVal => {
                                if (!event_1.isValidPropertyValue({ [prop]: newVal })(prop))
                                    throw new TypeError(`ClientChannel: DAO: Invalid value: ${ JSON.stringify(newVal) }`);
                                const oldVal = source[prop];
                                source[prop] = newVal === void 0 ? iniVal : newVal;
                                void set(prop, newVal, oldVal);
                            }
                        };
                        return map;
                    }, {}),
                    ...{
                        [Schema.meta]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[Schema.meta]
                        },
                        [Schema.id]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[Schema.id]
                        },
                        [Schema.key]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[Schema.key]
                        },
                        [Schema.date]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[Schema.date]
                        },
                        [Schema.event]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[Schema.event]
                        }
                    }
                };
                void alias_1.ObjectDefineProperties(dao, descmap);
                void alias_1.ObjectSeal(dao);
                return dao;
            }
            exports.build = build;
        },
        {
            '../../../data/es/event': 36,
            'spica/alias': 4,
            'spica/noop': 26
        }
    ],
    43: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.StoreChannel = void 0;
            var channel_1 = _dereq_('./service/channel');
            Object.defineProperty(exports, 'StoreChannel', {
                enumerable: true,
                get: function () {
                    return channel_1.StoreChannel;
                }
            });
        },
        { './service/channel': 48 }
    ],
    44: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.ChannelStore = void 0;
            const global_1 = _dereq_('spica/global');
            const observer_1 = _dereq_('spica/observer');
            const cancellation_1 = _dereq_('spica/cancellation');
            const promise_1 = _dereq_('spica/promise');
            const cache_1 = _dereq_('spica/cache');
            const noop_1 = _dereq_('spica/noop');
            const api_1 = _dereq_('../../../infrastructure/indexeddb/api');
            const data_1 = _dereq_('./channel/data');
            const access_1 = _dereq_('./channel/access');
            const expiry_1 = _dereq_('./channel/expiry');
            const channel_1 = _dereq_('../../broadcast/channel');
            const channel_2 = _dereq_('../../ownership/channel');
            class SaveMessage extends channel_1.ChannelMessage {
                constructor(key) {
                    super(key, 'save');
                    this.key = key;
                }
            }
            const cache = new Set();
            class ChannelStore {
                constructor(name, attrs, destroy, age, size, debug = false) {
                    this.name = name;
                    this.age = age;
                    this.size = size;
                    this.debug = debug;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.channel = new channel_1.Channel(this.name, this.debug);
                    this.ownership = new channel_2.Ownership(this.channel);
                    this.keys_ = new Set();
                    this.keys = new cache_1.Cache(this.size, {
                        disposer: (() => {
                            void this.ownership.take('store', 0);
                            const keys = this.keys_;
                            let timer = 0;
                            const resolve = () => {
                                timer = 0;
                                const since = global_1.Date.now();
                                let count = 0;
                                if (!this.ownership.take('store', 5 * 1000))
                                    return;
                                for (const key of keys) {
                                    if (!this.alive)
                                        return void this.keys.clear(), void keys.clear();
                                    void keys.delete(key);
                                    if (timer > 0)
                                        return;
                                    if (this.keys.has(key))
                                        continue;
                                    if (++count > 10)
                                        return void global_1.setTimeout(resolve, (global_1.Date.now() - since) * 3);
                                    if (!this.ownership.extend('store', 5 * 1000))
                                        return;
                                    if (!this.ownership.take(`key:${ key }`, 5 * 1000))
                                        continue;
                                    void this.schema.expire.set(key, 0);
                                }
                            };
                            return key => {
                                void keys.add(key);
                                if (timer > 0)
                                    return;
                                timer = global_1.setTimeout(resolve, 3 * 1000);
                            };
                        })(),
                        capture: { delete: false }
                    });
                    this.events_ = {
                        load: new observer_1.Observation(),
                        save: new observer_1.Observation(),
                        clean: new observer_1.Observation()
                    };
                    this.events = {
                        load: new observer_1.Observation({ limit: global_1.Infinity }),
                        save: new observer_1.Observation({ limit: global_1.Infinity }),
                        loss: new observer_1.Observation({ limit: global_1.Infinity })
                    };
                    this.ages = new Map();
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Store channel "${ name }" is already open.`);
                    void cache.add(name);
                    void this.cancellation.register(() => void cache.delete(name));
                    this.schema = new Schema(this, this.ownership, attrs, api_1.open(name, {
                        make(db) {
                            return data_1.DataStore.configure().make(db) && access_1.AccessStore.configure().make(db) && expiry_1.ExpiryStore.configure().make(db);
                        },
                        verify(db) {
                            return data_1.DataStore.configure().verify(db) && access_1.AccessStore.configure().verify(db) && expiry_1.ExpiryStore.configure().verify(db);
                        },
                        destroy(reason, ev) {
                            return data_1.DataStore.configure().destroy(reason, ev) && access_1.AccessStore.configure().destroy(reason, ev) && expiry_1.ExpiryStore.configure().destroy(reason, ev) && destroy(reason, ev);
                        }
                    }));
                    void this.cancellation.register(api_1.idbEventStream.on([
                        name,
                        'destroy'
                    ], () => void this.schema.rebuild()));
                    void this.cancellation.register(() => void this.schema.close());
                    void this.cancellation.register(() => void this.ownership.close());
                    void this.cancellation.register(() => void this.channel.close());
                    void this.cancellation.register(this.channel.listen('save', ({key}) => (void this.keys.delete(key) || void this.keys_.delete(key), void this.fetch(key))));
                    void this.events_.save.monitor([], ({key}) => void this.channel.post(new SaveMessage(key)));
                    void this.events_.clean.monitor([], (_, [key]) => {
                        void this.ownership.take(`key:${ key }`, 5 * 1000);
                        void this.schema.access.delete(key);
                        void this.schema.expire.delete(key);
                    });
                    if (this.size === global_1.Infinity)
                        return;
                    void this.events_.load.monitor([], ({key, type}) => type === ChannelStore.EventType.delete ? void this.keys.delete(key) || void this.keys_.delete(key) : void this.keys.put(key));
                    void this.events_.save.monitor([], ({key, type}) => type === ChannelStore.EventType.delete ? void this.keys.delete(key) || void this.keys_.delete(key) : void this.keys.put(key));
                    const limit = () => {
                        if (size === global_1.Infinity)
                            return;
                        if (!this.alive)
                            return;
                        void this.recent(global_1.Infinity, (ks, error) => {
                            if (error)
                                return void global_1.setTimeout(limit, 10 * 1000);
                            for (const key of ks.reverse()) {
                                void this.keys.put(key);
                            }
                        });
                    };
                    void limit();
                }
                get alive() {
                    return this.cancellation.alive;
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Store channel "${ this.name }" is already closed.`);
                }
                sync(keys, timeout) {
                    void this.ensureAliveness();
                    const cancellation = timeout === void 0 ? void 0 : new cancellation_1.Cancellation();
                    cancellation && void global_1.setTimeout(cancellation.cancel, timeout);
                    return promise_1.AtomicPromise.allSettled(keys.map(key => new global_1.Promise((resolve, reject) => void this.fetch(key, error => error ? void reject(error) : void resolve(key), cancellation))));
                }
                fetch(key, cb = noop_1.noop, cancellation) {
                    void this.ensureAliveness();
                    void this.schema.access.fetch(key);
                    return this.schema.data.fetch(key, cb, cancellation);
                }
                has(key) {
                    return this.schema.data.has(key);
                }
                meta(key) {
                    void this.ensureAliveness();
                    return this.schema.data.meta(key);
                }
                get(key) {
                    void this.ensureAliveness();
                    void this.log(key);
                    return this.schema.data.get(key);
                }
                add(record) {
                    void this.ensureAliveness();
                    const key = record.key;
                    void this.log(key);
                    void this.schema.data.add(record);
                    void this.events_.save.once([
                        record.key,
                        record.attr,
                        record.type
                    ], () => void this.log(key));
                }
                delete(key) {
                    void this.ensureAliveness();
                    void this.ownership.take(`key:${ key }`, 5 * 1000);
                    void this.log(key);
                    void this.schema.data.delete(key);
                }
                log(key) {
                    if (this.meta(key).id > 0 && !this.has(key))
                        return;
                    void this.schema.access.set(key);
                    void this.schema.expire.set(key, this.ages.get(key) || this.age);
                }
                expire(key, age = this.age) {
                    void this.ensureAliveness();
                    void this.ages.set(key, age);
                    return void this.schema.expire.set(key, age);
                }
                recent(limit, cb) {
                    void this.ensureAliveness();
                    return this.schema.access.recent(limit, cb);
                }
                close() {
                    void this.cancellation.cancel();
                    return void api_1.close(this.name);
                }
                destroy() {
                    void this.ensureAliveness();
                    void this.cancellation.cancel();
                    return void api_1.destroy(this.name);
                }
            }
            exports.ChannelStore = ChannelStore;
            (function (ChannelStore) {
                ChannelStore.Event = data_1.DataStore.Event;
                ChannelStore.EventType = data_1.DataStore.EventType;
                ChannelStore.Record = data_1.DataStore.Record;
            }(ChannelStore = exports.ChannelStore || (exports.ChannelStore = {})));
            class Schema {
                constructor(store, ownership, attrs, listen) {
                    this.store = store;
                    this.ownership = ownership;
                    this.attrs = attrs;
                    this.listen = listen;
                    this.cancellation = new cancellation_1.Cancellation();
                    void this.build();
                }
                build() {
                    const keys = this.data ? this.data.keys() : [];
                    this.data = new data_1.DataStore(this.attrs, this.listen);
                    this.access = new access_1.AccessStore(this.listen);
                    this.expire = new expiry_1.ExpiryStore(this.store, this.cancellation, this.ownership, this.listen);
                    void this.cancellation.register(() => this.data.close());
                    void this.cancellation.register(() => this.access.close());
                    void this.cancellation.register(() => this.expire.close());
                    void this.cancellation.register(this.store.events_.load.relay(this.data.events.load));
                    void this.cancellation.register(this.store.events_.save.relay(this.data.events.save));
                    void this.cancellation.register(this.store.events_.clean.relay(this.data.events.clean));
                    void this.cancellation.register(this.store.events.load.relay(this.data.events.load));
                    void this.cancellation.register(this.store.events.save.relay(this.data.events.save));
                    void this.cancellation.register(this.store.events.loss.relay(this.data.events.loss));
                    void this.store.sync(keys);
                }
                rebuild() {
                    void this.close();
                    this.cancellation = new cancellation_1.Cancellation();
                    void this.build();
                }
                close() {
                    void this.cancellation.cancel();
                }
            }
        },
        {
            '../../../infrastructure/indexeddb/api': 55,
            '../../broadcast/channel': 40,
            '../../ownership/channel': 49,
            './channel/access': 45,
            './channel/data': 46,
            './channel/expiry': 47,
            'spica/cache': 7,
            'spica/cancellation': 8,
            'spica/global': 15,
            'spica/noop': 26,
            'spica/observer': 27,
            'spica/promise': 28
        }
    ],
    45: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.AccessStore = exports.name = void 0;
            const global_1 = _dereq_('spica/global');
            const store_1 = _dereq_('../../../../data/kvs/store');
            const exception_1 = _dereq_('spica/exception');
            exports.name = 'access';
            class AccessStore {
                constructor(listen) {
                    this.listen = listen;
                    this.store = new class extends store_1.KeyValueStore {
                    }(exports.name, 'key', this.listen);
                }
                static configure() {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(exports.name) ? tx.objectStore(exports.name) : tx.db.createObjectStore(exports.name, {
                                keyPath: 'key',
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains('key')) {
                                void store.createIndex('key', 'key', { unique: true });
                            }
                            if (!store.indexNames.contains('date')) {
                                void store.createIndex('date', 'date');
                            }
                            return true;
                        },
                        verify(db) {
                            return db.objectStoreNames.contains(exports.name) && db.transaction(exports.name).objectStore(exports.name).indexNames.contains('key') && db.transaction(exports.name).objectStore(exports.name).indexNames.contains('date');
                        },
                        destroy() {
                            return true;
                        }
                    };
                }
                recent(limit, cb) {
                    const keys = [];
                    return void this.store.cursor(null, 'date', 'prev', 'readonly', (cursor, error) => {
                        if (error || !cursor)
                            return void cb(keys, error);
                        if (--limit < 0)
                            return;
                        try {
                            const {key} = cursor.value;
                            void keys.push(key);
                        } catch (reason) {
                            void cursor.delete();
                            void exception_1.causeAsyncException(reason);
                        }
                        void cursor.continue();
                    });
                }
                fetch(key) {
                    return this.store.fetch(key);
                }
                get(key) {
                    return this.store.has(key) ? this.store.get(key).date : 0;
                }
                set(key) {
                    void this.store.set(key, new AccessRecord(key));
                }
                delete(key) {
                    void this.store.delete(key);
                }
                close() {
                    void this.store.close();
                }
            }
            exports.AccessStore = AccessStore;
            class AccessRecord {
                constructor(key) {
                    this.key = key;
                    this.date = global_1.Date.now();
                }
            }
        },
        {
            '../../../../data/kvs/store': 39,
            'spica/exception': 13,
            'spica/global': 15
        }
    ],
    46: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.DataStore = exports.name = void 0;
            const store_1 = _dereq_('../../../../data/es/store');
            exports.name = 'data';
            class DataStore extends store_1.EventStore {
                static configure() {
                    return store_1.EventStore.configure(exports.name);
                }
                constructor(attrs, listen) {
                    super(exports.name, attrs, listen);
                }
            }
            exports.DataStore = DataStore;
            (function (DataStore) {
                DataStore.Event = store_1.EventStore.Event;
                DataStore.EventType = store_1.EventStore.EventType;
                DataStore.Record = store_1.EventStore.Record;
                DataStore.Value = store_1.EventStore.Value;
            }(DataStore = exports.DataStore || (exports.DataStore = {})));
        },
        { '../../../../data/es/store': 38 }
    ],
    47: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.ExpiryStore = void 0;
            const global_1 = _dereq_('spica/global');
            const store_1 = _dereq_('../../../../data/kvs/store');
            const exception_1 = _dereq_('spica/exception');
            const name = 'expiry';
            class ExpiryStore {
                constructor(chan, cancellation, ownership, listen) {
                    this.chan = chan;
                    this.cancellation = cancellation;
                    this.ownership = ownership;
                    this.listen = listen;
                    this.store = new class extends store_1.KeyValueStore {
                    }(name, 'key', this.listen);
                    this.schedule = (() => {
                        let timer = 0;
                        let scheduled = global_1.Infinity;
                        let running = false;
                        let wait = 5 * 1000;
                        void this.ownership.take('store', 0);
                        return timeout => {
                            timeout = global_1.Math.max(timeout, 3 * 1000);
                            if (global_1.Date.now() + timeout >= scheduled)
                                return;
                            scheduled = global_1.Date.now() + timeout;
                            void clearTimeout(timer);
                            timer = global_1.setTimeout(() => {
                                if (!this.cancellation.alive)
                                    return;
                                if (running)
                                    return;
                                scheduled = global_1.Infinity;
                                if (!this.ownership.take('store', wait))
                                    return this.schedule(wait *= 2);
                                wait = global_1.Math.max(global_1.Math.floor(wait / 1.5), 5 * 1000);
                                const since = global_1.Date.now();
                                let retry = false;
                                running = true;
                                return void this.store.cursor(null, 'expiry', 'next', 'readonly', (cursor, error) => {
                                    running = false;
                                    if (!this.cancellation.alive)
                                        return;
                                    if (error)
                                        return void this.schedule(wait * 10);
                                    if (!cursor)
                                        return retry && void this.schedule(wait);
                                    try {
                                        const {key, expiry} = cursor.value;
                                        if (expiry > global_1.Date.now())
                                            return void this.schedule(expiry - global_1.Date.now());
                                        if (!this.ownership.extend('store', wait))
                                            return;
                                        if (global_1.Date.now() - since > 1000)
                                            return void this.schedule(wait / 2);
                                        running = true;
                                        if (!this.ownership.take(`key:${ key }`, wait))
                                            return retry = true, void cursor.continue();
                                        void this.chan.delete(key);
                                    } catch (reason) {
                                        void cursor.delete();
                                        void exception_1.causeAsyncException(reason);
                                    }
                                    return void cursor.continue();
                                });
                            }, timeout);
                        };
                    })();
                    void this.schedule(10 * 1000);
                }
                static configure() {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: 'key',
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains('key')) {
                                void store.createIndex('key', 'key', { unique: true });
                            }
                            if (!store.indexNames.contains('expiry')) {
                                void store.createIndex('expiry', 'expiry');
                            }
                            return true;
                        },
                        verify(db) {
                            return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains('key') && db.transaction(name).objectStore(name).indexNames.contains('expiry');
                        },
                        destroy() {
                            return true;
                        }
                    };
                }
                set(key, age) {
                    if (age === global_1.Infinity)
                        return void this.delete(key);
                    void this.schedule(age);
                    void this.store.set(key, new ExpiryRecord(key, global_1.Date.now() + age));
                }
                delete(key) {
                    void this.store.delete(key);
                }
                close() {
                    void this.store.close();
                }
            }
            exports.ExpiryStore = ExpiryStore;
            class ExpiryRecord {
                constructor(key, expiry) {
                    this.key = key;
                    this.expiry = expiry;
                }
            }
        },
        {
            '../../../../data/kvs/store': 39,
            'spica/exception': 13,
            'spica/global': 15
        }
    ],
    48: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.StoreChannel = void 0;
            const alias_1 = _dereq_('spica/alias');
            const observer_1 = _dereq_('spica/observer');
            const throttle_1 = _dereq_('spica/throttle');
            const api_1 = _dereq_('../../dao/api');
            const channel_1 = _dereq_('../model/channel');
            const api_2 = _dereq_('../../webstorage/api');
            class StoreChannel extends channel_1.ChannelStore {
                constructor(name, factory, {migrate = () => void 0, destroy = () => true, age = Infinity, size = Infinity, debug = false} = {}) {
                    super(name, alias_1.ObjectKeys(factory()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(factory())), destroy, age, size, debug);
                    this.factory = factory;
                    this.links = new Map();
                    this.sources = new Map();
                    const attrs = alias_1.ObjectKeys(factory()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(factory()));
                    void this.events_.load.monitor([], ({key, attr, type}) => {
                        if (!this.sources.has(key))
                            return;
                        const source = this.sources.get(key);
                        const memory = this.get(key);
                        const link = this.link(key);
                        switch (type) {
                        case channel_1.ChannelStore.EventType.put:
                            return void update(attrs.filter(a => a === attr));
                        case channel_1.ChannelStore.EventType.delete:
                        case channel_1.ChannelStore.EventType.snapshot:
                            return void update(attrs);
                        }
                        return;
                        function update(attrs) {
                            const changes = attrs.filter(attr => attr in memory).map(attr => {
                                const newVal = memory[attr];
                                const oldVal = source[attr];
                                source[attr] = newVal;
                                return {
                                    attr,
                                    newVal,
                                    oldVal
                                };
                            }).filter(({newVal, oldVal}) => ![newVal].includes(oldVal));
                            if (changes.length === 0)
                                return;
                            void migrate(link);
                            for (const {attr, oldVal} of changes) {
                                void cast(source[api_1.Schema.event]).emit([
                                    api_2.StorageChannel.EventType.recv,
                                    attr
                                ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.recv, attr, memory[attr], oldVal));
                            }
                        }
                    });
                }
                link(key, age) {
                    void this.ensureAliveness();
                    void this.fetch(key);
                    void this.expire(key, age);
                    return this.links.has(key) ? this.links.get(key) : this.links.set(key, api_1.build(alias_1.ObjectDefineProperties(this.sources.set(key, this.get(key)).get(key), {
                        [api_1.Schema.meta]: { get: () => this.meta(key) },
                        [api_1.Schema.id]: { get: () => this.meta(key).id },
                        [api_1.Schema.key]: { get: () => this.meta(key).key },
                        [api_1.Schema.date]: { get: () => this.meta(key).date },
                        [api_1.Schema.event]: { value: new observer_1.Observation({ limit: Infinity }) }
                    }), this.factory, (attr, newValue, oldValue) => {
                        if (!this.alive)
                            return;
                        void this.add(new channel_1.ChannelStore.Record(key, { [attr]: newValue }));
                        void cast(this.sources.get(key)[api_1.Schema.event]).emit([
                            api_2.StorageChannel.EventType.send,
                            attr
                        ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.send, attr, newValue, oldValue));
                    }, throttle_1.throttle(100, () => this.alive && this.links.has(key) && this.has(key) && void this.log(key)))).get(key);
                }
            }
            exports.StoreChannel = StoreChannel;
            function cast(o) {
                return o;
            }
        },
        {
            '../../dao/api': 41,
            '../../webstorage/api': 50,
            '../model/channel': 44,
            'spica/alias': 4,
            'spica/observer': 27,
            'spica/throttle': 30
        }
    ],
    49: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Ownership = void 0;
            const global_1 = _dereq_('spica/global');
            const channel_1 = _dereq_('../broadcast/channel');
            const cancellation_1 = _dereq_('spica/cancellation');
            class OwnershipMessage extends channel_1.ChannelMessage {
                constructor(key, priority) {
                    super(key, 'ownership');
                    this.key = key;
                    this.priority = priority;
                }
            }
            class Ownership {
                constructor(channel) {
                    this.channel = channel;
                    this.store = new Map();
                    this.cancellation = new cancellation_1.Cancellation();
                    this.alive = true;
                    void this.cancellation.register((() => {
                        const listener = () => this.close();
                        void self.addEventListener('unload', listener);
                        return () => void self.removeEventListener('unload', listener);
                    })());
                    void this.cancellation.register(() => {
                        for (const key of this.store.keys()) {
                            void this.release(key);
                        }
                        void this.channel.close();
                    });
                    void this.channel.listen('ownership', ({
                        key,
                        priority: newPriority
                    }) => {
                        const oldPriority = this.getPriority(key);
                        switch (true) {
                        case newPriority === 0:
                            return oldPriority < 0 ? void this.setPriority(key, 0) : void 0;
                        case oldPriority > 0:
                            return newPriority > oldPriority && this.has(key) ? void this.castPriority(key) : void this.setPriority(key, -newPriority);
                        case oldPriority < 0:
                            return void this.setPriority(key, -newPriority);
                        default:
                        }
                    });
                }
                static genPriority(age) {
                    return global_1.Date.now() + age;
                }
                getPriority(key) {
                    return this.store.get(key) || 0;
                }
                setPriority(key, newPriority) {
                    const oldPriority = this.getPriority(key);
                    if (newPriority === oldPriority)
                        return;
                    void this.store.set(key, newPriority);
                    const mergin = 1000;
                    if (newPriority > 0 && newPriority > oldPriority + mergin) {
                        void this.castPriority(key);
                    }
                }
                castPriority(key) {
                    void this.channel.post(new OwnershipMessage(key, this.getPriority(key)));
                }
                has(key) {
                    const priority = this.getPriority(key);
                    return priority > 0 && priority >= Ownership.genPriority(0) + Ownership.mergin;
                }
                isTakable(key) {
                    const priority = this.getPriority(key);
                    return priority >= 0 || Ownership.genPriority(0) > global_1.Math.abs(priority);
                }
                take(key, age, wait) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    if (!this.isTakable(key))
                        return wait === void 0 ? false : global_1.Promise.resolve(false);
                    age = global_1.Math.min(global_1.Math.max(age, 1 * 1000), 60 * 1000);
                    wait = wait === void 0 ? wait : global_1.Math.max(wait, 0);
                    void this.setPriority(key, global_1.Math.max(Ownership.genPriority(age) + Ownership.mergin, this.getPriority(key)));
                    return wait === void 0 ? this.has(key) : new global_1.Promise(resolve => void global_1.setTimeout(() => void resolve(this.extend(key, age)), wait));
                }
                extend(key, age) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    return this.has(key) ? this.take(key, age) : false;
                }
                release(key) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    if (!this.has(key))
                        return;
                    void this.setPriority(key, 0);
                    void this.castPriority(key);
                }
                close() {
                    void this.cancellation.cancel();
                    this.alive = false;
                }
            }
            exports.Ownership = Ownership;
            Ownership.mergin = 5 * 1000;
        },
        {
            '../broadcast/channel': 40,
            'spica/cancellation': 8,
            'spica/global': 15
        }
    ],
    50: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.sessionStorage = exports.localStorage = exports.StorageChannel = void 0;
            var channel_1 = _dereq_('./service/channel');
            Object.defineProperty(exports, 'StorageChannel', {
                enumerable: true,
                get: function () {
                    return channel_1.StorageChannel;
                }
            });
            var api_1 = _dereq_('../../infrastructure/webstorage/api');
            Object.defineProperty(exports, 'localStorage', {
                enumerable: true,
                get: function () {
                    return api_1.localStorage;
                }
            });
            Object.defineProperty(exports, 'sessionStorage', {
                enumerable: true,
                get: function () {
                    return api_1.sessionStorage;
                }
            });
        },
        {
            '../../infrastructure/webstorage/api': 61,
            './service/channel': 52
        }
    ],
    51: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.fakeStorage = void 0;
            class Storage {
                constructor() {
                    this.store = new Map();
                }
                get length() {
                    return this.store.size;
                }
                getItem(key) {
                    return this.store.has(key) ? this.store.get(key) : null;
                }
                setItem(key, data) {
                    void this.store.set(key, data);
                }
                removeItem(key) {
                    void this.store.delete(key);
                }
                clear() {
                    void this.store.clear();
                }
            }
            exports.fakeStorage = new Storage();
        },
        {}
    ],
    52: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.StorageChannel = void 0;
            const alias_1 = _dereq_('spica/alias');
            const observer_1 = _dereq_('spica/observer');
            const cancellation_1 = _dereq_('spica/cancellation');
            const api_1 = _dereq_('../../dao/api');
            const api_2 = _dereq_('../../../infrastructure/webstorage/api');
            const storage_1 = _dereq_('../model/storage');
            const cache = new Set();
            class StorageChannel {
                constructor(name, storage = api_2.sessionStorage || storage_1.fakeStorage, factory, migrate = () => void 0) {
                    this.name = name;
                    this.storage = storage;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
                    this.events = {
                        send: new observer_1.Observation({ limit: Infinity }),
                        recv: new observer_1.Observation({ limit: Infinity })
                    };
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Storage channel "${ name }" is already open.`);
                    void cache.add(name);
                    void this.cancellation.register(() => void cache.delete(name));
                    const source = {
                        ...parse(this.storage.getItem(this.name)),
                        [api_1.Schema.key]: this.name,
                        [api_1.Schema.event]: new observer_1.Observation({ limit: Infinity })
                    };
                    this.link_ = api_1.build(source, factory, (attr, newValue, oldValue) => {
                        if (!this.alive)
                            return;
                        void this.storage.setItem(this.name, JSON.stringify(alias_1.ObjectKeys(source).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(source)).reduce((acc, attr) => {
                            acc[attr] = source[attr];
                            return acc;
                        }, {})));
                        const event = new StorageChannel.Event(StorageChannel.EventType.send, attr, newValue, oldValue);
                        void source[api_1.Schema.event].emit([
                            event.type,
                            event.attr
                        ], event);
                        void this.events.send.emit([event.attr], event);
                    });
                    void migrate(this.link_);
                    void this.cancellation.register(api_2.storageEventStream.on([
                        this.mode,
                        this.name
                    ], ({newValue}) => {
                        const item = parse(newValue);
                        void alias_1.ObjectKeys(item).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(item)).forEach(attr => {
                            const oldVal = source[attr];
                            const newVal = item[attr];
                            if ([newVal].includes(oldVal))
                                return;
                            source[attr] = newVal;
                            void migrate(this.link_);
                            const event = new StorageChannel.Event(StorageChannel.EventType.recv, attr, source[attr], oldVal);
                            void source[api_1.Schema.event].emit([
                                event.type,
                                event.attr
                            ], event);
                            void this.events.recv.emit([event.attr], event);
                        });
                    }));
                }
                get alive() {
                    return this.cancellation.alive;
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Storage channel "${ this.name }" is already closed.`);
                }
                link() {
                    void this.ensureAliveness();
                    return this.link_;
                }
                close() {
                    void this.cancellation.cancel();
                }
                destroy() {
                    void this.ensureAliveness();
                    void this.cancellation.cancel();
                    void this.storage.removeItem(this.name);
                }
            }
            exports.StorageChannel = StorageChannel;
            (function (StorageChannel) {
                class Event {
                    constructor(type, attr, newValue, oldValue) {
                        this.type = type;
                        this.attr = attr;
                        this.newValue = newValue;
                        this.oldValue = oldValue;
                    }
                }
                StorageChannel.Event = Event;
                let EventType;
                (function (EventType) {
                    EventType.send = 'send';
                    EventType.recv = 'recv';
                }(EventType = StorageChannel.EventType || (StorageChannel.EventType = {})));
            }(StorageChannel = exports.StorageChannel || (exports.StorageChannel = {})));
            function parse(item) {
                try {
                    return JSON.parse(item || '{}') || {};
                } catch (_a) {
                    return {};
                }
            }
        },
        {
            '../../../infrastructure/webstorage/api': 61,
            '../../dao/api': 41,
            '../model/storage': 51,
            'spica/alias': 4,
            'spica/cancellation': 8,
            'spica/observer': 27
        }
    ],
    53: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.verifyStorageAccess = exports.isStorageAvailable = void 0;
            var storage_1 = _dereq_('./module/storage');
            Object.defineProperty(exports, 'isStorageAvailable', {
                enumerable: true,
                get: function () {
                    return storage_1.isStorageAvailable;
                }
            });
            Object.defineProperty(exports, 'verifyStorageAccess', {
                enumerable: true,
                get: function () {
                    return storage_1.verifyStorageAccess;
                }
            });
        },
        { './module/storage': 54 }
    ],
    54: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.verifyStorageAccess = exports.isStorageAvailable = void 0;
            const uuid_1 = _dereq_('spica/uuid');
            exports.isStorageAvailable = verifyStorageAccess();
            function verifyStorageAccess() {
                try {
                    if (!self.navigator.cookieEnabled)
                        throw void 0;
                    const key = 'clientchannel#' + uuid_1.uuid();
                    void self.sessionStorage.setItem(key, key);
                    if (key !== self.sessionStorage.getItem(key))
                        throw void 0;
                    void self.sessionStorage.removeItem(key);
                    return exports.isStorageAvailable = true;
                } catch (_a) {
                    return exports.isStorageAvailable = false;
                }
            }
            exports.verifyStorageAccess = verifyStorageAccess;
        },
        { 'spica/uuid': 32 }
    ],
    55: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.IDBEvent = exports.idbEventStream = exports.destroy = exports.close = exports.listen_ = exports.open = exports.IDBKeyRange = exports.indexedDB = void 0;
            var global_1 = _dereq_('./module/global');
            Object.defineProperty(exports, 'indexedDB', {
                enumerable: true,
                get: function () {
                    return global_1.indexedDB;
                }
            });
            Object.defineProperty(exports, 'IDBKeyRange', {
                enumerable: true,
                get: function () {
                    return global_1.IDBKeyRange;
                }
            });
            var access_1 = _dereq_('./model/access');
            Object.defineProperty(exports, 'open', {
                enumerable: true,
                get: function () {
                    return access_1.open;
                }
            });
            Object.defineProperty(exports, 'listen_', {
                enumerable: true,
                get: function () {
                    return access_1.listen_;
                }
            });
            Object.defineProperty(exports, 'close', {
                enumerable: true,
                get: function () {
                    return access_1.close;
                }
            });
            Object.defineProperty(exports, 'destroy', {
                enumerable: true,
                get: function () {
                    return access_1.destroy;
                }
            });
            var event_1 = _dereq_('./model/event');
            Object.defineProperty(exports, 'idbEventStream', {
                enumerable: true,
                get: function () {
                    return event_1.idbEventStream;
                }
            });
            Object.defineProperty(exports, 'IDBEvent', {
                enumerable: true,
                get: function () {
                    return event_1.IDBEvent;
                }
            });
        },
        {
            './model/access': 56,
            './model/event': 57,
            './module/global': 60
        }
    ],
    56: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.destroy = exports.close = exports.listen_ = exports.open = void 0;
            const state_1 = _dereq_('./state');
            const transition_1 = _dereq_('./transition');
            const event_1 = _dereq_('./event');
            const api_1 = _dereq_('../../environment/api');
            const noop_1 = _dereq_('spica/noop');
            function open(database, config) {
                void operate(database, 'open', config);
                return (success, failure) => void request(database, success, failure);
            }
            exports.open = open;
            exports.listen_ = request;
            function close(database) {
                return void operate(database, 'close', {
                    make() {
                        return false;
                    },
                    verify() {
                        return false;
                    },
                    destroy() {
                        return false;
                    }
                });
            }
            exports.close = close;
            function destroy(database) {
                return void operate(database, 'destroy', {
                    make() {
                        return false;
                    },
                    verify() {
                        return false;
                    },
                    destroy() {
                        return true;
                    }
                });
            }
            exports.destroy = destroy;
            function operate(database, command, config) {
                if (state_1.commands.get(database) === 'destroy') {
                    switch (command) {
                    case 'open':
                    case 'close':
                        return void event_1.idbEventStream.once([
                            database,
                            'destroy'
                        ], () => void operate(database, command, config));
                    }
                }
                void state_1.commands.set(database, command);
                void state_1.configs.set(database, config);
                if (!state_1.isIDBAvailable || !api_1.isStorageAvailable)
                    return;
                if (state_1.states.has(database)) {
                    return void request(database, noop_1.noop);
                } else {
                    return void transition_1.handle(database);
                }
            }
            function request(database, success, failure = noop_1.noop) {
                if (!state_1.isIDBAvailable)
                    return void failure(new Error('Database is unavailable.'));
                if (!api_1.isStorageAvailable)
                    return void failure(new Error('Storage is unavailable.'));
                if (!state_1.requests.has(database))
                    return void failure(new Error('Database is inactive.'));
                void state_1.requests.get(database).enqueue(success, failure);
                void transition_1.handle(database);
            }
        },
        {
            '../../environment/api': 53,
            './event': 57,
            './state': 58,
            './transition': 59,
            'spica/noop': 26
        }
    ],
    57: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.IDBEvent = exports.idbEventStream = exports.idbEventStream_ = void 0;
            const observer_1 = _dereq_('spica/observer');
            exports.idbEventStream_ = new observer_1.Observation({ limit: Infinity });
            exports.idbEventStream = exports.idbEventStream_;
            class IDBEvent {
                constructor(name, type) {
                    this.name = name;
                    this.type = type;
                }
            }
            exports.IDBEvent = IDBEvent;
        },
        { 'spica/observer': 27 }
    ],
    58: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.EndState = exports.DestroyState = exports.CrashState = exports.AbortState = exports.ErrorState = exports.SuccessState = exports.UpgradeState = exports.BlockState = exports.InitialState = exports.states = exports.requests = exports.configs = exports.commands = exports.isIDBAvailable = void 0;
            exports.isIDBAvailable = true;
            exports.commands = new Map();
            exports.configs = new Map();
            exports.requests = new Map();
            class RequestQueue {
                constructor(database) {
                    this.database = database;
                    this.queue = [];
                }
                enqueue(success, failure) {
                    const state = exports.states.get(this.database);
                    if (!state || !state.alive || state.queue !== this)
                        return void failure(new Error('Request is invalid.'));
                    void this.queue.push({
                        success,
                        failure
                    });
                }
                dequeue() {
                    return this.queue.shift();
                }
                get size() {
                    return this.queue.length;
                }
                clear() {
                    while (true) {
                        try {
                            while (this.queue.length > 0) {
                                void this.queue.shift().failure(new Error('Request is cancelled.'));
                            }
                            return;
                        } catch (_a) {
                            continue;
                        }
                    }
                }
            }
            exports.states = new Map();
            class State {
                constructor(database, curr) {
                    this.database = database;
                    this.alive = false;
                    if ((curr === null || curr === void 0 ? void 0 : curr.alive) === false)
                        return;
                    if (this instanceof InitialState) {
                        this.alive = !curr;
                        if (!this.alive)
                            return;
                        void exports.requests.set(database, exports.requests.get(database) || new RequestQueue(database));
                    } else {
                        this.alive = !!curr;
                        if (!this.alive || !curr)
                            return;
                        curr.alive = false;
                    }
                    void exports.states.set(database, this);
                }
                get command() {
                    return exports.commands.get(this.database);
                }
                get config() {
                    return exports.configs.get(this.database);
                }
                get queue() {
                    return exports.requests.get(this.database);
                }
            }
            class InitialState extends State {
                constructor(database, version = 0) {
                    super(database, exports.states.get(database));
                    this.version = version;
                    this.STATE;
                }
            }
            exports.InitialState = InitialState;
            class BlockState extends State {
                constructor(state, session) {
                    super(state.database, state);
                    this.session = session;
                    this.STATE;
                }
            }
            exports.BlockState = BlockState;
            class UpgradeState extends State {
                constructor(state, session) {
                    super(state.database, state);
                    this.session = session;
                    this.STATE;
                }
            }
            exports.UpgradeState = UpgradeState;
            class SuccessState extends State {
                constructor(state, connection) {
                    super(state.database, state);
                    this.connection = connection;
                    this.STATE;
                    exports.isIDBAvailable = true;
                }
            }
            exports.SuccessState = SuccessState;
            class ErrorState extends State {
                constructor(state, error, event) {
                    super(state.database, state);
                    this.error = error;
                    this.event = event;
                    this.STATE;
                    if (state instanceof InitialState && error.message === 'A mutation operation was attempted on a database that did not allow mutations.') {
                        exports.isIDBAvailable = false;
                    }
                }
            }
            exports.ErrorState = ErrorState;
            class AbortState extends State {
                constructor(state, event) {
                    super(state.database, state);
                    this.event = event;
                    this.STATE;
                }
            }
            exports.AbortState = AbortState;
            class CrashState extends State {
                constructor(state, reason) {
                    super(state.database, state);
                    this.reason = reason;
                    this.STATE;
                }
            }
            exports.CrashState = CrashState;
            class DestroyState extends State {
                constructor(state) {
                    super(state.database, state);
                    this.STATE;
                }
            }
            exports.DestroyState = DestroyState;
            class EndState extends State {
                constructor(state, version = 0) {
                    super(state.database, state);
                    this.version = version;
                    this.STATE;
                }
                complete() {
                    var _a;
                    switch (this.command) {
                    case 'close':
                    case 'destroy':
                        void ((_a = exports.requests.get(this.database)) === null || _a === void 0 ? void 0 : _a.clear());
                        void exports.commands.delete(this.database);
                        void exports.configs.delete(this.database);
                        void exports.requests.delete(this.database);
                    }
                    void exports.states.delete(this.database);
                    this.alive = false;
                }
            }
            exports.EndState = EndState;
        },
        {}
    ],
    59: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.handle = void 0;
            const global_1 = _dereq_('../module/global');
            const state_1 = _dereq_('./state');
            const event_1 = _dereq_('./event');
            const api_1 = _dereq_('../../environment/api');
            const exception_1 = _dereq_('spica/exception');
            function handle(database) {
                const state = state_1.states.get(database);
                return state instanceof state_1.SuccessState ? void handleSuccessState(state) : void handleInitialState(new state_1.InitialState(database));
            }
            exports.handle = handle;
            function handleInitialState(state) {
                if (!state.alive)
                    return;
                const {database, version} = state;
                try {
                    const openRequest = version ? global_1.indexedDB.open(database, version) : global_1.indexedDB.open(database);
                    openRequest.onblocked = () => void handleBlockedState(new state_1.BlockState(state, openRequest));
                    openRequest.onupgradeneeded = () => void handleUpgradeState(new state_1.UpgradeState(state, openRequest));
                    openRequest.onsuccess = () => void handleSuccessState(new state_1.SuccessState(state, openRequest.result));
                    openRequest.onerror = event => void handleErrorState(new state_1.ErrorState(state, openRequest.error, event));
                } catch (reason) {
                    void handleCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleBlockedState(state) {
                if (!state.alive)
                    return;
                const {database, session} = state;
                session.onblocked = () => void handleBlockedState(new state_1.BlockState(state, session));
                session.onupgradeneeded = () => void handleUpgradeState(new state_1.UpgradeState(state, session));
                session.onsuccess = () => void handleSuccessState(new state_1.SuccessState(state, session.result));
                session.onerror = event => void handleErrorState(new state_1.ErrorState(state, session.error, event));
                void event_1.idbEventStream_.emit([
                    database,
                    'block'
                ], new event_1.IDBEvent(database, 'block'));
            }
            function handleUpgradeState(state) {
                if (!state.alive)
                    return;
                const {session, config} = state;
                const db = session.transaction.db;
                try {
                    if (config.make(session.transaction)) {
                        session.onsuccess = () => void handleSuccessState(new state_1.SuccessState(state, db));
                        session.onerror = event => void handleErrorState(new state_1.ErrorState(state, session.error, event));
                    } else {
                        session.onsuccess = session.onerror = event => (void db.close(), config.destroy(session.error, event) ? void handleDestroyState(new state_1.DestroyState(state)) : void handleEndState(new state_1.EndState(state)));
                    }
                } catch (reason) {
                    void handleCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleSuccessState(state) {
                if (!state.alive)
                    return;
                const {database, connection, config, queue} = state;
                connection.onversionchange = () => {
                    const curr = new state_1.EndState(state);
                    void connection.close();
                    void event_1.idbEventStream_.emit([
                        database,
                        'destroy'
                    ], new event_1.IDBEvent(database, 'destroy'));
                    void handleEndState(curr);
                };
                connection.onerror = event => void handleErrorState(new state_1.ErrorState(state, event.target.error, event));
                connection.onabort = event => void handleAbortState(new state_1.AbortState(state, event));
                connection.onclose = () => void handleEndState(new state_1.EndState(state));
                switch (state.command) {
                case 'open': {
                        VALIDATION:
                            try {
                                if (config.verify(connection))
                                    break VALIDATION;
                                void connection.close();
                                return void handleEndState(new state_1.EndState(state, connection.version + 1));
                            } catch (reason) {
                                void connection.close();
                                return void handleCrashState(new state_1.CrashState(state, reason));
                            }
                        void event_1.idbEventStream_.emit([
                            database,
                            'connect'
                        ], new event_1.IDBEvent(database, 'connect'));
                        try {
                            while (queue.size > 0 && state.alive) {
                                const {success, failure} = queue.dequeue();
                                try {
                                    success(connection);
                                } catch (reason) {
                                    failure(reason);
                                    throw reason;
                                }
                            }
                            return;
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                            const curr = new state_1.CrashState(state, reason);
                            void connection.close();
                            return void handleCrashState(curr);
                        }
                    }
                case 'close': {
                        const curr = new state_1.EndState(state);
                        void connection.close();
                        return void handleEndState(curr);
                    }
                case 'destroy': {
                        const curr = new state_1.DestroyState(state);
                        void connection.close();
                        return void handleDestroyState(curr);
                    }
                }
            }
            function handleErrorState(state) {
                if (!state.alive)
                    return;
                const {database, error, event, config} = state;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    'error'
                ], new event_1.IDBEvent(database, 'error'));
                if (config.destroy(error, event)) {
                    return void handleDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleEndState(new state_1.EndState(state));
                }
            }
            function handleAbortState(state) {
                if (!state.alive)
                    return;
                const {database, event} = state;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    'abort'
                ], new event_1.IDBEvent(database, 'abort'));
                return void handleEndState(new state_1.EndState(state));
            }
            function handleCrashState(state) {
                if (!state.alive)
                    return;
                const {database, reason, config} = state;
                void event_1.idbEventStream_.emit([
                    database,
                    'crash'
                ], new event_1.IDBEvent(database, 'crash'));
                if (config.destroy(reason)) {
                    return void handleDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleEndState(new state_1.EndState(state));
                }
            }
            function handleDestroyState(state) {
                if (!state.alive)
                    return;
                if (!state_1.isIDBAvailable || !api_1.verifyStorageAccess())
                    return void handleEndState(new state_1.EndState(state));
                const {database} = state;
                const deleteRequest = global_1.indexedDB.deleteDatabase(database);
                deleteRequest.onsuccess = () => (void event_1.idbEventStream_.emit([
                    database,
                    'destroy'
                ], new event_1.IDBEvent(database, 'destroy')), void handleEndState(new state_1.EndState(state)));
                deleteRequest.onerror = event => void handleErrorState(new state_1.ErrorState(state, deleteRequest.error, event));
            }
            function handleEndState(state) {
                if (!state.alive)
                    return;
                const {database, version, command} = state;
                void state.complete();
                void event_1.idbEventStream_.emit([
                    database,
                    'disconnect'
                ], new event_1.IDBEvent(database, 'disconnect'));
                if (!state_1.isIDBAvailable || !api_1.verifyStorageAccess())
                    return;
                switch (command) {
                case 'open':
                    return void handleInitialState(new state_1.InitialState(database, version));
                case 'close':
                case 'destroy':
                    return;
                }
            }
        },
        {
            '../../environment/api': 53,
            '../module/global': 60,
            './event': 57,
            './state': 58,
            'spica/exception': 13
        }
    ],
    60: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.IDBKeyRange = exports.indexedDB = void 0;
            exports.indexedDB = self.indexedDB;
            exports.IDBKeyRange = self.IDBKeyRange;
        },
        {}
    ],
    61: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.storageEventStream_ = exports.storageEventStream = exports.sessionStorage = exports.localStorage = void 0;
            var global_1 = _dereq_('./module/global');
            Object.defineProperty(exports, 'localStorage', {
                enumerable: true,
                get: function () {
                    return global_1.localStorage;
                }
            });
            Object.defineProperty(exports, 'sessionStorage', {
                enumerable: true,
                get: function () {
                    return global_1.sessionStorage;
                }
            });
            var event_1 = _dereq_('./model/event');
            Object.defineProperty(exports, 'storageEventStream', {
                enumerable: true,
                get: function () {
                    return event_1.storageEventStream;
                }
            });
            Object.defineProperty(exports, 'storageEventStream_', {
                enumerable: true,
                get: function () {
                    return event_1.storageEventStream_;
                }
            });
        },
        {
            './model/event': 62,
            './module/global': 63
        }
    ],
    62: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.storageEventStream = exports.storageEventStream_ = void 0;
            const observer_1 = _dereq_('spica/observer');
            const global_1 = _dereq_('../module/global');
            exports.storageEventStream_ = new observer_1.Observation({ limit: Infinity });
            exports.storageEventStream = exports.storageEventStream_;
            void self.addEventListener('storage', event => {
                switch (event.storageArea) {
                case global_1.localStorage:
                    return void exports.storageEventStream_.emit(event.key === null ? ['local'] : [
                        'local',
                        event.key
                    ], event);
                case global_1.sessionStorage:
                    return void exports.storageEventStream_.emit(event.key === null ? ['session'] : [
                        'session',
                        event.key
                    ], event);
                default:
                    return;
                }
            });
        },
        {
            '../module/global': 63,
            'spica/observer': 27
        }
    ],
    63: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.sessionStorage = exports.localStorage = void 0;
            const api_1 = _dereq_('../../environment/api');
            exports.localStorage = api_1.isStorageAvailable ? self.localStorage : void 0;
            exports.sessionStorage = api_1.isStorageAvailable ? self.sessionStorage : void 0;
        },
        { '../../environment/api': 53 }
    ],
    64: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function (m, exports) {
                for (var p in m)
                    if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
                        __createBinding(exports, m, p);
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            __exportStar(_dereq_('../application/api'), exports);
        },
        { '../application/api': 34 }
    ],
    'clientchannel': [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function () {
                        return m[k];
                    }
                });
            } : function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function (m, exports) {
                for (var p in m)
                    if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
                        __createBinding(exports, m, p);
            };
            Object.defineProperty(exports, '__esModule', { value: true });
            __exportStar(_dereq_('./src/export'), exports);
        },
        { './src/export': 33 }
    ]
}, {}, [
    1,
    2,
    3,
    'clientchannel'
]);
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
    }
}(typeof self !== 'undefined' ? self : this, function () {
    return require('clientchannel');
}));