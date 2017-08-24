/*! clientchannel v0.19.1 https://github.com/falsandtru/clientchannel | (c) 2017, falsandtru | (Apache-2.0 AND MPL-2.0) License */
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
            Object.defineProperty(exports, '__esModule', { value: true });
            var type_1 = require('./type');
            exports.assign = template(function (key, target, source) {
                return target[key] = source[key];
            });
            exports.clone = template(function (key, target, source) {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.clone([], source[key]);
                case 'Object':
                    return target[key] = exports.clone({}, source[key]);
                default:
                    return target[key] = source[key];
                }
            });
            exports.extend = template(function (key, target, source) {
                switch (type_1.type(source[key])) {
                case 'Array':
                    return target[key] = exports.extend([], source[key]);
                case 'Object':
                    switch (type_1.type(target[key])) {
                    case 'Function':
                    case 'Object':
                        return target[key] = exports.extend(target[key], source[key]);
                    default:
                        return target[key] = exports.extend({}, source[key]);
                    }
                default:
                    return target[key] = source[key];
                }
            });
            function template(strategy) {
                return walk;
                function walk(target) {
                    var sources = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        sources[_i - 1] = arguments[_i];
                    }
                    if (target === undefined || target === null) {
                        throw new TypeError('Spica: assign: Cannot walk on ' + target + '.');
                    }
                    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
                        var source = sources_1[_a];
                        if (source === undefined || source === null) {
                            continue;
                        }
                        for (var _b = 0, _c = Object.keys(Object(source)); _b < _c.length; _b++) {
                            var key = _c[_b];
                            var desc = Object.getOwnPropertyDescriptor(Object(source), key);
                            if (desc !== undefined && desc.enumerable) {
                                void strategy(key, Object(target), Object(source));
                            }
                        }
                    }
                    return Object(target);
                }
            }
        },
        { './type': 22 }
    ],
    4: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var equal_1 = require('./equal');
            var Cache = function () {
                function Cache(size, callback, _a) {
                    if (callback === void 0) {
                        callback = function () {
                            return void 0;
                        };
                    }
                    var _b = _a === void 0 ? {} : _a, _c = _b.stats, stats = _c === void 0 ? [
                            [],
                            []
                        ] : _c, _d = _b.entries, entries = _d === void 0 ? [] : _d;
                    var _this = this;
                    this.size = size;
                    this.callback = callback;
                    if (size > 0 === false)
                        throw new Error('Spica: Cache: Cache size must be greater than 0.');
                    var LFU = stats[1].slice(0, size);
                    var LRU = stats[0].slice(0, size - LFU.length);
                    this.stats = {
                        LRU: LRU,
                        LFU: LFU
                    };
                    this.store = new Map(entries.slice(0, size));
                    if (this.store.size !== LFU.length + LRU.length)
                        throw new Error('Spica: Cache: Size of stats and entries is not matched.');
                    if (!LFU.concat(LRU).every(function (k) {
                            return _this.store.has(k);
                        }))
                        throw new Error('Spica: Cache: Keys of stats and entries is not matched.');
                }
                Cache.prototype.put = function (key, value, log) {
                    if (log === void 0) {
                        log = true;
                    }
                    if (!log && this.store.has(key))
                        return void this.store.set(key, value), true;
                    if (this.access(key))
                        return void this.store.set(key, value), true;
                    var _a = this.stats, LRU = _a.LRU, LFU = _a.LFU;
                    if (LRU.length + LFU.length === this.size && LRU.length < LFU.length) {
                        var key_1 = LFU.pop();
                        var val = this.store.get(key_1);
                        void this.store.delete(key_1);
                        void this.callback(key_1, val);
                    }
                    void LRU.unshift(key);
                    void this.store.set(key, value);
                    if (LRU.length + LFU.length > this.size) {
                        var key_2 = LRU.pop();
                        var val = this.store.get(key_2);
                        void this.store.delete(key_2);
                        void this.callback(key_2, val);
                    }
                    return false;
                };
                Cache.prototype.set = function (key, value, log) {
                    void this.put(key, value, log);
                    return value;
                };
                Cache.prototype.get = function (key) {
                    void this.access(key);
                    return this.store.get(key);
                };
                Cache.prototype.has = function (key) {
                    return this.store.has(key);
                };
                Cache.prototype.delete = function (key) {
                    if (!this.store.has(key))
                        return false;
                    var _a = this.stats, LRU = _a.LRU, LFU = _a.LFU;
                    for (var _i = 0, _b = [
                                LFU,
                                LRU
                            ]; _i < _b.length; _i++) {
                        var log = _b[_i];
                        var index = equal_1.findIndex(key, log);
                        if (index === -1)
                            continue;
                        var val = this.store.get(key);
                        void this.store.delete(log.splice(index, 1)[0]);
                        void this.callback(key, val);
                        return true;
                    }
                    return false;
                };
                Cache.prototype.clear = function () {
                    var _this = this;
                    var entries = Array.from(this);
                    this.store = new Map();
                    this.stats = {
                        LRU: [],
                        LFU: []
                    };
                    return void entries.forEach(function (_a) {
                        var key = _a[0], val = _a[1];
                        return void _this.callback(key, val);
                    });
                };
                Cache.prototype[Symbol.iterator] = function () {
                    return this.store[Symbol.iterator]();
                };
                Cache.prototype.export = function () {
                    return {
                        stats: [
                            this.stats.LRU.slice(),
                            this.stats.LFU.slice()
                        ],
                        entries: Array.from(this)
                    };
                };
                Cache.prototype.inspect = function () {
                    var _a = this.stats, LRU = _a.LRU, LFU = _a.LFU;
                    return [
                        LRU.slice(),
                        LFU.slice()
                    ];
                };
                Cache.prototype.access = function (key) {
                    return this.accessLFU(key) || this.accessLRU(key);
                };
                Cache.prototype.accessLRU = function (key) {
                    if (!this.store.has(key))
                        return false;
                    var LRU = this.stats.LRU;
                    var index = equal_1.findIndex(key, LRU);
                    if (index === -1)
                        return false;
                    var LFU = this.stats.LFU;
                    void LFU.unshift.apply(LFU, LRU.splice(index, 1));
                    return true;
                };
                Cache.prototype.accessLFU = function (key) {
                    if (!this.store.has(key))
                        return false;
                    var LFU = this.stats.LFU;
                    var index = equal_1.findIndex(key, LFU);
                    if (index === -1)
                        return false;
                    void LFU.unshift.apply(LFU, LFU.splice(index, 1));
                    return true;
                };
                return Cache;
            }();
            exports.Cache = Cache;
        },
        { './equal': 8 }
    ],
    5: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var exception_1 = require('./exception');
            var maybe_1 = require('./monad/maybe');
            var either_1 = require('./monad/either');
            var Cancellation = function () {
                function Cancellation(cancelees) {
                    if (cancelees === void 0) {
                        cancelees = [];
                    }
                    var _this = this;
                    this.done = false;
                    this.listeners = new Set();
                    this.register = function (listener) {
                        if (_this.canceled)
                            return void handler(_this.reason), function () {
                                return void 0;
                            };
                        if (_this.done)
                            return function () {
                                return void 0;
                            };
                        void _this.listeners.add(handler);
                        return function () {
                            return _this.done ? void 0 : void _this.listeners.delete(handler);
                        };
                        function handler(reason) {
                            try {
                                void listener(reason);
                            } catch (reason) {
                                void exception_1.causeAsyncException(reason);
                            }
                        }
                    };
                    this.cancel = function (reason) {
                        if (_this.done)
                            return;
                        _this.done = true;
                        _this.canceled = true;
                        _this.reason = reason;
                        void Object.freeze(_this.listeners);
                        void Object.freeze(_this);
                        void _this.listeners.forEach(function (cb) {
                            return void cb(reason);
                        });
                    };
                    this.close = function () {
                        if (_this.done)
                            return;
                        _this.done = true;
                        void Object.freeze(_this.listeners);
                        void Object.freeze(_this);
                    };
                    this.canceled = false;
                    this.promise = function (val) {
                        return _this.canceled ? new Promise(function (_, reject) {
                            return void reject(_this.reason);
                        }) : Promise.resolve(val);
                    };
                    this.maybe = function (val) {
                        return _this.canceled ? maybe_1.Nothing : maybe_1.Just(val);
                    };
                    this.either = function (val) {
                        return _this.canceled ? either_1.Left(_this.reason) : either_1.Right(val);
                    };
                    void Array.from(cancelees).forEach(function (cancellee) {
                        return void cancellee.register(_this.cancel);
                    });
                }
                return Cancellation;
            }();
            exports.Cancellation = Cancellation;
        },
        {
            './exception': 9,
            './monad/either': 12,
            './monad/maybe': 16
        }
    ],
    6: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function concat(target, source) {
                for (var i = 0, len = source.length, offset = target.length; i < len; ++i) {
                    target[i + offset] = source[i];
                }
                return target;
            }
            exports.concat = concat;
        },
        {}
    ],
    7: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.curry = function (f, ctx) {
                return f.length === 0 ? function () {
                    return f.call(ctx);
                } : curry_(f, [], ctx);
            };
            function curry_(f, xs, ctx) {
                return f.length <= xs.length ? f.apply(ctx, xs.slice(0, f.length)) : function () {
                    var ys = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ys[_i] = arguments[_i];
                    }
                    return curry_(f, xs.concat(ys), ctx);
                };
            }
        },
        {}
    ],
    8: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function findIndex(a1, as) {
                var isNaN = a1 !== a1;
                for (var i = 0; i < as.length; ++i) {
                    var a2 = as[i];
                    if (isNaN ? a2 !== a2 : a2 === a1)
                        return i;
                }
                return -1;
            }
            exports.findIndex = findIndex;
        },
        {}
    ],
    9: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function causeAsyncException(reason) {
                void new Promise(function (_, reject) {
                    return void reject(reason);
                });
            }
            exports.causeAsyncException = causeAsyncException;
            function stringify(target) {
                try {
                    return target instanceof Error && typeof target.stack === 'string' ? target.stack : target !== void 0 && target !== null && typeof target.toString === 'function' ? target + '' : Object.prototype.toString.call(target);
                } catch (reason) {
                    return stringify(reason);
                }
            }
        },
        {}
    ],
    10: [
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
            var functor_1 = require('./functor');
            var curry_1 = require('../curry');
            var Applicative = function (_super) {
                __extends(Applicative, _super);
                function Applicative() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return Applicative;
            }(functor_1.Functor);
            exports.Applicative = Applicative;
            (function (Applicative) {
                function ap(af, aa) {
                    return aa ? af.bind(function (f) {
                        return aa.fmap(function (a) {
                            return f.length === 0 ? f(a) : curry_1.curry(f)(a);
                        });
                    }) : function (aa) {
                        return ap(af, aa);
                    };
                }
                Applicative.ap = ap;
            }(Applicative = exports.Applicative || (exports.Applicative = {})));
            exports.Applicative = Applicative;
        },
        {
            '../curry': 7,
            './functor': 13
        }
    ],
    11: [
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
            var monad_1 = require('./monad');
            var Either = function (_super) {
                __extends(Either, _super);
                function Either(thunk) {
                    var _this = _super.call(this, thunk) || this;
                    void _this.EITHER;
                    return _this;
                }
                Either.prototype.fmap = function (f) {
                    return this.bind(function (b) {
                        return new Right(f(b));
                    });
                };
                Either.prototype.ap = function (b) {
                    return Either.ap(this, b);
                };
                Either.prototype.bind = function (f) {
                    var _this = this;
                    return new Either(function () {
                        var m = _this.evaluate();
                        if (m instanceof Left) {
                            return m;
                        }
                        if (m instanceof Right) {
                            return f(m.extract());
                        }
                        if (m instanceof Either) {
                            return m.bind(f);
                        }
                        throw new TypeError('Spica: Either: Invalid monad value.\n\t' + m);
                    });
                };
                Either.prototype.extract = function (left, right) {
                    return !right ? this.evaluate().extract(left) : this.fmap(right).extract(left);
                };
                return Either;
            }(monad_1.Monad);
            exports.Either = Either;
            (function (Either) {
                function pure(b) {
                    return new Right(b);
                }
                Either.pure = pure;
                Either.Return = pure;
            }(Either = exports.Either || (exports.Either = {})));
            exports.Either = Either;
            var Left = function (_super) {
                __extends(Left, _super);
                function Left(a) {
                    var _this = _super.call(this, throwCallError) || this;
                    _this.a = a;
                    void _this.LEFT;
                    return _this;
                }
                Left.prototype.bind = function (_) {
                    return this;
                };
                Left.prototype.extract = function (left) {
                    if (!left)
                        throw this.a;
                    return left(this.a);
                };
                return Left;
            }(Either);
            exports.Left = Left;
            var Right = function (_super) {
                __extends(Right, _super);
                function Right(b) {
                    var _this = _super.call(this, throwCallError) || this;
                    _this.b = b;
                    void _this.RIGHT;
                    return _this;
                }
                Right.prototype.bind = function (f) {
                    var _this = this;
                    return new Either(function () {
                        return f(_this.extract());
                    });
                };
                Right.prototype.extract = function (_, right) {
                    return !right ? this.b : right(this.b);
                };
                return Right;
            }(Either);
            exports.Right = Right;
            function throwCallError() {
                throw new Error('Spica: Either: Invalid thunk call.');
            }
        },
        { './monad': 17 }
    ],
    12: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var Monad = require('./either.impl');
            var Either;
            (function (Either) {
                Either.fmap = Monad.Either.fmap;
                Either.pure = Monad.Either.pure;
                Either.ap = Monad.Either.ap;
                Either.Return = Monad.Either.Return;
                Either.bind = Monad.Either.bind;
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
        { './either.impl': 11 }
    ],
    13: [
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
            var lazy_1 = require('./lazy');
            var Functor = function (_super) {
                __extends(Functor, _super);
                function Functor() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return Functor;
            }(lazy_1.Lazy);
            exports.Functor = Functor;
            (function (Functor) {
                function fmap(m, f) {
                    return f ? m.fmap(f) : function (f) {
                        return m.fmap(f);
                    };
                }
                Functor.fmap = fmap;
            }(Functor = exports.Functor || (exports.Functor = {})));
            exports.Functor = Functor;
        },
        { './lazy': 14 }
    ],
    14: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var Lazy = function () {
                function Lazy(thunk) {
                    this.thunk = thunk;
                }
                Lazy.prototype.evaluate = function () {
                    return this.memory_ = this.memory_ || this.thunk();
                };
                return Lazy;
            }();
            exports.Lazy = Lazy;
        },
        {}
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
            var monadplus_1 = require('./monadplus');
            var Maybe = function (_super) {
                __extends(Maybe, _super);
                function Maybe(thunk) {
                    var _this = _super.call(this, thunk) || this;
                    void _this.MAYBE;
                    return _this;
                }
                Maybe.prototype.fmap = function (f) {
                    return this.bind(function (a) {
                        return new Just(f(a));
                    });
                };
                Maybe.prototype.ap = function (a) {
                    return Maybe.ap(this, a);
                };
                Maybe.prototype.bind = function (f) {
                    var _this = this;
                    return new Maybe(function () {
                        var m = _this.evaluate();
                        if (m instanceof Just) {
                            return f(m.extract());
                        }
                        if (m instanceof Nothing) {
                            return m;
                        }
                        if (m instanceof Maybe) {
                            return m.bind(f);
                        }
                        throw new TypeError('Spica: Maybe: Invalid monad value.\n\t' + m);
                    });
                };
                Maybe.prototype.extract = function (nothing, just) {
                    return !just ? this.evaluate().extract(nothing) : this.fmap(just).extract(nothing);
                };
                return Maybe;
            }(monadplus_1.MonadPlus);
            exports.Maybe = Maybe;
            (function (Maybe) {
                function pure(a) {
                    return new Just(a);
                }
                Maybe.pure = pure;
                Maybe.Return = pure;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            exports.Maybe = Maybe;
            var Just = function (_super) {
                __extends(Just, _super);
                function Just(a) {
                    var _this = _super.call(this, throwCallError) || this;
                    _this.a = a;
                    void _this.JUST;
                    return _this;
                }
                Just.prototype.bind = function (f) {
                    var _this = this;
                    return new Maybe(function () {
                        return f(_this.extract());
                    });
                };
                Just.prototype.extract = function (_, just) {
                    return !just ? this.a : just(this.a);
                };
                return Just;
            }(Maybe);
            exports.Just = Just;
            var Nothing = function (_super) {
                __extends(Nothing, _super);
                function Nothing() {
                    var _this = _super.call(this, throwCallError) || this;
                    void _this.NOTHING;
                    return _this;
                }
                Nothing.prototype.bind = function (_) {
                    return this;
                };
                Nothing.prototype.extract = function (nothing) {
                    if (!nothing)
                        throw void 0;
                    return nothing();
                };
                return Nothing;
            }(Maybe);
            exports.Nothing = Nothing;
            (function (Maybe) {
                Maybe.mzero = new Nothing();
                function mplus(ml, mr) {
                    return new Maybe(function () {
                        return ml.fmap(function () {
                            return ml;
                        }).extract(function () {
                            return mr;
                        });
                    });
                }
                Maybe.mplus = mplus;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            exports.Maybe = Maybe;
            function throwCallError() {
                throw new Error('Spica: Maybe: Invalid thunk call.');
            }
        },
        { './monadplus': 18 }
    ],
    16: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var Monad = require('./maybe.impl');
            var Maybe;
            (function (Maybe) {
                Maybe.fmap = Monad.Maybe.fmap;
                Maybe.pure = Monad.Maybe.pure;
                Maybe.ap = Monad.Maybe.ap;
                Maybe.Return = Monad.Maybe.Return;
                Maybe.bind = Monad.Maybe.bind;
                Maybe.mzero = Monad.Maybe.mzero;
                Maybe.mplus = Monad.Maybe.mplus;
            }(Maybe = exports.Maybe || (exports.Maybe = {})));
            function Just(a) {
                return new Monad.Just(a);
            }
            exports.Just = Just;
            exports.Nothing = Monad.Maybe.mzero;
        },
        { './maybe.impl': 15 }
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
            var applicative_1 = require('./applicative');
            var Monad = function (_super) {
                __extends(Monad, _super);
                function Monad() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return Monad;
            }(applicative_1.Applicative);
            exports.Monad = Monad;
            (function (Monad) {
                function bind(m, f) {
                    return f ? m.bind(f) : function (f) {
                        return bind(m, f);
                    };
                }
                Monad.bind = bind;
            }(Monad = exports.Monad || (exports.Monad = {})));
            exports.Monad = Monad;
        },
        { './applicative': 10 }
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
            var monad_1 = require('./monad');
            var MonadPlus = function (_super) {
                __extends(MonadPlus, _super);
                function MonadPlus() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return MonadPlus;
            }(monad_1.Monad);
            exports.MonadPlus = MonadPlus;
            (function (MonadPlus) {
            }(MonadPlus = exports.MonadPlus || (exports.MonadPlus = {})));
            exports.MonadPlus = MonadPlus;
        },
        { './monad': 17 }
    ],
    19: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var concat_1 = require('./concat');
            var equal_1 = require('./equal');
            var exception_1 = require('./exception');
            var RegisterItemType;
            (function (RegisterItemType) {
                RegisterItemType.monitor = 'monitor';
                RegisterItemType.subscriber = 'subscriber';
            }(RegisterItemType = exports.RegisterItemType || (exports.RegisterItemType = {})));
            var Observation = function () {
                function Observation() {
                    this.relaySources = new WeakSet();
                    this.node_ = {
                        parent: void 0,
                        children: new Map(),
                        childrenNames: [],
                        items: []
                    };
                }
                Observation.prototype.monitor = function (namespace, listener, _a) {
                    var _this = this;
                    var _b = (_a === void 0 ? {} : _a).once, once = _b === void 0 ? false : _b;
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    var items = this.seekNode_(namespace).items;
                    if (isRegistered(items, RegisterItemType.monitor, namespace, listener))
                        return function () {
                            return void 0;
                        };
                    void items.push({
                        type: RegisterItemType.monitor,
                        namespace: namespace,
                        listener: listener,
                        options: { once: once }
                    });
                    return function () {
                        return _this.off(namespace, listener, RegisterItemType.monitor);
                    };
                };
                Observation.prototype.on = function (namespace, listener, _a) {
                    var _this = this;
                    var _b = (_a === void 0 ? {} : _a).once, once = _b === void 0 ? false : _b;
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    var items = this.seekNode_(namespace).items;
                    if (isRegistered(items, RegisterItemType.subscriber, namespace, listener))
                        return function () {
                            return void 0;
                        };
                    void items.push({
                        type: RegisterItemType.subscriber,
                        namespace: namespace,
                        listener: listener,
                        options: { once: once }
                    });
                    return function () {
                        return _this.off(namespace, listener);
                    };
                };
                Observation.prototype.once = function (namespace, listener) {
                    void throwTypeErrorIfInvalidListener(listener, namespace);
                    return this.on(namespace, listener, { once: true });
                };
                Observation.prototype.off = function (namespace, listener, type) {
                    var _this = this;
                    if (type === void 0) {
                        type = RegisterItemType.subscriber;
                    }
                    switch (typeof listener) {
                    case 'function':
                        return void this.seekNode_(namespace).items.some(function (_a, i, items) {
                            var type_ = _a.type, listener_ = _a.listener;
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
                            var node_1 = this.seekNode_(namespace);
                            void node_1.childrenNames.slice().forEach(function (name) {
                                void _this.off(namespace.concat([name]));
                                var child = node_1.children.get(name);
                                if (!child)
                                    return;
                                if (child.items.length + child.childrenNames.length > 0)
                                    return;
                                void node_1.children.delete(name);
                                void node_1.childrenNames.splice(equal_1.findIndex(name, node_1.childrenNames), 1);
                            });
                            node_1.items = node_1.items.filter(function (_a) {
                                var type = _a.type;
                                return type === RegisterItemType.monitor;
                            });
                            return;
                        }
                    default:
                        throw throwTypeErrorIfInvalidListener(listener, namespace);
                    }
                };
                Observation.prototype.emit = function (namespace, data, tracker) {
                    void this.drain_(namespace, data, tracker);
                };
                Observation.prototype.reflect = function (namespace, data) {
                    var results = [];
                    void this.emit(namespace, data, function (_, r) {
                        return results = r;
                    });
                    return results;
                };
                Observation.prototype.relay = function (source) {
                    var _this = this;
                    if (this.relaySources.has(source))
                        return function () {
                            return void 0;
                        };
                    void this.relaySources.add(source);
                    var unbind = source.monitor([], function (data, namespace) {
                        return void _this.emit(namespace, data);
                    });
                    return function () {
                        return void _this.relaySources.delete(source), unbind();
                    };
                };
                Observation.prototype.drain_ = function (namespace, data, tracker) {
                    var _this = this;
                    var results = [];
                    void this.refsBelow_(this.seekNode_(namespace)).reduce(function (_, _a) {
                        var type = _a.type, listener = _a.listener, once = _a.options.once;
                        if (type !== RegisterItemType.subscriber)
                            return;
                        if (once) {
                            void _this.off(namespace, listener);
                        }
                        try {
                            var result = listener(data, namespace);
                            if (tracker) {
                                results[results.length] = result;
                            }
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }, void 0);
                    void this.refsAbove_(this.seekNode_(namespace)).reduce(function (_, _a) {
                        var type = _a.type, listener = _a.listener, once = _a.options.once;
                        if (type !== RegisterItemType.monitor)
                            return;
                        if (once) {
                            void _this.off(namespace, listener, RegisterItemType.monitor);
                        }
                        try {
                            void listener(data, namespace);
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }, void 0);
                    if (tracker) {
                        try {
                            void tracker(data, results);
                        } catch (reason) {
                            void exception_1.causeAsyncException(reason);
                        }
                    }
                };
                Observation.prototype.refs = function (namespace) {
                    return this.refsBelow_(this.seekNode_(namespace));
                };
                Observation.prototype.refsAbove_ = function (_a) {
                    var parent = _a.parent, items = _a.items;
                    items = concat_1.concat([], items);
                    while (parent) {
                        items = concat_1.concat(items, parent.items);
                        parent = parent.parent;
                    }
                    return items;
                };
                Observation.prototype.refsBelow_ = function (_a) {
                    var childrenNames = _a.childrenNames, children = _a.children, items = _a.items;
                    items = concat_1.concat([], items);
                    for (var i = 0; i < childrenNames.length; ++i) {
                        var name_1 = childrenNames[i];
                        var below = this.refsBelow_(children.get(name_1));
                        items = concat_1.concat(items, below);
                        if (below.length === 0) {
                            void children.delete(name_1);
                            void childrenNames.splice(equal_1.findIndex(name_1, childrenNames), 1);
                            void --i;
                        }
                    }
                    return items;
                };
                Observation.prototype.seekNode_ = function (namespace) {
                    var node = this.node_;
                    for (var _i = 0, namespace_1 = namespace; _i < namespace_1.length; _i++) {
                        var name_2 = namespace_1[_i];
                        var children = node.children;
                        if (!children.has(name_2)) {
                            void node.childrenNames.push(name_2);
                            children.set(name_2, {
                                parent: node,
                                children: new Map(),
                                childrenNames: [],
                                items: []
                            });
                        }
                        node = children.get(name_2);
                    }
                    return node;
                };
                return Observation;
            }();
            exports.Observation = Observation;
            function isRegistered(items, type, namespace, listener) {
                return items.some(function (_a) {
                    var t = _a.type, n = _a.namespace, l = _a.listener;
                    return t === type && n.length === namespace.length && n.every(function (_, i) {
                        return n[i] === namespace[i];
                    }) && l === listener;
                });
            }
            function throwTypeErrorIfInvalidListener(listener, types) {
                switch (typeof listener) {
                case 'function':
                    return;
                default:
                    throw new TypeError('Spica: Observation: Invalid listener.\n\t' + types + ' ' + listener);
                }
            }
        },
        {
            './concat': 6,
            './equal': 8,
            './exception': 9
        }
    ],
    20: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var zeros = '0'.repeat(15);
            var cnt = 0;
            function sqid(id) {
                if (arguments.length > 0) {
                    if (typeof id !== 'number')
                        throw new TypeError('Spica: sqid: A parameter value must be a number: ' + id);
                    if (id >= 0 === false)
                        throw new TypeError('Spica: sqid: A parameter value must be a positive number: ' + id);
                    if (id % 1 !== 0)
                        throw new TypeError('Spica: sqid: A parameter value must be an integer: ' + id);
                }
                return id === void 0 ? (zeros + ++cnt).slice(-15) : (zeros + id).slice(-15);
            }
            exports.sqid = sqid;
        },
        {}
    ],
    21: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var exception_1 = require('./exception');
            var queue = [];
            var register = new WeakSet();
            function flush() {
                var cbs = queue;
                queue = [];
                register = new WeakSet();
                return cbs;
            }
            function tick(cb, dedup) {
                if (dedup === void 0) {
                    dedup = false;
                }
                if (dedup) {
                    if (register.has(cb))
                        return;
                    void register.add(cb);
                }
                void queue.push(cb);
                void schedule();
            }
            exports.tick = tick;
            function schedule() {
                if (queue.length !== 1)
                    return;
                void Promise.resolve().then(run);
            }
            function run() {
                var cbs = flush();
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
        },
        { './exception': 9 }
    ],
    22: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            function type(target) {
                return Object.prototype.toString.call(target).split(' ').pop().slice(0, -1);
            }
            exports.type = type;
        },
        {}
    ],
    23: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
            function uuid() {
                var acc = '';
                for (var _i = 0, FORMAT_V4_1 = FORMAT_V4; _i < FORMAT_V4_1.length; _i++) {
                    var c = FORMAT_V4_1[_i];
                    if (c === 'x' || c === 'y') {
                        var r = Math.random() * 16 | 0;
                        var v = c == 'x' ? r : r & 3 | 8;
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
    24: [
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
        { './layer/interface/api': 52 }
    ],
    25: [
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
                    var Schema = _a.Schema, _b = _a.migrate, migrate = _b === void 0 ? function () {
                            return void 0;
                        } : _b, _c = _a.destroy, destroy = _c === void 0 ? function () {
                            return true;
                        } : _c, _d = _a.size, size = _d === void 0 ? Infinity : _d, _e = _a.expiry, expiry = _e === void 0 ? Infinity : _e;
                    return _super.call(this, name, Schema, migrate, destroy, size, expiry) || this;
                }
                return StoreChannel;
            }(api_1.StoreChannel);
            exports.StoreChannel = StoreChannel;
            var StorageChannel = function (_super) {
                __extends(StorageChannel, _super);
                function StorageChannel(name, _a) {
                    var Schema = _a.Schema, _b = _a.migrate, migrate = _b === void 0 ? function () {
                            return void 0;
                        } : _b;
                    return _super.call(this, name, api_2.localStorage, Schema, migrate) || this;
                }
                return StorageChannel;
            }(api_2.StorageChannel);
            exports.StorageChannel = StorageChannel;
        },
        {
            '../domain/indexeddb/api': 34,
            '../domain/webstorage/api': 40
        }
    ],
    26: [
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
                        return value === null || isBinary(value) || Object.keys(value).every(function (key) {
                            return isStorable(value[key]);
                        });
                    } catch (_) {
                        return false;
                    }
                default:
                    return false;
                }
            }
            exports.isStorable = isStorable;
            function hasBinary(value) {
                return value instanceof Object ? isBinary(value) || Object.keys(value).some(function (key) {
                    return hasBinary(value[key]);
                }) : false;
            }
            exports.hasBinary = hasBinary;
            function isBinary(value) {
                return value instanceof Int8Array || value instanceof Int16Array || value instanceof Int32Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Uint16Array || value instanceof Uint32Array || value instanceof ArrayBuffer || value instanceof Blob;
            }
        },
        {}
    ],
    27: [
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
            var assign_1 = require('spica/assign');
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
                    if (typeof this.id !== 'number' || !Number.isFinite(this.id) || this.id >= 0 === false || !Number.isInteger(this.id))
                        throw new TypeError('ClientChannel: EventRecord: Invalid event id: ' + this.id);
                    if (typeof this.type !== 'string')
                        throw new TypeError('ClientChannel: EventRecord: Invalid event type: ' + this.type);
                    if (typeof this.key !== 'string')
                        throw new TypeError('ClientChannel: EventRecord: Invalid event key: ' + this.key);
                    if (typeof this.value !== 'object' || !this.value)
                        throw new TypeError('ClientChannel: EventRecord: Invalid event value: ' + JSON.stringify(this.value));
                    if (typeof this.date !== 'number' || !Number.isFinite(this.date) || this.date >= 0 === false)
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
                        throw new TypeError('ClientChannel: EventRecord: Invalid event type: ' + type);
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
                        throw new TypeError('ClientChannel: UnstoredEventRecord: Invalid event id: ' + _this.id);
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
                        throw new TypeError('ClientChannel: StoredEventRecord: Invalid event id: ' + _this.id);
                    return _this;
                }
                return StoredEventRecord;
            }(EventRecord);
            exports.StoredEventRecord = StoredEventRecord;
            var LoadedEventRecord = function (_super) {
                __extends(LoadedEventRecord, _super);
                function LoadedEventRecord(_a) {
                    var id = _a.id, key = _a.key, value = _a.value, type = _a.type, date = _a.date;
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
                    void assign_1.clone.apply(void 0, [this].concat(sources));
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
            '../database/value': 26,
            './identifier': 28,
            'spica/assign': 3
        }
    ],
    28: [
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
    29: [
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
            var observation_1 = require('spica/observation');
            var cancellation_1 = require('spica/cancellation');
            var tick_1 = require('spica/tick');
            var sqid_1 = require('spica/sqid');
            var concat_1 = require('spica/concat');
            var api_1 = require('../../infrastructure/indexeddb/api');
            var identifier_1 = require('./identifier');
            var event_1 = require('./event');
            var value_1 = require('../database/value');
            var noop_1 = require('../../../lib/noop');
            var EventStoreSchema;
            (function (EventStoreSchema) {
                EventStoreSchema.id = 'id';
                EventStoreSchema.key = 'key';
            }(EventStoreSchema || (EventStoreSchema = {})));
            var EventStore = function () {
                function EventStore(database, name, attrs) {
                    var _this = this;
                    this.database = database;
                    this.name = name;
                    this.attrs = attrs;
                    this.memory = new observation_1.Observation();
                    this.events = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation(),
                        loss: new observation_1.Observation()
                    });
                    this.events_ = Object.freeze({
                        memory: new observation_1.Observation(),
                        access: new observation_1.Observation()
                    });
                    this.syncState = new Map();
                    this.syncWaits = new observation_1.Observation();
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
                            return true;
                        },
                        verify: function (db) {
                            return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.id) && db.transaction(name).objectStore(name).indexNames.contains(EventStoreSchema.key);
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
                EventStore.prototype.fetch = function (key, cb) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = noop_1.noop;
                    }
                    var events = [];
                    var updateSyncState = function (state) {
                        return void _this.syncState.set(key, state || _this.syncState.get(key) || void 0);
                    };
                    void updateSyncState(this.syncState.get(key) === true);
                    return void api_1.listen(this.database)(function (db) {
                        var tx = db.transaction(_this.name, 'readonly');
                        var req = tx.objectStore(_this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
                        var unbind = function () {
                            return void (req.onsuccess = tx.onerror = tx.onabort = null);
                        };
                        var proc = function (cursor, err) {
                            if (err)
                                return void cb(err), void updateSyncState(), void unbind();
                            if (!cursor || new event_1.LoadedEventRecord(cursor.value).date < _this.meta(key).date) {
                                void updateSyncState(true);
                                void Array.from(events.reduceRight(function (es, e) {
                                    return es.length === 0 || es[0].type === EventStore.EventType.put ? concat_1.concat(es, [e]) : es;
                                }, []).reduceRight(function (dict, e) {
                                    return dict.set(e.attr, e);
                                }, new Map()).values()).sort(function (a, b) {
                                    return a.date - b.date || a.id - b.id;
                                }).forEach(function (e) {
                                    return void _this.memory.off([
                                        e.key,
                                        e.attr,
                                        sqid_1.sqid(e.id)
                                    ]), void _this.memory.on([
                                        e.key,
                                        e.attr,
                                        sqid_1.sqid(e.id)
                                    ], function () {
                                        return e;
                                    }), void _this.events_.memory.emit([
                                        e.key,
                                        e.attr,
                                        sqid_1.sqid(e.id)
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
                                void _this.events_.access.emit([key], new EventStore.InternalEvent(EventStore.InternalEventType.query, identifier_1.makeEventId(0), key, ''));
                                if (events.length >= _this.snapshotCycle) {
                                    void _this.snapshot(key);
                                }
                                return;
                            } else {
                                var event_2 = new event_1.LoadedEventRecord(cursor.value);
                                if (_this.memory.refs([
                                        event_2.key,
                                        event_2.attr,
                                        sqid_1.sqid(event_2.id)
                                    ]).length > 0)
                                    return void proc(null, err);
                                try {
                                    void events.unshift(event_2);
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
                    }, updateSyncState);
                };
                EventStore.prototype.keys = function () {
                    return this.memory.reflect([]).reduce(function (keys, e) {
                        return keys.length === 0 || keys[keys.length - 1] !== e.key ? concat_1.concat(keys, [e.key]) : keys;
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
                    void this.events_.access.emit([
                        event.key,
                        event.attr,
                        event.type
                    ], new EventStore.InternalEvent(event.type, identifier_1.makeEventId(0), event.key, event.attr));
                    if (!this.observes(event.key)) {
                        void this.fetch(event.key);
                    }
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
                            void this.memory.refs([event.key]).filter(function (_a) {
                                var _b = _a.namespace, id = _b[2];
                                return id === sqid_1.sqid(0);
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
                        sqid_1.sqid(0),
                        sqid_1.sqid()
                    ], function () {
                        return event;
                    });
                    void this.events_.memory.emit([
                        event.key,
                        event.attr,
                        sqid_1.sqid(0)
                    ], event);
                    return void new Promise(function (resolve, reject) {
                        var cont = function (tx) {
                            var active = function () {
                                return _this.memory.refs([
                                    event.key,
                                    event.attr,
                                    sqid_1.sqid(0)
                                ]).some(function (_a) {
                                    var listener = _a.listener;
                                    return listener(void 0, [
                                        event.key,
                                        event.attr,
                                        sqid_1.sqid(0)
                                    ]) === event;
                                });
                            };
                            if (!active())
                                return void resolve();
                            var req = tx.objectStore(_this.name).add(adjust(event));
                            var success = function () {
                                void clean();
                                var savedEvent = new event_1.SavedEventRecord(identifier_1.makeEventId(req.result), event.key, event.value, event.type, event.date);
                                void _this.memory.off([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    sqid_1.sqid(savedEvent.id)
                                ]);
                                void _this.memory.on([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    sqid_1.sqid(savedEvent.id)
                                ], function () {
                                    return savedEvent;
                                });
                                void _this.events_.memory.emit([
                                    savedEvent.key,
                                    savedEvent.attr,
                                    sqid_1.sqid(savedEvent.id)
                                ], savedEvent);
                                void resolve();
                                var events = _this.memory.refs([savedEvent.key]).map(function (_a) {
                                    var listener = _a.listener;
                                    return listener(void 0, [savedEvent.key]);
                                }).reduce(function (es, e) {
                                    return e instanceof event_1.StoredEventRecord ? concat_1.concat(es, [e]) : es;
                                }, []);
                                if (events.length >= _this.snapshotCycle || value_1.hasBinary(event.value)) {
                                    void _this.snapshot(savedEvent.key);
                                }
                            };
                            var fail = function () {
                                return active() ? void reject() : void resolve(), void clean();
                            };
                            tx.addEventListener('complete', success);
                            tx.addEventListener('error', fail);
                            tx.addEventListener('abort', fail);
                        };
                        if (tx)
                            return void cont(tx);
                        var cancellation = new cancellation_1.Cancellation();
                        void cancellation.register(reject);
                        void cancellation.register(clean);
                        void tick_1.tick(function () {
                            return void setTimeout(cancellation.cancel, 1000), void api_1.listen(_this.database)(function (db) {
                                return void cancellation.close(), void cancellation.maybe(db).fmap(function (db) {
                                    return void cont(db.transaction(_this.name, 'readwrite'));
                                }).extract(function () {
                                    return void 0;
                                });
                            }, cancellation.cancel);
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
                                var event_3 = new event_1.LoadedEventRecord(cursor.value);
                                try {
                                    void events.unshift(event_3);
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
                                throw new TypeError('ClientChannel: EventStore: Invalid event type: ' + composedEvent.type);
                            } else {
                                return void cursor.continue();
                            }
                        };
                    });
                };
                EventStore.prototype.clean = function (key) {
                    var _this = this;
                    var events = [];
                    var cleanState = new Map();
                    return void this.cursor(api_1.IDBKeyRange.bound(key, key), EventStoreSchema.key, 'prev', 'readwrite', function (cursor) {
                        if (!cursor) {
                            return void events.reduce(function (_, event) {
                                return void _this.memory.off([
                                    event.key,
                                    event.attr,
                                    sqid_1.sqid(event.id)
                                ]), void _this.events_.memory.off([
                                    event.key,
                                    event.attr,
                                    sqid_1.sqid(event.id)
                                ]);
                            }, void 0);
                        } else {
                            var event_4 = new event_1.LoadedEventRecord(cursor.value);
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
                                void events.unshift(event_4);
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
                    }, function () {
                        return void cb(null, new Error('Access has failed.'));
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
                        return prev.key === event.key ? concat_1.concat([concat_1.concat([event], head)], tail) : concat_1.concat([[event]], concat_1.concat([head], tail));
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
                    throw new TypeError('ClientChannel: EventStore: Invalid event type: ' + source);
                    var _a;
                }
            }
            exports.compose = compose;
        },
        {
            '../../../lib/noop': 53,
            '../../infrastructure/indexeddb/api': 43,
            '../database/value': 26,
            './event': 27,
            './identifier': 28,
            'spica/cancellation': 5,
            'spica/concat': 6,
            'spica/observation': 19,
            'spica/sqid': 20,
            'spica/tick': 21
        }
    ],
    30: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var observation_1 = require('spica/observation');
            var api_1 = require('../../infrastructure/indexeddb/api');
            var noop_1 = require('../../../lib/noop');
            var KeyValueStore = function () {
                function KeyValueStore(database, name, index) {
                    this.database = database;
                    this.name = name;
                    this.index = index;
                    this.cache = new Map();
                    this.events = { access: new observation_1.Observation() };
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
                    }, function () {
                        return void cb(void 0, new Error('Access has failed.'));
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
                    }, function () {
                        return void cb(key, new Error('Access has failed.'));
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
                    }, function () {
                        return void cb(new Error('Access has failed.'));
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
                    }, function () {
                        return void cb(null, new Error('Access has failed.'));
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
            '../../../lib/noop': 53,
            '../../infrastructure/indexeddb/api': 43,
            'spica/observation': 19
        }
    ],
    31: [
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
                    void api_1.storageEventStream.on([
                        'local',
                        this.name
                    ], listener);
                    return function () {
                        return void _this.listeners.delete(listener), void api_1.storageEventStream.off([
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
                        return void api_1.storageEventStream.off([
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
        { '../../infrastructure/webstorage/api': 49 }
    ],
    32: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var builder_1 = require('./module/builder');
            exports.SCHEMA = builder_1.SCHEMA;
            exports.build = builder_1.build;
            exports.isValidPropertyName = builder_1.isValidPropertyName;
            exports.isValidPropertyValue = builder_1.isValidPropertyValue;
        },
        { './module/builder': 33 }
    ],
    33: [
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
                    throw new TypeError('ClientChannel: DAO: Invalid key: ' + source[exports.SCHEMA.KEY.NAME]);
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
                                throw new TypeError('ClientChannel: DAO: Invalid value: ' + JSON.stringify(newVal));
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
            '../../../../lib/noop': 53,
            '../../../data/es/event': 27
        }
    ],
    34: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var channel_1 = require('./service/channel');
            exports.StoreChannel = channel_1.StoreChannel;
        },
        { './service/channel': 39 }
    ],
    35: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var observation_1 = require('spica/observation');
            var cancellation_1 = require('spica/cancellation');
            var cache_1 = require('spica/cache');
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
                    this.cancellation = new cancellation_1.Cancellation();
                    this.events_ = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation()
                    });
                    this.events = Object.freeze({
                        load: new observation_1.Observation(),
                        save: new observation_1.Observation(),
                        loss: new observation_1.Observation()
                    });
                    this.ages = new Map();
                    if (cache.has(name))
                        throw new Error('ClientChannel: Specified database channel ' + name + ' is already created.');
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
                        destroy: function (reason, ev) {
                            return data_1.DataStore.configure().destroy(reason, ev) && access_1.AccessStore.configure().destroy(reason, ev) && expiry_1.ExpiryStore.configure().destroy(reason, ev) && destroy(reason, ev);
                        }
                    });
                    this.schema = new Schema(this, attrs, this.ages);
                    void this.cancellation.register(function () {
                        return void _this.schema.close();
                    });
                    void this.cancellation.register(api_1.idbEventStream.on([
                        name,
                        api_1.IDBEventType.destroy
                    ], function () {
                        return cache.get(name) === _this && void _this.schema.rebuild();
                    }));
                    if (size < Infinity) {
                        var keys_1 = new cache_1.Cache(this.size, function (k) {
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
                    if (!Number.isFinite(age))
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
                    this.cancellation_ = new cancellation_1.Cancellation();
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
                    this.cancellation_ = new cancellation_1.Cancellation();
                };
                return Schema;
            }();
        },
        {
            '../../../../lib/noop': 53,
            '../../../infrastructure/indexeddb/api': 43,
            './channel/access': 36,
            './channel/data': 37,
            './channel/expiry': 38,
            'spica/cache': 4,
            'spica/cancellation': 5,
            'spica/observation': 19
        }
    ],
    36: [
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
                        return type === store_2.EventStore.EventType.delete ? void _this.delete(key) : void _this.set(key, new AccessRecord(key));
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
                function AccessRecord(key) {
                    this.key = key;
                    this.date = Date.now();
                }
                return AccessRecord;
            }();
        },
        {
            '../../../../data/es/store': 29,
            '../../../../data/kvs/store': 30
        }
    ],
    37: [
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
        { '../../../../data/es/store': 29 }
    ],
    38: [
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
                                if (record.expiry > Date.now() && Number.isFinite(record.expiry))
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
            '../../../../data/es/store': 29,
            '../../../../data/kvs/store': 30
        }
    ],
    39: [
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
            var observation_1 = require('spica/observation');
            var api_1 = require('../../dao/api');
            var channel_1 = require('../model/channel');
            var api_2 = require('../../webstorage/api');
            var api_3 = require('../../broadcast/api');
            var StoreChannel = function (_super) {
                __extends(StoreChannel, _super);
                function StoreChannel(name, Schema, migrate, destroy, size, expiry) {
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
                    var _this = _super.call(this, name, Object.keys(new Schema()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(new Schema())), destroy, size, expiry) || this;
                    _this.Schema = Schema;
                    _this.broadcast = new api_3.BroadcastChannel(_this.name);
                    _this.links = new Map();
                    _this.sources = new Map();
                    var attrs = Object.keys(new Schema()).filter(api_1.isValidPropertyName).filter(api_1.isValidPropertyValue(new Schema()));
                    void _this.broadcast.listen(function (ev) {
                        return void _this.fetch(ev instanceof MessageEvent ? ev.data : ev.newValue);
                    });
                    void _this.events_.save.monitor([], function (_a) {
                        var key = _a.key;
                        return void _this.broadcast.post(key);
                    });
                    void _this.events_.load.monitor([], function (_a) {
                        var key = _a.key, attr = _a.attr, type = _a.type;
                        if (!_this.sources.has(key))
                            return;
                        var source = _this.sources.get(key);
                        var memory = _this.get(key);
                        var link = _this.link(key);
                        switch (type) {
                        case channel_1.ChannelStore.EventType.put:
                            return void update(attrs.filter(function (a) {
                                return a === attr;
                            }));
                        case channel_1.ChannelStore.EventType.delete:
                        case channel_1.ChannelStore.EventType.snapshot:
                            return void update(attrs);
                        }
                        return;
                        function update(attrs) {
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
                        __event: { value: new observation_1.Observation() }
                    }), function () {
                        return new _this.Schema();
                    }, function (attr, newValue, oldValue) {
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
            '../../broadcast/api': 31,
            '../../dao/api': 32,
            '../../webstorage/api': 40,
            '../model/channel': 35,
            'spica/observation': 19
        }
    ],
    40: [
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
            '../../infrastructure/webstorage/api': 49,
            './service/channel': 42
        }
    ],
    41: [
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
    42: [
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
            var observation_1 = require('spica/observation');
            var cancellation_1 = require('spica/cancellation');
            var api_1 = require('../../dao/api');
            var api_2 = require('../../../infrastructure/webstorage/api');
            var storage_1 = require('../model/storage');
            var cache = new Map();
            var StorageChannel = function () {
                function StorageChannel(name, storage, Schema, migrate, log) {
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
                    this.cancellation = new cancellation_1.Cancellation();
                    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
                    this.events = Object.freeze({
                        send: new observation_1.Observation(),
                        recv: new observation_1.Observation()
                    });
                    if (cache.has(name))
                        throw new Error('ClientChannel: Specified storage channel ' + name + ' is already created.');
                    void cache.set(name, this);
                    void this.cancellation.register(function () {
                        return void cache.delete(name);
                    });
                    var source = __assign((_a = {}, _a[api_1.SCHEMA.KEY.NAME] = this.name, _a[api_1.SCHEMA.EVENT.NAME] = new observation_1.Observation(), _a), parse(this.storage.getItem(this.name)));
                    this.link_ = api_1.build(source, function () {
                        return new Schema();
                    }, function (attr, newValue, oldValue) {
                        void log.update(_this.name);
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
                    void this.cancellation.register(api_2.storageEventStream.on([
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
                    void log.update(this.name);
                    void this.cancellation.register(function () {
                        return void log.delete(_this.name);
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
            '../../../infrastructure/webstorage/api': 49,
            '../../dao/api': 32,
            '../model/storage': 41,
            'spica/cancellation': 5,
            'spica/observation': 19
        }
    ],
    43: [
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
            var event_1 = require('./model/event');
            exports.idbEventStream = event_1.idbEventStream;
            exports.IDBEvent = event_1.IDBEvent;
            exports.IDBEventType = event_1.IDBEventType;
        },
        {
            './model/access': 44,
            './model/event': 45,
            './module/global': 48
        }
    ],
    44: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var mutation_1 = require('./mutation');
            function open(database, config) {
                return void mutation_1.operate(database, 'open', config);
            }
            exports.open = open;
            function listen(database) {
                return function (success, failure) {
                    if (failure === void 0) {
                        failure = function () {
                            return void 0;
                        };
                    }
                    return void mutation_1.request(database, success, failure);
                };
            }
            exports.listen = listen;
            function close(database) {
                return void mutation_1.operate(database, 'close', {
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
            }
            exports.close = close;
            function destroy(database) {
                return void mutation_1.operate(database, 'destroy', {
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
            }
            exports.destroy = destroy;
        },
        { './mutation': 46 }
    ],
    45: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var observation_1 = require('spica/observation');
            exports.idbEventStream_ = new observation_1.Observation();
            exports.idbEventStream = exports.idbEventStream_;
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
                function IDBEvent(name, type) {
                    this.name = name;
                    this.type = type;
                    void Object.freeze(this);
                }
                return IDBEvent;
            }();
            exports.IDBEvent = IDBEvent;
        },
        { 'spica/observation': 19 }
    ],
    46: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var global_1 = require('../module/global');
            var state_1 = require('./state');
            var event_1 = require('./event');
            function operate(database, command, config) {
                if (state_1.commands.get(database) === 'destroy') {
                    switch (command) {
                    case 'open':
                    case 'close':
                        return void event_1.idbEventStream_.once([
                            database,
                            event_1.IDBEventType.destroy
                        ], function () {
                            return void operate(database, command, config);
                        });
                    }
                }
                void state_1.commands.set(database, command);
                void state_1.configs.set(database, config);
                void handle(database);
            }
            exports.operate = operate;
            function request(database, success, failure) {
                state_1.requests.has(database) || void state_1.requests.set(database, new state_1.Requests(database));
                void state_1.requests.get(database).add(success, failure);
            }
            exports.request = request;
            function handle(database) {
                void request(database, function () {
                    return void 0;
                }, function () {
                    return void 0;
                });
                if (state_1.states.has(database))
                    return;
                void handleFromInitialState(new state_1.InitialState(database));
            }
            function handleFromInitialState(state) {
                if (!state.alive)
                    return;
                var database = state.database, version = state.version;
                try {
                    var openRequest_1 = version ? global_1.indexedDB.open(database, version) : global_1.indexedDB.open(database);
                    openRequest_1.onblocked = function () {
                        return void handleFromBlockedState(new state_1.BlockState(state, openRequest_1));
                    };
                    openRequest_1.onupgradeneeded = function () {
                        return void handleFromUpgradeState(new state_1.UpgradeState(state, openRequest_1));
                    };
                    openRequest_1.onsuccess = function () {
                        return void handleFromSuccessState(new state_1.SuccessState(state, openRequest_1.result));
                    };
                    openRequest_1.onerror = function (event) {
                        return void handleFromErrorState(new state_1.ErrorState(state, openRequest_1.error, event));
                    };
                } catch (reason) {
                    void handleFromCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleFromBlockedState(state) {
                if (!state.alive)
                    return;
                var database = state.database, session = state.session;
                session.onblocked = function () {
                    return void handleFromBlockedState(new state_1.BlockState(state, session));
                };
                session.onupgradeneeded = function () {
                    return void handleFromUpgradeState(new state_1.UpgradeState(state, session));
                };
                session.onsuccess = function () {
                    return void handleFromSuccessState(new state_1.SuccessState(state, session.result));
                };
                session.onerror = function (event) {
                    return void handleFromErrorState(new state_1.ErrorState(state, session.error, event));
                };
                void event_1.idbEventStream_.emit([
                    database,
                    event_1.IDBEventType.block
                ], new event_1.IDBEvent(database, event_1.IDBEventType.block));
            }
            function handleFromUpgradeState(state) {
                if (!state.alive)
                    return;
                var session = state.session;
                var db = session.transaction.db;
                var _a = state.config, make = _a.make, destroy = _a.destroy;
                try {
                    if (make(session.transaction)) {
                        session.onsuccess = function () {
                            return void handleFromSuccessState(new state_1.SuccessState(state, db));
                        };
                        session.onerror = function (event) {
                            return void handleFromErrorState(new state_1.ErrorState(state, session.error, event));
                        };
                    } else {
                        session.onsuccess = session.onerror = function (event) {
                            return void db.close(), destroy(session.error, event) ? void handleFromDestroyState(new state_1.DestroyState(state)) : void handleFromEndState(new state_1.EndState(state));
                        };
                    }
                } catch (reason) {
                    void handleFromCrashState(new state_1.CrashState(state, reason));
                }
            }
            function handleFromSuccessState(state) {
                if (!state.alive)
                    return;
                var database = state.database, connection = state.connection, requests = state.requests;
                connection.onversionchange = function () {
                    return void connection.close(), void event_1.idbEventStream_.emit([
                        database,
                        event_1.IDBEventType.destroy
                    ], new event_1.IDBEvent(database, event_1.IDBEventType.destroy)), void requests.clear(), void handleFromEndState(new state_1.EndState(state));
                };
                connection.onerror = function (event) {
                    return void handleFromErrorState(new state_1.ErrorState(state, event.target.error, event));
                };
                connection.onabort = function (event) {
                    return void handleFromAbortState(new state_1.AbortState(state, event));
                };
                connection.onclose = function () {
                    return void handleFromEndState(new state_1.EndState(state));
                };
                state.close = function () {
                    return void handleFromSuccessState(state);
                };
                state.destroy = function () {
                    return void handleFromSuccessState(state);
                };
                state.drain = function () {
                    return void handleFromSuccessState(state);
                };
                switch (state.command) {
                case 'open': {
                        var verify = state.config.verify;
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
                            event_1.IDBEventType.connect
                        ], new event_1.IDBEvent(database, event_1.IDBEventType.connect));
                        return void requests.resolve(state, function (reason) {
                            void new Promise(function (_, reject) {
                                return void reject(reason);
                            });
                            void connection.close();
                            void handleFromCrashState(new state_1.CrashState(state, reason));
                        });
                    }
                case 'close':
                    void connection.close();
                    return void handleFromEndState(new state_1.EndState(state));
                case 'destroy':
                    void connection.close();
                    return void handleFromDestroyState(new state_1.DestroyState(state));
                }
            }
            function handleFromErrorState(state) {
                if (!state.alive)
                    return;
                var database = state.database, error = state.error, event = state.event;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    event_1.IDBEventType.error
                ], new event_1.IDBEvent(database, event_1.IDBEventType.error));
                var destroy = state.config.destroy;
                if (destroy(error, event)) {
                    return void handleFromDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleFromEndState(new state_1.EndState(state));
                }
            }
            function handleFromAbortState(state) {
                if (!state.alive)
                    return;
                var database = state.database, event = state.event;
                void event.preventDefault();
                void event_1.idbEventStream_.emit([
                    database,
                    event_1.IDBEventType.abort
                ], new event_1.IDBEvent(database, event_1.IDBEventType.abort));
                return void handleFromEndState(new state_1.EndState(state));
            }
            function handleFromCrashState(state) {
                if (!state.alive)
                    return;
                var database = state.database, reason = state.reason;
                void event_1.idbEventStream_.emit([
                    database,
                    event_1.IDBEventType.crash
                ], new event_1.IDBEvent(database, event_1.IDBEventType.crash));
                var destroy = state.config.destroy;
                if (destroy(reason)) {
                    return void handleFromDestroyState(new state_1.DestroyState(state));
                } else {
                    return void handleFromEndState(new state_1.EndState(state));
                }
            }
            function handleFromDestroyState(state) {
                if (!state.alive)
                    return;
                var database = state.database;
                var deleteRequest = global_1.indexedDB.deleteDatabase(database);
                deleteRequest.onsuccess = function () {
                    return void event_1.idbEventStream_.emit([
                        database,
                        event_1.IDBEventType.destroy
                    ], new event_1.IDBEvent(database, event_1.IDBEventType.destroy)), void state.requests.clear(), void handleFromEndState(new state_1.EndState(state));
                };
                deleteRequest.onerror = function (event) {
                    return void handleFromErrorState(new state_1.ErrorState(state, deleteRequest.error, event));
                };
            }
            function handleFromEndState(state) {
                if (!state.alive)
                    return;
                var database = state.database, version = state.version;
                void state.complete();
                void event_1.idbEventStream_.emit([
                    database,
                    event_1.IDBEventType.disconnect
                ], new event_1.IDBEvent(database, event_1.IDBEventType.disconnect));
                switch (state.command) {
                case 'open':
                    return void handleFromInitialState(new state_1.InitialState(database, version));
                case 'close':
                case 'destroy':
                    return;
                }
            }
        },
        {
            '../module/global': 48,
            './event': 45,
            './state': 47
        }
    ],
    47: [
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
            exports.configs = new Map();
            exports.commands = new Map();
            var Command;
            (function (Command) {
                Command['open'] = 'open';
                Command['close'] = 'close';
                Command['destroy'] = 'destroy';
            }(Command = exports.Command || (exports.Command = {})));
            exports.requests = new Map();
            var Requests = function () {
                function Requests(database) {
                    this.database = database;
                    this.queue = [];
                }
                Requests.prototype.add = function (success, failure) {
                    void this.queue.push({
                        success: success,
                        failure: failure
                    });
                    var state = exports.states.get(this.database);
                    if (!(state instanceof SuccessState))
                        return;
                    void state.drain();
                };
                Requests.prototype.resolve = function (state, catcher) {
                    try {
                        while (this.queue.length > 0 && state.alive) {
                            void this.queue.shift().success(state.connection);
                        }
                    } catch (reason) {
                        void catcher(reason);
                    }
                };
                Requests.prototype.clear = function () {
                    try {
                        while (this.queue.length > 0) {
                            void this.queue.shift().failure();
                        }
                    } catch (_) {
                        return this.clear();
                    }
                };
                return Requests;
            }();
            exports.Requests = Requests;
            exports.states = new Map();
            var State = function () {
                function State(database, state) {
                    this.database = database;
                    this.alive = true;
                    switch (true) {
                    case this instanceof InitialState:
                        this.alive = !state;
                        break;
                    default:
                        this.alive = !!state && state.alive;
                    }
                    if (!this.alive)
                        return;
                    void exports.states.set(database, this);
                    if (state) {
                        state.alive = false;
                    }
                }
                Object.defineProperty(State.prototype, 'command', {
                    get: function () {
                        return exports.commands.get(this.database);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(State.prototype, 'config', {
                    get: function () {
                        return exports.configs.get(this.database);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(State.prototype, 'requests', {
                    get: function () {
                        return exports.requests.get(this.database);
                    },
                    enumerable: true,
                    configurable: true
                });
                return State;
            }();
            var InitialState = function (_super) {
                __extends(InitialState, _super);
                function InitialState(database, version) {
                    if (version === void 0) {
                        version = 0;
                    }
                    var _this = _super.call(this, database, exports.states.get(database)) || this;
                    _this.version = version;
                    _this.STATE;
                    return _this;
                }
                return InitialState;
            }(State);
            exports.InitialState = InitialState;
            var BlockState = function (_super) {
                __extends(BlockState, _super);
                function BlockState(state, session) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.session = session;
                    _this.STATE;
                    return _this;
                }
                return BlockState;
            }(State);
            exports.BlockState = BlockState;
            var UpgradeState = function (_super) {
                __extends(UpgradeState, _super);
                function UpgradeState(state, session) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.session = session;
                    _this.STATE;
                    return _this;
                }
                return UpgradeState;
            }(State);
            exports.UpgradeState = UpgradeState;
            var SuccessState = function (_super) {
                __extends(SuccessState, _super);
                function SuccessState(state, connection) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.connection = connection;
                    _this.STATE;
                    return _this;
                }
                return SuccessState;
            }(State);
            exports.SuccessState = SuccessState;
            var ErrorState = function (_super) {
                __extends(ErrorState, _super);
                function ErrorState(state, error, event) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.error = error;
                    _this.event = event;
                    _this.STATE;
                    return _this;
                }
                return ErrorState;
            }(State);
            exports.ErrorState = ErrorState;
            var AbortState = function (_super) {
                __extends(AbortState, _super);
                function AbortState(state, event) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.event = event;
                    _this.STATE;
                    return _this;
                }
                return AbortState;
            }(State);
            exports.AbortState = AbortState;
            var CrashState = function (_super) {
                __extends(CrashState, _super);
                function CrashState(state, reason) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.reason = reason;
                    _this.STATE;
                    return _this;
                }
                return CrashState;
            }(State);
            exports.CrashState = CrashState;
            var DestroyState = function (_super) {
                __extends(DestroyState, _super);
                function DestroyState(state) {
                    var _this = _super.call(this, state.database, state) || this;
                    _this.STATE;
                    return _this;
                }
                return DestroyState;
            }(State);
            exports.DestroyState = DestroyState;
            var EndState = function (_super) {
                __extends(EndState, _super);
                function EndState(state, version) {
                    if (version === void 0) {
                        version = 0;
                    }
                    var _this = _super.call(this, state.database, state) || this;
                    _this.version = version;
                    _this.STATE;
                    return _this;
                }
                EndState.prototype.complete = function () {
                    if (!this.alive)
                        return;
                    this.alive = false;
                    void exports.states.delete(this.database);
                    switch (this.command) {
                    case 'close':
                    case 'destroy':
                        void exports.commands.set(this.database, 'close');
                        void exports.configs.set(this.database, {
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
                    }
                };
                return EndState;
            }(State);
            exports.EndState = EndState;
        },
        {}
    ],
    48: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            exports.indexedDB = self.indexedDB;
            exports.IDBKeyRange = self.IDBKeyRange;
        },
        {}
    ],
    49: [
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
            './model/event': 50,
            './module/global': 51
        }
    ],
    50: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var observation_1 = require('spica/observation');
            var global_1 = require('../module/global');
            exports.storageEventStream_ = new observation_1.Observation();
            exports.storageEventStream = exports.storageEventStream_;
            void self.addEventListener('storage', function (event) {
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
            '../module/global': 51,
            'spica/observation': 19
        }
    ],
    51: [
        function (require, module, exports) {
            'use strict';
            Object.defineProperty(exports, '__esModule', { value: true });
            var uuid_1 = require('spica/uuid');
            var supportsWebStorage = function () {
                try {
                    if (!self.navigator.cookieEnabled)
                        throw void 0;
                    var key = 'clientchannel#' + uuid_1.uuid();
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
        { 'spica/uuid': 23 }
    ],
    52: [
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
        { '../application/api': 25 }
    ],
    53: [
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
        { './src/export': 24 }
    ]
}, {}, [
    1,
    2,
    'clientchannel'
]);