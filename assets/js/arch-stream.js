/*! arch-stream v0.0.105 https://github.com/falsandtru/arch-stream | (c) 2015, falsandtru | MIT License (https://opensource.org/licenses/MIT) */
define = typeof define === 'function' && define.amd
  ? define
  : (function () {
    'use strict';
    var name = 'arch-stream',
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
define('src/lib/thenable', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function isThenable(target) {
        return !!target && typeof target === 'object' && target.then !== void 0;
    }
    exports.isThenable = isThenable;
});
define('src/lib/tick', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var TICK;
    (function (TICK) {
        TICK.queue = enqueue;
        var Queue = [];
        var Reservation = 0;
        function enqueue(fn) {
            void Queue.push(fn);
            void schedule();
        }
        function dequeue() {
            void schedule();
            void --Reservation;
            var task = Queue.length;
            while (task-- > 0) {
                void Queue.shift()();
            }
        }
        var Delays = [
            0,
            4,
            10,
            20,
            25
        ].reverse();
        function schedule() {
            if (Queue.length === 0)
                return;
            while (Reservation < Delays.length) {
                void setTimeout(dequeue, Delays[Reservation % Delays.length]);
                void ++Reservation;
            }
        }
    }(TICK || (TICK = {})));
    var IS_NODE = Function('return typeof process === \'object\' && typeof window !== \'object\'')();
    exports.Tick = IS_NODE ? Function('return fn => process.nextTick(fn)')() : TICK.queue;
});
define('src/lib/message', [
    'require',
    'exports',
    'src/lib/thenable',
    'src/lib/tick'
], function (require, exports, thenable_1, tick_1) {
    'use strict';
    var EMPTY = Object.create(null);
    var Message = function () {
        function Message(parent, listener) {
            if (listener === void 0) {
                listener = identity;
            }
            this.parent = parent;
            this.listener = listener;
            this.memory_ = EMPTY;
            this.collection_ = [];
            this.transform_ = false;
            this.listeners_ = [];
            if (parent) {
                this.parent.child_ = this;
            }
        }
        Message.prototype.root = function () {
            return !this.parent ? this : this.parent.root();
        };
        Message.prototype.collect_ = function () {
            if (this.collection_.length > 0)
                return this.collection_;
            var target = this, collection = [];
            do {
                void collection.push(target);
            } while (target = target.child_);
            return this.collection_ = collection;
        };
        Message.prototype.transport_ = function (data, cb) {
            var msg, called = false;
            var delayed = false;
            var complete = process(this.collect_(), data, this.transform_);
            delayed = true;
            if (complete && typeof cb === 'function') {
                void cb(data);
            }
            return;
            function process(collection, data, transform) {
                return collection.every(function (msg_) {
                    msg = msg_;
                    msg.memory_ = data;
                    var result = msg.listener(msg.memory_);
                    if (!thenable_1.isThenable(result)) {
                        data = transform ? result : data;
                        return true;
                    } else {
                        called = false;
                        void result.then(resume, resume);
                        return called;
                    }
                });
                function resume(result) {
                    called = true;
                    data = transform ? result : data;
                    if (!delayed)
                        return;
                    if (msg.child_) {
                        void msg.child_.send(data, cb);
                    }
                }
            }
        };
        Message.prototype.clone = function () {
            return clone_(this);
            function clone_(msg) {
                return !msg.parent ? new Message(void 0, msg.listener) : new Message(clone_(msg.parent), msg.listener);
            }
        };
        Message.prototype.connect = function (msg) {
            this.parent.child_ = msg;
            msg.parent = this.parent;
            return this;
        };
        Message.prototype.send = function (data, async, cb) {
            var _this = this;
            switch (true) {
            case typeof async === 'function': {
                    return this.send(data, false, async);
                }
            case async === true: {
                    void tick_1.Tick(function () {
                        return _this.transport_(data, cb);
                    });
                    return this;
                }
            case async === false:
            default: {
                    void this.transport_(data, cb);
                    return this;
                }
            }
        };
        Message.prototype.recv = function (callback) {
            var child = new Message(this);
            this.listener = callback;
            this.collection_ = [];
            if (this.memory_ !== EMPTY) {
                void this.send(this.memory_);
            }
            return child;
        };
        Message.prototype.trans = function (callback) {
            this.transform_ = true;
            return this.recv(callback);
        };
        Message.prototype.then = function (done, _) {
            var _this = this;
            var msg = new Message();
            this.child_ = void 0;
            this.listener = identity;
            this.listeners_.push(msg);
            this.trans(function (data) {
                var listeners = _this.listeners_;
                _this.listeners_ = [];
                (function resolve() {
                    try {
                        while (listeners.length > 0) {
                            listeners.shift().send(data);
                        }
                    } catch (err) {
                        void console.error(err);
                        void resolve();
                    }
                }());
            });
            return msg.trans(done || identity);
        };
        return Message;
    }();
    exports.Message = Message;
    function identity(data) {
        return data;
    }
});
define('src/lib/throttle', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var Throttle = function () {
        function Throttle() {
            this.queue_ = [];
            this.processing_ = [];
            this.limit_ = Infinity;
            this.volume_ = Infinity;
        }
        Throttle.prototype.isDrainable_ = function () {
            return this.processing_.length < this.volume_;
        };
        Throttle.prototype.discharger_ = function (queue, processing) {
            return;
        };
        Throttle.prototype.flow = function (volume, limit, discharger) {
            if (limit === void 0) {
                limit = Infinity;
            }
            if (discharger === void 0) {
                discharger = function () {
                    return void 0;
                };
            }
            this.volume_ = volume;
            this.limit_ = limit;
            this.discharger_ = discharger;
        };
        Throttle.prototype.enqueue = function (entity) {
            if (this.isDrainable_()) {
                void this.processing_.push(entity);
                void this.resolver_(entity);
                return true;
            } else {
                this.queue_.push(entity);
                do {
                    void this.discharger_(this.queue_, this.processing_);
                } while (this.processing_.length + this.queue_.length > this.limit_);
                return false;
            }
        };
        Throttle.prototype.dequeue = function (entity) {
            var index = this.processing_.indexOf(entity);
            if (index > 0) {
                void this.processing_.splice(index, 1);
            } else {
                void this.processing_.shift();
            }
            if (this.queue_.length > 0 && this.isDrainable_()) {
                void this.enqueue(this.queue_.shift());
            }
        };
        Throttle.prototype.register = function (resolver) {
            this.resolver_ = resolver;
        };
        return Throttle;
    }();
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = Throttle;
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
define('src/stream/modular', [
    'require',
    'exports',
    'src/lib/throttle',
    'src/lib/tick',
    'src/lib/noop'
], function (require, exports, throttle_1, tick_2, noop_1) {
    'use strict';
    var ModularStream = function () {
        function ModularStream(procs, count, branched) {
            var _this = this;
            if (count === void 0) {
                count = 1;
            }
            this.procs = procs;
            this.count = count;
            this.branched = branched;
            this.read = this.read.bind(this);
            this.write = this.write.bind(this);
            void tick_2.Tick(function (_) {
                return 0 < _this.count && _this.count < Infinity && _this.throwCountDeprivedError();
            });
        }
        ModularStream.prototype.compose_ = function () {
            this.last_ = this.procs.map(function (msg) {
                return msg.clone();
            }).reduce(function (parent, child) {
                return parent.connect(child.root()) && child;
            });
            this.first_ = this.last_.root();
        };
        ModularStream.prototype.wrap = function (wrapper) {
            void this.compose_();
            var msg = this.last_;
            do {
                msg = msg.parent;
                msg.listener = wrap(msg.listener);
            } while (msg.parent);
            this.procs = [this.last_];
            return this;
            function wrap(listener) {
                return function (entity) {
                    return wrapper(entity, listener);
                };
            }
        };
        ModularStream.prototype.read_ = function (callback) {
            void --this.count;
            if (this.count < 0) {
                void this.throwCountExceededError();
            }
            void this.compose_();
            void this.last_.recv(callback);
        };
        ModularStream.prototype.read = function (callback) {
            var _this = this;
            if (callback === void 0) {
                callback = noop_1.noop;
            }
            var active = false;
            void this.read_(function (entity) {
                if (_this.flow_) {
                    void tick_2.Tick(function () {
                        return void _this.flow_.dequeue(entity);
                    });
                }
                if (active) {
                    void callback(entity);
                }
            });
            active = true;
            return this;
        };
        ModularStream.prototype.write_ = function (entity, cb) {
            void this.first_.send(entity, cb);
        };
        ModularStream.prototype.write = function (entity, cb) {
            if (this.flow_) {
                void this.flow_.enqueue(entity);
            } else {
                void this.write_(entity, cb);
            }
            return this;
        };
        ModularStream.prototype.flow = function (volume, limit, discharger) {
            var _this = this;
            if (limit === void 0) {
                limit = Infinity;
            }
            this.flow_ = new throttle_1.default();
            void this.flow_.flow(volume, limit, discharger);
            void this.flow_.register(function (entity) {
                return _this.write_(entity);
            });
            return this;
        };
        ModularStream.prototype.throwCountExceededError = function () {
            throw new Error('ArchStream: Import and read counts are exeeded.');
        };
        ModularStream.prototype.throwCountDeprivedError = function () {
            this.count = 0;
            throw new Error('ArchStream: Import and read counts are not deprived.');
        };
        return ModularStream;
    }();
    exports.ModularStream = ModularStream;
});
define('src/stream/compose', [
    'require',
    'exports',
    'src/stream/modular'
], function (require, exports, modular_1) {
    'use strict';
    var ComposeStream = function () {
        function ComposeStream(extract_) {
            this.extract_ = extract_;
            this.procs_ = [];
            this.branched_ = 0;
        }
        ComposeStream.prototype.register = function (procs) {
            var offset = this.procs_.length;
            void procs.reduceRight(function (procs, proc, i) {
                procs[i + offset] = proc;
                return procs;
            }, this.procs_);
            return this;
        };
        ComposeStream.prototype.import = function (module, MethodEntity) {
            var _this = this;
            void this.throwErrorIfNotImportable_(module, MethodEntity);
            if (MethodEntity) {
                module = new ComposeStream().import(module).export().wrap(function (entity, listener) {
                    return _this.extract_(entity) instanceof MethodEntity ? listener(entity) : 0;
                });
            }
            void --module.count;
            if (module.count < 0) {
                void module.throwCountExceededError();
            }
            void this.register(module.procs);
            return this;
        };
        ComposeStream.prototype.export = function (count) {
            return new modular_1.ModularStream(this.procs_, count, this.branched_);
        };
        ComposeStream.prototype.throwErrorIfNotImportable_ = function (module, MethodEntity) {
            if (MethodEntity) {
                if (module.branched > 0 || this.branched_ > 1) {
                    void --module.count;
                    void this.throwConditionalImportError();
                }
                this.branched_ = 1;
            } else {
                if (module.branched > 0 && this.branched_ > 0) {
                    void --module.count;
                    void this.throwConditionalImportError();
                }
                this.branched_ = module.branched > 0 ? module.branched + 1 : module.branched;
            }
        };
        ComposeStream.prototype.throwConditionalImportError = function () {
            throw new Error('ArchStream: Conditional import cannot call from different streams.');
        };
        return ComposeStream;
    }();
    exports.ComposeStream = ComposeStream;
});
define('src/stream/transform', [
    'require',
    'exports',
    'src/lib/message',
    'src/stream/compose',
    'src/stream/modular'
], function (require, exports, message_1, compose_1, modular_2) {
    'use strict';
    var ArchStream = function () {
        function ArchStream(parent_, message_) {
            var _this = this;
            if (message_ === void 0) {
                message_ = new message_1.Message();
            }
            this.parent_ = parent_;
            this.message_ = message_;
            this.proxies_ = [];
            if (this.parent_) {
                void this.parent_.proxies_.reduce(function (_, proxy) {
                    return _this.proxy(function () {
                        return proxy;
                    });
                }, void 0);
            }
        }
        ArchStream.prototype.pipe = function (callback) {
            return new ArchStream(this, this.message_.recv(callback));
        };
        ArchStream.prototype.import = function (pm, MethodEntity) {
            return pm instanceof modular_2.ModularStream ? new compose_1.ComposeStream().import(pm, MethodEntity) : new compose_1.ComposeStream(pm);
        };
        ArchStream.prototype.export = function (count) {
            return new compose_1.ComposeStream().register([this.message_]).export(count);
        };
        ArchStream.prototype.proxy = function (gen) {
            var _this = this;
            var proxy = typeof gen === 'function' ? gen() : gen;
            this.proxies_.push(proxy);
            void Object.keys(proxy).filter(function (prop) {
                return prop.length > 0 && prop[0] !== '_' && prop[prop.length - 1] !== '_';
            }).filter(function (prop) {
                return typeof proxy[prop] === 'function';
            }).reduce(function (_, method) {
                return _this[method] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    return compose(_this, method, args);
                };
            }, void 0);
            return this;
            function compose(self, method, args) {
                var params = self.proxies_.filter(function (proxy) {
                    return typeof proxy[method] === 'function';
                }).reduce(function (args, proxy) {
                    return toArray(proxy[method].apply(void 0, args) || args);
                }, args);
                var base = 'pipe';
                switch (method) {
                case base: {
                        return ArchStream.prototype[method].call(self, params[0]);
                    }
                case 'import': {
                        throw new Error('ArchStream: `import` method cannot extend by proxy.');
                    }
                case 'export': {
                        return (_a = ArchStream.prototype[method]).call.apply(_a, [compose(self, base, params)].concat(args));
                    }
                default: {
                        return compose(self, base, params);
                    }
                }
                function toArray(target) {
                    return Array.isArray(target) ? target : [target];
                }
                var _a;
            }
        };
        return ArchStream;
    }();
    exports.ArchStream = ArchStream;
});
define('src/proxy/case', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function default_1(index, indexer) {
        var map = Object.create(null);
        void index.reduce(function (_, method, i) {
            return map[method + ''] = i;
        }, void 0);
        return function (shadow) {
            return { pipe: pipe };
        };
        function pipe() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return function (entity) {
                var i = +map[indexer(entity) + ''];
                if (-1 < i && i < args.length) {
                    args[i](entity);
                }
            };
        }
    }
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = default_1;
});
define('src/proxy/hook', [
    'require',
    'exports',
    'src/lib/noop'
], function (require, exports, noop_2) {
    'use strict';
    function default_2(_a) {
        var _b = _a.pre, pre = _b === void 0 ? noop_2.noop : _b, _c = _a.post, post = _c === void 0 ? noop_2.noop : _c;
        return function (shadow) {
            return { pipe: pipe };
        };
        function pipe() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return args.map(function (proc) {
                return function (entity) {
                    pre(entity);
                    proc(entity);
                    post(entity);
                };
            });
        }
    }
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = default_2;
});
define('src/proxy/responsibility', [
    'require',
    'exports',
    'src/lib/noop'
], function (require, exports, noop_3) {
    'use strict';
    function default_3() {
        var proxy;
        return function (shadow) {
            return proxy = { rule: rule };
        };
        function rule(LocalEntity, extract) {
            proxy.pipe = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return args.map(function (callback) {
                    return function (entity) {
                        if (extract(entity) instanceof LocalEntity) {
                            callback(entity);
                        } else {
                            throw TypeError('ArchStream: ResponsibilityProxy: Uncovered internal entity.\n\t' + extract(entity).constructor);
                        }
                    };
                });
            };
            proxy.export = function () {
                return function (entity) {
                    if (extract(entity) instanceof LocalEntity) {
                        void Object.freeze(extract(entity));
                    }
                };
            };
            return noop_3.noop;
        }
    }
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = default_3;
});
define('src/lib/proxy', [
    'require',
    'exports',
    'src/proxy/case',
    'src/proxy/hook',
    'src/proxy/responsibility'
], function (require, exports, case_1, hook_1, responsibility_1) {
    'use strict';
    exports.Proxy = {
        Case: case_1.default,
        Hook: hook_1.default,
        Responsibility: responsibility_1.default
    };
});
define('src/lib/concat', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function concat(target, source) {
        for (var i = 0, len = source.length, offset = target.length; i < len; ++i) {
            target[i + offset] = source[i];
        }
        return target;
    }
    exports.concat = concat;
});
define('src/lib/observable', [
    'require',
    'exports',
    'src/lib/concat'
], function (require, exports, concat_1) {
    'use strict';
    var Observable = function () {
        function Observable() {
            this.node_ = {
                parent: void 0,
                childrenMap: Object.create(null),
                childrenList: [],
                registers: []
            };
        }
        Observable.prototype.monitor = function (namespace, subscriber, identifier) {
            var _this = this;
            if (identifier === void 0) {
                identifier = subscriber;
            }
            void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
            void this.seekNode_(namespace).registers.push([
                namespace,
                identifier,
                true,
                subscriber
            ]);
            return function () {
                return _this.off(namespace, identifier);
            };
        };
        Observable.prototype.on = function (namespace, subscriber, identifier) {
            var _this = this;
            if (identifier === void 0) {
                identifier = subscriber;
            }
            void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
            void this.seekNode_(namespace).registers.push([
                namespace,
                identifier,
                false,
                function (data) {
                    return subscriber(data);
                }
            ]);
            return function () {
                return _this.off(namespace, identifier);
            };
        };
        Observable.prototype.off = function (namespace, subscriber) {
            switch (typeof subscriber) {
            case 'function': {
                    void this.seekNode_(namespace).registers.some(function (_a, i, registers) {
                        var identifier = _a[1];
                        if (subscriber !== identifier)
                            return false;
                        switch (i) {
                        case 0: {
                                return !void registers.shift();
                            }
                        case registers.length - 1: {
                                return !void registers.pop();
                            }
                        default: {
                                return !void registers.splice(i, 1);
                            }
                        }
                    });
                    return;
                }
            case 'undefined': {
                    var node = this.seekNode_(namespace);
                    node.childrenMap = Object.create(null);
                    node.childrenList = [];
                    node.registers = [];
                    return;
                }
            default: {
                    throw this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
                }
            }
        };
        Observable.prototype.once = function (namespace, subscriber) {
            var _this = this;
            void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
            return this.on(namespace, function (data) {
                void _this.off(namespace, subscriber);
                return subscriber(data);
            }, subscriber);
        };
        Observable.prototype.emit = function (namespace, data, tracker) {
            void this.drain_(namespace, data, tracker);
        };
        Observable.prototype.reflect = function (namespace, data) {
            var results;
            void this.emit(namespace, data, function (_, r) {
                return results = r;
            });
            return results;
        };
        Observable.prototype.drain_ = function (types, data, tracker) {
            var results = [];
            void this.refsBelow_(this.seekNode_(types)).reduce(function (_, sub) {
                var monitor = sub[2], subscriber = sub[3];
                if (monitor)
                    return;
                try {
                    var result = subscriber(data);
                    if (tracker) {
                        results[results.length] = result;
                    }
                } catch (err) {
                    if (err !== void 0 && err !== null) {
                        void console.error(err + '');
                    }
                }
            }, void 0);
            void this.refsAbove_(this.seekNode_(types)).reduce(function (_, sub) {
                var monitor = sub[2], subscriber = sub[3];
                if (!monitor)
                    return;
                try {
                    void subscriber(data);
                } catch (err) {
                    if (err !== void 0 && err !== null) {
                        void console.error(err);
                    }
                }
            }, void 0);
            if (tracker) {
                try {
                    void tracker(data, results);
                } catch (err) {
                    void console.error(err);
                }
            }
        };
        Observable.prototype.refs = function (namespace) {
            return this.refsBelow_(this.seekNode_(namespace));
        };
        Observable.prototype.refsAbove_ = function (_a) {
            var parent = _a.parent, registers = _a.registers;
            registers = concat_1.concat([], registers);
            while (parent) {
                registers = concat_1.concat(registers, parent.registers);
                parent = parent.parent;
            }
            return registers;
        };
        Observable.prototype.refsBelow_ = function (_a) {
            var childrenList = _a.childrenList, childrenMap = _a.childrenMap, registers = _a.registers;
            registers = concat_1.concat([], registers);
            for (var i = 0; i < childrenList.length; ++i) {
                var name_1 = childrenList[i];
                var below = this.refsBelow_(childrenMap[name_1]);
                registers = concat_1.concat(registers, below);
                if (below.length === 0) {
                    void delete childrenMap[name_1];
                    void childrenList.splice(childrenList.indexOf(name_1), 1);
                    void --i;
                }
            }
            return registers;
        };
        Observable.prototype.seekNode_ = function (types) {
            var node = this.node_;
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var type = types_1[_i];
                var childrenMap = node.childrenMap;
                if (!childrenMap[type + '']) {
                    void node.childrenList.push(type + '');
                    node.childrenList = node.childrenList.sort();
                    childrenMap[type + ''] = {
                        parent: node,
                        childrenMap: Object.create(null),
                        childrenList: [],
                        registers: []
                    };
                }
                node = childrenMap[type + ''];
            }
            return node;
        };
        Observable.prototype.throwTypeErrorIfInvalidSubscriber_ = function (subscriber, types) {
            switch (typeof subscriber) {
            case 'function': {
                    return;
                }
            default: {
                    throw new TypeError('ArchStream: Observable: Invalid subscriber.\n\t' + (types, subscriber));
                }
            }
        };
        return Observable;
    }();
    exports.Observable = Observable;
});
define('src/lib/fingerprint', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    exports.FINGERPRINT = typeof window === 'object' ? browser() : server();
    function browser() {
        return hash(str2digit([
            stringify(window.navigator),
            stringify(window.screen),
            stringify(new Date().getTimezoneOffset())
        ].join()));
    }
    exports.browser = browser;
    function server() {
        return hash(str2digit([stringify(process)].join()));
    }
    exports.server = server;
    function hash(digit) {
        return digit.split('').reduce(function (a, b, i) {
            return (+b * i + a) % 1000000000 || a - +b;
        }, 0);
    }
    exports.hash = hash;
    function str2digit(str) {
        return str.split('').map(function (c) {
            return c.charCodeAt(0);
        }).join('');
    }
    exports.str2digit = str2digit;
    function stringify(obj, depth) {
        if (depth === void 0) {
            depth = 5;
        }
        if (depth > 0 && obj && typeof obj === 'object') {
            var str = '{';
            for (var p in obj) {
                str += '"' + p + '": ' + stringify(obj[p], depth - 1) + ',';
            }
            str += '}';
            return str;
        } else {
            return !obj || obj.toString ? '"' + obj + '"' : '"' + Object.prototype.toString.call(obj) + '"';
        }
    }
    exports.stringify = stringify;
});
define('src/lib/uuid', [
    'require',
    'exports',
    'src/lib/fingerprint'
], function (require, exports, fingerprint_1) {
    'use strict';
    var SEED = fingerprint_1.FINGERPRINT * Date.now() % 1000000000000000;
    if (!SEED || typeof SEED !== 'number' || SEED < 100 || 1000000000000000 < SEED)
        throw new Error('ArchStream: uuid: Invalid uuid static seed.\n\t' + fingerprint_1.FINGERPRINT);
    var FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
    var seed = SEED;
    function v4() {
        var k = seed = seed * Date.now() % 1000000000000000;
        if (k < 16 || 1000000000000000 < k)
            throw new Error('ArchStream: uuid: Invalid uuid dynamic seed.');
        var acc = '';
        for (var _i = 0, FORMAT_V4_1 = FORMAT_V4; _i < FORMAT_V4_1.length; _i++) {
            var c = FORMAT_V4_1[_i];
            if (c === 'x' || c === 'y') {
                var r = Math.random() * k % 16 | 0;
                var v = c == 'x' ? r : r & 3 | 8;
                acc += v.toString(16);
            } else {
                acc += c;
            }
        }
        return acc.toLowerCase();
    }
    exports.v4 = v4;
});
define('src/lib/dict/datamap', [
    'require',
    'exports',
    'src/lib/uuid'
], function (require, exports, uuid_1) {
    'use strict';
    var UNIQUE_SEPARATOR = '\uDFFF' + uuid_1.v4().slice(-4) + '\uDBFF';
    function serialize(key) {
        var acc = '';
        for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
            var k = key_1[_i];
            acc += k + UNIQUE_SEPARATOR;
        }
        return acc;
    }
    var DataMap = function () {
        function DataMap() {
            this.store = Object.create(null);
            void this.reset_();
        }
        DataMap.prototype.get = function (key) {
            return (this.store[serialize(key)] || [])[1];
        };
        DataMap.prototype.set = function (key, val) {
            void this.reset_();
            return (this.store[serialize(key)] = [
                key,
                val
            ])[1];
        };
        DataMap.prototype.has = function (key) {
            return !!this.store[serialize(key)];
        };
        DataMap.prototype.delete = function (key) {
            void this.reset_();
            return void delete this.store[serialize(key)];
        };
        DataMap.prototype.clear = function () {
            void this.reset_();
            this.store = Object.create(null);
        };
        DataMap.prototype.reset_ = function () {
            this.size_ = NaN;
            this.entries_ = void 0;
        };
        Object.defineProperty(DataMap.prototype, 'size', {
            get: function () {
                return this.size_ >= 0 ? this.size_ : this.size_ = Object.keys(this.store).length;
            },
            enumerable: true,
            configurable: true
        });
        DataMap.prototype.entries = function () {
            var _this = this;
            return this.entries_ ? this.entries_ : this.entries_ = Object.keys(this.store).map(function (key) {
                return _this.store[key];
            });
        };
        return DataMap;
    }();
    exports.DataMap = DataMap;
});
define('src/lib/dict/dataset', [
    'require',
    'exports',
    'src/lib/dict/datamap'
], function (require, exports, datamap_1) {
    'use strict';
    var DataSet = function () {
        function DataSet(replacer) {
            this.replacer = replacer;
            this.store = new datamap_1.DataMap();
        }
        DataSet.prototype.get = function (key) {
            return this.store.get(key);
        };
        DataSet.prototype.add = function (key, val) {
            if (!this.has(key))
                return this.store.set(key, val);
            if (!this.replacer)
                throw new Error('ArchStream: Set: Cannot overwrite value of set without replacer.');
            return this.store.set(key, this.replacer(this.get(key), val));
        };
        DataSet.prototype.has = function (key) {
            return this.store.has(key);
        };
        DataSet.prototype.delete = function (key) {
            return void this.store.delete(key);
        };
        DataSet.prototype.clear = function () {
            return void this.store.clear();
        };
        Object.defineProperty(DataSet.prototype, 'size', {
            get: function () {
                return this.store.size;
            },
            enumerable: true,
            configurable: true
        });
        DataSet.prototype.entries = function () {
            return this.store.entries();
        };
        return DataSet;
    }();
    exports.DataSet = DataSet;
});
define('src/lib/supervisor', [
    'require',
    'exports',
    'src/lib/observable',
    'src/lib/dict/dataset',
    'src/lib/tick',
    'src/lib/thenable',
    'src/lib/concat',
    'src/lib/noop'
], function (require, exports, observable_1, dataset_1, tick_3, thenable_2, concat_2, noop_4) {
    'use strict';
    var Supervisor = function () {
        function Supervisor(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? '' : _c, _d = _b.dependencies, dependencies = _d === void 0 ? [] : _d, _e = _b.retry, retry = _e === void 0 ? false : _e, _f = _b.timeout, timeout = _f === void 0 ? 0 : _f, _g = _b.destructor, destructor = _g === void 0 ? noop_4.noop : _g;
            this.deps = new dataset_1.DataSet();
            this.events = {
                exec: new observable_1.Observable(),
                fail: new observable_1.Observable(),
                loss: new observable_1.Observable(),
                exit: new observable_1.Observable()
            };
            this.procs = new observable_1.Observable();
            this.alive = true;
            this.registerable = true;
            this.scheduled = false;
            this.workerSharedResource = {
                procs: this.procs,
                dependenciesStack: []
            };
            this.queue = [];
            if (this.constructor === Supervisor)
                throw new Error('ArchStream: Supervisor: Cannot instantiate abstract classes.');
            this.name = name;
            void dependencies.reduce(function (_, _a) {
                var namespace = _a[0], deps = _a[1];
                return void _this.deps.add(namespace, deps);
            }, void 0);
            this.retry = retry;
            this.timeout = timeout;
            this.destructor_ = destructor;
            void ++this.constructor.count;
        }
        Supervisor.prototype.destructor = function (reason) {
            void this.checkState();
            this.alive = false;
            while (this.queue.length > 0) {
                var _a = this.queue.shift(), namespace = _a[0], data = _a[1];
                void this.events.loss.emit(namespace, [
                    namespace,
                    void 0,
                    data
                ]);
            }
            try {
                void this.destructor_(reason);
            } catch (err) {
                void console.error(err);
            }
            void --this.constructor.count;
            void Object.freeze(this);
        };
        Supervisor.prototype.schedule = function () {
            var _this = this;
            if (!this.alive)
                return;
            if (this.scheduled)
                return;
            void tick_3.Tick(function (_) {
                if (!_this.alive)
                    return;
                _this.scheduled = false;
                void _this.drain();
            });
            this.scheduled = true;
        };
        Supervisor.prototype.register = function (namespace, process) {
            void this.checkState();
            if (!this.registerable)
                throw new Error('ArchStream: Supervisor: Supervisor ' + this.name + ' cannot register process during the exiting.');
            namespace = concat_2.concat([], namespace);
            void this.schedule();
            return new Worker(this, this.workerSharedResource, namespace, process, this.deps.get(namespace) || []).terminate;
        };
        Supervisor.prototype.call = function (namespace, data, timeout, callback) {
            var _this = this;
            if (timeout === void 0) {
                timeout = this.timeout;
            }
            if (callback === void 0) {
                callback = noop_4.noop;
            }
            void this.checkState();
            namespace = concat_2.concat([], namespace);
            void this.queue.push([
                namespace,
                data,
                function (data, results) {
                    return void callback(results, data);
                },
                timeout,
                Date.now()
            ]);
            void this.schedule();
            if (timeout > 0 === false)
                return;
            void setTimeout(function () {
                return _this.drain(namespace);
            }, timeout);
        };
        Supervisor.prototype.cast = function (namespace, data, retry) {
            if (retry === void 0) {
                retry = this.retry;
            }
            void this.checkState();
            var results = this.procs.reflect(namespace, new WorkerCommand_$Call(data));
            if (results.length === 0) {
                void this.events.fail.emit(namespace, [
                    namespace,
                    void 0,
                    data
                ]);
            }
            return results.length > 0 || !retry ? results : this.cast(namespace, data, false);
        };
        Supervisor.prototype.refs = function (namespace) {
            void this.checkState();
            return this.procs.refs(namespace).map(function (_a) {
                var namespace = _a[0], recv = _a[1];
                var worker = recv(void 0);
                return [
                    worker.namespace,
                    worker.process,
                    worker.terminate
                ];
            });
        };
        Supervisor.prototype.terminate = function (namespace, reason) {
            void this.checkState();
            if (namespace === void 0) {
                this.registerable = false;
            }
            void this.procs.emit(namespace || [], new WorkerCommand_$Exit(reason));
            void this.procs.off(namespace || []);
            if (namespace === void 0) {
                void this.destructor(reason);
            }
        };
        Supervisor.prototype.checkState = function () {
            if (!this.alive)
                throw new Error('ArchStream: Supervisor: Supervisor ' + this.name + ' already exited.');
        };
        Supervisor.prototype.drain = function (target) {
            if (target === void 0) {
                target = [];
            }
            var now = Date.now();
            var _loop_1 = function (i) {
                var _a = this_1.queue[i], namespace = _a[0], data = _a[1], callback = _a[2], timeout = _a[3], since = _a[4];
                var results = target.every(function (n, i) {
                    return n === namespace[i];
                }) ? this_1.procs.reflect(namespace, new WorkerCommand_$Call(data)) : [];
                if (results.length === 0) {
                    void this_1.events.fail.emit(namespace, [
                        namespace,
                        void 0,
                        data
                    ]);
                }
                if (results.length === 0 && now < since + timeout)
                    return out_i_1 = i, 'continue';
                i === 0 ? void this_1.queue.shift() : void this_1.queue.splice(i, 1);
                void --i;
                if (results.length === 0) {
                    void this_1.events.loss.emit(namespace, [
                        namespace,
                        void 0,
                        data
                    ]);
                }
                if (!callback)
                    return out_i_1 = i, 'continue';
                try {
                    void callback(data, results);
                } catch (err) {
                    void console.error(err);
                }
                out_i_1 = i;
            };
            var out_i_1;
            var this_1 = this;
            for (var i = 0; i < this.queue.length; ++i) {
                var state_1 = _loop_1(i);
                i = out_i_1;
                if (state_1 === 'continue')
                    continue;
            }
        };
        Supervisor.count = 0;
        Supervisor.procs = 0;
        return Supervisor;
    }();
    exports.Supervisor = Supervisor;
    var AbstractWorkerCommand = function () {
        function AbstractWorkerCommand() {
        }
        return AbstractWorkerCommand;
    }();
    var WorkerCommand_$Deps = function (_super) {
        __extends(WorkerCommand_$Deps, _super);
        function WorkerCommand_$Deps(namespace) {
            _super.call(this);
            this.namespace = namespace;
        }
        return WorkerCommand_$Deps;
    }(AbstractWorkerCommand);
    var WorkerCommand_$Call = function (_super) {
        __extends(WorkerCommand_$Call, _super);
        function WorkerCommand_$Call(data) {
            _super.call(this);
            this.data = data;
        }
        return WorkerCommand_$Call;
    }(AbstractWorkerCommand);
    var WorkerCommand_$Exit = function (_super) {
        __extends(WorkerCommand_$Exit, _super);
        function WorkerCommand_$Exit(reason) {
            _super.call(this);
            this.reason = reason;
        }
        return WorkerCommand_$Exit;
    }(AbstractWorkerCommand);
    var Worker = function () {
        function Worker(sv, sharedResource, namespace, process, dependencies) {
            var _this = this;
            this.sv = sv;
            this.sharedResource = sharedResource;
            this.namespace = namespace;
            this.process = process;
            this.dependencies = dependencies;
            this.alive = true;
            this.called = false;
            this.concurrency = 1;
            this.receive = function (cmd) {
                return Worker.prototype.receive.call(_this, cmd);
            };
            this.terminate = function (reason) {
                return Worker.prototype.terminate.call(_this, reason);
            };
            this.sharedResource.allRefsCache = void 0;
            void ++this.sv.constructor.procs;
            void this.sharedResource.procs.on(namespace, this.receive);
        }
        Worker.prototype.destructor = function (reason) {
            void this.checkState();
            void this.sharedResource.procs.off(this.namespace, this.receive);
            this.alive = false;
            void --this.sv.constructor.procs;
            this.sharedResource.allRefsCache = void 0;
            void Object.freeze(this);
            void this.sv.events.exit.emit(this.namespace, [
                this.namespace,
                this.process,
                reason
            ]);
        };
        Worker.prototype.tryDependencyResolving = function (cmd) {
            if (this.receive(new WorkerCommand_$Deps(this.namespace))) {
                this.sharedResource.dependenciesStack = [];
                return;
            } else {
                this.sharedResource.dependenciesStack = [];
                throw void 0;
            }
        };
        Worker.prototype.receive = function (cmd) {
            var _this = this;
            void this.checkState();
            if (cmd === void 0) {
                return this;
            }
            if (cmd instanceof WorkerCommand_$Deps) {
                if (cmd.namespace.length !== this.namespace.length)
                    return false;
                if (this.concurrency === 0)
                    return false;
                for (var _i = 0, _a = this.sharedResource.dependenciesStack; _i < _a.length; _i++) {
                    var stacked = _a[_i];
                    if (equal(this.namespace, stacked))
                        return true;
                }
                void this.sharedResource.dependenciesStack.push(this.namespace);
                return this.dependencies.every(function (dep) {
                    return (_this.sharedResource.allRefsCache = _this.sharedResource.allRefsCache || _this.sharedResource.procs.refs([])).some(function (_a) {
                        var ns = _a[0], proc = _a[1];
                        return equal(ns, dep) && !!proc(new WorkerCommand_$Deps(dep));
                    });
                });
            }
            if (cmd instanceof WorkerCommand_$Call) {
                if (this.concurrency === 0)
                    throw void 0;
                void this.tryDependencyResolving(cmd);
                if (!this.called) {
                    this.called = true;
                    void this.sv.events.exec.emit(this.namespace, [
                        this.namespace,
                        this.process
                    ]);
                }
                try {
                    void --this.concurrency;
                    var result = (0, this.process)(cmd.data);
                    if (thenable_2.isThenable(result)) {
                        void result.then(function (_) {
                            void _this.sv.schedule();
                            if (!_this.alive)
                                return;
                            void ++_this.concurrency;
                        }, function (reason) {
                            void _this.sv.schedule();
                            if (!_this.alive)
                                return;
                            void ++_this.concurrency;
                            void _this.terminate(reason);
                        });
                    } else {
                        void ++this.concurrency;
                    }
                    return result;
                } catch (reason) {
                    void this.terminate(reason);
                    throw void 0;
                }
            }
            if (cmd instanceof WorkerCommand_$Exit) {
                void this.terminate(cmd.reason);
                throw void 0;
            }
            throw new TypeError('ArchStream: Supervisor: Invalid command: ' + cmd);
        };
        Worker.prototype.terminate = function (reason) {
            void this.destructor(reason);
        };
        Worker.prototype.checkState = function () {
            if (!this.alive)
                throw new Error('ArchStream: Supervisor: Process ' + this.namespace + '/' + this.process + ' already exited.');
        };
        return Worker;
    }();
    function equal(a, b) {
        if (a === b)
            return true;
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
});
define('src/lib/monad/monad', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var Monad = function () {
        function Monad(thunk) {
            this.thunk = thunk;
        }
        Monad.prototype.extract = function (transform) {
            return this.evaluate().extract(transform);
        };
        Monad.prototype.evaluate = function () {
            return this.memory_ = this.memory_ || this.thunk();
        };
        Monad.prototype.assert = function (type) {
            return this;
        };
        return Monad;
    }();
    exports.Monad = Monad;
});
define('src/lib/monad/maybe.impl', [
    'require',
    'exports',
    'src/lib/monad/monad'
], function (require, exports, monad_1) {
    'use strict';
    var Maybe = function (_super) {
        __extends(Maybe, _super);
        function Maybe(thunk) {
            _super.call(this, thunk);
            this.thunk = thunk;
        }
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
                throw new TypeError('ArchStream: Maybe: Invalid monad value.\n\t' + m);
            });
        };
        Maybe.prototype.extract = function (transform) {
            return _super.prototype.extract.call(this, transform);
        };
        Maybe.prototype.assert = function (type) {
            return this;
        };
        return Maybe;
    }(monad_1.Monad);
    exports.Maybe = Maybe;
    var Just = function (_super) {
        __extends(Just, _super);
        function Just(val_) {
            _super.call(this);
            this.val_ = val_;
        }
        Just.prototype.bind = function (f) {
            var _this = this;
            return new Maybe(function () {
                return _this;
            }).bind(f);
        };
        Just.prototype.extract = function (transform) {
            return this.val_;
        };
        Just.prototype.assert = function (type) {
            return this;
        };
        return Just;
    }(Maybe);
    exports.Just = Just;
    var Nothing = function (_super) {
        __extends(Nothing, _super);
        function Nothing() {
            _super.apply(this, arguments);
        }
        Nothing.prototype.bind = function (f) {
            return this;
        };
        Nothing.prototype.extract = function (transform) {
            if (!transform)
                throw void 0;
            return transform();
        };
        Nothing.prototype.assert = function (type) {
            return this;
        };
        return Nothing;
    }(Maybe);
    exports.Nothing = Nothing;
});
define('src/lib/monad/maybe', [
    'require',
    'exports',
    'src/lib/monad/maybe.impl'
], function (require, exports, maybe_impl_1) {
    'use strict';
    var Maybe;
    (function (Maybe) {
        function Just(val) {
            return new maybe_impl_1.Just(val);
        }
        Maybe.Just = Just;
        Maybe.Nothing = new maybe_impl_1.Nothing();
        Maybe.Return = Just;
    }(Maybe = exports.Maybe || (exports.Maybe = {})));
    exports.Just = Maybe.Just;
    exports.Nothing = Maybe.Nothing;
    exports.Return = exports.Just;
});
define('src/lib/monad/either.impl', [
    'require',
    'exports',
    'src/lib/monad/monad'
], function (require, exports, monad_2) {
    'use strict';
    var Either = function (_super) {
        __extends(Either, _super);
        function Either(thunk) {
            _super.call(this, thunk);
            this.thunk = thunk;
        }
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
                throw new TypeError('ArchStream: Either: Invalid monad value.\n\t' + m);
            });
        };
        Either.prototype.extract = function (transform) {
            return _super.prototype.extract.call(this, transform);
        };
        Either.prototype.assert = function (type) {
            return this;
        };
        return Either;
    }(monad_2.Monad);
    exports.Either = Either;
    var Left = function (_super) {
        __extends(Left, _super);
        function Left(val_) {
            _super.call(this);
            this.val_ = val_;
        }
        Left.prototype.bind = function (f) {
            return this;
        };
        Left.prototype.extract = function (transform) {
            if (!transform)
                throw this.val_;
            return transform(this.val_);
        };
        Left.prototype.assert = function (type) {
            return this;
        };
        return Left;
    }(Either);
    exports.Left = Left;
    var Right = function (_super) {
        __extends(Right, _super);
        function Right(val_) {
            _super.call(this);
            this.val_ = val_;
        }
        Right.prototype.bind = function (f) {
            var _this = this;
            return new Either(function () {
                return _this;
            }).bind(f);
        };
        Right.prototype.extract = function (transform) {
            return this.val_;
        };
        Right.prototype.assert = function (type) {
            return this;
        };
        return Right;
    }(Either);
    exports.Right = Right;
});
define('src/lib/monad/either', [
    'require',
    'exports',
    'src/lib/monad/either.impl'
], function (require, exports, either_impl_1) {
    'use strict';
    var Either;
    (function (Either) {
        function Left(val) {
            return new either_impl_1.Left(val);
        }
        Either.Left = Left;
        function Right(val) {
            return new either_impl_1.Right(val);
        }
        Either.Right = Right;
        Either.Return = Right;
    }(Either = exports.Either || (exports.Either = {})));
    exports.Left = Either.Left;
    exports.Right = Either.Right;
    exports.Return = Either.Return;
});
define('src/lib/sqid', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var cnt = 0;
    function sqid(id) {
        return id === void 0 ? (1000000000000000 + ++cnt + '').slice(1) : (1000000000000000 + id + '').slice(1);
    }
    exports.sqid = sqid;
});
define('src/lib/dict/weakmap', [
    'require',
    'exports',
    'src/lib/uuid',
    'src/lib/sqid'
], function (require, exports, uuid_2, sqid_1) {
    'use strict';
    var UNIQUE_ATTRIBUTE = '' + uuid_2.v4();
    function store(obj) {
        return obj[UNIQUE_ATTRIBUTE] ? obj[UNIQUE_ATTRIBUTE] : Object.defineProperty(obj, UNIQUE_ATTRIBUTE, {
            value: Object.create(null),
            enumerable: false,
            writable: false,
            configurable: true
        })[UNIQUE_ATTRIBUTE];
    }
    var WeakMap = function () {
        function WeakMap() {
            this.id = +sqid_1.sqid();
        }
        WeakMap.prototype.get = function (key) {
            return (store(key)[this.id] || [])[0];
        };
        WeakMap.prototype.set = function (key, val) {
            return (store(key)[this.id] = [val])[0];
        };
        WeakMap.prototype.has = function (key) {
            return !!store(key)[this.id];
        };
        WeakMap.prototype.delete = function (key) {
            void delete store(key)[this.id];
        };
        return WeakMap;
    }();
    exports.WeakMap = WeakMap;
});
define('src/lib/dict/map', [
    'require',
    'exports',
    'src/lib/dict/weakmap',
    'src/lib/concat',
    'src/lib/sqid'
], function (require, exports, weakmap_1, concat_3, sqid_2) {
    'use strict';
    var PrimitiveTypes = (_a = {}, _a[typeof void 0] = true, _a[typeof true] = true, _a[typeof 0] = true, _a[typeof ''] = true, _a);
    function isPrimitive(target) {
        return PrimitiveTypes[typeof target] || target instanceof Object === false;
    }
    var Map = function () {
        function Map() {
            this.pstore = Object.create(null);
            this.ostore = Object.create(null);
            this.weakstore = new weakmap_1.WeakMap();
            void this.reset_();
        }
        Map.prototype.get = function (key) {
            return isPrimitive(key) ? (this.pstore[typeof key + key] || [])[1] : (this.weakstore.get(key) || [])[1];
        };
        Map.prototype.set = function (key, val) {
            void this.reset_();
            if (isPrimitive(key)) {
                this.pstore[typeof key + key] = [
                    key,
                    val
                ];
            } else {
                var id = +sqid_2.sqid();
                void this.weakstore.set(key, [
                    id,
                    val
                ])[1];
                this.ostore[id] = [
                    key,
                    val,
                    id
                ];
            }
            return val;
        };
        Map.prototype.has = function (key) {
            return isPrimitive(key) ? !!this.pstore[typeof key + key] : this.weakstore.has(key);
        };
        Map.prototype.delete = function (key) {
            void this.reset_();
            if (isPrimitive(key)) {
                void delete this.pstore[typeof key + key];
            } else {
                void delete this.ostore[(this.weakstore.get(key) || [])[0]];
                void this.weakstore.delete(key);
            }
        };
        Map.prototype.clear = function () {
            var _this = this;
            void this.reset_();
            void Object.keys(this.ostore).forEach(function (id) {
                return void _this.delete(_this.ostore[id][0]);
            });
            this.weakstore = new weakmap_1.WeakMap();
            this.pstore = Object.create(null);
            this.ostore = Object.create(null);
        };
        Map.prototype.reset_ = function () {
            this.size_ = NaN;
            this.entries_ = void 0;
        };
        Object.defineProperty(Map.prototype, 'size', {
            get: function () {
                return this.size_ >= 0 ? this.size_ : this.size_ = Object.keys(this.pstore).length + Object.keys(this.ostore).length;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.entries = function () {
            var _this = this;
            return this.entries_ ? this.entries_ : this.entries_ = concat_3.concat(Object.keys(this.pstore).map(function (key) {
                return [
                    _this.pstore[key][0],
                    _this.pstore[key][1]
                ];
            }), Object.keys(this.ostore).map(function (key) {
                return [
                    _this.ostore[key][0],
                    _this.ostore[key][1]
                ];
            }));
        };
        return Map;
    }();
    exports.Map = Map;
    var _a;
});
define('src/lib/dict/attrmap', [
    'require',
    'exports',
    'src/lib/dict/map',
    'src/lib/dict/weakmap'
], function (require, exports, map_1, weakmap_2) {
    'use strict';
    var AttrMap = function () {
        function AttrMap() {
            this.store = new weakmap_2.WeakMap();
        }
        AttrMap.prototype.get = function (obj, key) {
            return this.store.get(obj) && this.store.get(obj).get(key);
        };
        AttrMap.prototype.set = function (obj, key, val) {
            return (this.store.get(obj) || this.store.set(obj, new map_1.Map())).set(key, val);
        };
        AttrMap.prototype.has = function (obj, key) {
            return this.store.has(obj) && this.store.get(obj).has(key);
        };
        AttrMap.prototype.delete = function (obj, key) {
            return key === void 0 ? this.store.delete(obj) : this.store.get(obj) && this.store.get(obj).delete(key);
        };
        return AttrMap;
    }();
    exports.AttrMap = AttrMap;
    var _a;
});
define('src/lib/dict/relationmap', [
    'require',
    'exports',
    'src/lib/dict/weakmap'
], function (require, exports, weakmap_3) {
    'use strict';
    var RelationMap = function () {
        function RelationMap() {
            this.store = new weakmap_3.WeakMap();
        }
        RelationMap.prototype.get = function (source, target) {
            return this.store.get(source) && this.store.get(source).get(target);
        };
        RelationMap.prototype.set = function (source, target, val) {
            return (this.store.get(source) || this.store.set(source, new weakmap_3.WeakMap())).set(target, val);
        };
        RelationMap.prototype.has = function (source, target) {
            return this.store.has(source) && this.store.get(source).has(target);
        };
        RelationMap.prototype.delete = function (source, target) {
            return target === void 0 ? this.store.delete(source) : this.store.get(source) && this.store.get(source).delete(target);
        };
        return RelationMap;
    }();
    exports.RelationMap = RelationMap;
    var _a;
});
define('src/lib/dict/set', [
    'require',
    'exports',
    'src/lib/dict/map'
], function (require, exports, map_2) {
    'use strict';
    var Set = function () {
        function Set(replacer) {
            this.replacer = replacer;
            this.store = new map_2.Map();
        }
        Set.prototype.get = function (key) {
            return this.store.get(key);
        };
        Set.prototype.add = function (key, val) {
            if (!this.has(key))
                return this.store.set(key, val);
            if (!this.replacer)
                throw new Error('ArchStream: Set: Cannot overwrite value of set without replacer.');
            return this.store.set(key, this.replacer(this.get(key), val));
        };
        Set.prototype.has = function (key) {
            return this.store.has(key);
        };
        Set.prototype.delete = function (key) {
            return void this.store.delete(key);
        };
        Set.prototype.clear = function () {
            return void this.store.clear();
        };
        Object.defineProperty(Set.prototype, 'size', {
            get: function () {
                return this.store.size;
            },
            enumerable: true,
            configurable: true
        });
        Set.prototype.entries = function () {
            return this.store.entries();
        };
        return Set;
    }();
    exports.Set = Set;
    var _a;
});
define('src/lib/dict/weakset', [
    'require',
    'exports',
    'src/lib/dict/weakmap'
], function (require, exports, weakmap_4) {
    'use strict';
    var WeakSet = function () {
        function WeakSet(replacer) {
            this.replacer = replacer;
            this.store = new weakmap_4.WeakMap();
        }
        WeakSet.prototype.get = function (key) {
            return this.store.get(key);
        };
        WeakSet.prototype.add = function (key, val) {
            if (!this.has(key))
                return this.store.set(key, val);
            if (!this.replacer)
                throw new Error('ArchStream: WeakSet: Cannot overwrite value of set without replacer.');
            return this.store.set(key, this.replacer(this.get(key), val));
        };
        WeakSet.prototype.has = function (key) {
            return this.store.has(key);
        };
        WeakSet.prototype.delete = function (key) {
            void this.store.delete(key);
        };
        return WeakSet;
    }();
    exports.WeakSet = WeakSet;
    var _a;
});
define('src/lib/dict/attrset', [
    'require',
    'exports',
    'src/lib/dict/set',
    'src/lib/dict/weakmap'
], function (require, exports, set_1, weakmap_5) {
    'use strict';
    var AttrSet = function () {
        function AttrSet(replacer) {
            this.replacer = replacer;
            this.store = new weakmap_5.WeakMap();
        }
        AttrSet.prototype.get = function (obj, key) {
            return this.store.get(obj) && this.store.get(obj).get(key);
        };
        AttrSet.prototype.add = function (obj, key, val) {
            return (this.store.get(obj) || this.store.set(obj, new set_1.Set(this.replacer))).add(key, val);
        };
        AttrSet.prototype.has = function (obj, key) {
            return this.store.has(obj) && this.store.get(obj).has(key);
        };
        AttrSet.prototype.delete = function (obj, key) {
            return key === void 0 ? this.store.delete(obj) : this.store.get(obj) && this.store.get(obj).delete(key);
        };
        return AttrSet;
    }();
    exports.AttrSet = AttrSet;
    var _a;
});
define('src/lib/dict/relationset', [
    'require',
    'exports',
    'src/lib/dict/weakset',
    'src/lib/dict/weakmap'
], function (require, exports, weakset_1, weakmap_6) {
    'use strict';
    var RelationSet = function () {
        function RelationSet(replacer) {
            this.replacer = replacer;
            this.store = new weakmap_6.WeakMap();
        }
        RelationSet.prototype.get = function (source, target) {
            return this.store.get(source) && this.store.get(source).get(target);
        };
        RelationSet.prototype.add = function (source, target, val) {
            return (this.store.get(source) || this.store.set(source, new weakset_1.WeakSet(this.replacer))).add(target, val);
        };
        RelationSet.prototype.has = function (source, target) {
            return this.store.has(source) && this.store.get(source).has(target);
        };
        RelationSet.prototype.delete = function (source, target) {
            return target === void 0 ? this.store.delete(source) : this.store.get(source) && this.store.get(source).delete(target);
        };
        return RelationSet;
    }();
    exports.RelationSet = RelationSet;
    var _a;
});
define('src/lib/timer', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function Timer(_a) {
        var _b = _a.begin, begin = _b === void 0 ? 0 : _b, _c = _a.end, end = _c === void 0 ? 1000 * 3600 * 24 : _c, _d = _a.step, step = _d === void 0 ? function (prev) {
                return (prev || 1) * 3;
            } : _d, _e = _a.precond, precond = _e === void 0 ? function () {
                return true;
            } : _e, _f = _a.task, task = _f === void 0 ? function () {
                return void 0;
            } : _f, _g = _a.postcond, postcond = _g === void 0 ? function () {
                return true;
            } : _g, _h = _a.complete, complete = _h === void 0 ? function () {
                return 0;
            } : _h, _j = _a.error, error = _j === void 0 ? function () {
                return 0;
            } : _j, _k = _a.timeout, timeout = _k === void 0 ? function () {
                return 0;
            } : _k, _l = _a.since, since = _l === void 0 ? Date.now() : _l;
        begin = begin < 0 ? 0 : begin;
        void setTimeout(function () {
            try {
                if (precond()) {
                    var result = task();
                    if (postcond())
                        return void complete(result);
                }
            } catch (err) {
                return void error(err);
            }
            var now = Date.now();
            var next = step(now - since);
            if (end - (now - since) <= 0)
                return void timeout();
            void Timer({
                precond: precond,
                task: task,
                postcond: postcond,
                complete: complete,
                timeout: timeout,
                begin: begin + next,
                end: end,
                step: step,
                since: since
            });
        }, begin);
    }
    exports.Timer = Timer;
    var _a;
});
define('src/lib/assign', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    exports.assign = template(function (key, target, source) {
        return target[key] = source[key];
    });
    exports.clone = template(function (key, target, source) {
        switch (type(source[key])) {
        case 'Array': {
                return target[key] = exports.clone([], source[key]);
            }
        case 'Function':
        case 'Object': {
                return target[key] = exports.clone({}, source[key]);
            }
        default: {
                return target[key] = source[key];
            }
        }
    });
    exports.extend = template(function (key, target, source) {
        switch (type(source[key])) {
        case 'Array': {
                return target[key] = exports.extend([], source[key]);
            }
        case 'Function':
        case 'Object': {
                switch (type(target[key])) {
                case 'Function':
                case 'Object': {
                        return target[key] = exports.extend(target[key], source[key]);
                    }
                default: {
                        return target[key] = exports.extend({}, source[key]);
                    }
                }
            }
        default: {
                return target[key] = source[key];
            }
        }
    });
    function template(cb) {
        return function walk(target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            if (target === undefined || target === null) {
                throw new TypeError('ArchStream: assign: Cannot walk on ' + target + '.');
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
                        void cb(key, Object(target), Object(source));
                    }
                }
            }
            return Object(target);
        };
    }
    function type(target) {
        return Object.prototype.toString.call(target).split(' ').pop().slice(0, -1);
    }
    var _a;
});
define('src/export', [
    'require',
    'exports',
    'src/stream/transform',
    'src/lib/message',
    'src/lib/proxy',
    'src/lib/supervisor',
    'src/lib/observable',
    'src/lib/monad/maybe',
    'src/lib/monad/either',
    'src/lib/dict/map',
    'src/lib/dict/datamap',
    'src/lib/dict/weakmap',
    'src/lib/dict/attrmap',
    'src/lib/dict/relationmap',
    'src/lib/dict/set',
    'src/lib/dict/dataset',
    'src/lib/dict/weakset',
    'src/lib/dict/attrset',
    'src/lib/dict/relationset',
    'src/lib/tick',
    'src/lib/timer',
    'src/lib/fingerprint',
    'src/lib/uuid',
    'src/lib/sqid',
    'src/lib/assign',
    'src/lib/concat',
    'src/stream/transform'
], function (require, exports, transform_1, message_2, proxy_1, supervisor_1, observable_2, maybe_1, either_1, map_3, datamap_2, weakmap_7, attrmap_1, relationmap_1, set_2, dataset_2, weakset_2, attrset_1, relationset_1, tick_4, timer_1, fingerprint_2, uuid_3, sqid_3, assign_1, concat_4, transform_2) {
    'use strict';
    exports.ArchStream = transform_1.ArchStream;
    exports.Message = message_2.Message;
    exports.Proxy = proxy_1.Proxy;
    exports.Supervisor = supervisor_1.Supervisor;
    exports.Observable = observable_2.Observable;
    exports.Maybe = maybe_1.Maybe;
    exports.Just = maybe_1.Just;
    exports.Nothing = maybe_1.Nothing;
    exports.Either = either_1.Either;
    exports.Left = either_1.Left;
    exports.Right = either_1.Right;
    exports.Map = map_3.Map;
    exports.DataMap = datamap_2.DataMap;
    exports.WeakMap = weakmap_7.WeakMap;
    exports.AttrMap = attrmap_1.AttrMap;
    exports.RelationMap = relationmap_1.RelationMap;
    exports.Set = set_2.Set;
    exports.DataSet = dataset_2.DataSet;
    exports.WeakSet = weakset_2.WeakSet;
    exports.AttrSet = attrset_1.AttrSet;
    exports.RelationSet = relationset_1.RelationSet;
    exports.Tick = tick_4.Tick;
    exports.Timer = timer_1.Timer;
    exports.FINGERPRINT = fingerprint_2.FINGERPRINT;
    exports.uuid = uuid_3.v4;
    exports.sqid = sqid_3.sqid;
    exports.assign = assign_1.assign;
    exports.clone = assign_1.clone;
    exports.extend = assign_1.extend;
    exports.concat = concat_4.concat;
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = A;
    function A() {
        return new transform_2.ArchStream();
    }
    var _a;
});
define('arch-stream', [
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
    var _a;
});