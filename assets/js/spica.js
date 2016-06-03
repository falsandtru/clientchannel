/*! spica v0.0.4 https://github.com/falsandtru/spica | (c) 2016, falsandtru | undefined License (undefined) */
define = typeof define === 'function' && define.amd
  ? define
  : (function () {
    'use strict';
    var name = 'spica',
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
                    throw new TypeError('Spica: Observable: Invalid subscriber.\n\t' + (types, subscriber));
                }
            }
        };
        return Observable;
    }();
    exports.Observable = Observable;
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
define('src/lib/type', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    function type(target) {
        return Object.prototype.toString.call(target).split(' ').pop().slice(0, -1);
    }
    exports.type = type;
});
define('src/lib/collection/datamap', [
    'require',
    'exports',
    'src/lib/sqid',
    'src/lib/type'
], function (require, exports, sqid_1, type_1) {
    'use strict';
    function isPrimitive(target) {
        return target instanceof Object === false;
    }
    var DataMap = function () {
        function DataMap() {
            this.store = new Map();
            this.weakstore = new WeakMap();
        }
        DataMap.prototype.stringify = function (key) {
            switch (typeof key) {
            case 'undefined':
                return '0:' + key;
            case 'boolean':
                return '1:' + key;
            case 'number':
                return '2:' + (1000 + ('' + key).length) + ':' + key;
            case 'string':
                return '3:' + (100000000000000 + key.length) + ':' + key;
            default: {
                    if (isPrimitive(key)) {
                        return '8:' + key;
                    }
                    if (key instanceof Array) {
                        return '9:[ ' + this.stringifyArray(key) + ' ]';
                    }
                    return '9:{ ' + (this.weakstore.has(key) ? this.weakstore.get(key) : this.stringifyObject(key) || this.weakstore.set(key, sqid_1.sqid())) + ' }';
                }
            }
        };
        DataMap.prototype.stringifyArray = function (key) {
            var acc = '';
            for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
                var k = key_1[_i];
                acc += '' + this.stringify(k);
            }
            return acc;
        };
        DataMap.prototype.stringifyObject = function (key) {
            if (type_1.type(key) !== 'Object')
                return '';
            var keys = Object.keys(key);
            var acc = '';
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var k = keys_1[_i];
                acc += this.stringify(k) + ': ' + this.stringify(key[k]);
            }
            return acc || ' ';
        };
        DataMap.prototype.get = function (key) {
            return (this.store.get(this.stringify(key)) || [])[1];
        };
        DataMap.prototype.set = function (key, val) {
            return void this.store.set(this.stringify(key), [
                key,
                val
            ]), this;
        };
        DataMap.prototype.has = function (key) {
            return this.store.has(this.stringify(key));
        };
        DataMap.prototype.delete = function (key) {
            return this.store.delete(this.stringify(key));
        };
        DataMap.prototype.clear = function () {
            return this.store.clear();
        };
        Object.defineProperty(DataMap.prototype, 'size', {
            get: function () {
                return this.store.size;
            },
            enumerable: true,
            configurable: true
        });
        return DataMap;
    }();
    exports.DataMap = DataMap;
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
define('src/lib/supervisor', [
    'require',
    'exports',
    'src/lib/observable',
    'src/lib/collection/datamap',
    'src/lib/tick',
    'src/lib/thenable',
    'src/lib/concat',
    'src/lib/noop'
], function (require, exports, observable_1, datamap_1, tick_1, thenable_1, concat_2, noop_1) {
    'use strict';
    var Supervisor = function () {
        function Supervisor(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.name, name = _c === void 0 ? '' : _c, _d = _b.dependencies, dependencies = _d === void 0 ? [] : _d, _e = _b.retry, retry = _e === void 0 ? false : _e, _f = _b.timeout, timeout = _f === void 0 ? 0 : _f, _g = _b.destructor, destructor = _g === void 0 ? noop_1.noop : _g;
            this.deps = new datamap_1.DataMap();
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
                throw new Error('Spica: Supervisor: Cannot instantiate abstract classes.');
            this.name = name;
            void dependencies.reduce(function (_, _a) {
                var namespace = _a[0], deps = _a[1];
                return void _this.deps.set(namespace, deps);
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
            void tick_1.Tick(function (_) {
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
                throw new Error('Spica: Supervisor: Supervisor ' + this.name + ' cannot register process during the exiting.');
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
                callback = noop_1.noop;
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
            var results = this.procs.reflect(namespace, new WorkerCommand.Call(data));
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
            void this.procs.emit(namespace || [], new WorkerCommand.Exit(reason));
            void this.procs.off(namespace || []);
            if (namespace === void 0) {
                void this.destructor(reason);
            }
        };
        Supervisor.prototype.checkState = function () {
            if (!this.alive)
                throw new Error('Spica: Supervisor: Supervisor ' + this.name + ' already exited.');
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
                }) ? this_1.procs.reflect(namespace, new WorkerCommand.Call(data)) : [];
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
    var WorkerCommand;
    (function (WorkerCommand) {
        var AbstractCommand = function () {
            function AbstractCommand() {
            }
            return AbstractCommand;
        }();
        var Deps = function (_super) {
            __extends(Deps, _super);
            function Deps(namespace) {
                _super.call(this);
                this.namespace = namespace;
            }
            return Deps;
        }(AbstractCommand);
        WorkerCommand.Deps = Deps;
        var Call = function (_super) {
            __extends(Call, _super);
            function Call(data) {
                _super.call(this);
                this.data = data;
            }
            return Call;
        }(AbstractCommand);
        WorkerCommand.Call = Call;
        var Exit = function (_super) {
            __extends(Exit, _super);
            function Exit(reason) {
                _super.call(this);
                this.reason = reason;
            }
            return Exit;
        }(AbstractCommand);
        WorkerCommand.Exit = Exit;
    }(WorkerCommand || (WorkerCommand = {})));
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
            if (this.receive(new WorkerCommand.Deps(this.namespace))) {
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
            if (cmd instanceof WorkerCommand.Deps) {
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
                        return equal(ns, dep) && !!proc(new WorkerCommand.Deps(dep));
                    });
                });
            }
            if (cmd instanceof WorkerCommand.Call) {
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
                    if (thenable_1.isThenable(result)) {
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
            if (cmd instanceof WorkerCommand.Exit) {
                void this.terminate(cmd.reason);
                throw void 0;
            }
            throw new TypeError('Spica: Supervisor: Invalid command: ' + cmd);
        };
        Worker.prototype.terminate = function (reason) {
            void this.destructor(reason);
        };
        Worker.prototype.checkState = function () {
            if (!this.alive)
                throw new Error('Spica: Supervisor: Process ' + this.namespace + '/' + this.process + ' already exited.');
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
define('src/lib/monad/lazy', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
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
});
define('src/lib/monad/functor', [
    'require',
    'exports',
    'src/lib/monad/lazy'
], function (require, exports, lazy_1) {
    'use strict';
    var Functor = function (_super) {
        __extends(Functor, _super);
        function Functor() {
            _super.apply(this, arguments);
        }
        return Functor;
    }(lazy_1.Lazy);
    exports.Functor = Functor;
});
define('src/lib/monad/monad', [
    'require',
    'exports',
    'src/lib/monad/functor'
], function (require, exports, functor_1) {
    'use strict';
    var Monad = function (_super) {
        __extends(Monad, _super);
        function Monad() {
            _super.apply(this, arguments);
        }
        return Monad;
    }(functor_1.Functor);
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
                throw new TypeError('Spica: Maybe: Invalid monad value.\n\t' + m);
            });
        };
        Maybe.prototype.fmap = function (f) {
            return this.bind(function (v) {
                return new Just(f(v));
            });
        };
        Maybe.prototype.extract = function (transform) {
            return this.evaluate().extract(transform);
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
        Nothing.prototype.fmap = function (f) {
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
                throw new TypeError('Spica: Either: Invalid monad value.\n\t' + m);
            });
        };
        Either.prototype.fmap = function (f) {
            return this.bind(function (v) {
                return new Right(f(v));
            });
        };
        Either.prototype.extract = function (transform) {
            return this.evaluate().extract(transform);
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
        Left.prototype.fmap = function (f) {
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
define('src/lib/collection/attrmap', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var AttrMap = function () {
        function AttrMap() {
            this.store = new WeakMap();
        }
        AttrMap.prototype.get = function (obj, key) {
            return this.store.get(obj) && this.store.get(obj).get(key);
        };
        AttrMap.prototype.set = function (obj, key, val) {
            var store = this.store.has(obj) ? this.store.get(obj) : this.store.set(obj, new Map()).get(obj);
            return void store.set(key, val), this;
        };
        AttrMap.prototype.has = function (obj, key) {
            return this.store.has(obj) && this.store.get(obj).has(key);
        };
        AttrMap.prototype.delete = function (obj, key) {
            return key === void 0 ? this.store.delete(obj) : this.store.has(obj) ? this.store.get(obj).delete(key) : false;
        };
        return AttrMap;
    }();
    exports.AttrMap = AttrMap;
});
define('src/lib/collection/relationmap', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    var RelationMap = function () {
        function RelationMap() {
            this.store = new WeakMap();
        }
        RelationMap.prototype.get = function (source, target) {
            return this.store.get(source) && this.store.get(source).get(target);
        };
        RelationMap.prototype.set = function (source, target, val) {
            var store = this.store.has(source) ? this.store.get(source) : this.store.set(source, new WeakMap()).get(source);
            return void store.set(target, val), this;
        };
        RelationMap.prototype.has = function (source, target) {
            return this.store.has(source) && this.store.get(source).has(target);
        };
        RelationMap.prototype.delete = function (source, target) {
            return target === void 0 ? this.store.delete(source) : this.store.has(source) ? this.store.get(source).delete(target) : false;
        };
        return RelationMap;
    }();
    exports.RelationMap = RelationMap;
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
        throw new Error('Spica: uuid: Invalid uuid static seed.\n\t' + fingerprint_1.FINGERPRINT);
    var FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
    var seed = SEED;
    function v4() {
        var k = seed = seed * Date.now() % 1000000000000000;
        if (k < 16 || 1000000000000000 < k)
            throw new Error('Spica: uuid: Invalid uuid dynamic seed.');
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
define('src/lib/assign', [
    'require',
    'exports',
    'src/lib/type'
], function (require, exports, type_2) {
    'use strict';
    exports.assign = template(function (key, target, source) {
        return target[key] = source[key];
    });
    exports.clone = template(function (key, target, source) {
        switch (type_2.type(source[key])) {
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
        switch (type_2.type(source[key])) {
        case 'Array': {
                return target[key] = exports.extend([], source[key]);
            }
        case 'Function':
        case 'Object': {
                switch (type_2.type(target[key])) {
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
                        void cb(key, Object(target), Object(source));
                    }
                }
            }
            return Object(target);
        };
    }
});
define('src/export', [
    'require',
    'exports',
    'src/lib/supervisor',
    'src/lib/observable',
    'src/lib/monad/maybe',
    'src/lib/monad/either',
    'src/lib/collection/datamap',
    'src/lib/collection/attrmap',
    'src/lib/collection/relationmap',
    'src/lib/tick',
    'src/lib/fingerprint',
    'src/lib/uuid',
    'src/lib/sqid',
    'src/lib/assign',
    'src/lib/concat'
], function (require, exports, supervisor_1, observable_2, maybe_1, either_1, datamap_2, attrmap_1, relationmap_1, tick_2, fingerprint_2, uuid_1, sqid_2, assign_1, concat_3) {
    'use strict';
    exports.Supervisor = supervisor_1.Supervisor;
    exports.Observable = observable_2.Observable;
    exports.Maybe = maybe_1.Maybe;
    exports.Just = maybe_1.Just;
    exports.Nothing = maybe_1.Nothing;
    exports.Either = either_1.Either;
    exports.Left = either_1.Left;
    exports.Right = either_1.Right;
    exports.DataMap = datamap_2.DataMap;
    exports.AttrMap = attrmap_1.AttrMap;
    exports.RelationMap = relationmap_1.RelationMap;
    exports.Tick = tick_2.Tick;
    exports.FINGERPRINT = fingerprint_2.FINGERPRINT;
    exports.uuid = uuid_1.v4;
    exports.sqid = sqid_2.sqid;
    exports.assign = assign_1.assign;
    exports.clone = assign_1.clone;
    exports.extend = assign_1.extend;
    exports.concat = concat_3.concat;
});
define('spica', [
    'require',
    'exports',
    'src/export'
], function (require, exports, export_1) {
    'use strict';
    function __export(m) {
        for (var p in m)
            if (!exports.hasOwnProperty(p))
                exports[p] = m[p];
    }
    __export(export_1);
});