/*! clientchannel v0.36.1 https://github.com/falsandtru/clientchannel | (c) 2016, falsandtru | (Apache-2.0 AND MPL-2.0) License */
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
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    5: [
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
    6: [
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
        { './global': 17 }
    ],
    7: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.template = exports.inherit = exports.merge = exports.extend = exports.overwrite = exports.clone = exports.assign = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const type_1 = _dereq_('./type');
            const array_1 = _dereq_('./array');
            exports.assign = template((prop, target, source) => target[prop] = source[prop]);
            exports.clone = template((prop, target, source) => {
                switch ((0, type_1.type)(source[prop])) {
                case 'Array':
                    return target[prop] = source[prop].slice();
                case 'Object':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Object':
                        return target[prop] = (0, exports.clone)(empty(source[prop]), source[prop]);
                    default:
                        return target[prop] = source[prop];
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.overwrite = template((prop, target, source) => {
                switch ((0, type_1.type)(source[prop])) {
                case 'Array':
                    return target[prop] = source[prop];
                case 'Object':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Object':
                        return (0, exports.overwrite)(target[prop], source[prop]);
                    default:
                        return target[prop] = (0, exports.overwrite)(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.extend = template((prop, target, source) => {
                switch ((0, type_1.type)(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    return target[prop] = source[prop];
                case 'Object':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Object':
                        return (0, exports.extend)(target[prop], source[prop]);
                    default:
                        return target[prop] = (0, exports.extend)(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.merge = template((prop, target, source) => {
                switch ((0, type_1.type)(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Array':
                        return target[prop] = (0, array_1.push)(target[prop], source[prop]);
                    default:
                        return target[prop] = source[prop].slice();
                    }
                case 'Object':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Object':
                        return (0, exports.merge)(target[prop], source[prop]);
                    default:
                        return target[prop] = (0, exports.merge)(empty(source[prop]), source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            exports.inherit = template((prop, target, source) => {
                switch ((0, type_1.type)(source[prop])) {
                case 'undefined':
                    return;
                case 'Array':
                    return target[prop] = source[prop].slice();
                case 'Object':
                    switch ((0, type_1.type)(target[prop])) {
                    case 'Object':
                        return (0, alias_1.hasOwnProperty)(target, prop) ? (0, exports.inherit)(target[prop], source[prop]) : target[prop] = (0, exports.inherit)((0, alias_1.ObjectCreate)(target[prop]), source[prop]);
                    default:
                        return target[prop] = (0, alias_1.ObjectCreate)(source[prop]);
                    }
                default:
                    return target[prop] = source[prop];
                }
            });
            function template(strategy) {
                return walk;
                function walk(target, ...sources) {
                    if ((0, type_1.isPrimitive)(target))
                        return target;
                    for (let i = 0; i < sources.length; ++i) {
                        const source = sources[i];
                        if (source === target)
                            continue;
                        if ((0, type_1.isPrimitive)(source))
                            continue;
                        const keys = (0, alias_1.ObjectKeys)(source);
                        for (let i = 0; i < keys.length; ++i) {
                            strategy(keys[i], target, source);
                        }
                    }
                    return target;
                }
            }
            exports.template = template;
            function empty(source) {
                return source instanceof global_1.Object ? {} : (0, alias_1.ObjectCreate)(null);
            }
        },
        {
            './alias': 5,
            './array': 6,
            './global': 17,
            './type': 35
        }
    ],
    8: [
        function (_dereq_, module, exports) {
            'use strict';
            var _a, _b;
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Cancellation = void 0;
            const promise_1 = _dereq_('./promise');
            const future_1 = _dereq_('./future');
            const exception_1 = _dereq_('./exception');
            const maybe_1 = _dereq_('./maybe');
            const either_1 = _dereq_('./either');
            const function_1 = _dereq_('./function');
            const internal = Symbol.for('spica/cancellation::internal');
            class Cancellation {
                constructor(cancellees = []) {
                    this[_a] = 'Cancellation';
                    this[_b] = new Internal();
                    for (const cancellee of cancellees) {
                        cancellee.register(this.cancel);
                    }
                }
                get [(_a = Symbol.toStringTag, _b = internal, promise_1.internal)]() {
                    return this[internal].promise[promise_1.internal];
                }
                get isAlive() {
                    return this[internal].reason.length === 0;
                }
                get isCancelled() {
                    return this[internal].reason.length === 1;
                }
                get isClosed() {
                    return this[internal].reason.length === 2;
                }
                get isFinished() {
                    return this[internal].reason.length !== 0;
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
                get then() {
                    return this[internal].promise.then;
                }
                get catch() {
                    return this[internal].promise.catch;
                }
                get finally() {
                    return this[internal].promise.finally;
                }
                get promise() {
                    return val => this.isCancelled ? promise_1.AtomicPromise.reject(this[internal].reason[0]) : promise_1.AtomicPromise.resolve(val);
                }
                get maybe() {
                    return val => (0, maybe_1.Just)(val).bind(val => this.isCancelled ? maybe_1.Nothing : (0, maybe_1.Just)(val));
                }
                get either() {
                    return val => (0, either_1.Right)(val).bind(val => this.isCancelled ? (0, either_1.Left)(this[internal].reason[0]) : (0, either_1.Right)(val));
                }
            }
            exports.Cancellation = Cancellation;
            class Internal {
                constructor() {
                    this.isFinished = false;
                    this.reason = [];
                    this.listeners = [];
                }
                get promise() {
                    if (!this.future) {
                        this.future = new future_1.AtomicFuture();
                        switch (this.reason.length) {
                        case 1:
                            return this.future.bind(this.reason[0]);
                        case 2:
                            return this.future.bind(promise_1.AtomicPromise.reject(this.reason[1]));
                        }
                    }
                    return this.future;
                }
                register(listener) {
                    if (this.isFinished) {
                        this.reason.length === 1 && handler(this.reason[0]);
                        return function_1.noop;
                    }
                    const i = this.listeners.push(handler) - 1;
                    return () => this.listeners[i] = void 0;
                    function handler(reason) {
                        try {
                            listener(reason);
                        } catch (reason) {
                            (0, exception_1.causeAsyncException)(reason);
                        }
                    }
                }
                cancel(reason) {
                    var _c, _d;
                    if (this.reason.length !== 0)
                        return;
                    this.reason = [reason];
                    for (let i = 0, {listeners} = this; i < listeners.length; ++i) {
                        (_c = listeners[i]) === null || _c === void 0 ? void 0 : _c.call(listeners, reason);
                    }
                    (_d = this.future) === null || _d === void 0 ? void 0 : _d.bind(reason);
                    this.isFinished = true;
                }
                close(reason) {
                    var _c;
                    if (this.reason.length !== 0)
                        return;
                    this.reason = [
                        ,
                        reason
                    ];
                    (_c = this.future) === null || _c === void 0 ? void 0 : _c.bind(promise_1.AtomicPromise.reject(reason));
                    this.isFinished = true;
                }
            }
        },
        {
            './either': 13,
            './exception': 14,
            './function': 15,
            './future': 16,
            './maybe': 20,
            './promise': 31
        }
    ],
    9: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.tick = exports.clock = exports.now = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const exception_1 = _dereq_('./exception');
            let mem;
            let count = 0;
            function now(nocache = false) {
                if (mem === void 0) {
                    tick(() => mem = void 0);
                } else if (!nocache && ++count !== 100) {
                    return mem;
                }
                count = 0;
                return mem = global_1.Date.now();
            }
            exports.now = now;
            exports.clock = Promise.resolve(void 0);
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
                        (void 0, jobs[i])();
                        jobs[i] = void 0;
                    } catch (reason) {
                        (0, exception_1.causeAsyncException)(reason);
                    }
                }
                jobs.length > 1000 && count < jobs.length * 0.5 && jobs.splice((0, alias_1.floor)(jobs.length * 0.9), jobs.length);
            }
        },
        {
            './alias': 5,
            './exception': 14,
            './global': 17
        }
    ],
    10: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.equal = void 0;
            function equal(a, b) {
                return a === a ? a === b : b !== b;
            }
            exports.equal = equal;
        },
        {}
    ],
    11: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.concat = void 0;
            const alias_1 = _dereq_('./alias');
            function concat(target, source) {
                if ((0, alias_1.isArray)(source)) {
                    for (let i = 0; i < source.length; ++i) {
                        target.push(source[i]);
                    }
                } else {
                    target.push(...source);
                }
                return target;
            }
            exports.concat = concat;
        },
        { './alias': 5 }
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
                return (...xs) => arity === 0 || xs.length <= arity ? f(...xs) : uncurry_(f(...(0, array_1.shift)(xs, arity)[0]))(...xs);
            }
        },
        { './array': 6 }
    ],
    13: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            __exportStar(_dereq_('./monad/either'), exports);
        },
        { './monad/either': 23 }
    ],
    14: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.causeAsyncException = void 0;
            const global_1 = _dereq_('./global');
            function causeAsyncException(reason) {
                global_1.Promise.reject(reason);
            }
            exports.causeAsyncException = causeAsyncException;
        },
        { './global': 17 }
    ],
    15: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.noop = exports.id = exports.clear = exports.singleton = void 0;
            function singleton(f) {
                let result;
                return function (...as) {
                    if (result)
                        return result[0];
                    result = [f.call(this, ...as)];
                    return result[0];
                };
            }
            exports.singleton = singleton;
            function clear(f) {
                return (...as) => void f(...as);
            }
            exports.clear = clear;
            function id(a) {
                return a;
            }
            exports.id = id;
            function noop() {
            }
            exports.noop = noop;
        },
        {}
    ],
    16: [
        function (_dereq_, module, exports) {
            'use strict';
            var _a, _b, _c, _d;
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.AtomicFuture = exports.Future = void 0;
            const global_1 = _dereq_('./global');
            const promise_1 = _dereq_('./promise');
            class Future {
                constructor(strict = true) {
                    this[_a] = 'Promise';
                    this[_b] = new promise_1.Internal();
                    this.bind = value => {
                        const core = this[promise_1.internal];
                        if (!core.isPending && !strict)
                            return this;
                        if (!core.isPending)
                            throw new Error(`Spica: Future: Cannot rebind a value.`);
                        core.resolve(value);
                        return this;
                    };
                }
                static get [Symbol.species]() {
                    return global_1.Promise;
                }
                then(onfulfilled, onrejected) {
                    return new global_1.Promise((resolve, reject) => this[promise_1.internal].then(resolve, reject, onfulfilled, onrejected));
                }
                catch(onrejected) {
                    return this.then(void 0, onrejected);
                }
                finally(onfinally) {
                    return this.then(onfinally, onfinally).then(() => this);
                }
            }
            exports.Future = Future;
            _a = Symbol.toStringTag, _b = promise_1.internal;
            class AtomicFuture {
                constructor(strict = true) {
                    this[_c] = 'Promise';
                    this[_d] = new promise_1.Internal();
                    this.bind = value => {
                        const core = this[promise_1.internal];
                        if (!core.isPending && !strict)
                            return this;
                        if (!core.isPending)
                            throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
                        core.resolve(value);
                        return this;
                    };
                }
                static get [Symbol.species]() {
                    return promise_1.AtomicPromise;
                }
                then(onfulfilled, onrejected) {
                    return new promise_1.AtomicPromise((resolve, reject) => this[promise_1.internal].then(resolve, reject, onfulfilled, onrejected));
                }
                catch(onrejected) {
                    return this.then(void 0, onrejected);
                }
                finally(onfinally) {
                    return this.then(onfinally, onfinally).then(() => this);
                }
            }
            exports.AtomicFuture = AtomicFuture;
            _c = Symbol.toStringTag, _d = promise_1.internal;
        },
        {
            './global': 17,
            './promise': 31
        }
    ],
    17: [
        function (_dereq_, module, exports) {
            'use strict';
            const global = void 0 || typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || Function('return this')();
            eval('global.global = global');
            module.exports = global;
        },
        {}
    ],
    18: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            __exportStar(_dereq_('./list/ixlist'), exports);
        },
        { './list/ixlist': 19 }
    ],
    19: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.List = void 0;
            const global_1 = _dereq_('../global');
            const alias_1 = _dereq_('../alias');
            const stack_1 = _dereq_('../stack');
            const compare_1 = _dereq_('../compare');
            const undefined = void 0;
            const BORDER = 1000000000;
            class List {
                constructor(capacity = global_1.Infinity, index) {
                    this.heap = new stack_1.Stack();
                    this.HEAD = 0;
                    this.CURSOR = 0;
                    this.LENGTH = 0;
                    if (typeof capacity === 'object') {
                        index = capacity;
                        capacity = global_1.Infinity;
                    }
                    this.capacity = capacity;
                    this.index = index;
                    this.nodes = this.capacity <= BORDER ? (0, global_1.Array)((0, alias_1.min)(this.capacity, BORDER)) : {};
                }
                get length() {
                    return this.LENGTH;
                }
                get head() {
                    return this.nodes[this.HEAD];
                }
                get tail() {
                    const head = this.head;
                    return head && this.nodes[head.next];
                }
                get last() {
                    const head = this.head;
                    return head && this.nodes[head.prev];
                }
                node(index) {
                    return 0 <= index && index < this.capacity ? this.nodes[index] : undefined;
                }
                rotateToNext() {
                    var _a, _b;
                    return this.HEAD = (_b = (_a = this.tail) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : this.HEAD;
                }
                rotateToPrev() {
                    var _a, _b;
                    return this.HEAD = (_b = (_a = this.last) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : this.HEAD;
                }
                clear() {
                    var _a;
                    this.nodes = this.capacity <= BORDER ? (0, global_1.Array)((0, alias_1.min)(this.capacity, BORDER)) : {};
                    this.heap.clear();
                    (_a = this.index) === null || _a === void 0 ? void 0 : _a.clear();
                    this.HEAD = 0;
                    this.CURSOR = 0;
                    this.LENGTH = 0;
                }
                add(key, value) {
                    var _a, _b;
                    if (this.LENGTH === BORDER && 'length' in this.nodes) {
                        this.nodes = { ...this.nodes };
                    }
                    const nodes = this.nodes;
                    const head = nodes[this.HEAD];
                    if (!head) {
                        const index = this.HEAD = this.CURSOR = this.heap.length > 0 ? this.heap.pop() : this.length;
                        ++this.LENGTH;
                        (_a = this.index) === null || _a === void 0 ? void 0 : _a.set(key, index);
                        nodes[index] = {
                            index,
                            key,
                            value,
                            next: index,
                            prev: index
                        };
                        return index;
                    }
                    if (this.length !== this.capacity) {
                        const index = this.HEAD = this.CURSOR = this.heap.length > 0 ? this.heap.pop() : this.length;
                        ++this.LENGTH;
                        (_b = this.index) === null || _b === void 0 ? void 0 : _b.set(key, index);
                        nodes[index] = {
                            index,
                            key,
                            value,
                            next: head.index,
                            prev: head.prev
                        };
                        head.prev = nodes[head.prev].next = index;
                        return index;
                    } else {
                        const node = nodes[head.prev];
                        const index = this.HEAD = this.CURSOR = node.index;
                        if (this.index && !(0, compare_1.equal)(node.key, key)) {
                            this.index.delete(node.key, index);
                            this.index.set(key, index);
                        }
                        node.key = key;
                        node.value = value;
                        return index;
                    }
                }
                put(key, value, index) {
                    const node = this.find(key, index);
                    if (!node)
                        return this.add(key, value);
                    node.value = value;
                    return node.index;
                }
                find(key, index = this.CURSOR) {
                    var _a;
                    let node;
                    node = this.node(index);
                    if (node && (0, compare_1.equal)(node.key, key))
                        return this.CURSOR = index, node;
                    if (!this.index)
                        throw new Error(`Spica: IxList: Need the index but not given.`);
                    if (node ? this.length === 1 : this.length === 0)
                        return;
                    node = this.node(index = (_a = this.index.get(key)) !== null && _a !== void 0 ? _a : -1);
                    if (node)
                        return this.CURSOR = index, node;
                }
                get(index) {
                    return this.node(index);
                }
                has(index) {
                    return this.node(index) !== undefined;
                }
                del(index) {
                    var _a;
                    const node = this.node(index);
                    if (!node)
                        return;
                    --this.LENGTH;
                    this.heap.push(node.index);
                    (_a = this.index) === null || _a === void 0 ? void 0 : _a.delete(node.key, node.index);
                    const nodes = this.nodes;
                    nodes[node.prev].next = node.next;
                    nodes[node.next].prev = node.prev;
                    if (this.HEAD === node.index) {
                        this.HEAD = node.next;
                    }
                    if (this.CURSOR === node.index) {
                        this.CURSOR = node.next;
                    }
                    nodes[node.index] = undefined;
                    return node;
                }
                delete(key, index) {
                    var _a, _b;
                    return this.del((_b = (_a = this.find(key, index)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1);
                }
                insert(key, value, before) {
                    const head = this.HEAD;
                    this.HEAD = before;
                    const index = this.add(key, value);
                    if (this.length !== 1) {
                        this.HEAD = head;
                    }
                    return index;
                }
                unshift(key, value) {
                    return this.add(key, value);
                }
                unshiftRotationally(key, value) {
                    if (this.length === 0)
                        return this.unshift(key, value);
                    const node = this.last;
                    if (this.index && !(0, compare_1.equal)(node.key, key)) {
                        this.index.delete(node.key, node.index);
                        this.index.set(key, node.index);
                    }
                    this.HEAD = node.index;
                    this.CURSOR = node.index;
                    node.key = key;
                    node.value = value;
                    return node.index;
                }
                shift() {
                    const node = this.head;
                    return node && this.del(node.index);
                }
                push(key, value) {
                    return this.insert(key, value, this.HEAD);
                }
                pushRotationally(key, value) {
                    if (this.length === 0)
                        return this.push(key, value);
                    const node = this.head;
                    if (this.index && !(0, compare_1.equal)(node.key, key)) {
                        this.index.delete(node.key, node.index);
                        this.index.set(key, node.index);
                    }
                    this.HEAD = node.next;
                    this.CURSOR = node.index;
                    node.key = key;
                    node.value = value;
                    return node.index;
                }
                pop() {
                    const node = this.last;
                    return node && this.del(node.index);
                }
                replace(index, key, value) {
                    const node = this.node(index);
                    if (!node)
                        return;
                    if (this.index && !(0, compare_1.equal)(node.key, key)) {
                        this.index.delete(node.key, index);
                        this.index.set(key, index);
                    }
                    const clone = {
                        index: node.index,
                        key: node.key,
                        value: node.value,
                        next: node.next,
                        prev: node.prev
                    };
                    node.key = key;
                    node.value = value;
                    return clone;
                }
                move(index, before) {
                    if (index === before)
                        return false;
                    const a1 = this.node(index);
                    if (!a1)
                        return false;
                    const b1 = this.node(before);
                    if (!b1)
                        return false;
                    if (a1.next === b1.index)
                        return false;
                    const nodes = this.nodes;
                    const b0 = nodes[b1.prev];
                    const a0 = nodes[a1.prev];
                    const a2 = nodes[a1.next];
                    b0.next = a1.index;
                    a1.next = b1.index;
                    b1.prev = a1.index;
                    a1.prev = b0.index;
                    a0.next = a2.index;
                    a2.prev = a0.index;
                    return true;
                }
                moveToHead(index) {
                    this.move(index, this.HEAD);
                    this.HEAD = index;
                }
                moveToLast(index) {
                    this.move(index, this.HEAD);
                    this.HEAD = index === this.HEAD ? this.head.next : this.HEAD;
                }
                swap(index1, index2) {
                    if (index1 === index2)
                        return false;
                    const node1 = this.node(index1);
                    if (!node1)
                        return false;
                    const node2 = this.node(index2);
                    if (!node2)
                        return false;
                    const nodes = this.nodes;
                    const node3 = nodes[node2.next];
                    this.move(node2.index, node1.index);
                    this.move(node1.index, node3.index);
                    switch (this.HEAD) {
                    case node1.index:
                        this.HEAD = node2.index;
                        break;
                    case node2.index:
                        this.HEAD = node1.index;
                        break;
                    }
                    return true;
                }
                *[Symbol.iterator]() {
                    const nodes = this.nodes;
                    for (let node = nodes[this.HEAD]; node;) {
                        yield [
                            node.key,
                            node.value
                        ];
                        node = nodes[node.next];
                        if ((node === null || node === void 0 ? void 0 : node.index) === this.HEAD)
                            return;
                    }
                }
            }
            exports.List = List;
        },
        {
            '../alias': 5,
            '../compare': 10,
            '../global': 17,
            '../stack': 32
        }
    ],
    20: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            __exportStar(_dereq_('./monad/maybe'), exports);
        },
        { './monad/maybe': 27 }
    ],
    21: [
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
                    return aa ? af.bind(f => aa.fmap((0, curry_1.curry)(f))) : aa => ap(af, aa);
                }
                Applicative.ap = ap;
            }(Applicative = exports.Applicative || (exports.Applicative = {})));
        },
        {
            '../curry': 12,
            './functor': 24
        }
    ],
    22: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Right = exports.Left = exports.Either = void 0;
            const monad_1 = _dereq_('./monad');
            const promise_1 = _dereq_('../promise');
            const function_1 = _dereq_('../function');
            class Either extends monad_1.Monad {
                constructor(thunk) {
                    super(thunk);
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
                        throw new TypeError(`Spica: Either: Invalid monad value: ${ m }`);
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
                        const r = m.extract(function_1.noop, a => [a]);
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
                constructor(value) {
                    super(throwCallError);
                    this.value = value;
                }
                bind(_) {
                    return this;
                }
                extract(left) {
                    if (!left)
                        throw this.value;
                    return left(this.value);
                }
            }
            exports.Left = Left;
            class Right extends Either {
                constructor(value) {
                    super(throwCallError);
                    this.value = value;
                }
                bind(f) {
                    return new Either(() => f(this.extract()));
                }
                extract(_, right) {
                    return !right ? this.value : right(this.value);
                }
            }
            exports.Right = Right;
            function throwCallError() {
                throw new Error(`Spica: Either: Invalid thunk call.`);
            }
        },
        {
            '../function': 15,
            '../promise': 31,
            './monad': 28
        }
    ],
    23: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            const function_1 = _dereq_('../function');
            class Either extends Monad.Either {
                constructor() {
                    super(function_1.noop);
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
        {
            '../function': 15,
            './either.impl': 22
        }
    ],
    24: [
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
        { './lazy': 25 }
    ],
    25: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Lazy = void 0;
            class Lazy {
                constructor(thunk) {
                    this.thunk = thunk;
                    this.$memory = void 0;
                }
                evaluate() {
                    var _a;
                    return (_a = this.$memory) !== null && _a !== void 0 ? _a : this.$memory = this.thunk();
                }
            }
            exports.Lazy = Lazy;
        },
        {}
    ],
    26: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Nothing = exports.Just = exports.Maybe = void 0;
            const monadplus_1 = _dereq_('./monadplus');
            const promise_1 = _dereq_('../promise');
            const function_1 = _dereq_('../function');
            class Maybe extends monadplus_1.MonadPlus {
                constructor(thunk) {
                    super(thunk);
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
                        throw new TypeError(`Spica: Maybe: Invalid monad value: ${ m }`);
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
                        const r = m.extract(function_1.noop, a => [a]);
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
                constructor(value) {
                    super(throwCallError);
                    this.value = value;
                }
                bind(f) {
                    return new Maybe(() => f(this.extract()));
                }
                extract(_, just) {
                    return !just ? this.value : just(this.value);
                }
            }
            exports.Just = Just;
            class Nothing extends Maybe {
                constructor() {
                    super(throwCallError);
                }
                bind(_) {
                    return this;
                }
                extract(nothing) {
                    if (!nothing)
                        throw new Error(`Spica: Maybe: Nothig value is extracted.`);
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
            '../function': 15,
            '../promise': 31,
            './monadplus': 29
        }
    ],
    27: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            const function_1 = _dereq_('../function');
            class Maybe extends Monad.Maybe {
                constructor() {
                    super(function_1.noop);
                }
            }
            exports.Maybe = Maybe;
            function Just(a) {
                return new Monad.Just(a);
            }
            exports.Just = Just;
            exports.Nothing = Monad.Maybe.mzero;
        },
        {
            '../function': 15,
            './maybe.impl': 26
        }
    ],
    28: [
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
        { './applicative': 21 }
    ],
    29: [
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
        { './monad': 28 }
    ],
    30: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Observation = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const ixlist_1 = _dereq_('./ixlist');
            const function_1 = _dereq_('./function');
            const array_1 = _dereq_('./array');
            const exception_1 = _dereq_('./exception');
            class ListenerNode {
                constructor(parent, index) {
                    this.parent = parent;
                    this.index = index;
                    this.children = new ixlist_1.List(new global_1.Map());
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
                    this.relaies = new global_1.WeakSet();
                    (0, alias_1.ObjectAssign)(this.settings, opts);
                }
                monitor(namespace, monitor, options = {}) {
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
                        options
                    };
                    monitors.push(item);
                    return (0, function_1.singleton)(() => void this.off(namespace, item));
                }
                on(namespace, subscriber, options = {}) {
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
                        options
                    };
                    subscribers.push(item);
                    return (0, function_1.singleton)(() => void this.off(namespace, item));
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
                            return void (0, array_1.splice)(items, items.indexOf(subscriber), 1);
                        }
                    case 'function': {
                            const items = node.subscribers;
                            return void (0, array_1.splice)(items, items.findIndex(item => item.listener === subscriber), 1);
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
                    if (this.relaies.has(source))
                        throw new global_1.Error(`Spica: Observation: Relay source is already registered.`);
                    this.relaies.add(source);
                    return source.monitor([], (data, namespace) => void this.emit(namespace, data));
                }
                refs(namespace) {
                    const node = this.seekNode(namespace, 1);
                    if (!node)
                        return [];
                    return (0, array_1.push)(this.refsBelow(node, 0), this.refsBelow(node, 1)).reduce((acc, rs) => (0, array_1.push)(acc, rs), []);
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
                                (0, exception_1.causeAsyncException)(reason);
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
                                (0, exception_1.causeAsyncException)(reason);
                            }
                            i = i < items.length ? i : items.length - 1;
                            for (; i >= 0 && items[i].id > item.id; --i);
                        }
                    }
                    if (tracker) {
                        try {
                            tracker(data, results);
                        } catch (reason) {
                            (0, exception_1.causeAsyncException)(reason);
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
                refsBelow_({monitors, subscribers, children}, type, acc) {
                    type === 0 ? acc.push(monitors) : acc.push(subscribers);
                    let count = 0;
                    for (let node = children.last, i = 0; node && i < children.length; (node = children.node(node.prev)) && ++i) {
                        const cnt = this.refsBelow_(node.value, type, acc)[1];
                        count += cnt;
                        if (cnt === 0 && this.settings.cleanup) {
                            node = children.node(children.del(node.index).next);
                            if (!node)
                                break;
                            --i;
                        }
                    }
                    return [
                        acc,
                        monitors.length + subscribers.length + count
                    ];
                }
                seekNode(namespace, mode) {
                    var _a;
                    let node = this.node;
                    for (let i = 0; i < namespace.length; ++i) {
                        const name = namespace[i];
                        const {children} = node;
                        let child = (_a = children.find(name)) === null || _a === void 0 ? void 0 : _a.value;
                        if (!child) {
                            switch (mode) {
                            case 1:
                                return;
                            case 2:
                                return node;
                            }
                            child = new ListenerNode(node, name);
                            children.add(name, child);
                        }
                        node = child;
                    }
                    return node;
                }
            }
            exports.Observation = Observation;
            function clear({monitors, subscribers, children}) {
                for (let node = children.last, i = 0; node && i < children.length; (node = children.node(node.prev)) && ++i) {
                    if (!clear(node.value))
                        continue;
                    node = children.node(children.del(node.index).next);
                    if (!node)
                        break;
                    --i;
                }
                (0, array_1.splice)(subscribers, 0);
                return monitors.length === 0;
            }
        },
        {
            './alias': 5,
            './array': 6,
            './exception': 14,
            './function': 15,
            './global': 17,
            './ixlist': 18
        }
    ],
    31: [
        function (_dereq_, module, exports) {
            'use strict';
            var _a, _b;
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.never = exports.isPromiseLike = exports.Internal = exports.AtomicPromise = exports.internal = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const function_1 = _dereq_('./function');
            exports.internal = Symbol.for('spica/promise::internal');
            class AtomicPromise {
                constructor(executor) {
                    this[_a] = 'Promise';
                    this[_b] = new Internal();
                    try {
                        executor(value => void this[exports.internal].resolve(value), reason => void this[exports.internal].reject(reason));
                    } catch (reason) {
                        this[exports.internal].reject(reason);
                    }
                }
                static get [Symbol.species]() {
                    return AtomicPromise;
                }
                static all(vs) {
                    return new AtomicPromise((resolve, reject) => {
                        const values = (0, alias_1.isArray)(vs) ? vs : [...vs];
                        const results = (0, global_1.Array)(values.length);
                        let done = false;
                        let count = 0;
                        for (let i = 0; !done && i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                results[i] = value;
                                ++count;
                                continue;
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[exports.internal];
                                switch (status.state) {
                                case 2:
                                    results[i] = status.value;
                                    ++count;
                                    continue;
                                case 3:
                                    return reject(status.reason);
                                }
                            }
                            value.then(value => {
                                results[i] = value;
                                ++count;
                                count === values.length && resolve(results);
                            }, reason => {
                                reject(reason);
                                done = true;
                            });
                        }
                        count === values.length && resolve(results);
                    });
                }
                static race(vs) {
                    return new AtomicPromise((resolve, reject) => {
                        const values = (0, alias_1.isArray)(vs) ? vs : [...vs];
                        for (let i = 0; i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                return resolve(value);
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[exports.internal];
                                switch (status.state) {
                                case 2:
                                    return resolve(status.value);
                                case 3:
                                    return reject(status.reason);
                                }
                            }
                        }
                        let done = false;
                        for (let i = 0; !done && i < values.length; ++i) {
                            const value = values[i];
                            value.then(value => {
                                resolve(value);
                                done = true;
                            }, reason => {
                                reject(reason);
                                done = true;
                            });
                        }
                    });
                }
                static allSettled(vs) {
                    return new AtomicPromise(resolve => {
                        const values = (0, alias_1.isArray)(vs) ? vs : [...vs];
                        const results = (0, global_1.Array)(values.length);
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
                                const {status} = value[exports.internal];
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
                static any(vs) {
                    return new AtomicPromise((resolve, reject) => {
                        const values = (0, alias_1.isArray)(vs) ? vs : [...vs];
                        const reasons = (0, global_1.Array)(values.length);
                        let done = false;
                        let count = 0;
                        for (let i = 0; !done && i < values.length; ++i) {
                            const value = values[i];
                            if (!isPromiseLike(value)) {
                                return resolve(value);
                            }
                            if (isAtomicPromiseLike(value)) {
                                const {status} = value[exports.internal];
                                switch (status.state) {
                                case 2:
                                    return resolve(status.value);
                                case 3:
                                    reasons[i] = status.reason;
                                    ++count;
                                    continue;
                                }
                            }
                            value.then(value => {
                                resolve(value);
                                done = true;
                            }, reason => {
                                reasons[i] = reason;
                                ++count;
                                count === values.length && reject(new AggregateError(reasons, 'All promises were rejected'));
                            });
                        }
                        count === values.length && reject(new AggregateError(reasons, 'All promises were rejected'));
                    });
                }
                static resolve(value) {
                    return new AtomicPromise(resolve => resolve(value));
                }
                static reject(reason) {
                    return new AtomicPromise((_, reject) => reject(reason));
                }
                then(onfulfilled, onrejected) {
                    return new AtomicPromise((resolve, reject) => this[exports.internal].then(resolve, reject, onfulfilled, onrejected));
                }
                catch(onrejected) {
                    return this.then(void 0, onrejected);
                }
                finally(onfinally) {
                    return this.then(onfinally, onfinally).then(() => this);
                }
            }
            exports.AtomicPromise = AtomicPromise;
            _a = Symbol.toStringTag, _b = exports.internal;
            class Internal {
                constructor() {
                    this.status = { state: 0 };
                    this.fulfillReactions = [];
                    this.rejectReactions = [];
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
                    if (isAtomicPromiseLike(value)) {
                        const core = value[exports.internal];
                        switch (core.status.state) {
                        case 2:
                        case 3:
                            this.status = core.status;
                            return this.resume();
                        default:
                            return core.then(() => (this.status = core.status, this.resume()), () => (this.status = core.status, this.resume()));
                        }
                    }
                    this.status = {
                        state: 1,
                        promise: value
                    };
                    return void value.then(value => {
                        this.status = {
                            state: 2,
                            value
                        };
                        this.resume();
                    }, reason => {
                        this.status = {
                            state: 3,
                            reason
                        };
                        this.resume();
                    });
                }
                reject(reason) {
                    if (this.status.state !== 0)
                        return;
                    this.status = {
                        state: 3,
                        reason
                    };
                    return this.resume();
                }
                then(resolve, reject, onfulfilled, onrejected) {
                    const {status, fulfillReactions, rejectReactions} = this;
                    switch (status.state) {
                    case 2:
                        if (fulfillReactions.length !== 0)
                            break;
                        return call(resolve, reject, resolve, onfulfilled, status.value);
                    case 3:
                        if (rejectReactions.length !== 0)
                            break;
                        return call(resolve, reject, reject, onrejected, status.reason);
                    }
                    fulfillReactions.push([
                        resolve,
                        reject,
                        resolve,
                        onfulfilled
                    ]);
                    rejectReactions.push([
                        resolve,
                        reject,
                        reject,
                        onrejected
                    ]);
                }
                resume() {
                    const {status, fulfillReactions, rejectReactions} = this;
                    switch (status.state) {
                    case 0:
                    case 1:
                        return;
                    case 2:
                        if (rejectReactions.length !== 0) {
                            this.rejectReactions = [];
                        }
                        if (fulfillReactions.length === 0)
                            return;
                        react(fulfillReactions, status.value);
                        this.fulfillReactions = [];
                        return;
                    case 3:
                        if (fulfillReactions.length !== 0) {
                            this.fulfillReactions = [];
                        }
                        if (rejectReactions.length === 0)
                            return;
                        react(rejectReactions, status.reason);
                        this.rejectReactions = [];
                        return;
                    }
                }
            }
            exports.Internal = Internal;
            function react(reactions, param) {
                for (let i = 0; i < reactions.length; ++i) {
                    const reaction = reactions[i];
                    call(reaction[0], reaction[1], reaction[2], reaction[3], param);
                }
            }
            function call(resolve, reject, cont, callback, param) {
                if (!callback)
                    return cont(param);
                try {
                    resolve(callback(param));
                } catch (reason) {
                    reject(reason);
                }
            }
            function isPromiseLike(value) {
                return value !== null && typeof value === 'object' && typeof value.then === 'function';
            }
            exports.isPromiseLike = isPromiseLike;
            function isAtomicPromiseLike(value) {
                return exports.internal in value;
            }
            exports.never = new class Never extends Promise {
                static get [Symbol.species]() {
                    return Never;
                }
                constructor() {
                    super(function_1.noop);
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
            './alias': 5,
            './function': 15,
            './global': 17
        }
    ],
    32: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Stack = void 0;
            const undefined = void 0;
            class Stack {
                constructor() {
                    this.list = undefined;
                    this.length = 0;
                }
                push(value) {
                    const node = this.list;
                    const values = node === null || node === void 0 ? void 0 : node[0];
                    ++this.length;
                    !values || values.length === 100 ? this.list = [
                        [value],
                        node
                    ] : values.push(value);
                }
                pop() {
                    const node = this.list;
                    if (node === undefined)
                        return;
                    const values = node[0];
                    --this.length;
                    if (values.length !== 1)
                        return values.pop();
                    const value = values[0];
                    this.list = node[1];
                    node[1] = undefined;
                    return value;
                }
                clear() {
                    this.list = undefined;
                }
                isEmpty() {
                    return this.list === undefined;
                }
                peek() {
                    var _a;
                    return (_a = this.list) === null || _a === void 0 ? void 0 : _a[0][0];
                }
                *[Symbol.iterator]() {
                    while (!this.isEmpty()) {
                        yield this.pop();
                    }
                    return;
                }
            }
            exports.Stack = Stack;
        },
        {}
    ],
    33: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.debounce = exports.throttle = void 0;
            const global_1 = _dereq_('./global');
            const exception_1 = _dereq_('./exception');
            function throttle(interval, callback, capacity = 1) {
                let timer = 0;
                let buffer = [];
                return function self(data) {
                    if (capacity === 1) {
                        buffer = [data];
                    } else {
                        buffer.length === capacity && buffer.pop();
                        buffer.unshift(data);
                    }
                    if (timer !== 0)
                        return;
                    timer = (0, global_1.setTimeout)(async () => {
                        const buf = buffer;
                        buffer = [];
                        try {
                            await callback.call(this, buf[0], buf);
                        } catch (reason) {
                            (0, exception_1.causeAsyncException)(reason);
                        }
                        timer = 0;
                        buffer.length > 0 && self.call(this, buffer.shift());
                    }, interval);
                };
            }
            exports.throttle = throttle;
            function debounce(delay, callback, capacity = 1) {
                let timer = 0;
                let buffer = [];
                let callable = true;
                return function self(data) {
                    if (capacity === 1) {
                        buffer = [data];
                    } else {
                        buffer.length === capacity && buffer.pop();
                        buffer.unshift(data);
                    }
                    if (timer !== 0)
                        return;
                    timer = (0, global_1.setTimeout)(() => {
                        timer = 0;
                        (0, global_1.setTimeout)(async () => {
                            if (timer !== 0)
                                return;
                            if (!callable)
                                return;
                            const buf = buffer;
                            buffer = [];
                            callable = false;
                            try {
                                await callback.call(this, buf[0], buf);
                            } catch (reason) {
                                (0, exception_1.causeAsyncException)(reason);
                            }
                            callable = true;
                            buffer.length > 0 && self.call(this, buffer.shift());
                        }, delay);
                    }, delay);
                };
            }
            exports.debounce = debounce;
        },
        {
            './exception': 14,
            './global': 17
        }
    ],
    34: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.wait = exports.setRepeatTimer = exports.setTimer = void 0;
            const global_1 = _dereq_('./global');
            const function_1 = _dereq_('./function');
            exports.setTimer = template(1);
            exports.setRepeatTimer = template(Infinity);
            function template(count) {
                return (timeout, handler, unhandler) => {
                    let params;
                    let id = (0, global_1.setTimeout)(async function loop() {
                        params = [await handler()];
                        if (--count === 0)
                            return;
                        id = (0, global_1.setTimeout)(loop, timeout);
                    }, timeout);
                    return (0, function_1.singleton)(() => {
                        (0, global_1.clearTimeout)(id);
                        params && (unhandler === null || unhandler === void 0 ? void 0 : unhandler(params[0]));
                    });
                };
            }
            function wait(ms) {
                return ms === 0 ? Promise.resolve(void 0) : new Promise(resolve => void (0, global_1.setTimeout)(resolve, ms));
            }
            exports.wait = wait;
        },
        {
            './function': 15,
            './global': 17
        }
    ],
    35: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.isPrimitive = exports.isType = exports.type = void 0;
            const global_1 = _dereq_('./global');
            const alias_1 = _dereq_('./alias');
            const toString = Object.prototype.toString.call.bind(Object.prototype.toString);
            const ObjectPrototype = Object.prototype;
            const ArrayPrototype = Array.prototype;
            function type(value) {
                if (value === void 0)
                    return 'undefined';
                if (value === null)
                    return 'null';
                const type = typeof value;
                if (type === 'object') {
                    if (value[global_1.Symbol.toStringTag])
                        return value[global_1.Symbol.toStringTag];
                    const proto = (0, alias_1.ObjectGetPrototypeOf)(value);
                    if (proto === ObjectPrototype)
                        return 'Object';
                    if (proto === ArrayPrototype)
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
            './alias': 5,
            './global': 17
        }
    ],
    36: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.uuid = void 0;
            const global_1 = _dereq_('./global');
            function uuid() {
                return gen(rnd16, HEX);
            }
            exports.uuid = uuid;
            const HEX = [...Array(16)].map((_, i) => i.toString(16));
            const gen = Function('rnd16', 'HEX', [
                '"use strict";',
                'return ""',
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/./g, c => {
                    switch (c) {
                    case 'x':
                        return `+ HEX[rnd16()]`;
                    case 'y':
                        return `+ HEX[rnd16() & 0x03 | 0x08]`;
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
                if (offset === 4) {
                    offset = digit;
                    return buffer[index++] & mask;
                } else {
                    offset -= 4;
                    return buffer[index] >> offset & mask;
                }
            }
        },
        { './global': 17 }
    ],
    37: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
        { './layer/interface/api': 68 }
    ],
    38: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
            exports.Ownership = exports.StorageChannel = exports.StoreChannel = void 0;
            const api_1 = _dereq_('../domain/indexeddb/api');
            const api_2 = _dereq_('../domain/webstorage/api');
            const channel_1 = _dereq_('../domain/broadcast/channel');
            const channel_2 = _dereq_('../domain/ownership/channel');
            __exportStar(_dereq_('../domain/indexeddb/api'), exports);
            __exportStar(_dereq_('../domain/webstorage/api'), exports);
            class StoreChannel extends api_1.StoreChannel {
                constructor(name, config) {
                    super(name, config.schemas, config);
                }
            }
            exports.StoreChannel = StoreChannel;
            (function (StoreChannel) {
                StoreChannel.Value = api_1.StoreChannel.Value;
            }(StoreChannel = exports.StoreChannel || (exports.StoreChannel = {})));
            class StorageChannel extends api_2.StorageChannel {
                constructor(name, config) {
                    super(name, api_2.localStorage || api_2.sessionStorage || api_2.fakeStorage, config);
                }
            }
            exports.StorageChannel = StorageChannel;
            (function (StorageChannel) {
                StorageChannel.Value = api_2.StorageChannel.Value;
            }(StorageChannel = exports.StorageChannel || (exports.StorageChannel = {})));
            class Ownership extends channel_2.Ownership {
                constructor(name) {
                    super(new channel_1.Channel(name, false));
                }
            }
            exports.Ownership = Ownership;
        },
        {
            '../domain/broadcast/channel': 44,
            '../domain/indexeddb/api': 47,
            '../domain/ownership/channel': 53,
            '../domain/webstorage/api': 54
        }
    ],
    39: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.hasBinary = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = void 0;
            const alias_1 = _dereq_('spica/alias');
            const type_1 = _dereq_('spica/type');
            function isValidProperty([name, value]) {
                return isValidPropertyName(name) && isValidPropertyValue(value);
            }
            exports.isValidProperty = isValidProperty;
            function isValidPropertyName(name) {
                return /^(?=[a-z])[0-9a-zA-Z_]*[0-9a-zA-Z]$/.test(name);
            }
            exports.isValidPropertyName = isValidPropertyName;
            function isValidPropertyValue(value) {
                switch (typeof value) {
                case 'undefined':
                case 'boolean':
                case 'number':
                case 'string':
                    return true;
                case 'object':
                    try {
                        return value === null || isBinary(value) || (0, alias_1.ObjectEntries)(value).every(isValidProperty);
                    } catch (_a) {
                        return false;
                    }
                default:
                    return false;
                }
            }
            exports.isValidPropertyValue = isValidPropertyValue;
            function isBinary(value) {
                return value instanceof Int8Array || value instanceof Int16Array || value instanceof Int32Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Uint16Array || value instanceof Uint32Array || value instanceof ArrayBuffer || value instanceof Blob;
            }
            function hasBinary(value) {
                return !(0, type_1.isPrimitive)(value) ? isBinary(value) || (0, alias_1.ObjectValues)(value).some(hasBinary) : false;
            }
            exports.hasBinary = hasBinary;
        },
        {
            'spica/alias': 5,
            'spica/type': 35
        }
    ],
    40: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.EventRecordValue = exports.SavedEventRecord = exports.LoadedEventRecord = exports.StoredEventRecord = exports.UnstoredEventRecord = exports.EventRecordType = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const identifier_1 = _dereq_('./identifier');
            const value_1 = _dereq_('../database/value');
            const assign_1 = _dereq_('spica/assign');
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
                    this.prop = this.type === exports.EventRecordType.put ? (0, alias_1.ObjectKeys)(value).filter(value_1.isValidPropertyName)[0] : '';
                    if (typeof this.prop !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event prop: ${ this.key }`);
                    switch (type) {
                    case exports.EventRecordType.put:
                        if (!(0, value_1.isValidPropertyName)(this.prop))
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${ this.type }: ${ this.prop }`);
                        this.value = value = new EventRecordValue({ [this.prop]: value[this.prop] });
                        return;
                    case exports.EventRecordType.snapshot:
                        if (this.prop !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${ this.type }: ${ this.prop }`);
                        this.value = value = new EventRecordValue(value);
                        return;
                    case exports.EventRecordType.delete:
                        if (this.prop !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${ this.type }: ${ this.prop }`);
                        this.value = value = new EventRecordValue();
                        return;
                    default:
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${ type }`);
                    }
                }
            }
            class UnstoredEventRecord extends EventRecord {
                constructor(key, value, type = exports.EventRecordType.put, date = global_1.Date.now()) {
                    super((0, identifier_1.makeEventId)(0), type, key, value, date);
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
                    (0, assign_1.clone)(this, ...sources);
                }
            }
            exports.EventRecordValue = EventRecordValue;
        },
        {
            '../database/value': 39,
            './identifier': 41,
            'spica/alias': 5,
            'spica/assign': 7,
            'spica/global': 17
        }
    ],
    41: [
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
    42: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.compose = exports.record = exports.EventStore = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const api_1 = _dereq_('../../infrastructure/indexeddb/api');
            const identifier_1 = _dereq_('./identifier');
            const event_1 = _dereq_('./event');
            const value_1 = _dereq_('../database/value');
            const observer_1 = _dereq_('spica/observer');
            const clock_1 = _dereq_('spica/clock');
            const concat_1 = _dereq_('spica/concat');
            const exception_1 = _dereq_('spica/exception');
            var EventStoreSchema;
            (function (EventStoreSchema) {
                EventStoreSchema.id = 'id';
                EventStoreSchema.key = 'key';
            }(EventStoreSchema || (EventStoreSchema = {})));
            class EventStore {
                constructor(name, listen, relation) {
                    this.name = name;
                    this.listen = listen;
                    this.relation = relation;
                    this.alive = true;
                    this.memory = new observer_1.Observation({
                        limit: 1,
                        cleanup: true
                    });
                    this.status = {
                        store: this,
                        ids: new global_1.Map(),
                        dates: new global_1.Map(),
                        update(event) {
                            this.dates.set(event.key, (0, alias_1.max)(event.date, this.dates.get(event.key) || 0));
                            this.ids.set(event.key, (0, identifier_1.makeEventId)((0, alias_1.max)(event.id, this.ids.get(event.key) || 0)));
                            if (event instanceof event_1.LoadedEventRecord) {
                                return void this.store.events.load.emit([
                                    event.key,
                                    event.prop,
                                    event.type
                                ], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
                            }
                            if (event instanceof event_1.SavedEventRecord) {
                                return void this.store.events.save.emit([
                                    event.key,
                                    event.prop,
                                    event.type
                                ], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
                            }
                        }
                    };
                    this.events = {
                        load: new observer_1.Observation(),
                        save: new observer_1.Observation(),
                        loss: new observer_1.Observation(),
                        clear: new observer_1.Observation()
                    };
                    this.tx = { rwc: 0 };
                    this.counter = 0;
                    this.snapshotCycle = 9;
                    this.events.load.monitor([], event => {
                        switch (event.type) {
                        case EventStore.EventType.delete:
                        case EventStore.EventType.snapshot:
                            clean(event);
                        }
                    });
                    this.events.save.monitor([], event => {
                        switch (event.type) {
                        case EventStore.EventType.delete:
                        case EventStore.EventType.snapshot:
                            this.clean(event.key);
                            clean(event);
                        }
                    });
                    const clean = event => {
                        for (const ev of this.memory.reflect([event.key])) {
                            0 < ev.id && ev.id < event.id && this.memory.off([
                                ev.key,
                                ev.prop,
                                true,
                                ev.id
                            ]);
                        }
                    };
                }
                static configure(name) {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: EventStoreSchema.id,
                                autoIncrement: true
                            });
                            if (!store.indexNames.contains(EventStoreSchema.id)) {
                                store.createIndex(EventStoreSchema.id, EventStoreSchema.id, { unique: true });
                            }
                            if (!store.indexNames.contains(EventStoreSchema.key)) {
                                store.createIndex(EventStoreSchema.key, EventStoreSchema.key);
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
                    if (++this.tx.rwc < 25 || !this.tx.rw)
                        return;
                    const tx = this.tx.rw;
                    this.tx.rwc = 0;
                    this.tx.rw = void 0;
                    tx.commit();
                    return this.tx.rw;
                }
                set txrw(tx) {
                    if (this.tx.rw === tx)
                        return;
                    this.tx.rwc = 0;
                    this.tx.rw = tx;
                    const clear = () => {
                        if (this.tx.rw !== tx)
                            return;
                        this.tx.rw = void 0;
                    };
                    this.tx.rw.addEventListener('abort', clear);
                    this.tx.rw.addEventListener('error', clear);
                    this.tx.rw.addEventListener('complete', clear);
                    (0, clock_1.tick)(clear);
                }
                transact(cache, success, failure, tx = this.txrw) {
                    return tx ? void success(tx) : void this.listen(db => {
                        const tx = cache(db);
                        return tx ? void success(this.txrw = tx) : void failure(new Error('Session is already closed.'));
                    }, failure);
                }
                load(key, cb, cancellation) {
                    if (!this.alive)
                        return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Session is already closed.')));
                    const events = [];
                    return void this.listen(db => {
                        if (!this.alive)
                            return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Session is already closed.')));
                        if (cancellation === null || cancellation === void 0 ? void 0 : cancellation.isCancelled)
                            return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request is cancelled.')));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = tx.objectStore(this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
                        req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (!cursor)
                                return;
                            let event;
                            try {
                                event = new event_1.LoadedEventRecord(cursor.value);
                            } catch (reason) {
                                (0, exception_1.causeAsyncException)(reason);
                                cursor.delete();
                                return void cursor.continue();
                            }
                            if (event.id < this.meta(key).id)
                                return;
                            events.unshift(event);
                            if (event.type !== EventStore.EventType.put)
                                return;
                            cursor.continue();
                        });
                        tx.addEventListener('complete', () => {
                            for (const [, event] of new global_1.Map(events.map(ev => [
                                    ev.prop,
                                    ev
                                ]))) {
                                this.memory.off([
                                    event.key,
                                    event.prop,
                                    event.id > 0,
                                    event.id
                                ]);
                                this.memory.on([
                                    event.key,
                                    event.prop,
                                    event.id > 0,
                                    event.id
                                ], () => event);
                                this.status.update(event);
                            }
                            try {
                                cb === null || cb === void 0 ? void 0 : cb(req.error);
                            } catch (reason) {
                                (0, exception_1.causeAsyncException)(reason);
                            }
                            if (events.length >= this.snapshotCycle) {
                                this.snapshot(key);
                            }
                        });
                        tx.addEventListener('complete', () => void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()));
                        tx.addEventListener('error', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void (cb === null || cb === void 0 ? void 0 : cb(tx.error || req.error))));
                        tx.addEventListener('abort', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void (cb === null || cb === void 0 ? void 0 : cb(tx.error || req.error))));
                        cancellation === null || cancellation === void 0 ? void 0 : cancellation.register(() => void tx.abort());
                    }, () => void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request has failed.'))));
                }
                keys() {
                    return this.memory.reflect([]).reduce((keys, ev) => keys.at(-1) !== ev.key ? (0, concat_1.concat)(keys, [ev.key]) : keys, []).sort();
                }
                has(key) {
                    return compose(key, this.memory.reflect([key])).type !== EventStore.EventType.delete;
                }
                meta(key) {
                    const events = this.memory.reflect([key]);
                    return {
                        key: key,
                        id: events.reduce((id, ev) => ev.id > id ? ev.id : id, 0),
                        date: events.reduce((date, ev) => ev.date > date ? ev.date : date, 0)
                    };
                }
                get(key) {
                    return (0, alias_1.ObjectAssign)((0, alias_1.ObjectCreate)(null), compose(key, this.memory.reflect([key])).value);
                }
                add(event, tx) {
                    if (!this.alive)
                        return;
                    const revert = this.memory.on([
                        event.key,
                        event.prop,
                        false,
                        ++this.counter
                    ], () => event);
                    this.status.update(event);
                    const active = () => this.memory.reflect([
                        event.key,
                        event.prop,
                        false
                    ]).includes(event);
                    const loss = () => void this.events.loss.emit([
                        event.key,
                        event.prop,
                        event.type
                    ], new EventStore.Event(event.type, (0, identifier_1.makeEventId)(0), event.key, event.prop, event.date));
                    return void this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
                        if (!active())
                            return;
                        const req = tx.objectStore(this.name).add(record(event));
                        const ev = event;
                        tx.addEventListener('complete', () => {
                            revert();
                            const event = new event_1.SavedEventRecord((0, identifier_1.makeEventId)(req.result), ev.key, ev.value, ev.type, ev.date);
                            this.memory.off([
                                event.key,
                                event.prop,
                                true,
                                event.id
                            ]);
                            this.memory.on([
                                event.key,
                                event.prop,
                                true,
                                event.id
                            ], () => event);
                            this.status.update(event);
                            const events = this.memory.reflect([event.key]).filter(ev => ev.id > 0);
                            if (events.length >= this.snapshotCycle || events.filter(event => (0, value_1.hasBinary)(event.value)).length >= 3) {
                                this.snapshot(event.key);
                            }
                        });
                        const fail = () => {
                            void revert() || active() && loss();
                        };
                        tx.addEventListener('error', fail);
                        tx.addEventListener('abort', fail);
                        tx.commit();
                    }, () => {
                        void revert() || active() && loss();
                    }, tx);
                }
                delete(key) {
                    return void this.add(new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete));
                }
                snapshot(key) {
                    if (!this.alive)
                        return;
                    return void this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
                        if (!this.has(key) || this.meta(key).id === 0)
                            return;
                        const store = tx.objectStore(this.name);
                        const req = store.index(EventStoreSchema.key).openCursor(key, 'prev');
                        const events = [];
                        req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (cursor) {
                                try {
                                    const event = new event_1.LoadedEventRecord(cursor.value);
                                    events.unshift(event);
                                } catch (reason) {
                                    (0, exception_1.causeAsyncException)(reason);
                                    cursor.delete();
                                }
                                return void cursor.continue();
                            } else {
                                if (events.length <= 1)
                                    return;
                                if (events.at(-1).type === EventStore.EventType.snapshot)
                                    return;
                                const event = compose(key, events);
                                if (event.id > 0)
                                    return;
                                switch (event.type) {
                                case EventStore.EventType.snapshot:
                                    return void this.add(new event_1.UnstoredEventRecord(event.key, event.value, event.type, events.reduce((date, ev) => ev.date > date ? ev.date : date, 0)), tx);
                                case EventStore.EventType.delete:
                                    return void tx.commit();
                                case EventStore.EventType.put:
                                default:
                                    throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${ event.type }`);
                                }
                            }
                        });
                    }, () => void 0);
                }
                clean(key) {
                    var _a, _b;
                    if (!this.alive)
                        return;
                    const events = [];
                    let deletion = false;
                    let clear;
                    return void this.cursor(api_1.IDBKeyRange.only(key), EventStoreSchema.key, 'prev', 'readwrite', (_b = (_a = this.relation) === null || _a === void 0 ? void 0 : _a.stores) !== null && _b !== void 0 ? _b : [], (error, cursor, tx) => {
                        var _a;
                        if (!this.alive)
                            return;
                        if (error)
                            return;
                        if (cursor) {
                            let event;
                            try {
                                event = new event_1.LoadedEventRecord(cursor.value);
                            } catch (reason) {
                                (0, exception_1.causeAsyncException)(reason);
                                cursor.delete();
                            }
                            switch (event.type) {
                            case EventStore.EventType.put:
                                clear !== null && clear !== void 0 ? clear : clear = false;
                                if (deletion)
                                    break;
                                return void cursor.continue();
                            case EventStore.EventType.snapshot:
                                clear !== null && clear !== void 0 ? clear : clear = false;
                                if (deletion)
                                    break;
                                deletion = true;
                                return void cursor.continue();
                            case EventStore.EventType.delete:
                                clear !== null && clear !== void 0 ? clear : clear = true;
                                deletion = true;
                                break;
                            }
                            events.unshift(event);
                            cursor.delete();
                            return void cursor.continue();
                        } else if (tx) {
                            if (clear && this.memory.reflect([key]).every(ev => ev.id > 0)) {
                                (_a = this.relation) === null || _a === void 0 ? void 0 : _a.delete(key, tx);
                            }
                            return;
                        } else if (events.length > 0) {
                            for (const event of events) {
                                this.memory.off([
                                    event.key,
                                    event.prop,
                                    true,
                                    event.id
                                ]);
                            }
                            for (const event of this.memory.reflect([key]).filter(ev => 0 < ev.id && ev.id < events.at(-1).id)) {
                                this.memory.off([
                                    event.key,
                                    event.prop,
                                    true,
                                    event.id
                                ]);
                            }
                            return;
                        }
                    });
                }
                cursor(query, index, direction, mode, stores, cb) {
                    if (!this.alive)
                        return void cb(new Error('Session is already closed.'), null, null);
                    return void this.listen(db => {
                        if (!this.alive)
                            return void cb(new Error('Session is already closed.'), null, null);
                        const tx = db.transaction([
                            this.name,
                            ...stores
                        ], mode);
                        const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
                        req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (cursor) {
                                try {
                                    cb(req.error, cursor, tx);
                                } catch (reason) {
                                    cursor.delete();
                                    (0, exception_1.causeAsyncException)(reason);
                                }
                                return;
                            } else {
                                cb(tx.error || req.error, null, tx);
                                mode === 'readwrite' && tx.commit();
                                return;
                            }
                        });
                        tx.addEventListener('complete', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('error', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('abort ', () => void cb(tx.error || req.error, null, null));
                    }, () => void cb(new Error('Request has failed.'), null, null));
                }
                close() {
                    this.alive = false;
                }
            }
            exports.EventStore = EventStore;
            (function (EventStore) {
                class Event {
                    constructor(type, id, key, prop, date) {
                        this.type = type;
                        this.id = id;
                        this.key = key;
                        this.prop = prop;
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
            function compose(key, events) {
                return group(events).map(events => events.reduceRight(compose, new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.delete, 0))).reduce(ev => ev);
                function group(events) {
                    return events.map((ev, i) => [
                        ev,
                        i
                    ]).sort(([a, ai], [b, bi]) => void 0 || global_1.indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id > 0 && a.id > 0 && b.id - a.id || bi - ai).reduceRight(([head, ...tail], [event]) => {
                        const prev = head[0];
                        if (!prev)
                            return [[event]];
                        return prev.key === event.key ? (0, concat_1.concat)([(0, concat_1.concat)([event], head)], tail) : (0, concat_1.concat)([[event]], (0, concat_1.concat)([head], tail));
                    }, [[]]);
                }
                function compose(target, source) {
                    switch (source.type) {
                    case EventStore.EventType.put:
                        return new event_1.UnstoredEventRecord(source.key, new EventStore.Value(target.value, { [source.prop]: source.value[source.prop] }), EventStore.EventType.snapshot);
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
            '../../infrastructure/indexeddb/api': 59,
            '../database/value': 39,
            './event': 40,
            './identifier': 41,
            'spica/alias': 5,
            'spica/clock': 9,
            'spica/concat': 11,
            'spica/exception': 14,
            'spica/global': 17,
            'spica/observer': 30
        }
    ],
    43: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.KeyValueStore = void 0;
            const global_1 = _dereq_('spica/global');
            const clock_1 = _dereq_('spica/clock');
            const exception_1 = _dereq_('spica/exception');
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
                    if (++this.tx.rwc < 25 || !this.tx.rw)
                        return;
                    const tx = this.tx.rw;
                    this.tx.rwc = 0;
                    this.tx.rw = void 0;
                    tx.commit();
                    return this.tx.rw;
                }
                set txrw(tx) {
                    if (this.tx.rw === tx)
                        return;
                    this.tx.rwc = 0;
                    this.tx.rw = tx;
                    const clear = () => {
                        if (this.tx.rw !== tx)
                            return;
                        this.tx.rw = void 0;
                    };
                    this.tx.rw.addEventListener('abort', clear);
                    this.tx.rw.addEventListener('error', clear);
                    this.tx.rw.addEventListener('complete', clear);
                    (0, clock_1.tick)(clear);
                }
                transact(cache, success, failure, tx = this.txrw) {
                    return tx ? void success(tx) : void this.listen(db => {
                        const tx = cache(db);
                        return tx ? void success(this.txrw = tx) : void failure(new Error('Session is already closed.'));
                    }, failure);
                }
                load(key, cb, cancellation) {
                    if (!this.alive)
                        return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Session is already closed.'), key));
                    return void this.listen(db => {
                        if (!this.alive)
                            return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Session is already closed.'), key));
                        if (cancellation === null || cancellation === void 0 ? void 0 : cancellation.isCancelled)
                            return void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request is cancelled.'), key));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = this.index ? tx.objectStore(this.name).index(this.index).get(key) : tx.objectStore(this.name).get(key);
                        req.addEventListener('success', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error || req.error, key, req.result)) && this.cache.set(key, req.result));
                        tx.addEventListener('complete', () => void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()));
                        tx.addEventListener('error', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void (cb === null || cb === void 0 ? void 0 : cb(tx.error || req.error, key))));
                        tx.addEventListener('abort', () => (void (cancellation === null || cancellation === void 0 ? void 0 : cancellation.close()), void (cb === null || cb === void 0 ? void 0 : cb(tx.error || req.error, key))));
                        cancellation === null || cancellation === void 0 ? void 0 : cancellation.register(() => void tx.abort());
                    }, () => void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request has failed.'), key)));
                }
                has(key) {
                    return this.cache.has(key);
                }
                get(key) {
                    return this.cache.get(key);
                }
                set(key, value, cb) {
                    return this.put(value, key, cb);
                }
                put(value, key, cb) {
                    this.cache.set(key, value);
                    if (!this.alive)
                        return value;
                    this.transact(db => this.alive && this.cache.has(key) ? db.transaction(this.name, 'readwrite') : void 0, tx => {
                        this.index ? tx.objectStore(this.name).put(this.cache.get(key)) : tx.objectStore(this.name).put(this.cache.get(key), key);
                        tx.addEventListener('complete', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key, value)));
                        tx.addEventListener('error', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key, value)));
                        tx.addEventListener('abort', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key, value)));
                    }, () => void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request has failed.'), key, value)));
                    return value;
                }
                delete(key, cb) {
                    this.cache.delete(key);
                    if (!this.alive)
                        return;
                    this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
                        tx.objectStore(this.name).delete(key);
                        tx.addEventListener('complete', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key)));
                        tx.addEventListener('error', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key)));
                        tx.addEventListener('abort', () => void (cb === null || cb === void 0 ? void 0 : cb(tx.error, key)));
                    }, () => void (cb === null || cb === void 0 ? void 0 : cb(new Error('Request has failed.'), key)));
                }
                count(query, index) {
                    return new global_1.Promise((resolve, reject) => void this.listen(db => {
                        if (!this.alive)
                            return void reject(new Error('Session is already closed.'));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = index ? tx.objectStore(this.name).index(index).count(query !== null && query !== void 0 ? query : void 0) : tx.objectStore(this.name).count(query !== null && query !== void 0 ? query : void 0);
                        req.addEventListener('success', () => void resolve(req.result));
                        tx.addEventListener('complete', () => void reject(req.error));
                        tx.addEventListener('error', () => void reject(req.error));
                        tx.addEventListener('abort', () => void reject(req.error));
                    }, () => void reject(new Error('Request has failed.'))));
                }
                getAll(query, count, index, mode, stores, cb) {
                    if (!this.alive)
                        return;
                    this.listen(db => {
                        if (!this.alive)
                            return;
                        const tx = db.transaction([
                            this.name,
                            ...stores
                        ], mode);
                        const req = index ? tx.objectStore(this.name).index(index).getAll(query, count) : tx.objectStore(this.name).getAll(query, count);
                        req.addEventListener('success', () => {
                            const values = req.result;
                            if (values) {
                                try {
                                    cb(tx.error || req.error, values, tx);
                                } catch (reason) {
                                    (0, exception_1.causeAsyncException)(reason);
                                }
                                return;
                            } else {
                                cb(tx.error || req.error, null, tx);
                                mode === 'readwrite' && tx.commit();
                                return;
                            }
                        });
                        tx.addEventListener('complete', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('error', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('abort', () => void cb(tx.error || req.error, null, null));
                    }, () => void cb(new Error('Request has failed.'), null, null));
                }
                cursor(query, index, direction, mode, stores, cb) {
                    if (!this.alive)
                        return;
                    this.listen(db => {
                        if (!this.alive)
                            return;
                        const tx = db.transaction([
                            this.name,
                            ...stores
                        ], mode);
                        const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
                        req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (cursor) {
                                try {
                                    this.cache.set(cursor.primaryKey, { ...cursor.value });
                                    cb(tx.error || req.error, cursor, tx);
                                } catch (reason) {
                                    cursor.delete();
                                    (0, exception_1.causeAsyncException)(reason);
                                }
                                return;
                            } else {
                                cb(tx.error || req.error, null, tx);
                                mode === 'readwrite' && tx.commit();
                                return;
                            }
                        });
                        tx.addEventListener('complete', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('error', () => void cb(tx.error || req.error, null, null));
                        tx.addEventListener('abort', () => void cb(tx.error || req.error, null, null));
                    }, () => void cb(new Error('Request has failed.'), null, null));
                }
                close() {
                    this.alive = false;
                }
            }
            exports.KeyValueStore = KeyValueStore;
        },
        {
            'spica/clock': 9,
            'spica/exception': 14,
            'spica/global': 17
        }
    ],
    44: [
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
                    this.channel = new BroadcastChannel(`clientchannel::${ this.name }`);
                    this.listeners = new Set();
                    this.alive = true;
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Broadcast channel "${ name }" is already open.`);
                    cache.add(this.name);
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Broadcast channel "${ this.name }" is already closed.`);
                }
                listen(type, listener) {
                    this.ensureAliveness();
                    this.listeners.add(handler);
                    this.channel.addEventListener('message', handler);
                    const {debug} = this;
                    return () => {
                        this.listeners.delete(handler);
                        this.channel.removeEventListener('message', handler);
                    };
                    function handler(ev) {
                        const msg = parse(ev.data);
                        if (!msg || msg.type !== type)
                            return;
                        debug && console.log('recv', msg);
                        listener(msg);
                    }
                }
                post(msg) {
                    this.ensureAliveness();
                    this.debug && console.log('send', msg);
                    this.channel.postMessage(msg);
                }
                close() {
                    this.channel.close();
                    this.listeners.clear();
                    cache.delete(this.name);
                    this.alive = false;
                }
            }
            exports.Channel = Channel;
        },
        {}
    ],
    45: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.build = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = exports.DAO = void 0;
            var builder_1 = _dereq_('./module/builder');
            Object.defineProperty(exports, 'DAO', {
                enumerable: true,
                get: function () {
                    return builder_1.DAO;
                }
            });
            Object.defineProperty(exports, 'isValidProperty', {
                enumerable: true,
                get: function () {
                    return builder_1.isValidProperty;
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
            Object.defineProperty(exports, 'build', {
                enumerable: true,
                get: function () {
                    return builder_1.build;
                }
            });
        },
        { './module/builder': 46 }
    ],
    46: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.build = exports.DAO = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = void 0;
            const alias_1 = _dereq_('spica/alias');
            const value_1 = _dereq_('../../../data/database/value');
            var value_2 = _dereq_('../../../data/database/value');
            Object.defineProperty(exports, 'isValidProperty', {
                enumerable: true,
                get: function () {
                    return value_2.isValidProperty;
                }
            });
            Object.defineProperty(exports, 'isValidPropertyName', {
                enumerable: true,
                get: function () {
                    return value_2.isValidPropertyName;
                }
            });
            Object.defineProperty(exports, 'isValidPropertyValue', {
                enumerable: true,
                get: function () {
                    return value_2.isValidPropertyValue;
                }
            });
            var DAO;
            (function (DAO) {
                DAO.meta = Symbol.for('clientchannel/DAO.meta');
                DAO.id = Symbol.for('clientchannel/DAO.id');
                DAO.key = Symbol.for('clientchannel/DAO.key');
                DAO.date = Symbol.for('clientchannel/DAO.data');
                DAO.event = Symbol.for('clientchannel/DAO.event');
            }(DAO = exports.DAO || (exports.DAO = {})));
            function build(source, target, set, get) {
                if (typeof source[DAO.key] !== 'string')
                    throw new TypeError(`ClientChannel: DAO: Invalid key: ${ source[DAO.key] }`);
                const descmap = {
                    ...(0, alias_1.ObjectEntries)(target).filter(value_1.isValidProperty).reduce((map, [prop, iniValue]) => {
                        var _a;
                        {
                            const desc = (_a = (0, alias_1.ObjectGetOwnPropertyDescriptor)(target, prop)) !== null && _a !== void 0 ? _a : {};
                            if (desc.get || desc.set)
                                return map;
                        }
                        if (!(prop in source)) {
                            source[prop] = iniValue;
                        }
                        map[prop] = {
                            enumerable: true,
                            get() {
                                const value = source[prop];
                                get === null || get === void 0 ? void 0 : get(prop, value);
                                return value;
                            },
                            set(newValue) {
                                if (!(0, value_1.isValidPropertyValue)(newValue))
                                    throw new TypeError(`ClientChannel: DAO: Invalid value: ${ JSON.stringify(newValue) }`);
                                const oldValue = source[prop];
                                source[prop] = newValue;
                                set === null || set === void 0 ? void 0 : set(prop, newValue, oldValue);
                            }
                        };
                        return map;
                    }, {}),
                    ...{
                        [DAO.meta]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[DAO.meta]
                        },
                        [DAO.id]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[DAO.id]
                        },
                        [DAO.key]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[DAO.key]
                        },
                        [DAO.date]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[DAO.date]
                        },
                        [DAO.event]: {
                            configurable: false,
                            enumerable: false,
                            get: () => source[DAO.event]
                        }
                    }
                };
                (0, alias_1.ObjectDefineProperties)(target, descmap);
                (0, alias_1.ObjectSeal)(target);
                return target;
            }
            exports.build = build;
        },
        {
            '../../../data/database/value': 39,
            'spica/alias': 5
        }
    ],
    47: [
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
        { './service/channel': 52 }
    ],
    48: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.ChannelStore = void 0;
            const global_1 = _dereq_('spica/global');
            const api_1 = _dereq_('../../../infrastructure/indexeddb/api');
            const api_2 = _dereq_('../../dao/api');
            const data_1 = _dereq_('./channel/data');
            const access_1 = _dereq_('./channel/access');
            const expiry_1 = _dereq_('./channel/expiry');
            const channel_1 = _dereq_('../../broadcast/channel');
            const channel_2 = _dereq_('../../ownership/channel');
            const observer_1 = _dereq_('spica/observer');
            const cancellation_1 = _dereq_('spica/cancellation');
            const promise_1 = _dereq_('spica/promise');
            class SaveMessage extends channel_1.ChannelMessage {
                constructor(key) {
                    super(key, 'save');
                    this.key = key;
                }
            }
            const cache = new Set();
            class ChannelStore {
                constructor(name, destroy, age, capacity, debug = false) {
                    this.name = name;
                    this.age = age;
                    this.capacity = capacity;
                    this.debug = debug;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.channel = new channel_1.Channel(this.name, this.debug);
                    this.ownership = new channel_2.Ownership(this.channel);
                    this.keys = new Set();
                    this.lock = false;
                    this.events$ = {
                        load: new observer_1.Observation(),
                        save: new observer_1.Observation()
                    };
                    this.events = {
                        load: new observer_1.Observation({ limit: global_1.Infinity }),
                        save: new observer_1.Observation({ limit: global_1.Infinity }),
                        loss: new observer_1.Observation({ limit: global_1.Infinity })
                    };
                    this.ages = new Map();
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Store channel "${ name }" is already open.`);
                    cache.add(name);
                    this.cancellation.register(() => void cache.delete(name));
                    this.stores = new Stores(this, this.ownership, this.capacity, (0, api_1.open)(name, {
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
                    this.cancellation.register(api_1.idbEventStream.on([
                        name,
                        'destroy'
                    ], () => void this.stores.rebuild()));
                    this.cancellation.register(() => void this.stores.close());
                    this.cancellation.register(() => void this.ownership.close());
                    this.cancellation.register(() => void this.channel.close());
                    this.cancellation.register(this.channel.listen('save', ({key}) => void this.load(key)));
                    this.events$.save.monitor([], ({key}) => void this.channel.post(new SaveMessage(key)));
                    if (this.capacity === global_1.Infinity)
                        return;
                    this.events$.load.monitor([], ({key, type}) => {
                        if (type === ChannelStore.EventType.delete) {
                            this.keys.delete(key);
                        } else if (!this.keys.has(key)) {
                            this.keys.add(key);
                        }
                    });
                    this.events$.save.monitor([], ({key, type}) => {
                        if (type === ChannelStore.EventType.delete) {
                            this.keys.delete(key);
                        } else if (!this.keys.has(key)) {
                            this.keys.add(key);
                            this.keys.size > this.capacity && this.stores.access.schedule(100);
                        }
                    });
                }
                get alive() {
                    return this.cancellation.isAlive;
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Store channel "${ this.name }" is already closed.`);
                }
                sync(keys, timeout) {
                    this.ensureAliveness();
                    const cancellation = timeout === void 0 ? void 0 : new cancellation_1.Cancellation();
                    cancellation && (0, global_1.setTimeout)(cancellation.cancel, timeout);
                    return global_1.Promise.resolve(promise_1.AtomicPromise.allSettled(keys.map(key => new global_1.Promise((resolve, reject) => void this.load(key, error => error ? void reject(error) : void resolve(key), cancellation)))));
                }
                load(key, cb, cancellation) {
                    this.ensureAliveness();
                    return this.stores.data.load(key, cb, cancellation);
                }
                has(key) {
                    this.ensureAliveness();
                    return this.stores.data.has(key);
                }
                meta(key) {
                    this.ensureAliveness();
                    return this.stores.data.meta(key);
                }
                get(key) {
                    this.ensureAliveness();
                    this.log(key);
                    return this.stores.data.get(key);
                }
                add(record) {
                    this.ensureAliveness();
                    const key = record.key;
                    this.stores.data.add(record);
                    this.log(key);
                }
                delete(key) {
                    this.ensureAliveness();
                    this.stores.data.delete(key);
                    this.stores.access.set(key, false);
                }
                clean(key) {
                    this.ensureAliveness();
                    this.stores.data.clean(key);
                }
                log(key) {
                    var _a;
                    if (!this.alive)
                        return;
                    this.stores.access.set(key);
                    this.stores.expiry.set(key, (_a = this.ages.get(key)) !== null && _a !== void 0 ? _a : this.age);
                }
                expire(key, age = this.age) {
                    this.ensureAliveness();
                    this.ages.set(key, age);
                }
                recent(cb, timeout) {
                    if (typeof cb === 'number')
                        return this.recent(void 0, cb);
                    this.ensureAliveness();
                    return this.stores.access.recent(cb, timeout);
                }
                close() {
                    this.cancellation.cancel();
                    return void (0, api_1.close)(this.name);
                }
                destroy() {
                    this.ensureAliveness();
                    this.cancellation.cancel();
                    return void (0, api_1.destroy)(this.name);
                }
            }
            exports.ChannelStore = ChannelStore;
            (function (ChannelStore) {
                let Value;
                (function (Value) {
                    Value.meta = api_2.DAO.meta;
                    Value.id = api_2.DAO.id;
                    Value.key = api_2.DAO.key;
                    Value.date = api_2.DAO.date;
                    Value.event = api_2.DAO.event;
                }(Value = ChannelStore.Value || (ChannelStore.Value = {})));
                ChannelStore.Event = data_1.DataStore.Event;
                ChannelStore.EventType = data_1.DataStore.EventType;
                ChannelStore.Record = data_1.DataStore.Record;
            }(ChannelStore = exports.ChannelStore || (exports.ChannelStore = {})));
            class Stores {
                constructor(store, ownership, capacity, listen) {
                    this.store = store;
                    this.ownership = ownership;
                    this.capacity = capacity;
                    this.listen = listen;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.build();
                }
                build() {
                    const keys = this.data ? this.data.keys() : [];
                    this.access = new access_1.AccessStore(this.store, this.cancellation, this.ownership, this.listen, this.capacity);
                    this.expiry = new expiry_1.ExpiryStore(this.store, this.cancellation, this.ownership, this.listen);
                    this.data = new data_1.DataStore(this.listen, {
                        stores: [
                            this.access.name,
                            this.expiry.name
                        ],
                        delete: (key, tx) => {
                            tx.objectStore(this.access.name).delete(key);
                            tx.objectStore(this.expiry.name).delete(key);
                        }
                    });
                    this.cancellation.register(() => this.data.close());
                    this.cancellation.register(() => this.access.close());
                    this.cancellation.register(() => this.expiry.close());
                    this.cancellation.register(this.store.events$.load.relay(this.data.events.load));
                    this.cancellation.register(this.store.events$.save.relay(this.data.events.save));
                    this.cancellation.register(this.store.events.load.relay(this.data.events.load));
                    this.cancellation.register(this.store.events.save.relay(this.data.events.save));
                    this.cancellation.register(this.store.events.loss.relay(this.data.events.loss));
                    this.store.sync(keys);
                }
                rebuild() {
                    this.close();
                    this.cancellation = new cancellation_1.Cancellation();
                    this.build();
                }
                close() {
                    this.cancellation.cancel();
                }
            }
        },
        {
            '../../../infrastructure/indexeddb/api': 59,
            '../../broadcast/channel': 44,
            '../../dao/api': 45,
            '../../ownership/channel': 53,
            './channel/access': 49,
            './channel/data': 50,
            './channel/expiry': 51,
            'spica/cancellation': 8,
            'spica/global': 17,
            'spica/observer': 30,
            'spica/promise': 31
        }
    ],
    49: [
        function (_dereq_, module, exports) {
            'use strict';
            var _a;
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.AccessStore = exports.name = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const store_1 = _dereq_('../../../../data/kvs/store');
            const timer_1 = _dereq_('spica/timer');
            exports.name = 'access';
            class AccessStore {
                constructor(chan, cancellation, ownership, listen, capacity) {
                    this.chan = chan;
                    this.cancellation = cancellation;
                    this.ownership = ownership;
                    this.listen = listen;
                    this.capacity = capacity;
                    this.name = exports.name;
                    this.store = new class extends store_1.KeyValueStore {
                    }(exports.name, 'key', this.listen);
                    this.schedule = (() => {
                        let untimer;
                        let delay = 10 * 1000;
                        let schedule = global_1.Infinity;
                        return timeout => {
                            if (this.capacity === global_1.Infinity)
                                return;
                            timeout = (0, alias_1.min)(timeout, 60 * 60 * 1000);
                            if (global_1.Date.now() + timeout >= schedule)
                                return;
                            schedule = global_1.Date.now() + timeout;
                            untimer === null || untimer === void 0 ? void 0 : untimer();
                            untimer = (0, timer_1.setTimer)(timeout, async () => {
                                if (!this.cancellation.isAlive)
                                    return;
                                if (schedule === 0)
                                    return;
                                schedule = global_1.Infinity;
                                if (!this.ownership.take('store', delay))
                                    return void this.schedule(delay *= 2);
                                if (this.chan.lock)
                                    return void this.schedule(delay);
                                let untimer = (0, timer_1.setRepeatTimer)(1000, () => {
                                    if (this.ownership.extend('store', delay))
                                        return;
                                    untimer();
                                });
                                this.chan.lock = true;
                                const size = await this.store.count(null, 'key').catch(() => NaN);
                                this.chan.lock = false;
                                if (size >= 0 === false)
                                    return void untimer() || void this.schedule(delay *= 2);
                                if (size <= this.capacity)
                                    return void untimer();
                                const limit = 100;
                                schedule = 0;
                                this.chan.lock = true;
                                return void this.store.getAll(null, (0, alias_1.min)(size - this.capacity, limit), 'date', 'readonly', [], (error, cursor, tx) => {
                                    if (!cursor && !tx)
                                        return;
                                    this.chan.lock = false;
                                    schedule = global_1.Infinity;
                                    untimer();
                                    if (!this.cancellation.isAlive)
                                        return;
                                    if (error)
                                        return void this.schedule(delay * 10);
                                    if (!cursor)
                                        return;
                                    if (!this.ownership.extend('store', delay))
                                        return void this.schedule(delay *= 2);
                                    for (const {key} of cursor) {
                                        this.chan.has(key) || this.chan.meta(key).date === 0 ? this.chan.delete(key) : this.chan.clean(key);
                                    }
                                    cursor.length === limit && this.schedule(delay);
                                });
                            });
                        };
                    })();
                    this.schedule(10 * 1000);
                }
                static configure() {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(exports.name) ? tx.objectStore(exports.name) : tx.db.createObjectStore(exports.name, {
                                keyPath: 'key',
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains('key')) {
                                store.createIndex('key', 'key', { unique: true });
                            }
                            if (!store.indexNames.contains('date')) {
                                store.createIndex('date', 'date');
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
                recent(cb, timeout) {
                    return new Promise((resolve, reject) => {
                        let done = false;
                        timeout && (0, timer_1.setTimer)(timeout, () => done = !void reject(new Error('Timeout.')));
                        const keys = [];
                        void this.store.cursor(null, 'date', 'prev', 'readonly', [], (error, cursor) => {
                            if (done)
                                return;
                            if (error)
                                return void reject(error);
                            if (!cursor)
                                return void resolve(keys);
                            const {key, active} = cursor.value;
                            if (active) {
                                keys.push(key);
                                if ((cb === null || cb === void 0 ? void 0 : cb(key, keys)) === false)
                                    return void resolve(keys);
                            }
                            cursor.continue();
                        });
                    });
                }
                set(key, active = true) {
                    this.store.set(key, new AccessRecord(key, active));
                }
                close() {
                    this.store.close();
                }
            }
            exports.AccessStore = AccessStore;
            class AccessRecord {
                constructor(key, active) {
                    this.active = active;
                    this[_a] = global_1.Date.now();
                    this['key'] = key;
                }
            }
            'key', _a = 'date';
        },
        {
            '../../../../data/kvs/store': 43,
            'spica/alias': 5,
            'spica/global': 17,
            'spica/timer': 34
        }
    ],
    50: [
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
                constructor(listen, relation) {
                    super(exports.name, listen, relation);
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
        { '../../../../data/es/store': 42 }
    ],
    51: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.ExpiryStore = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const store_1 = _dereq_('../../../../data/kvs/store');
            const timer_1 = _dereq_('spica/timer');
            const name = 'expiry';
            class ExpiryStore {
                constructor(chan, cancellation, ownership, listen) {
                    this.chan = chan;
                    this.cancellation = cancellation;
                    this.ownership = ownership;
                    this.listen = listen;
                    this.name = name;
                    this.store = new class extends store_1.KeyValueStore {
                    }(name, 'key', this.listen);
                    this.schedule = (() => {
                        let untimer;
                        let delay = 10 * 1000;
                        let schedule = global_1.Infinity;
                        return timeout => {
                            timeout = (0, alias_1.min)(timeout, 60 * 60 * 1000);
                            if (global_1.Date.now() + timeout >= schedule)
                                return;
                            schedule = global_1.Date.now() + timeout;
                            untimer === null || untimer === void 0 ? void 0 : untimer();
                            untimer = (0, timer_1.setTimer)(timeout, () => {
                                if (!this.cancellation.isAlive)
                                    return;
                                if (schedule === 0)
                                    return;
                                schedule = global_1.Infinity;
                                if (!this.ownership.take('store', delay))
                                    return void this.schedule(delay *= 2);
                                if (this.chan.lock)
                                    return void this.schedule(delay);
                                let untimer = (0, timer_1.setRepeatTimer)(1000, () => {
                                    if (this.ownership.extend('store', delay))
                                        return;
                                    untimer();
                                });
                                const limit = 100;
                                schedule = 0;
                                this.chan.lock = true;
                                return void this.store.getAll(null, limit, 'expiry', 'readonly', [], (error, cursor, tx) => {
                                    if (!cursor && !tx)
                                        return;
                                    this.chan.lock = false;
                                    schedule = global_1.Infinity;
                                    untimer();
                                    if (!this.cancellation.isAlive)
                                        return;
                                    if (error)
                                        return void this.schedule(delay * 10);
                                    if (!cursor)
                                        return;
                                    if (!this.ownership.extend('store', delay))
                                        return void this.schedule(delay *= 2);
                                    for (const {key, expiry} of cursor) {
                                        if (expiry > global_1.Date.now())
                                            return void this.schedule(expiry - global_1.Date.now());
                                        this.chan.has(key) || this.chan.meta(key).date === 0 ? this.chan.delete(key) : this.chan.clean(key);
                                    }
                                    cursor.length === limit && this.schedule(delay);
                                });
                            });
                        };
                    })();
                    this.schedule(10 * 1000);
                }
                static configure() {
                    return {
                        make(tx) {
                            const store = tx.db.objectStoreNames.contains(name) ? tx.objectStore(name) : tx.db.createObjectStore(name, {
                                keyPath: 'key',
                                autoIncrement: false
                            });
                            if (!store.indexNames.contains('key')) {
                                store.createIndex('key', 'key', { unique: true });
                            }
                            if (!store.indexNames.contains('expiry')) {
                                store.createIndex('expiry', 'expiry');
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
                load(key, cancellation) {
                    return this.store.load(key, (err, key, value) => {
                        var _a;
                        return !err && (value === null || value === void 0 ? void 0 : value.expiry) > ((_a = this.store.get(key)) === null || _a === void 0 ? void 0 : _a.expiry);
                    }, cancellation);
                }
                set(key, age) {
                    if (age === global_1.Infinity)
                        return void this.store.delete(key);
                    this.schedule(age);
                    this.store.set(key, new ExpiryRecord(key, global_1.Date.now() + age));
                }
                close() {
                    this.store.close();
                }
            }
            exports.ExpiryStore = ExpiryStore;
            class ExpiryRecord {
                constructor(key, expiry) {
                    this['key'] = key;
                    this['expiry'] = expiry;
                }
            }
            'key', 'expiry';
        },
        {
            '../../../../data/kvs/store': 43,
            'spica/alias': 5,
            'spica/global': 17,
            'spica/timer': 34
        }
    ],
    52: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.StoreChannel = void 0;
            const alias_1 = _dereq_('spica/alias');
            const api_1 = _dereq_('../../dao/api');
            const channel_1 = _dereq_('../model/channel');
            const api_2 = _dereq_('../../webstorage/api');
            const observer_1 = _dereq_('spica/observer');
            const throttle_1 = _dereq_('spica/throttle');
            const compare_1 = _dereq_('spica/compare');
            class StoreChannel extends channel_1.ChannelStore {
                constructor(name, schemas, {migrate, destroy = () => true, age = Infinity, capacity = Infinity, debug = false} = {}) {
                    super(name, destroy, age, capacity, debug);
                    this.schemas = schemas;
                    this.sources = new Map();
                    this.links = new Map();
                    const update = (key, prop) => {
                        const source = this.sources.get(key);
                        const memory = this.get(key);
                        const link = this.link_(key);
                        const props = prop === '' ? (0, alias_1.ObjectKeys)(memory) : prop in memory ? [prop] : [];
                        const changes = props.map(prop => {
                            const newValue = memory[prop];
                            const oldValue = source[prop];
                            source[prop] = newValue;
                            return {
                                prop,
                                newValue,
                                oldValue
                            };
                        }).filter(({newValue, oldValue}) => !(0, compare_1.equal)(newValue, oldValue));
                        if (changes.length === 0)
                            return;
                        migrate === null || migrate === void 0 ? void 0 : migrate(link);
                        for (const {prop, oldValue} of changes) {
                            source[StoreChannel.Value.event].emit([
                                api_2.StorageChannel.EventType.recv,
                                prop
                            ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.recv, prop, memory[prop], oldValue));
                        }
                    };
                    this.events$.load.monitor([], ({key, prop, type}) => {
                        if (!this.sources.has(key))
                            return;
                        switch (type) {
                        case StoreChannel.EventType.put:
                        case StoreChannel.EventType.snapshot:
                            return void update(key, prop);
                        case StoreChannel.EventType.delete:
                            return;
                        }
                    });
                }
                link_(key) {
                    var _a;
                    if (this.links.has(key))
                        return this.links.get(key);
                    const source = this.get(key);
                    this.sources.set(key, source);
                    this.links.set(key, (0, api_1.build)((0, alias_1.ObjectDefineProperties)(source, {
                        [StoreChannel.Value.meta]: { get: () => this.meta(key) },
                        [StoreChannel.Value.id]: { get: () => this.meta(key).id },
                        [StoreChannel.Value.key]: { get: () => this.meta(key).key },
                        [StoreChannel.Value.date]: { get: () => this.meta(key).date },
                        [StoreChannel.Value.event]: { value: new observer_1.Observation({ limit: Infinity }) }
                    }), '' in this.schemas ? ((_a = this.schemas[key]) !== null && _a !== void 0 ? _a : this.schemas[''])(key) : this.schemas[key](key), (prop, newValue, oldValue) => {
                        if (!this.alive || this.sources.get(key) !== source)
                            return;
                        this.add(new StoreChannel.Record(key, { [prop]: newValue }));
                        if ((0, compare_1.equal)(newValue, oldValue))
                            return;
                        source[StoreChannel.Value.event].emit([
                            api_2.StorageChannel.EventType.send,
                            prop
                        ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.send, prop, newValue, oldValue));
                    }, (0, throttle_1.throttle)(100, () => {
                        this.alive && this.sources.get(key) === source && this.log(key);
                    }))).get(key);
                    return this.link_(key);
                }
                link(key, age) {
                    this.ensureAliveness();
                    this.expire(key, age);
                    const link = this.link_(key);
                    const source = this.sources.get(key);
                    this.load(key, error => {
                        !error && this.alive && this.sources.get(key) === source && this.log(key);
                    });
                    return link;
                }
                unlink(link) {
                    const key = typeof link === 'string' ? link : link[StoreChannel.Value.key];
                    if (key !== link)
                        return link === this.links.get(key) && this.unlink(key);
                    return this.sources.delete(key) && this.links.delete(key);
                }
                delete(key) {
                    this.ensureAliveness();
                    this.links.delete(key);
                    super.delete(key);
                }
            }
            exports.StoreChannel = StoreChannel;
            (function (StoreChannel) {
                StoreChannel.Value = channel_1.ChannelStore.Value;
                StoreChannel.Event = channel_1.ChannelStore.Event;
                StoreChannel.EventType = channel_1.ChannelStore.EventType;
                StoreChannel.Record = channel_1.ChannelStore.Record;
            }(StoreChannel = exports.StoreChannel || (exports.StoreChannel = {})));
        },
        {
            '../../dao/api': 45,
            '../../webstorage/api': 54,
            '../model/channel': 48,
            'spica/alias': 5,
            'spica/compare': 10,
            'spica/observer': 30,
            'spica/throttle': 33
        }
    ],
    53: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.Ownership = void 0;
            const global_1 = _dereq_('spica/global');
            const alias_1 = _dereq_('spica/alias');
            const channel_1 = _dereq_('../broadcast/channel');
            const cancellation_1 = _dereq_('spica/cancellation');
            class OwnershipMessage extends channel_1.ChannelMessage {
                constructor(key, priority, ttl) {
                    super(key, 'ownership');
                    this.key = key;
                    this.priority = priority;
                    this.ttl = ttl;
                }
            }
            class Ownership {
                constructor(channel) {
                    this.channel = channel;
                    this.store = new Map();
                    this.cancellation = new cancellation_1.Cancellation();
                    this.alive = true;
                    this.cancellation.register((() => {
                        const listener = () => this.close();
                        self.addEventListener('unload', listener);
                        return () => void self.removeEventListener('unload', listener);
                    })());
                    this.cancellation.register(() => {
                        for (const key of this.store.keys()) {
                            this.release(key);
                        }
                        this.channel.close();
                    });
                    this.channel.listen('ownership', ({
                        key,
                        priority: newPriority,
                        ttl: newTTL
                    }) => {
                        const {priority: oldPriority} = this.getOwnership(key);
                        switch (true) {
                        case newPriority < 0:
                            return newPriority === oldPriority ? void this.store.delete(key) : void 0;
                        case oldPriority === 0:
                            return void this.setOwnership(key, -newPriority, newTTL);
                        case oldPriority > 0:
                            return oldPriority < newPriority && this.has(key) ? void this.castOwnership(key) : void this.setOwnership(key, -newPriority, newTTL);
                        case oldPriority < 0:
                            return void this.setOwnership(key, -newPriority, newTTL);
                        default:
                        }
                    });
                }
                static genPriority() {
                    return global_1.Date.now();
                }
                getOwnership(key) {
                    var _a;
                    return (_a = this.store.get(key)) !== null && _a !== void 0 ? _a : {
                        priority: 0,
                        ttl: 0
                    };
                }
                setOwnership(key, newPriority, newTTL) {
                    const {
                        priority: oldPriority,
                        ttl: oldTTL
                    } = this.getOwnership(key);
                    this.store.set(key, {
                        priority: newPriority,
                        ttl: newTTL
                    });
                    if (newPriority > 0 && newPriority + newTTL - Ownership.throttle > (0, alias_1.abs)(oldPriority) + oldTTL) {
                        this.castOwnership(key);
                    }
                }
                castOwnership(key) {
                    const {priority, ttl} = this.getOwnership(key);
                    this.channel.post(new OwnershipMessage(key, priority, ttl));
                }
                has(key) {
                    const {priority, ttl} = this.getOwnership(key);
                    return priority >= 0 && Ownership.genPriority() <= priority + ttl;
                }
                isTakable(key) {
                    const {priority, ttl} = this.getOwnership(key);
                    return priority >= 0 || Ownership.genPriority() > (0, alias_1.abs)(priority) + ttl;
                }
                take(key, ttl, wait) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    if (!this.isTakable(key))
                        return wait === void 0 ? false : global_1.Promise.resolve(false);
                    ttl = (0, alias_1.floor)((0, alias_1.min)((0, alias_1.max)(ttl, 1 * 1000), 60 * 1000));
                    wait = wait === void 0 ? wait : (0, alias_1.min)(wait, 0);
                    const priority = Ownership.genPriority() + Ownership.throttle + Ownership.margin;
                    this.setOwnership(key, priority, ttl);
                    return wait === void 0 ? this.has(key) : new global_1.Promise(resolve => void (0, global_1.setTimeout)(() => void resolve(this.extend(key, ttl)), wait));
                }
                extend(key, ttl) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    return this.has(key) ? this.take(key, ttl) : false;
                }
                release(key) {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Ownership channel "${ this.channel.name }" is already closed.`);
                    if (!this.has(key))
                        return;
                    this.setOwnership(key, -this.getOwnership(key).priority, 0);
                    this.castOwnership(key);
                    this.store.delete(key);
                }
                close() {
                    this.cancellation.cancel();
                    this.alive = false;
                }
            }
            exports.Ownership = Ownership;
            Ownership.throttle = 5 * 1000;
            Ownership.margin = 1 * 1000;
        },
        {
            '../broadcast/channel': 44,
            'spica/alias': 5,
            'spica/cancellation': 8,
            'spica/global': 17
        }
    ],
    54: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.fakeStorage = exports.sessionStorage = exports.localStorage = exports.StorageChannel = void 0;
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
            var storage_1 = _dereq_('./model/storage');
            Object.defineProperty(exports, 'fakeStorage', {
                enumerable: true,
                get: function () {
                    return storage_1.fakeStorage;
                }
            });
        },
        {
            '../../infrastructure/webstorage/api': 65,
            './model/storage': 55,
            './service/channel': 56
        }
    ],
    55: [
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
                    this.store.set(key, data);
                }
                removeItem(key) {
                    this.store.delete(key);
                }
                clear() {
                    this.store.clear();
                }
            }
            exports.fakeStorage = new Storage();
        },
        {}
    ],
    56: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.StorageChannel = void 0;
            const alias_1 = _dereq_('spica/alias');
            const api_1 = _dereq_('../../dao/api');
            const api_2 = _dereq_('../../../infrastructure/webstorage/api');
            const storage_1 = _dereq_('../model/storage');
            const observer_1 = _dereq_('spica/observer');
            const cancellation_1 = _dereq_('spica/cancellation');
            const compare_1 = _dereq_('spica/compare');
            const cache = new Set();
            class StorageChannel {
                constructor(name, storage = api_2.sessionStorage || storage_1.fakeStorage, config) {
                    this.name = name;
                    this.storage = storage;
                    this.config = config;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
                    this.events = {
                        send: new observer_1.Observation({ limit: Infinity }),
                        recv: new observer_1.Observation({ limit: Infinity })
                    };
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Storage channel "${ name }" is already open.`);
                    cache.add(name);
                    this.cancellation.register(() => void cache.delete(name));
                    this.cancellation.register(api_2.storageEventStream.on([
                        this.mode,
                        this.name
                    ], ({newValue}) => {
                        const source = this.source;
                        const memory = parse(newValue);
                        const link = this.$link;
                        if (!source || !link)
                            return;
                        void (0, alias_1.ObjectEntries)(memory).filter(api_1.isValidProperty).forEach(([prop]) => {
                            var _a, _b;
                            const newValue = memory[prop];
                            const oldValue = source[prop];
                            if ((0, compare_1.equal)(newValue, oldValue))
                                return;
                            source[prop] = newValue;
                            (_b = (_a = this.config).migrate) === null || _b === void 0 ? void 0 : _b.call(_a, link);
                            const event = new StorageChannel.Event(StorageChannel.EventType.recv, prop, source[prop], oldValue);
                            this.events.recv.emit([event.prop], event);
                            source[StorageChannel.Value.event].emit([
                                event.type,
                                event.prop
                            ], event);
                        });
                    }));
                }
                get alive() {
                    return this.cancellation.isAlive;
                }
                ensureAliveness() {
                    if (!this.alive)
                        throw new Error(`ClientChannel: Storage channel "${ this.name }" is already closed.`);
                }
                link() {
                    var _a, _b;
                    this.ensureAliveness();
                    if (this.$link)
                        return this.$link;
                    const source = this.source = {
                        ...parse(this.storage.getItem(this.name)),
                        [StorageChannel.Value.key]: this.name,
                        [StorageChannel.Value.event]: new observer_1.Observation({ limit: Infinity })
                    };
                    this.$link = (0, api_1.build)(source, this.config.schema(), (prop, newValue, oldValue) => {
                        if (!this.alive || this.source !== source)
                            return;
                        this.storage.setItem(this.name, JSON.stringify((0, alias_1.ObjectFromEntries)((0, alias_1.ObjectEntries)(source).filter(api_1.isValidProperty))));
                        const event = new StorageChannel.Event(StorageChannel.EventType.send, prop, newValue, oldValue);
                        this.events.send.emit([event.prop], event);
                        source[StorageChannel.Value.event].emit([
                            event.type,
                            event.prop
                        ], event);
                    });
                    (_b = (_a = this.config).migrate) === null || _b === void 0 ? void 0 : _b.call(_a, this.$link);
                    return this.link();
                }
                unlink(link) {
                    if (link && this.$link !== link)
                        return false;
                    const result = !!this.source;
                    this.source = this.$link = void 0;
                    return result;
                }
                close() {
                    this.cancellation.cancel();
                }
                destroy() {
                    this.ensureAliveness();
                    this.cancellation.cancel();
                    this.storage.removeItem(this.name);
                }
            }
            exports.StorageChannel = StorageChannel;
            (function (StorageChannel) {
                let Value;
                (function (Value) {
                    Value.key = api_1.DAO.key;
                    Value.event = api_1.DAO.event;
                }(Value = StorageChannel.Value || (StorageChannel.Value = {})));
                class Event {
                    constructor(type, prop, newValue, oldValue) {
                        this.type = type;
                        this.prop = prop;
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
            '../../../infrastructure/webstorage/api': 65,
            '../../dao/api': 45,
            '../model/storage': 55,
            'spica/alias': 5,
            'spica/cancellation': 8,
            'spica/compare': 10,
            'spica/observer': 30
        }
    ],
    57: [
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
        { './module/storage': 58 }
    ],
    58: [
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
                    const key = 'clientchannel#' + (0, uuid_1.uuid)();
                    self.sessionStorage.setItem(key, key);
                    if (key !== self.sessionStorage.getItem(key))
                        throw void 0;
                    self.sessionStorage.removeItem(key);
                    return exports.isStorageAvailable = true;
                } catch (_a) {
                    return exports.isStorageAvailable = false;
                }
            }
            exports.verifyStorageAccess = verifyStorageAccess;
        },
        { 'spica/uuid': 36 }
    ],
    59: [
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
            './model/access': 60,
            './model/event': 61,
            './module/global': 64
        }
    ],
    60: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.destroy = exports.close = exports.listen_ = exports.open = void 0;
            const state_1 = _dereq_('./state');
            const transition_1 = _dereq_('./transition');
            const event_1 = _dereq_('./event');
            const api_1 = _dereq_('../../environment/api');
            const function_1 = _dereq_('spica/function');
            function open(database, config) {
                operate(database, 'open', config);
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
                state_1.commands.set(database, command);
                state_1.configs.set(database, config);
                if (!state_1.isIDBAvailable || !api_1.isStorageAvailable)
                    return;
                if (state_1.states.has(database)) {
                    return void request(database, function_1.noop);
                } else {
                    return void (0, transition_1.handle)(database);
                }
            }
            function request(database, success, failure = function_1.noop) {
                if (!state_1.isIDBAvailable)
                    return void failure(new Error('Database is unavailable.'));
                if (!api_1.isStorageAvailable)
                    return void failure(new Error('Storage is unavailable.'));
                if (!state_1.requests.has(database))
                    return void failure(new Error('Database is inactive.'));
                state_1.requests.get(database).enqueue(success, failure);
                (0, transition_1.handle)(database);
            }
        },
        {
            '../../environment/api': 57,
            './event': 61,
            './state': 62,
            './transition': 63,
            'spica/function': 15
        }
    ],
    61: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.IDBEvent = exports.idbEventStream = exports.idbEventStream$ = void 0;
            const observer_1 = _dereq_('spica/observer');
            exports.idbEventStream$ = new observer_1.Observation({ limit: Infinity });
            exports.idbEventStream = exports.idbEventStream$;
            class IDBEvent {
                constructor(name, type) {
                    this.name = name;
                    this.type = type;
                }
            }
            exports.IDBEvent = IDBEvent;
        },
        { 'spica/observer': 30 }
    ],
    62: [
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
                    this.queue.push({
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
                                this.queue.shift().failure(new Error('Request is cancelled.'));
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
                        exports.requests.set(database, exports.requests.get(database) || new RequestQueue(database));
                    } else {
                        this.alive = !!curr;
                        if (!this.alive || !curr)
                            return;
                        curr.alive = false;
                    }
                    exports.states.set(database, this);
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
                        (_a = exports.requests.get(this.database)) === null || _a === void 0 ? void 0 : _a.clear();
                        exports.commands.delete(this.database);
                        exports.configs.delete(this.database);
                        exports.requests.delete(this.database);
                    }
                    exports.states.delete(this.database);
                    this.alive = false;
                }
            }
            exports.EndState = EndState;
        },
        {}
    ],
    63: [
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
                    handleCrashState(new state_1.CrashState(state, reason));
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
                event_1.idbEventStream$.emit([
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
                    handleCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleSuccessState(state) {
                if (!state.alive)
                    return;
                const {database, connection, config, queue} = state;
                connection.onversionchange = () => {
                    const curr = new state_1.EndState(state);
                    connection.close();
                    event_1.idbEventStream$.emit([
                        database,
                        'destroy'
                    ], new event_1.IDBEvent(database, 'destroy'));
                    handleEndState(curr);
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
                                connection.close();
                                return void handleEndState(new state_1.EndState(state, connection.version + 1));
                            } catch (reason) {
                                connection.close();
                                return void handleCrashState(new state_1.CrashState(state, reason));
                            }
                        event_1.idbEventStream$.emit([
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
                            (0, exception_1.causeAsyncException)(reason);
                            const curr = new state_1.CrashState(state, reason);
                            connection.close();
                            return void handleCrashState(curr);
                        }
                    }
                case 'close': {
                        const curr = new state_1.EndState(state);
                        connection.close();
                        return void handleEndState(curr);
                    }
                case 'destroy': {
                        const curr = new state_1.DestroyState(state);
                        connection.close();
                        return void handleDestroyState(curr);
                    }
                }
            }
            function handleErrorState(state) {
                if (!state.alive)
                    return;
                const {database, error, event, config} = state;
                event.preventDefault();
                event_1.idbEventStream$.emit([
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
                event.preventDefault();
                event_1.idbEventStream$.emit([
                    database,
                    'abort'
                ], new event_1.IDBEvent(database, 'abort'));
                return void handleEndState(new state_1.EndState(state));
            }
            function handleCrashState(state) {
                if (!state.alive)
                    return;
                const {database, reason, config} = state;
                event_1.idbEventStream$.emit([
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
                if (!state_1.isIDBAvailable || !(0, api_1.verifyStorageAccess)())
                    return void handleEndState(new state_1.EndState(state));
                const {database} = state;
                const deleteRequest = global_1.indexedDB.deleteDatabase(database);
                deleteRequest.onsuccess = () => (void event_1.idbEventStream$.emit([
                    database,
                    'destroy'
                ], new event_1.IDBEvent(database, 'destroy')), void handleEndState(new state_1.EndState(state)));
                deleteRequest.onerror = event => void handleErrorState(new state_1.ErrorState(state, deleteRequest.error, event));
            }
            function handleEndState(state) {
                if (!state.alive)
                    return;
                const {database, version, command} = state;
                state.complete();
                event_1.idbEventStream$.emit([
                    database,
                    'disconnect'
                ], new event_1.IDBEvent(database, 'disconnect'));
                if (!state_1.isIDBAvailable || !(0, api_1.verifyStorageAccess)())
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
            '../../environment/api': 57,
            '../module/global': 64,
            './event': 61,
            './state': 62,
            'spica/exception': 14
        }
    ],
    64: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.IDBKeyRange = exports.indexedDB = void 0;
            exports.indexedDB = self.indexedDB;
            exports.IDBKeyRange = self.IDBKeyRange;
        },
        {}
    ],
    65: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.storageEventStream$ = exports.storageEventStream = exports.sessionStorage = exports.localStorage = void 0;
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
            Object.defineProperty(exports, 'storageEventStream$', {
                enumerable: true,
                get: function () {
                    return event_1.storageEventStream$;
                }
            });
        },
        {
            './model/event': 66,
            './module/global': 67
        }
    ],
    66: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.storageEventStream = exports.storageEventStream$ = void 0;
            const global_1 = _dereq_('../module/global');
            const observer_1 = _dereq_('spica/observer');
            exports.storageEventStream$ = new observer_1.Observation({ limit: Infinity });
            exports.storageEventStream = exports.storageEventStream$;
            void self.addEventListener('storage', event => {
                switch (event.storageArea) {
                case global_1.localStorage:
                    return void exports.storageEventStream$.emit(event.key === null ? ['local'] : [
                        'local',
                        event.key
                    ], event);
                case global_1.sessionStorage:
                    return void exports.storageEventStream$.emit(event.key === null ? ['session'] : [
                        'session',
                        event.key
                    ], event);
                default:
                    return;
                }
            });
        },
        {
            '../module/global': 67,
            'spica/observer': 30
        }
    ],
    67: [
        function (_dereq_, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.sessionStorage = exports.localStorage = void 0;
            const api_1 = _dereq_('../../environment/api');
            exports.localStorage = api_1.isStorageAvailable ? self.localStorage : void 0;
            exports.sessionStorage = api_1.isStorageAvailable ? self.sessionStorage : void 0;
        },
        { '../../environment/api': 57 }
    ],
    68: [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
        { '../application/api': 38 }
    ],
    'clientchannel': [
        function (_dereq_, module, exports) {
            'use strict';
            var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
                if (k2 === undefined)
                    k2 = k;
                var desc = Object.getOwnPropertyDescriptor(m, k);
                if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                        enumerable: true,
                        get: function () {
                            return m[k];
                        }
                    };
                }
                Object.defineProperty(o, k2, desc);
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
        { './src/export': 37 }
    ]
}, {}, [
    1,
    2,
    3,
    'clientchannel',
    4
]);
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.commonJsStrict = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    return require('clientchannel');
}));