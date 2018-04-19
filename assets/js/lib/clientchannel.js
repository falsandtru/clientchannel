/*! clientchannel v0.24.1 https://github.com/falsandtru/clientchannel | (c) 2016, falsandtru | (Apache-2.0 AND MPL-2.0) License */
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
            arguments[4][1][0].apply(exports, arguments);
        },
        { 'dup': 1 }
    ],
    4: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const type_1 = require('./type');
            exports.assign = template((key, target, source) => target[key] = source[key]);
            exports.clone = template((key, target, source) => {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.clone([], source[key]);
                case 'Object':
                    return target[key] = source[key] instanceof Object ? exports.clone({}, source[key]) : source[key];
                default:
                    return target[key] = source[key];
                }
            });
            exports.extend = template((key, target, source) => {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.extend([], source[key]);
                case 'Object':
                    switch (type_1.type(target[key])) {
                    case 'Object':
                        return target[key] = source[key] instanceof Object ? exports.extend(target[key], source[key]) : source[key];
                    default:
                        return target[key] = source[key] instanceof Object ? exports.extend({}, source[key]) : source[key];
                    }
                default:
                    return target[key] = source[key];
                }
            });
            function template(strategy) {
                return walk;
                function walk(target, ...sources) {
                    if (target === undefined || target === null) {
                        throw new TypeError(`Spica: assign: Cannot walk on ${ target }.`);
                    }
                    for (const source of sources) {
                        if (source === undefined || source === null) {
                            continue;
                        }
                        for (const key of Object.keys(Object(source))) {
                            const desc = Object.getOwnPropertyDescriptor(Object(source), key);
                            if (desc !== undefined && desc.enumerable) {
                                void strategy(key, Object(target), Object(source));
                            }
                        }
                    }
                    return Object(target);
                }
            }
        },
        { './type': 24 }
    ],
    5: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const assign_1 = require('./assign');
            const equal_1 = require('./equal');
            class Cache {
                constructor(size, callback = () => undefined, opts = {}) {
                    this.size = size;
                    this.callback = callback;
                    this.opts = {
                        ignore: {
                            delete: false,
                            clear: false
                        }
                    };
                    if (size > 0 === false)
                        throw new Error(`Spica: Cache: Cache size must be greater than 0.`);
                    void Object.freeze(assign_1.extend(this.opts, opts));
                    const {stats, entries} = opts.data || {
                        stats: [
                            [],
                            []
                        ],
                        entries: []
                    };
                    const LFU = stats[1].slice(0, size);
                    const LRU = stats[0].slice(0, size - LFU.length);
                    this.stats = {
                        LRU,
                        LFU
                    };
                    this.store = new Map(entries);
                    void [
                        ...stats[1],
                        ...stats[0]
                    ].slice(LFU.length + LRU.length).forEach(k => void this.store.delete(k));
                    if (this.store.size !== LFU.length + LRU.length)
                        throw new Error(`Spica: Cache: Size of stats and entries is not matched.`);
                    if (![
                            ...LFU,
                            ...LRU
                        ].every(k => this.store.has(k)))
                        throw new Error(`Spica: Cache: Keys of stats and entries is not matched.`);
                }
                put(key, value, log = true) {
                    if (!log && this.store.has(key))
                        return void this.store.set(key, value), true;
                    if (this.access(key))
                        return void this.store.set(key, value), true;
                    const {LRU, LFU} = this.stats;
                    if (LRU.length + LFU.length === this.size && LRU.length < LFU.length) {
                        const key = LFU.pop();
                        const val = this.store.get(key);
                        void this.store.delete(key);
                        void this.callback(key, val);
                    }
                    void LRU.unshift(key);
                    void this.store.set(key, value);
                    if (LRU.length + LFU.length > this.size) {
                        const key = LRU.pop();
                        const val = this.store.get(key);
                        void this.store.delete(key);
                        void this.callback(key, val);
                    }
                    return false;
                }
                set(key, value, log) {
                    void this.put(key, value, log);
                    return value;
                }
                get(key, log = true) {
                    if (!log)
                        return this.store.get(key);
                    void this.access(key);
                    return this.store.get(key);
                }
                has(key) {
                    return this.store.has(key);
                }
                delete(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LRU, LFU} = this.stats;
                    for (const stat of [
                            LFU,
                            LRU
                        ]) {
                        const index = equal_1.findIndex(key, stat);
                        if (index === -1)
                            continue;
                        const val = this.store.get(key);
                        void this.store.delete(stat.splice(index, 1)[0]);
                        if (this.opts.ignore.delete)
                            return true;
                        void this.callback(key, val);
                        return true;
                    }
                    return false;
                }
                clear() {
                    const store = this.store;
                    this.store = new Map();
                    this.stats = {
                        LRU: [],
                        LFU: []
                    };
                    if (this.opts.ignore.clear)
                        return;
                    return void [...store].forEach(([key, val]) => void this.callback(key, val));
                }
                [Symbol.iterator]() {
                    return this.store[Symbol.iterator]();
                }
                export() {
                    return {
                        stats: [
                            this.stats.LRU.slice(),
                            this.stats.LFU.slice()
                        ],
                        entries: [...this]
                    };
                }
                inspect() {
                    const {LRU, LFU} = this.stats;
                    return [
                        LRU.slice(),
                        LFU.slice()
                    ];
                }
                access(key) {
                    return this.accessLFU(key) || this.accessLRU(key);
                }
                accessLRU(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LRU} = this.stats;
                    const index = equal_1.findIndex(key, LRU);
                    if (index === -1)
                        return false;
                    const {LFU} = this.stats;
                    void LFU.unshift(...LRU.splice(index, 1));
                    return true;
                }
                accessLFU(key) {
                    if (!this.store.has(key))
                        return false;
                    const {LFU} = this.stats;
                    const index = equal_1.findIndex(key, LFU);
                    if (index === -1)
                        return false;
                    void LFU.unshift(...LFU.splice(index, 1));
                    return true;
                }
            }
            exports.Cache = Cache;
        },
        {
            './assign': 4,
            './equal': 9
        }
    ],
    6: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const exception_1 = require('./exception');
            const maybe_1 = require('./monad/maybe');
            const either_1 = require('./monad/either');
            class Cancellation {
                constructor(cancelees = []) {
                    this.done = false;
                    this.listeners = new Set();
                    this.register = listener => {
                        if (this.canceled)
                            return void handler(this.reason), () => undefined;
                        if (this.done)
                            return () => undefined;
                        void this.listeners.add(handler);
                        return () => this.done ? undefined : void this.listeners.delete(handler);
                        function handler(reason) {
                            try {
                                void listener(reason);
                            } catch (reason) {
                                void exception_1.causeAsyncException(reason);
                            }
                        }
                    };
                    this.cancel = reason => {
                        if (this.done)
                            return;
                        this.done = true;
                        this.canceled = true;
                        this.reason = reason;
                        void Object.freeze(this.listeners);
                        void Object.freeze(this);
                        void this.listeners.forEach(cb => void cb(reason));
                    };
                    this.close = () => {
                        if (this.done)
                            return;
                        this.done = true;
                        void Object.freeze(this.listeners);
                        void Object.freeze(this);
                    };
                    this.canceled = false;
                    this.promise = val => this.canceled ? new Promise((_, reject) => void reject(this.reason)) : Promise.resolve(val);
                    this.maybe = val => this.canceled ? maybe_1.Nothing : maybe_1.Just(val);
                    this.either = val => this.canceled ? either_1.Left(this.reason) : either_1.Right(val);
                    void [...cancelees].forEach(cancellee => void cancellee.register(this.cancel));
                }
            }
            exports.Cancellation = Cancellation;
        },
        {
            './exception': 10,
            './monad/either': 13,
            './monad/maybe': 17
        }
    ],
    7: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function concat(target, source) {
                for (let i = 0, offset = target.length, len = source.length; i < len; ++i) {
                    target[offset + i] = source[i];
                }
                return target;
            }
            exports.concat = concat;
        },
        {}
    ],
    8: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.curry = (f, ctx) => f.length === 0 ? () => f.call(ctx) : curry_(f, [], ctx);
            function curry_(f, xs, ctx) {
                return f.length <= xs.length ? f.apply(ctx, xs.slice(0, f.length)) : (...ys) => curry_(f, xs.concat(ys), ctx);
            }
        },
        {}
    ],
    9: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function findIndex(a1, as) {
                const isNaN = a1 !== a1;
                for (let i = 0; i < as.length; ++i) {
                    const a2 = as[i];
                    if (isNaN ? a2 !== a2 : a2 === a1)
                        return i;
                }
                return -1;
            }
            exports.findIndex = findIndex;
        },
        {}
    ],
    10: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function causeAsyncException(reason) {
                void new Promise((_, reject) => void reject(reason));
            }
            exports.causeAsyncException = causeAsyncException;
            function stringify(target) {
                try {
                    return target instanceof Error && typeof target.stack === 'string' ? target.stack : target !== undefined && target !== null && typeof target.toString === 'function' ? target + '' : Object.prototype.toString.call(target);
                } catch (reason) {
                    return stringify(reason);
                }
            }
        },
        {}
    ],
    11: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const functor_1 = require('./functor');
            const curry_1 = require('../curry');
            class Applicative extends functor_1.Functor {
            }
            exports.Applicative = Applicative;
            (function (Applicative) {
                function ap(af, aa) {
                    return aa ? af.bind(f => aa.fmap(a => f.length === 0 ? f(a) : curry_1.curry(f)(a))) : aa => ap(af, aa);
                }
                Applicative.ap = ap;
            }(Applicative = exports.Applicative || (exports.Applicative = {})));
        },
        {
            '../curry': 8,
            './functor': 14
        }
    ],
    12: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const monad_1 = require('./monad');
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
            }
            exports.Either = Either;
            (function (Either) {
                function pure(b) {
                    return new Right(b);
                }
                Either.pure = pure;
                Either.Return = pure;
                function sequence(ms) {
                    return ms.reduce((acc, m) => acc.bind(bs => m.fmap(b => bs.concat([b]))), Either.Return([]));
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
        { './monad': 18 }
    ],
    13: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const Monad = require('./either.impl');
            var Either;
            (function (Either) {
                Either.fmap = Monad.Either.fmap;
                Either.pure = Monad.Either.pure;
                Either.ap = Monad.Either.ap;
                Either.Return = Monad.Either.Return;
                Either.bind = Monad.Either.bind;
                Either.sequence = Monad.Either.sequence;
            }(Either = exports.Either || (exports.Either = {})));
            function Left(a) {
                return new Monad.Left(a);
            }
            exports.Left = Left;
            function Right(b) {
                return new Monad.Right(b);
            }
            exports.Right = Right;
        },
        { './either.impl': 12 }
    ],
    14: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const lazy_1 = require('./lazy');
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
        { './lazy': 15 }
    ],
    15: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            class Lazy {
                constructor(thunk) {
                    this.thunk = thunk;
                }
                evaluate() {
                    return this.memory_ = this.memory_ || this.thunk();
                }
            }
            exports.Lazy = Lazy;
        },
        {}
    ],
    16: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const monadplus_1 = require('./monadplus');
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
            }
            exports.Maybe = Maybe;
            (function (Maybe) {
                function pure(a) {
                    return new Just(a);
                }
                Maybe.pure = pure;
                Maybe.Return = pure;
                function sequence(ms) {
                    return ms.reduce((acc, m) => acc.bind(as => m.fmap(a => as.concat([a]))), Maybe.Return([]));
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
                        throw undefined;
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
        { './monadplus': 19 }
    ],
    17: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const Monad = require('./maybe.impl');
            var Maybe;
            (function (Maybe) {
                Maybe.fmap = Monad.Maybe.fmap;
                Maybe.pure = Monad.Maybe.pure;
                Maybe.ap = Monad.Maybe.ap;
                Maybe.Return = Monad.Maybe.Return;
                Maybe.bind = Monad.Maybe.bind;
                Maybe.sequence = Monad.Maybe.sequence;
                Maybe.mzero = Monad.Maybe.mzero;
                Maybe.mplus = Monad.Maybe.mplus;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            function Just(a) {
                return new Monad.Just(a);
            }
            exports.Just = Just;
            exports.Nothing = Monad.Maybe.mzero;
        },
        { './maybe.impl': 16 }
    ],
    18: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const applicative_1 = require('./applicative');
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
        { './applicative': 11 }
    ],
    19: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const monad_1 = require('./monad');
            class MonadPlus extends monad_1.Monad {
            }
            exports.MonadPlus = MonadPlus;
            (function (MonadPlus) {
            }(MonadPlus = exports.MonadPlus || (exports.MonadPlus = {})));
        },
        { './monad': 18 }
    ],
    20: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const concat_1 = require('./concat');
            const equal_1 = require('./equal');
            const exception_1 = require('./exception');
            var RegisterItemType;
            (function (RegisterItemType) {
                RegisterItemType.monitor = 'monitor';
                RegisterItemType.subscriber = 'subscriber';
            }(RegisterItemType = exports.RegisterItemType || (exports.RegisterItemType = {})));
            class Observation {
                constructor() {
                    this.relaySources = new WeakSet();
                    this.node_ = {
                        parent: undefined,
                        children: new Map(),
                        childrenNames: [],
                        items: []
                    };
                }
                monitor(namespace, listener, {
                    once = false
                } = {}) {
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    const {items} = this.seekNode_(namespace);
                    if (isRegistered(items, RegisterItemType.monitor, namespace, listener))
                        return () => undefined;
                    void items.push({
                        type: RegisterItemType.monitor,
                        namespace,
                        listener,
                        options: { once }
                    });
                    return () => this.off(namespace, listener, RegisterItemType.monitor);
                }
                on(namespace, listener, {
                    once = false
                } = {}) {
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    const {items} = this.seekNode_(namespace);
                    if (isRegistered(items, RegisterItemType.subscriber, namespace, listener))
                        return () => undefined;
                    void items.push({
                        type: RegisterItemType.subscriber,
                        namespace,
                        listener,
                        options: { once }
                    });
                    return () => this.off(namespace, listener);
                }
                once(namespace, listener) {
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    return this.on(namespace, listener, { once: true });
                }
                off(namespace, listener, type = RegisterItemType.subscriber) {
                    switch (typeof listener) {
                    case 'function':
                        return void this.seekNode_(namespace).items.some(({
                            type: type_,
                            listener: listener_
                        }, i, items) => {
                            if (listener_ !== listener)
                                return false;
                            if (type_ !== type)
                                return false;
                            switch (i) {
                            case 0:
                                return !void items.shift();
                            case items.length - 1:
                                return !void items.pop();
                            default:
                                return !void items.splice(i, 1);
                            }
                        });
                    case 'undefined': {
                            const node = this.seekNode_(namespace);
                            void node.childrenNames.slice().forEach(name => {
                                void this.off(namespace.concat([name]));
                                const child = node.children.get(name);
                                if (!child)
                                    return;
                                if (child.items.length + child.childrenNames.length > 0)
                                    return;
                                void node.children.delete(name);
                                void node.childrenNames.splice(equal_1.findIndex(name, node.childrenNames), 1);
                            });
                            node.items = node.items.filter(({type}) => type === RegisterItemType.monitor);
                            return;
                        }
                    default:
                        throw throwTypeErrorIfInvalidListener(listener, namespace);
                    }
                }
                emit(namespace, data, tracker) {
                    void this.drain_(namespace, data, tracker);
                }
                reflect(namespace, data) {
                    let results = [];
                    void this.emit(namespace, data, (_, r) => results = r);
                    return results;
                }
                relay(source) {
                    if (this.relaySources.has(source))
                        return () => undefined;
                    void this.relaySources.add(source);
                    const unbind = source.monitor([], (data, namespace) => void this.emit(namespace, data));
                    return () => (void this.relaySources.delete(source), unbind());
                }
                drain_(namespace, data, tracker) {
                    const results = [];
                    void this.refsBelow_(this.seekNode_(namespace)).reduce((_, {
                        type,
                        listener,
                        options: {once}
                    }) => {
                        if (type !== RegisterItemType.subscriber)
                            return;
                        if (once) {
                            void this.off(namespace, listener);
                        }
                        try {
                            const result = listener(data, namespace);
                            if (tracker) {
                                results[results.length] = result;
                            }
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }, undefined);
                    void this.refsAbove_(this.seekNode_(namespace)).reduce((_, {
                        type,
                        listener,
                        options: {once}
                    }) => {
                        if (type !== RegisterItemType.monitor)
                            return;
                        if (once) {
                            void this.off(namespace, listener, RegisterItemType.monitor);
                        }
                        try {
                            void listener(data, namespace);
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }, undefined);
                    if (tracker) {
                        try {
                            void tracker(data, results);
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }
                }
                refs(namespace) {
                    return this.refsBelow_(this.seekNode_(namespace));
                }
                refsAbove_({parent, items}) {
                    items = concat_1.concat([], items);
                    while (parent) {
                        items = concat_1.concat(items, parent.items);
                        parent = parent.parent;
                    }
                    return items;
                }
                refsBelow_({childrenNames, children, items}) {
                    items = concat_1.concat([], items);
                    for (let i = 0; i < childrenNames.length; ++i) {
                        const name = childrenNames[i];
                        const below = this.refsBelow_(children.get(name));
                        items = concat_1.concat(items, below);
                        if (below.length === 0) {
                            void children.delete(name);
                            void childrenNames.splice(equal_1.findIndex(name, childrenNames), 1);
                            void --i;
                        }
                    }
                    return items;
                }
                seekNode_(namespace) {
                    let node = this.node_;
                    for (const name of namespace) {
                        const {children} = node;
                        if (!children.has(name)) {
                            void node.childrenNames.push(name);
                            children.set(name, {
                                parent: node,
                                children: new Map(),
                                childrenNames: [],
                                items: []
                            });
                        }
                        node = children.get(name);
                    }
                    return node;
                }
            }
            exports.Observation = Observation;
            function isRegistered(items, type, namespace, listener) {
                return items.some(({
                    type: t,
                    namespace: n,
                    listener: l
                }) => t === type && n.length === namespace.length && n.every((_, i) => n[i] === namespace[i]) && l === listener);
            }
            function throwTypeErrorIfInvalidListener(listener, types) {
                switch (typeof listener) {
                case 'function':
                    return;
                default:
                    throw new TypeError(`Spica: Observation: Invalid listener.\n\t${ types } ${ listener }`);
                }
            }
        },
        {
            './concat': 7,
            './equal': 9,
            './exception': 10
        }
    ],
    21: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const zeros = '0'.repeat(15);
            let cnt = 0;
            function sqid(id) {
                if (arguments.length > 0) {
                    if (typeof id !== 'number')
                        throw new TypeError(`Spica: sqid: A parameter value must be a number: ${ id }`);
                    if (id >= 0 === false)
                        throw new TypeError(`Spica: sqid: A parameter value must be a positive number: ${ id }`);
                    if (id % 1 !== 0)
                        throw new TypeError(`Spica: sqid: A parameter value must be an integer: ${ id }`);
                }
                return id === undefined ? (zeros + ++cnt).slice(-15) : (zeros + id).slice(-15);
            }
            exports.sqid = sqid;
        },
        {}
    ],
    22: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function throttle(interval, callback) {
                let timer = 0;
                let buffer = [];
                return arg => {
                    void buffer.push(arg);
                    if (timer > 0)
                        return;
                    timer = setTimeout(() => {
                        timer = 0;
                        void callback(buffer[buffer.length - 1], flush());
                    }, interval);
                };
                function flush() {
                    const buf = buffer;
                    buffer = [];
                    return buf;
                }
            }
            exports.throttle = throttle;
            function debounce(delay, callback) {
                let timer = 0;
                let buffer = [];
                return arg => {
                    void buffer.push(arg);
                    if (timer > 0)
                        return;
                    timer = setTimeout(() => {
                        timer = 0;
                        void setTimeout(() => {
                            if (timer > 0)
                                return;
                            void callback(buffer[buffer.length - 1], flush());
                        }, delay);
                    }, delay);
                };
                function flush() {
                    const buf = buffer;
                    buffer = [];
                    return buf;
                }
            }
            exports.debounce = debounce;
        },
        {}
    ],
    23: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const exception_1 = require('./exception');
            let queue = [];
            let register = new WeakSet();
            function tick(cb, dedup = false) {
                if (dedup) {
                    if (register.has(cb))
                        return;
                    void register.add(cb);
                }
                void queue.push(cb);
                void schedule();
            }
            exports.tick = tick;
            const scheduler = Promise.resolve();
            function schedule() {
                if (queue.length !== 1)
                    return;
                void scheduler.then(run);
            }
            function run() {
                const cbs = flush();
                while (true) {
                    try {
                        while (cbs.length > 0) {
                            void cbs.shift()();
                        }
                    } catch (reason) {
                        void exception_1.causeAsyncException(reason);
                        continue;
                    }
                    return;
                }
            }
            function flush() {
                const cbs = queue;
                queue = [];
                register = new WeakSet();
                return cbs;
            }
        },
        { './exception': 10 }
    ],
    24: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function type(target) {
                const type = Object.prototype.toString.call(target).split(' ').pop().slice(0, -1);
                if (typeof target !== 'object' && target instanceof Object === false || target === null)
                    return type.toLowerCase();
                return type;
            }
            exports.type = type;
        },
        {}
    ],
    25: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
            function uuid() {
                let acc = '';
                for (const c of FORMAT_V4) {
                    if (c === 'x' || c === 'y') {
                        const r = Math.random() * 16 | 0;
                        const v = c == 'x' ? r : r & 3 | 8;
                        acc += v.toString(16);
                    } else {
                        acc += c;
                    }
                }
                return acc.toLowerCase();
            }
            exports.uuid = uuid;
        },
        {}
    ],
    26: [
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
        { './layer/interface/api': 55 }
    ],
    27: [
        function (require, module, exports) {
            'use strict';
            function __export(m) {
                for (var p in m)
                    if (!exports.hasOwnProperty(p))
                        exports[p] = m[p];
            }
            Object.defineProperty(exports, '__esModule', { value: true });
            const api_1 = require('../domain/indexeddb/api');
            const api_2 = require('../domain/webstorage/api');
            const channel_1 = require('../domain/broadcast/channel');
            const channel_2 = require('../domain/ownership/channel');
            __export(require('../domain/indexeddb/api'));
            __export(require('../domain/webstorage/api'));
            class StoreChannel extends api_1.StoreChannel {
                constructor(name, config) {
                    super(name, config.Schema, config);
                }
            }
            exports.StoreChannel = StoreChannel;
            class StorageChannel extends api_2.StorageChannel {
                constructor(name, {Schema, migrate = () => void 0}) {
                    super(name, api_2.localStorage, Schema, migrate);
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
            '../domain/broadcast/channel': 33,
            '../domain/indexeddb/api': 36,
            '../domain/ownership/channel': 42,
            '../domain/webstorage/api': 43
        }
    ],
    28: [
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
                        return value === null || isBinary(value) || Object.keys(value).every(key => isStorable(value[key]));
                    } catch (_a) {
                        return false;
                    }
                default:
                    return false;
                }
            }
            exports.isStorable = isStorable;
            function hasBinary(value) {
                return value instanceof Object ? isBinary(value) || Object.keys(value).some(key => hasBinary(value[key])) : false;
            }
            exports.hasBinary = hasBinary;
            function isBinary(value) {
                return value instanceof Int8Array || value instanceof Int16Array || value instanceof Int32Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Uint16Array || value instanceof Uint32Array || value instanceof ArrayBuffer || value instanceof Blob;
            }
        },
        {}
    ],
    29: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const assign_1 = require('spica/assign');
            const identifier_1 = require('./identifier');
            const value_1 = require('../database/value');
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
                    if (typeof this.id !== 'number' || !Number.isFinite(this.id) || this.id >= 0 === false || !Number.isSafeInteger(this.id))
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${ this.id }`);
                    if (typeof this.type !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${ this.type }`);
                    if (typeof this.key !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${ this.key }`);
                    if (typeof this.value !== 'object' || !this.value)
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${ JSON.stringify(this.value) }`);
                    if (typeof this.date !== 'number' || !Number.isFinite(this.date) || this.date >= 0 === false)
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${ this.date }`);
                    this.attr = this.type === exports.EventRecordType.put ? Object.keys(value).filter(isValidPropertyName)[0] : '';
                    if (typeof this.attr !== 'string')
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event attr: ${ this.key }`);
                    switch (type) {
                    case exports.EventRecordType.put:
                        if (!isValidPropertyName(this.attr))
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue({ [this.attr]: value[this.attr] });
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    case exports.EventRecordType.snapshot:
                        if (this.attr !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue(value);
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    case exports.EventRecordType.delete:
                        if (this.attr !== '')
                            throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${ this.type }: ${ this.attr }`);
                        this.value = value = new EventRecordValue();
                        void Object.freeze(this.value);
                        void Object.freeze(this);
                        return;
                    default:
                        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${ type }`);
                    }
                }
            }
            class UnstoredEventRecord extends EventRecord {
                constructor(key, value, type = exports.EventRecordType.put, date = Date.now()) {
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
            '../database/value': 28,
            './identifier': 30,
            'spica/assign': 4
        }
    ],
    30: [
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
    31: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            const cancellation_1 = require('spica/cancellation');
            const tick_1 = require('spica/tick');
            const sqid_1 = require('spica/sqid');
            const concat_1 = require('spica/concat');
            const api_1 = require('../../infrastructure/indexeddb/api');
            const identifier_1 = require('./identifier');
            const event_1 = require('./event');
            const value_1 = require('../database/value');
            const noop_1 = require('../../../lib/noop');
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
                    this.memory = new observation_1.Observation();
                    this.events = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation(),
                        loss: new observation_1.Observation(),
                        clean: new observation_1.Observation()
                    });
                    this.events_ = Object.freeze({ memory: new observation_1.Observation() });
                    this.tx_ = { rwc: 0 };
                    this.snapshotCycle = 9;
                    const states = new class {
                        constructor() {
                            this.ids = new Map();
                            this.dates = new Map();
                        }
                        update(event) {
                            void this.ids.set(event.key, identifier_1.makeEventId(Math.max(event.id, this.ids.get(event.key) || 0)));
                            void this.dates.set(event.key, Math.max(event.date, this.dates.get(event.key) || 0));
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
                    if (++this.tx_.rwc > 25) {
                        this.tx_.rwc = 0;
                        this.tx_.rw = void 0;
                        return;
                    }
                    return this.tx_.rw;
                }
                set txrw(tx) {
                    if (!tx)
                        return;
                    if (this.tx_.rw && this.tx_.rw === tx)
                        return;
                    this.tx_.rwc = 0;
                    this.tx_.rw = tx;
                    void tick_1.tick(() => this.tx_.rw = void 0);
                }
                fetch(key, cb = noop_1.noop, cancellation = new cancellation_1.Cancellation()) {
                    const events = [];
                    return void this.listen(db => {
                        if (cancellation.canceled)
                            return void cb(new Error('Cancelled.'));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = tx.objectStore(this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
                        const proc = (cursor, error) => {
                            if (error)
                                return;
                            if (!cursor || new event_1.LoadedEventRecord(cursor.value).date < this.meta(key).date) {
                                void [...events.reduceRight((es, e) => es.length === 0 || es[0].type === EventStore.EventType.put ? concat_1.concat(es, [e]) : es, []).reduceRight((dict, e) => dict.set(e.attr, e), new Map()).values()].sort((a, b) => a.date - b.date || a.id - b.id).forEach(e => (void this.memory.off([
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
                                    void new Promise((_, reject) => void reject(reason));
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
                                    return void proc(null, error);
                                try {
                                    void events.unshift(event);
                                } catch (error) {
                                    void tx.objectStore(this.name).delete(cursor.primaryKey);
                                    void new Promise((_, reject) => void reject(error));
                                }
                                if (event.type !== EventStore.EventType.put)
                                    return void proc(null, error);
                                return void cursor.continue();
                            }
                        };
                        void req.addEventListener('success', () => void proc(req.result, req.error));
                        void tx.addEventListener('complete', () => void cancellation.close());
                        void tx.addEventListener('error', () => (void cancellation.close(), void cb(tx.error || req.error)));
                        void tx.addEventListener('abort', () => (void cancellation.close(), void cb(tx.error || req.error)));
                        void cancellation.register(() => events.length === 0 && void tx.abort());
                    }, () => void cb(new Error('Access has failed.')));
                }
                keys() {
                    return this.memory.reflect([]).reduce((keys, e) => keys.length === 0 || keys[keys.length - 1] !== e.key ? concat_1.concat(keys, [e.key]) : keys, []).sort();
                }
                has(key) {
                    return compose(key, this.attrs, this.memory.reflect([key])).type !== EventStore.EventType.delete;
                }
                meta(key) {
                    const events = this.memory.reflect([key]);
                    return Object.freeze({
                        key: key,
                        id: events.reduce((id, e) => e.id > id ? e.id : id, 0),
                        date: events.reduce((date, e) => e.date > date ? e.date : date, 0)
                    });
                }
                get(key) {
                    return Object.assign(Object.create(null), compose(key, this.attrs, this.memory.reflect([key])).value);
                }
                add(event, tx) {
                    switch (event.type) {
                    case EventStore.EventType.put: {
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
                        }
                    case EventStore.EventType.delete:
                    case EventStore.EventType.snapshot: {
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
                        const req = tx.objectStore(this.name).add(adjust(event));
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
                    return void this.listen(db => {
                        if (!this.has(key) || this.meta(key).id === 0)
                            return;
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        const store = tx.objectStore(this.name);
                        const req = store.index(EventStoreSchema.key).openCursor(key, 'prev');
                        const events = [];
                        void req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (cursor) {
                                const event = new event_1.LoadedEventRecord(cursor.value);
                                try {
                                    void events.unshift(event);
                                } catch (error) {
                                    void cursor.delete();
                                    void new Promise((_, reject) => void reject(error));
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
                    const events = [];
                    const cleanState = new Map();
                    const cleared = new cancellation_1.Cancellation();
                    return void this.cursor(api_1.IDBKeyRange.only(key), EventStoreSchema.key, 'prev', 'readwrite', (cursor, error) => {
                        if (error)
                            return;
                        if (!cursor) {
                            void events.reduce((_, event) => (void this.memory.off([
                                event.key,
                                event.attr,
                                sqid_1.sqid(event.id)
                            ]), void this.events_.memory.off([
                                event.key,
                                event.attr,
                                sqid_1.sqid(event.id)
                            ])), void 0);
                            return void this.events.clean.emit([key], !cleared.canceled);
                        } else {
                            const event = new event_1.LoadedEventRecord(cursor.value);
                            switch (event.type) {
                            case EventStore.EventType.put:
                                void cleared.cancel();
                                void cleanState.set(event.key, cleanState.get(event.key) || false);
                                if (cleanState.get(event.key))
                                    break;
                                return void cursor.continue();
                            case EventStore.EventType.snapshot:
                                void cleared.cancel();
                                if (cleanState.get(event.key))
                                    break;
                                void cleanState.set(event.key, true);
                                return void cursor.continue();
                            case EventStore.EventType.delete:
                                void cleared.close();
                                if (cleanState.get(event.key))
                                    break;
                                void cleanState.set(event.key, true);
                                break;
                            }
                            void cursor.delete();
                            void events.unshift(event);
                            return void cursor.continue();
                        }
                    });
                }
                cursor(query, index, direction, mode, cb) {
                    return void this.listen(db => {
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
                    }, () => void cb(null, new Error('Access has failed.')));
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
                        void Object.freeze(this);
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
            function adjust(event) {
                const ret = Object.assign({}, event);
                delete ret.id;
                return ret;
            }
            exports.adjust = adjust;
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
            '../../../lib/noop': 56,
            '../../infrastructure/indexeddb/api': 46,
            '../database/value': 28,
            './event': 29,
            './identifier': 30,
            'spica/cancellation': 6,
            'spica/concat': 7,
            'spica/observation': 20,
            'spica/sqid': 21,
            'spica/tick': 23
        }
    ],
    32: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const noop_1 = require('../../../lib/noop');
            const cancellation_1 = require('spica/cancellation');
            const tick_1 = require('spica/tick');
            class KeyValueStore {
                constructor(name, index, listen) {
                    this.name = name;
                    this.index = index;
                    this.listen = listen;
                    this.cache = new Map();
                    this.tx_ = { rwc: 0 };
                    if (typeof index !== 'string')
                        throw new TypeError();
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
                    if (++this.tx_.rwc > 25) {
                        this.tx_.rwc = 0;
                        this.tx_.rw = void 0;
                        return;
                    }
                    return this.tx_.rw;
                }
                set txrw(tx) {
                    if (!tx)
                        return;
                    if (this.tx_.rw && this.tx_.rw === tx)
                        return;
                    this.tx_.rwc = 0;
                    this.tx_.rw = tx;
                    void tick_1.tick(() => this.tx_.rw = void 0);
                }
                fetch(key, cb = noop_1.noop, cancellation = new cancellation_1.Cancellation()) {
                    return void this.listen(db => {
                        if (cancellation.canceled)
                            return void cb(new Error('Cancelled.'));
                        const tx = db.transaction(this.name, 'readonly');
                        const req = this.index ? tx.objectStore(this.name).index(this.index).get(key) : tx.objectStore(this.name).get(key);
                        void req.addEventListener('success', () => void cb(req.error));
                        void tx.addEventListener('complete', () => void cancellation.close());
                        void tx.addEventListener('error', () => (void cancellation.close(), void cb(tx.error || req.error)));
                        void tx.addEventListener('abort', () => (void cancellation.close(), void cb(tx.error || req.error)));
                        void cancellation.register(() => void tx.abort());
                    }, () => void cb(new Error('Access has failed.')));
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
                    void this.listen(db => {
                        if (!this.cache.has(key))
                            return;
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        this.index ? tx.objectStore(this.name).put(this.cache.get(key)) : tx.objectStore(this.name).put(this.cache.get(key), key);
                        void tx.addEventListener('complete', () => void cb(key, tx.error));
                        void tx.addEventListener('error', () => void cb(key, tx.error));
                        void tx.addEventListener('abort', () => void cb(key, tx.error));
                    }, () => void cb(key, new Error('Access has failed.')));
                    return value;
                }
                delete(key, cb = noop_1.noop) {
                    void this.cache.delete(key);
                    void this.listen(db => {
                        const tx = this.txrw = this.txrw || db.transaction(this.name, 'readwrite');
                        void tx.objectStore(this.name).delete(key);
                        void tx.addEventListener('complete', () => void cb(tx.error));
                        void tx.addEventListener('error', () => void cb(tx.error));
                        void tx.addEventListener('abort', () => void cb(tx.error));
                    }, () => void cb(new Error('Access has failed.')));
                }
                cursor(query, index, direction, mode, cb) {
                    void this.listen(db => {
                        const tx = db.transaction(this.name, mode);
                        const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
                        void req.addEventListener('success', () => {
                            const cursor = req.result;
                            if (!cursor)
                                return;
                            void this.cache.set(cursor.primaryKey, Object.assign({}, cursor.value));
                            void cb(cursor, req.error);
                        });
                        void tx.addEventListener('complete', () => void cb(null, req.error));
                        void tx.addEventListener('error', () => void cb(null, req.error));
                        void tx.addEventListener('abort', () => void cb(null, req.error));
                    }, () => void cb(null, new Error('Access has failed.')));
                }
            }
            exports.KeyValueStore = KeyValueStore;
        },
        {
            '../../../lib/noop': 56,
            'spica/cancellation': 6,
            'spica/tick': 23
        }
    ],
    33: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const api_1 = require('../../infrastructure/webstorage/api');
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
            class AbstractChannel {
                constructor(name) {
                    this.name = name;
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Specified broadcast channel "${ name }" is already opened.`);
                    void cache.add(this.name);
                }
                close() {
                    void cache.delete(this.name);
                }
            }
            class Channel {
                constructor(name, debug) {
                    this.name = name;
                    this.debug = debug;
                    return typeof BroadcastChannel === 'function' ? new Broadcast(name, debug) : new Storage(name, debug);
                }
                listen(type, listener) {
                    type;
                    listener;
                    return () => void 0;
                }
                post(msg) {
                    msg;
                }
                close() {
                }
            }
            exports.Channel = Channel;
            class Broadcast extends AbstractChannel {
                constructor(name, debug) {
                    super(name);
                    this.name = name;
                    this.debug = debug;
                    this.channel = new BroadcastChannel(this.name);
                    this.listeners = new Set();
                    this.alive = true;
                }
                listen(type, listener) {
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
                    if (!this.alive)
                        return;
                    this.debug && console.log('send', msg);
                    void this.channel.postMessage(msg);
                }
                close() {
                    this.alive = false;
                    super.close();
                    void this.listeners.forEach(listener => void this.channel.removeEventListener('message', listener));
                    void this.listeners.clear();
                }
            }
            class Storage extends AbstractChannel {
                constructor(name, debug) {
                    super(name);
                    this.name = name;
                    this.debug = debug;
                    this.storage = api_1.localStorage;
                    this.listeners = new Set();
                    this.alive = true;
                    void self.addEventListener('unload', () => void this.storage.removeItem(this.name), true);
                }
                listen(type, listener) {
                    void this.listeners.add(handler);
                    void api_1.storageEventStream.on([
                        'local',
                        this.name
                    ], handler);
                    return () => (void this.listeners.delete(handler), void api_1.storageEventStream.off([
                        'local',
                        this.name
                    ], handler));
                    function handler(ev) {
                        if (typeof ev.newValue !== 'string')
                            return;
                        const msg = parse(JSON.parse(ev.newValue));
                        if (!msg || msg.type !== type)
                            return;
                        return void listener(msg);
                    }
                }
                post(msg) {
                    if (!this.alive)
                        return;
                    void this.storage.setItem(this.name, JSON.stringify(msg));
                }
                close() {
                    this.alive = false;
                    super.close();
                    void this.listeners.forEach(listener => void api_1.storageEventStream.off([
                        'local',
                        this.name
                    ], listener));
                    void this.listeners.clear();
                    void this.storage.removeItem(this.name);
                }
            }
        },
        { '../../infrastructure/webstorage/api': 52 }
    ],
    34: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var builder_1 = require('./module/builder');
            exports.SCHEMA = builder_1.SCHEMA;
            exports.build = builder_1.build;
            exports.isValidPropertyName = builder_1.isValidPropertyName;
            exports.isValidPropertyValue = builder_1.isValidPropertyValue;
        },
        { './module/builder': 35 }
    ],
    35: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const event_1 = require('../../../data/es/event');
            exports.isValidPropertyName = event_1.isValidPropertyName;
            exports.isValidPropertyValue = event_1.isValidPropertyValue;
            const noop_1 = require('../../../../lib/noop');
            exports.SCHEMA = {
                META: { NAME: '__meta' },
                ID: { NAME: '__id' },
                KEY: { NAME: '__key' },
                DATE: { NAME: '__date' },
                EVENT: { NAME: '__event' }
            };
            function build(source, factory, set = noop_1.noop, get = noop_1.noop) {
                const dao = factory();
                void Object.keys(exports.SCHEMA).map(prop => exports.SCHEMA[prop].NAME).reduce((_, prop) => {
                    delete dao[prop];
                }, void 0);
                if (typeof source[exports.SCHEMA.KEY.NAME] !== 'string')
                    throw new TypeError(`ClientChannel: DAO: Invalid key: ${ source[exports.SCHEMA.KEY.NAME] }`);
                const descmap = Object.assign({}, Object.keys(dao).filter(event_1.isValidPropertyName).filter(event_1.isValidPropertyValue(dao)).reduce((map, prop) => {
                    {
                        const desc = Object.getOwnPropertyDescriptor(dao, prop);
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
                }, {}), {
                    [exports.SCHEMA.META.NAME]: {
                        configurable: false,
                        enumerable: false,
                        get: () => source[exports.SCHEMA.META.NAME]
                    },
                    [exports.SCHEMA.ID.NAME]: {
                        configurable: false,
                        enumerable: false,
                        get: () => source[exports.SCHEMA.ID.NAME]
                    },
                    [exports.SCHEMA.KEY.NAME]: {
                        configurable: false,
                        enumerable: false,
                        get: () => source[exports.SCHEMA.KEY.NAME]
                    },
                    [exports.SCHEMA.DATE.NAME]: {
                        configurable: false,
                        enumerable: false,
                        get: () => source[exports.SCHEMA.DATE.NAME]
                    },
                    [exports.SCHEMA.EVENT.NAME]: {
                        configurable: false,
                        enumerable: false,
                        get: () => source[exports.SCHEMA.EVENT.NAME]
                    }
                });
                void Object.defineProperties(dao, descmap);
                void Object.seal(dao);
                return dao;
            }
            exports.build = build;
        },
        {
            '../../../../lib/noop': 56,
            '../../../data/es/event': 29
        }
    ],
    36: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var channel_1 = require('./service/channel');
            exports.StoreChannel = channel_1.StoreChannel;
        },
        { './service/channel': 41 }
    ],
    37: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            const cancellation_1 = require('spica/cancellation');
            const cache_1 = require('spica/cache');
            const api_1 = require('../../../infrastructure/indexeddb/api');
            const data_1 = require('./channel/data');
            const access_1 = require('./channel/access');
            const expiry_1 = require('./channel/expiry');
            const channel_1 = require('../../broadcast/channel');
            const channel_2 = require('../../ownership/channel');
            const noop_1 = require('../../../../lib/noop');
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
                    this.keys_ = new Set();
                    this.channel = new channel_1.Channel(this.name, this.debug);
                    this.ownership = new channel_2.Ownership(this.channel);
                    this.keys = new cache_1.Cache(this.size, (() => {
                        void this.ownership.take('store', 0);
                        const keys = this.keys_;
                        let timer = 0;
                        const resolve = () => {
                            timer = 0;
                            const since = Date.now();
                            let count = 0;
                            if (!this.ownership.take('store', 5 * 1000))
                                return;
                            for (const key of keys) {
                                if (this.cancellation.canceled)
                                    return void this.keys.clear(), void keys.clear();
                                void keys.delete(key);
                                if (timer > 0)
                                    return;
                                if (this.keys.has(key))
                                    continue;
                                if (++count > 10)
                                    return void setTimeout(resolve, (Date.now() - since) * 3);
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
                            timer = setTimeout(resolve, 3 * 1000);
                        };
                    })(), { ignore: { delete: true } });
                    this.events_ = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation(),
                        clean: new observation_1.Observation()
                    });
                    this.events = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation(),
                        loss: new observation_1.Observation()
                    });
                    this.ages = new Map();
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Specified database channel "${ name }" is already opened.`);
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
                    void this.cancellation.register(this.channel.listen('save', ({key}) => (void this.keys.delete(key) || void this.keys_.delete(key), void this.fetch(key))));
                    void this.cancellation.register(() => void this.channel.close());
                    void this.events_.save.monitor([], ({key}) => void this.channel.post(new SaveMessage(key)));
                    void this.events_.clean.monitor([], (cleared, [key]) => {
                        if (!cleared)
                            return;
                        void this.ownership.take(`key:${ key }`, 5 * 1000);
                        void this.schema.access.delete(key);
                        void this.schema.expire.delete(key);
                    });
                    if (!Number.isFinite(this.size))
                        return;
                    void this.events_.load.monitor([], ({key, type}) => type === ChannelStore.EventType.delete ? void this.keys.delete(key) || void this.keys_.delete(key) : void this.keys.put(key));
                    void this.events_.save.monitor([], ({key, type}) => type === ChannelStore.EventType.delete ? void this.keys.delete(key) || void this.keys_.delete(key) : void this.keys.put(key));
                    const limit = () => {
                        if (!Number.isFinite(size))
                            return;
                        if (this.cancellation.canceled)
                            return;
                        void this.recent(Infinity, (ks, error) => {
                            if (error)
                                return void setTimeout(limit, 10 * 1000);
                            return void ks.reverse().forEach(key => void this.keys.put(key));
                        });
                    };
                    void limit();
                }
                sync(keys, cb = noop_1.noop, timeout = Infinity) {
                    const cancellation = new cancellation_1.Cancellation();
                    if (Number.isFinite(timeout)) {
                        void setTimeout(cancellation.cancel, timeout);
                    }
                    return void Promise.all(keys.map(key => new Promise(resolve => void this.fetch(key, error => void resolve([
                        key,
                        error
                    ]), cancellation)))).then(cb);
                }
                fetch(key, cb = noop_1.noop, cancellation = new cancellation_1.Cancellation()) {
                    void this.schema.access.fetch(key);
                    return this.schema.data.fetch(key, cb, cancellation);
                }
                has(key) {
                    return this.schema.data.has(key);
                }
                meta(key) {
                    return this.schema.data.meta(key);
                }
                get(key) {
                    void this.log(key);
                    return this.schema.data.get(key);
                }
                add(record) {
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
                    if (this.cancellation.canceled)
                        return;
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
                    void this.ages.set(key, age);
                    return void this.schema.expire.set(key, age);
                }
                recent(limit, cb) {
                    return this.schema.access.recent(limit, cb);
                }
                close() {
                    void this.cancellation.cancel();
                    return void api_1.close(this.name);
                }
                destroy() {
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
                constructor(store_, ownership_, attrs_, listen_) {
                    this.store_ = store_;
                    this.ownership_ = ownership_;
                    this.attrs_ = attrs_;
                    this.listen_ = listen_;
                    this.cancellation_ = new cancellation_1.Cancellation();
                    void this.build();
                }
                build() {
                    const keys = this.data ? this.data.keys() : [];
                    this.data = new data_1.DataStore(this.attrs_, this.listen_);
                    this.access = new access_1.AccessStore(this.listen_);
                    this.expire = new expiry_1.ExpiryStore(this.store_, this.cancellation_, this.ownership_, this.listen_);
                    void this.cancellation_.register(this.store_.events_.load.relay(this.data.events.load));
                    void this.cancellation_.register(this.store_.events_.save.relay(this.data.events.save));
                    void this.cancellation_.register(this.store_.events_.clean.relay(this.data.events.clean));
                    void this.cancellation_.register(this.store_.events.load.relay(this.data.events.load));
                    void this.cancellation_.register(this.store_.events.save.relay(this.data.events.save));
                    void this.cancellation_.register(this.store_.events.loss.relay(this.data.events.loss));
                    void this.store_.sync(keys);
                }
                rebuild() {
                    void this.close();
                    void this.build();
                }
                close() {
                    void this.cancellation_.cancel();
                    this.cancellation_ = new cancellation_1.Cancellation();
                }
            }
        },
        {
            '../../../../lib/noop': 56,
            '../../../infrastructure/indexeddb/api': 46,
            '../../broadcast/channel': 33,
            '../../ownership/channel': 42,
            './channel/access': 38,
            './channel/data': 39,
            './channel/expiry': 40,
            'spica/cache': 5,
            'spica/cancellation': 6,
            'spica/observation': 20
        }
    ],
    38: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const store_1 = require('../../../../data/kvs/store');
            exports.name = 'access';
            var AccessStoreSchema;
            (function (AccessStoreSchema) {
                AccessStoreSchema['key'] = 'key';
                AccessStoreSchema['date'] = 'date';
            }(AccessStoreSchema || (AccessStoreSchema = {})));
            class AccessStore {
                constructor(listen) {
                    this.listen = listen;
                    this.store = new class extends store_1.KeyValueStore {
                    }(exports.name, 'key', this.listen);
                    void Object.freeze(this);
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
                        if (error)
                            return void cb([], error);
                        if (!cursor)
                            return void cb(keys);
                        if (--limit < 0)
                            return;
                        const {key} = cursor.value;
                        void keys.push(key);
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
            }
            exports.AccessStore = AccessStore;
            class AccessRecord {
                constructor(key) {
                    this.key = key;
                    this.date = Date.now();
                }
            }
        },
        { '../../../../data/kvs/store': 32 }
    ],
    39: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const store_1 = require('../../../../data/es/store');
            exports.name = 'data';
            class DataStore extends store_1.EventStore {
                constructor(attrs, listen) {
                    super(exports.name, attrs, listen);
                }
                static configure() {
                    return store_1.EventStore.configure(exports.name);
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
        { '../../../../data/es/store': 31 }
    ],
    40: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const store_1 = require('../../../../data/kvs/store');
            const name = 'expiry';
            var ExpiryStoreSchema;
            (function (ExpiryStoreSchema) {
                ExpiryStoreSchema['key'] = 'key';
                ExpiryStoreSchema['expiry'] = 'expiry';
            }(ExpiryStoreSchema || (ExpiryStoreSchema = {})));
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
                        let scheduled = Infinity;
                        let running = false;
                        let wait = 5 * 1000;
                        void this.ownership.take('store', 0);
                        return timeout => {
                            timeout = Math.max(timeout, 3 * 1000);
                            if (Date.now() + timeout >= scheduled)
                                return;
                            scheduled = Date.now() + timeout;
                            void clearTimeout(timer);
                            timer = setTimeout(() => {
                                if (running)
                                    return;
                                scheduled = Infinity;
                                if (!this.ownership.take('store', wait))
                                    return this.schedule(wait *= 2);
                                wait = Math.max(Math.floor(wait / 1.5), 5 * 1000);
                                const since = Date.now();
                                let retry = false;
                                running = true;
                                return void this.store.cursor(null, 'expiry', 'next', 'readonly', (cursor, error) => {
                                    running = false;
                                    if (this.cancellation.canceled)
                                        return;
                                    if (error)
                                        return void this.schedule(wait * 10);
                                    if (!cursor)
                                        return retry && void this.schedule(wait);
                                    const {key, expiry} = cursor.value;
                                    if (expiry > Date.now())
                                        return void this.schedule(expiry - Date.now());
                                    if (!this.ownership.extend('store', wait))
                                        return;
                                    if (Date.now() - since > 1000)
                                        return void this.schedule(wait / 2);
                                    running = true;
                                    if (!this.ownership.take(`key:${ key }`, wait))
                                        return retry = true, void cursor.continue();
                                    void this.chan.delete(key);
                                    return void cursor.continue();
                                });
                            }, timeout);
                        };
                    })();
                    void this.schedule(10 * 1000);
                    void Object.freeze(this);
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
                    if (age === Infinity)
                        return void this.delete(key);
                    void this.schedule(age);
                    void this.store.set(key, new ExpiryRecord(key, Date.now() + age));
                }
                delete(key) {
                    void this.store.delete(key);
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
        { '../../../../data/kvs/store': 32 }
    ],
    41: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            const throttle_1 = require('spica/throttle');
            const api_1 = require('../../dao/api');
            const channel_1 = require('../model/channel');
            const api_2 = require('../../webstorage/api');
            class StoreChannel extends channel_1.ChannelStore {
                constructor(name, Schema, {migrate = () => void 0, destroy = () => true, age = Infinity, size = Infinity, debug = false} = { Schema }) {
                    super(name, Object.keys(new Schema()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(new Schema())), destroy, age, size, debug);
                    this.Schema = Schema;
                    this.links = new Map();
                    this.sources = new Map();
                    const attrs = Object.keys(new Schema()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(new Schema()));
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
                            void changes.forEach(({attr, oldVal}) => void cast(source.__event).emit([
                                api_2.StorageChannel.EventType.recv,
                                attr
                            ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.recv, attr, memory[attr], oldVal)));
                        }
                    });
                    void Object.freeze(this);
                }
                link(key, age) {
                    void this.fetch(key);
                    void this.expire(key, age);
                    return this.links.has(key) ? this.links.get(key) : this.links.set(key, api_1.build(Object.defineProperties(this.sources.set(key, this.get(key)).get(key), {
                        __meta: { get: () => this.meta(key) },
                        __id: { get: () => this.meta(key).id },
                        __key: { get: () => this.meta(key).key },
                        __date: { get: () => this.meta(key).date },
                        __event: { value: new observation_1.Observation() }
                    }), () => new this.Schema(), (attr, newValue, oldValue) => (void this.add(new channel_1.ChannelStore.Record(key, { [attr]: newValue })), void cast(this.sources.get(key).__event).emit([
                        api_2.StorageChannel.EventType.send,
                        attr
                    ], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.send, attr, newValue, oldValue))), throttle_1.throttle(100, () => this.has(key) && void this.log(key)))).get(key);
                }
                destroy() {
                    void super.destroy();
                }
            }
            exports.StoreChannel = StoreChannel;
            function cast(o) {
                return o;
            }
        },
        {
            '../../dao/api': 34,
            '../../webstorage/api': 43,
            '../model/channel': 37,
            'spica/observation': 20,
            'spica/throttle': 22
        }
    ],
    42: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const channel_1 = require('../broadcast/channel');
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
                    void this.channel.listen('ownership', ({key, priority}) => {
                        if (this.has(key) && this.getPriority(key) < priority - Ownership.mergin) {
                            void this.castPriority(key);
                        } else {
                            void this.setPriority(key, Math.min(-priority, this.getPriority(key)));
                        }
                    });
                }
                static genPriority(age) {
                    return Date.now() + age;
                }
                getPriority(key) {
                    if (!this.store.has(key)) {
                        void this.setPriority(key, Math.max(Ownership.genPriority(0) - Ownership.mergin, 0));
                        void this.setPriority(key, -Ownership.genPriority(Ownership.mergin));
                    }
                    return this.store.get(key);
                }
                setPriority(key, priority) {
                    if (this.store.has(key) && priority === this.getPriority(key))
                        return;
                    void this.store.set(key, priority + Math.floor(Math.random() * 1 * 1000));
                    void this.castPriority(key);
                }
                castPriority(key) {
                    if (this.getPriority(key) < 0)
                        return;
                    if (!this.isTakable(key))
                        return;
                    void this.channel.post(new OwnershipMessage(key, this.getPriority(key) + Ownership.mergin));
                }
                has(key) {
                    return this.getPriority(key) >= Ownership.genPriority(0);
                }
                isTakable(key) {
                    return this.getPriority(key) > 0 || Ownership.genPriority(0) > Math.abs(this.getPriority(key));
                }
                take(key, age, wait) {
                    age = Math.min(Math.max(age, 1 * 1000), 60 * 1000) + 100;
                    wait = wait === undefined ? wait : Math.max(wait, 0);
                    if (!this.isTakable(key))
                        return false;
                    void this.setPriority(key, Math.max(Ownership.genPriority(age + (wait || 0)), this.getPriority(key)));
                    return wait === undefined ? true : new Promise(resolve => setTimeout(resolve, wait)).then(() => this.extend(key, age) ? Promise.resolve() : Promise.reject());
                }
                extend(key, age) {
                    return this.has(key) ? this.take(key, age) : false;
                }
                close() {
                    void this.channel.close();
                }
            }
            Ownership.mergin = 5 * 1000;
            exports.Ownership = Ownership;
        },
        { '../broadcast/channel': 33 }
    ],
    43: [
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
            '../../infrastructure/webstorage/api': 52,
            './service/channel': 45
        }
    ],
    44: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
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
    45: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            const cancellation_1 = require('spica/cancellation');
            const api_1 = require('../../dao/api');
            const api_2 = require('../../../infrastructure/webstorage/api');
            const storage_1 = require('../model/storage');
            const cache = new Set();
            class StorageChannel {
                constructor(name, storage = api_2.sessionStorage || storage_1.fakeStorage, Schema, migrate = () => void 0) {
                    this.name = name;
                    this.storage = storage;
                    this.cancellation = new cancellation_1.Cancellation();
                    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
                    this.events = Object.freeze({
                        send: new observation_1.Observation(),
                        recv: new observation_1.Observation()
                    });
                    if (cache.has(name))
                        throw new Error(`ClientChannel: Specified storage channel "${ name }" is already opened.`);
                    void cache.add(name);
                    void this.cancellation.register(() => void cache.delete(name));
                    const source = Object.assign({
                        [api_1.SCHEMA.KEY.NAME]: this.name,
                        [api_1.SCHEMA.EVENT.NAME]: new observation_1.Observation()
                    }, parse(this.storage.getItem(this.name)));
                    this.link_ = api_1.build(source, () => new Schema(), (attr, newValue, oldValue) => {
                        void this.storage.setItem(this.name, JSON.stringify(Object.keys(source).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(source)).reduce((acc, attr) => {
                            acc[attr] = source[attr];
                            return acc;
                        }, {})));
                        const event = new StorageChannel.Event(StorageChannel.EventType.send, attr, newValue, oldValue);
                        void source.__event.emit([
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
                        void Object.keys(item).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(item)).reduce((_, attr) => {
                            const oldVal = source[attr];
                            const newVal = item[attr];
                            if ([newVal].includes(oldVal))
                                return;
                            source[attr] = newVal;
                            void migrate(this.link_);
                            const event = new StorageChannel.Event(StorageChannel.EventType.recv, attr, source[attr], oldVal);
                            void source.__event.emit([
                                event.type,
                                event.attr
                            ], event);
                            void this.events.recv.emit([event.attr], event);
                        }, void 0);
                    }));
                    void Object.freeze(this);
                }
                link() {
                    return this.link_;
                }
                close() {
                    void this.cancellation.cancel();
                }
                destroy() {
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
                        void Object.freeze(this);
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
            '../../../infrastructure/webstorage/api': 52,
            '../../dao/api': 34,
            '../model/storage': 44,
            'spica/cancellation': 6,
            'spica/observation': 20
        }
    ],
    46: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var global_1 = require('./module/global');
            exports.indexedDB = global_1.indexedDB;
            exports.IDBKeyRange = global_1.IDBKeyRange;
            var access_1 = require('./model/access');
            exports.open = access_1.open;
            exports.listen_ = access_1.listen_;
            exports.close = access_1.close;
            exports.destroy = access_1.destroy;
            var event_1 = require('./model/event');
            exports.idbEventStream = event_1.idbEventStream;
            exports.IDBEvent = event_1.IDBEvent;
            exports.IDBEventType = event_1.IDBEventType;
        },
        {
            './model/access': 47,
            './model/event': 48,
            './module/global': 51
        }
    ],
    47: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const state_1 = require('./state');
            const transition_1 = require('./transition');
            const event_1 = require('./event');
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
                if (state_1.states.has(database)) {
                    return void request(database, () => void 0);
                } else {
                    return void transition_1.handle(database);
                }
            }
            function request(database, success, failure = () => void 0) {
                if (!state_1.requests.has(database))
                    return void failure();
                void state_1.requests.get(database).enqueue(success, failure);
                void transition_1.handle(database);
            }
        },
        {
            './event': 48,
            './state': 49,
            './transition': 50
        }
    ],
    48: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            exports.idbEventStream_ = new observation_1.Observation();
            exports.idbEventStream = exports.idbEventStream_;
            var IDBEventType;
            (function (IDBEventType) {
                IDBEventType['connect'] = 'connect';
                IDBEventType['disconnect'] = 'disconnect';
                IDBEventType['block'] = 'block';
                IDBEventType['error'] = 'error';
                IDBEventType['abort'] = 'abort';
                IDBEventType['crash'] = 'crash';
                IDBEventType['destroy'] = 'destroy';
            }(IDBEventType = exports.IDBEventType || (exports.IDBEventType = {})));
            class IDBEvent {
                constructor(name, type) {
                    this.name = name;
                    this.type = type;
                    void Object.freeze(this);
                }
            }
            exports.IDBEvent = IDBEvent;
        },
        { 'spica/observation': 20 }
    ],
    49: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.commands = new Map();
            var Command;
            (function (Command) {
                Command['open'] = 'open';
                Command['close'] = 'close';
                Command['destroy'] = 'destroy';
            }(Command = exports.Command || (exports.Command = {})));
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
                        return void failure();
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
                    try {
                        while (this.queue.length > 0) {
                            void this.queue.shift().failure();
                        }
                    } catch (_a) {
                        return this.clear();
                    }
                }
            }
            exports.states = new Map();
            class State {
                constructor(database, curr) {
                    this.database = database;
                    this.alive = true;
                    switch (true) {
                    case this instanceof InitialState:
                        this.alive = !curr;
                        if (!this.alive)
                            return;
                        void exports.requests.set(database, exports.requests.get(database) || new RequestQueue(database));
                        break;
                    default:
                        this.alive = !!curr && curr.alive;
                        if (!this.alive)
                            return;
                    }
                    void exports.states.set(database, this);
                    if (curr) {
                        curr.alive = false;
                    }
                }
                get command() {
                    return exports.commands.get(this.database) || 'close';
                }
                get config() {
                    return exports.configs.get(this.database) || {
                        make() {
                            return false;
                        },
                        verify() {
                            return false;
                        },
                        destroy() {
                            return false;
                        }
                    };
                }
                get queue() {
                    return exports.requests.get(this.database) || new RequestQueue(this.database);
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
                }
            }
            exports.SuccessState = SuccessState;
            class ErrorState extends State {
                constructor(state, error, event) {
                    super(state.database, state);
                    this.error = error;
                    this.event = event;
                    this.STATE;
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
                    if (!this.alive)
                        return;
                    switch (this.command) {
                    case 'close':
                    case 'destroy':
                        if (exports.requests.has(this.database)) {
                            void exports.requests.get(this.database).clear();
                        }
                        void exports.commands.delete(this.database);
                        void exports.configs.delete(this.database);
                        void exports.requests.delete(this.database);
                    }
                    this.alive = false;
                    void exports.states.delete(this.database);
                }
            }
            exports.EndState = EndState;
        },
        {}
    ],
    50: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const global_1 = require('../module/global');
            const state_1 = require('./state');
            const event_1 = require('./event');
            function handle(database) {
                const state = state_1.states.get(database);
                return state instanceof state_1.SuccessState ? void handleFromSuccessState(state) : void handleFromInitialState(new state_1.InitialState(database));
            }
            exports.handle = handle;
            function handleFromInitialState(state) {
                if (!state.alive)
                    return;
                const {database, version} = state;
                try {
                    const openRequest = version ? global_1.indexedDB.open(database, version) : global_1.indexedDB.open(database);
                    openRequest.onblocked = () => void handleFromBlockedState(new state_1.BlockState(state, openRequest));
                    openRequest.onupgradeneeded = () => void handleFromUpgradeState(new state_1.UpgradeState(state, openRequest));
                    openRequest.onsuccess = () => void handleFromSuccessState(new state_1.SuccessState(state, openRequest.result));
                    openRequest.onerror = event => void handleFromErrorState(new state_1.ErrorState(state, openRequest.error, event));
                } catch (reason) {
                    void handleFromCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleFromBlockedState(state) {
                if (!state.alive)
                    return;
                const {database, session} = state;
                session.onblocked = () => void handleFromBlockedState(new state_1.BlockState(state, session));
                session.onupgradeneeded = () => void handleFromUpgradeState(new state_1.UpgradeState(state, session));
                session.onsuccess = () => void handleFromSuccessState(new state_1.SuccessState(state, session.result));
                session.onerror = event => void handleFromErrorState(new state_1.ErrorState(state, session.error, event));
                void event_1.idbEventStream_.emit([
                    database,
                    'block'
                ], new event_1.IDBEvent(database, 'block'));
            }
            function handleFromUpgradeState(state) {
                if (!state.alive)
                    return;
                const {session} = state;
                const db = session.transaction.db;
                const {make, destroy} = state.config;
                try {
                    if (make(session.transaction)) {
                        session.onsuccess = () => void handleFromSuccessState(new state_1.SuccessState(state, db));
                        session.onerror = event => void handleFromErrorState(new state_1.ErrorState(state, session.error, event));
                    } else {
                        session.onsuccess = session.onerror = event => (void db.close(), destroy(session.error, event) ? void handleFromDestroyState(new state_1.DestroyState(state)) : void handleFromEndState(new state_1.EndState(state)));
                    }
                } catch (reason) {
                    void handleFromCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleFromSuccessState(state) {
                if (!state.alive)
                    return;
                const {database, connection, queue} = state;
                connection.onversionchange = () => {
                    const curr = new state_1.EndState(state);
                    void connection.close();
                    void event_1.idbEventStream_.emit([
                        database,
                        'destroy'
                    ], new event_1.IDBEvent(database, 'destroy'));
                    void handleFromEndState(curr);
                };
                connection.onerror = event => void handleFromErrorState(new state_1.ErrorState(state, event.target.error, event));
                connection.onabort = event => void handleFromAbortState(new state_1.AbortState(state, event));
                connection.onclose = () => void handleFromEndState(new state_1.EndState(state));
                switch (state.command) {
                case 'open': {
                        const {verify} = state.config;
                        VERIFY: {
                            try {
                                if (verify(connection))
                                    break VERIFY;
                                void connection.close();
                                return void handleFromEndState(new state_1.EndState(state, connection.version + 1));
                            } catch (reason) {
                                void connection.close();
                                return void handleFromCrashState(new state_1.CrashState(state, reason));
                            }
                        }
                        void event_1.idbEventStream_.emit([
                            database,
                            'connect'
                        ], new event_1.IDBEvent(database, 'connect'));
                        try {
                            while (queue.size > 0 && state.alive) {
                                void queue.dequeue().success(connection);
                            }
                            return;
                        } catch (reason) {
                            void new Promise((_, reject) => void reject(reason));
                            const curr = new state_1.CrashState(state, reason);
                            void connection.close();
                            return void handleFromCrashState(curr);
                        }
                    }
                case 'close': {
                        const curr = new state_1.EndState(state);
                        void connection.close();
                        return void handleFromEndState(curr);
                    }
                case 'destroy': {
                        const curr = new state_1.DestroyState(state);
                        void connection.close();
                        return void handleFromDestroyState(curr);
                    }
                }
            }
            function handleFromErrorState(state) {
                if (!state.alive)
                    return;
                const {database, error, event} = state;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    'error'
                ], new event_1.IDBEvent(database, 'error'));
                const {destroy} = state.config;
                if (destroy(error, event)) {
                    return void handleFromDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleFromEndState(new state_1.EndState(state));
                }
            }
            function handleFromAbortState(state) {
                if (!state.alive)
                    return;
                const {database, event} = state;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    'abort'
                ], new event_1.IDBEvent(database, 'abort'));
                return void handleFromEndState(new state_1.EndState(state));
            }
            function handleFromCrashState(state) {
                if (!state.alive)
                    return;
                const {database, reason} = state;
                void event_1.idbEventStream_.emit([
                    database,
                    'crash'
                ], new event_1.IDBEvent(database, 'crash'));
                const {destroy} = state.config;
                if (destroy(reason)) {
                    return void handleFromDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleFromEndState(new state_1.EndState(state));
                }
            }
            function handleFromDestroyState(state) {
                if (!state.alive)
                    return;
                const {database} = state;
                const deleteRequest = global_1.indexedDB.deleteDatabase(database);
                deleteRequest.onsuccess = () => (void event_1.idbEventStream_.emit([
                    database,
                    'destroy'
                ], new event_1.IDBEvent(database, 'destroy')), void handleFromEndState(new state_1.EndState(state)));
                deleteRequest.onerror = event => void handleFromErrorState(new state_1.ErrorState(state, deleteRequest.error, event));
            }
            function handleFromEndState(state) {
                if (!state.alive)
                    return;
                const {database, version, command} = state;
                void state.complete();
                void event_1.idbEventStream_.emit([
                    database,
                    'disconnect'
                ], new event_1.IDBEvent(database, 'disconnect'));
                switch (state_1.commands.get(database) || command) {
                case 'open':
                    return void handleFromInitialState(new state_1.InitialState(database, version));
                case 'close':
                case 'destroy':
                    return;
                }
            }
        },
        {
            '../module/global': 51,
            './event': 48,
            './state': 49
        }
    ],
    51: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.indexedDB = self.indexedDB;
            exports.IDBKeyRange = self.IDBKeyRange;
        },
        {}
    ],
    52: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var global_1 = require('./module/global');
            exports.localStorage = global_1.localStorage;
            exports.sessionStorage = global_1.sessionStorage;
            var event_1 = require('./model/event');
            exports.storageEventStream = event_1.storageEventStream;
            exports.storageEventStream_ = event_1.storageEventStream_;
        },
        {
            './model/event': 53,
            './module/global': 54
        }
    ],
    53: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const observation_1 = require('spica/observation');
            const global_1 = require('../module/global');
            exports.storageEventStream_ = new observation_1.Observation();
            exports.storageEventStream = exports.storageEventStream_;
            void self.addEventListener('storage', event => {
                switch (event.storageArea) {
                case global_1.localStorage:
                    return void exports.storageEventStream_.emit(typeof event.key === 'string' ? [
                        'local',
                        event.key
                    ] : ['local'], event);
                case global_1.sessionStorage:
                    return void exports.storageEventStream_.emit(typeof event.key === 'string' ? [
                        'session',
                        event.key
                    ] : ['session'], event);
                default:
                    return;
                }
            });
        },
        {
            '../module/global': 54,
            'spica/observation': 20
        }
    ],
    54: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            const uuid_1 = require('spica/uuid');
            const supportsWebStorage = (() => {
                try {
                    if (!self.navigator.cookieEnabled)
                        throw void 0;
                    const key = 'clientchannel#' + uuid_1.uuid();
                    void self.sessionStorage.setItem(key, key);
                    if (key !== self.sessionStorage.getItem(key))
                        throw void 0;
                    void self.sessionStorage.removeItem(key);
                    return true;
                } catch (_a) {
                    return false;
                }
            })();
            exports.localStorage = supportsWebStorage ? self.localStorage : void 0;
            exports.sessionStorage = supportsWebStorage ? self.sessionStorage : void 0;
        },
        { 'spica/uuid': 25 }
    ],
    55: [
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
        { '../application/api': 27 }
    ],
    56: [
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
        { './src/export': 26 }
    ]
}, {}, [
    1,
    2,
    3,
    'clientchannel'
]);