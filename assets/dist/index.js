/*! clientchannel v0.37.1 https://github.com/falsandtru/clientchannel | (c) 2016, falsandtru | (Apache-2.0 AND MPL-2.0) License */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["clientchannel"] = factory();
	else
		root["clientchannel"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 8767:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(4279), exports);

/***/ }),

/***/ 5406:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ObjectSetPrototypeOf = exports.ObjectGetPrototypeOf = exports.ObjectCreate = exports.ObjectAssign = exports.toString = exports.isEnumerable = exports.isPrototypeOf = exports.hasOwnProperty = exports.isArray = exports.sqrt = exports.log = exports.tan = exports.cos = exports.sign = exports.round = exports.random = exports.min = exports.max = exports.floor = exports.ceil = exports.abs = exports.parseInt = exports.parseFloat = exports.isSafeInteger = exports.isNaN = exports.isInteger = exports.isFinite = exports[NaN] = void 0;
exports[NaN] = Number.NaN, exports.isFinite = Number.isFinite, exports.isInteger = Number.isInteger, exports.isNaN = Number.isNaN, exports.isSafeInteger = Number.isSafeInteger, exports.parseFloat = Number.parseFloat, exports.parseInt = Number.parseInt;
exports.abs = Math.abs, exports.ceil = Math.ceil, exports.floor = Math.floor, exports.max = Math.max, exports.min = Math.min, exports.random = Math.random, exports.round = Math.round, exports.sign = Math.sign, exports.cos = Math.cos, exports.tan = Math.tan, exports.log = Math.log, exports.sqrt = Math.sqrt;
exports.isArray = Array.isArray;
exports.hasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
exports.isPrototypeOf = Object.prototype.isPrototypeOf.call.bind(Object.prototype.isPrototypeOf);
exports.isEnumerable = Object.prototype.propertyIsEnumerable.call.bind(Object.prototype.propertyIsEnumerable);
exports.toString = Object.prototype.toString.call.bind(Object.prototype.toString);
exports.ObjectAssign = Object.assign;
exports.ObjectCreate = Object.create;
exports.ObjectGetPrototypeOf = Object.getPrototypeOf;
exports.ObjectSetPrototypeOf = Object.setPrototypeOf;

/***/ }),

/***/ 8112:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.splice = exports.pop = exports.push = exports.shift = exports.unshift = exports.indexOf = void 0;

const global_1 = __webpack_require__(4128);

const undefined = void 0;

function indexOf(as, a) {
  if (as.length === 0) return -1;
  return a === a ? as.indexOf(a) : as.findIndex(a => a !== a);
}

exports.indexOf = indexOf;

function unshift(as, bs) {
  if ('length' in as) {
    if (as.length === 1) return bs.unshift(as[0]), bs;
    if (global_1.Symbol.iterator in as) return bs.unshift(...as), bs;

    for (let i = as.length; i--;) {
      bs.unshift(as[i]);
    }
  } else {
    bs.unshift(...as);
  }

  return bs;
}

exports.unshift = unshift;

function shift(as, count) {
  if (count < 0) throw new Error('Unexpected negative number');
  return count === undefined ? [as.shift(), as] : [splice(as, 0, count), as];
}

exports.shift = shift;

function push(as, bs) {
  if ('length' in bs) {
    if (bs.length === 1) return as.push(bs[0]), as;
    if (global_1.Symbol.iterator in bs && bs.length > 50) return as.push(...bs), as;

    for (let len = bs.length, i = 0; i < len; ++i) {
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
  if (count < 0) throw new Error('Unexpected negative number');
  return count === undefined ? [as, as.pop()] : [as, splice(as, as.length - count, count)];
}

exports.pop = pop;

function splice(as, index, count, ...values) {
  if (as.length === 0) return push(as, values), [];

  if (index > as.length) {
    index = as.length;
  } else if (index < 0) {
    index = -index > as.length ? 0 : as.length + index;
  }

  count = count > as.length ? as.length : count;
  if (count === 0 && values.length === 0) return [];
  if (count === 1 && values.length === 1) return [[as[index], as[index] = values[0]][0]];

  switch (index) {
    case 0:
      if (count === 0) return unshift(values, as), [];
      if (count === 1) return [[as.shift()], unshift(values, as)][0];
      break;

    case as.length - 1:
      if (count === 1) return [[as.pop()], push(as, values)][0];
      break;

    case as.length:
      return push(as, values), [];
  }

  switch (values.length) {
    case 0:
      return arguments.length > 2 ? as.splice(index, count) : as.splice(index);

    case 1:
      return as.splice(index, count, values[0]);

    case 2:
      return as.splice(index, count, values[0], values[1]);

    case 3:
      return as.splice(index, count, values[0], values[1], values[2]);

    case 4:
      return as.splice(index, count, values[0], values[1], values[2], values[3]);

    case 5:
      return as.splice(index, count, values[0], values[1], values[2], values[3], values[4]);

    default:
      return as.splice(index, count, ...values);
  }
}

exports.splice = splice;

/***/ }),

/***/ 4401:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.template = exports.inherit = exports.merge = exports.extend = exports.overwrite = exports.clone = exports.assign = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const type_1 = __webpack_require__(5177);

const array_1 = __webpack_require__(8112);

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
    if ((0, type_1.isPrimitive)(target)) return target;

    for (let i = 0; i < sources.length; ++i) {
      const source = sources[i];
      if (source === target) continue;
      if ((0, type_1.isPrimitive)(source)) continue;
      const keys = global_1.Object.keys(source);

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

/***/ }),

/***/ 412:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _a, _b;

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Cancellation = void 0;

const promise_1 = __webpack_require__(4879);

const future_1 = __webpack_require__(3387);

const exception_1 = __webpack_require__(7822);

const maybe_1 = __webpack_require__(6512);

const either_1 = __webpack_require__(8555);

const function_1 = __webpack_require__(6288);

const internal = Symbol.for('spica/cancellation::internal');

class Cancellation {
  constructor(cancellees) {
    this[_a] = 'Cancellation';
    this[_b] = new Internal();
    if (cancellees) for (const cancellee of cancellees) {
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
    if (this.reason.length !== 0) return;
    this.reason = [reason];

    for (let i = 0, {
      listeners
    } = this; i < listeners.length; ++i) {
      listeners[i]?.(reason);
    }

    this.future?.bind(reason);
    this.isFinished = true;
  }

  close(reason) {
    if (this.reason.length !== 0) return;
    this.reason = [void 0, reason];
    this.future?.bind(promise_1.AtomicPromise.reject(reason));
    this.isFinished = true;
  }

}

/***/ }),

/***/ 7681:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.tick = exports.promise = exports.clock = exports.now = void 0;

const global_1 = __webpack_require__(4128);

const queue_1 = __webpack_require__(4934);

const exception_1 = __webpack_require__(7822);

const undefined = void 0;
let time;
let count = 0;

function now(nocache) {
  if (time === undefined) {
    tick(() => time = undefined);
  } else if (!nocache && count++ !== 20) {
    return time;
  }

  count = 1;
  return time = global_1.Date.now();
}

exports.now = now;
exports.clock = global_1.Promise.resolve(undefined);

function promise(cb) {
  global_1.Promise.resolve().then(cb);
}

exports.promise = promise;
const queue = new queue_1.Queue();
const scheduler = global_1.Promise.resolve();

function tick(cb) {
  queue.isEmpty() && scheduler.then(run);
  queue.push(cb);
}

exports.tick = tick;

function run() {
  for (let count = queue.length; count--;) {
    try {
      // @ts-expect-error
      (0, queue.pop())();
    } catch (reason) {
      (0, exception_1.causeAsyncException)(reason);
    }
  }
}

/***/ }),

/***/ 5529:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.equal = void 0;

function equal(a, b) {
  return a === a ? a === b : b !== b;
}

exports.equal = equal;

/***/ }),

/***/ 302:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.concat = void 0;

function concat(target, source) {
  if ('length' in source) {
    for (let i = 0; i < source.length; ++i) {
      target.push(source[i]);
    }
  } else {
    target.push(...source);
  }

  return target;
}

exports.concat = concat;

/***/ }),

/***/ 4877:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.uncurry = exports.curry = void 0;

const array_1 = __webpack_require__(8112);

exports.curry = f => curry_(f, f.length);

function curry_(f, arity, ...xs) {
  let g;
  return xs.length < arity ? (...ys) => curry_(g ??= xs.length && f.bind(void 0, ...xs) || f, arity - xs.length, ...ys) : f(...xs);
}

const uncurry = f => uncurry_(f);

exports.uncurry = uncurry;

function uncurry_(f) {
  const arity = f.length;
  return (...xs) => arity === 0 || xs.length <= arity ? f(...xs) : uncurry_(f(...(0, array_1.shift)(xs, arity)[0]))(...xs);
}

/***/ }),

/***/ 8555:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(14), exports);

/***/ }),

/***/ 7822:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.causeAsyncException = void 0;

const global_1 = __webpack_require__(4128);

function causeAsyncException(reason) {
  global_1.Promise.reject(reason);
}

exports.causeAsyncException = causeAsyncException;

/***/ }),

/***/ 6288:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.noop = exports.fix = exports.id = exports.clear = exports.singleton = void 0;

function singleton(f) {
  let result;
  return function (...as) {
    if (result) return result[0];
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

function fix(f) {
  return a1 => {
    const a2 = f(a1);
    return a1 === a2 || a2 !== a2 ? a2 : f(a2);
  };
}

exports.fix = fix; // @ts-ignore

function noop() {}

exports.noop = noop;

/***/ }),

/***/ 3387:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _a, _b, _c, _d;

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AtomicFuture = exports.Future = void 0;

const global_1 = __webpack_require__(4128);

const promise_1 = __webpack_require__(4879);

class Future {
  constructor(strict = true) {
    this[_a] = 'Promise';
    this[_b] = new promise_1.Internal();

    this.bind = value => {
      const core = this[promise_1.internal];
      if (!core.isPending && !strict) return this;
      if (!core.isPending) throw new Error(`Spica: Future: Cannot rebind a value.`);
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
      if (!core.isPending && !strict) return this;
      if (!core.isPending) throw new Error(`Spica: AtomicFuture: Cannot rebind a value.`);
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

/***/ }),

/***/ 4128:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



__webpack_require__(6921);

const global = void 0 || typeof globalThis !== 'undefined' && globalThis // @ts-ignore
|| typeof self !== 'undefined' && self || Function('return this')();
global.global = global;
module.exports = global;

/***/ }),

/***/ 6921:
/***/ (() => {

 // @ts-ignore

var globalThis; // @ts-ignore

var global = (/* unused pure expression or super */ null && (globalThis));

/***/ }),

/***/ 818:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MultiHeap = exports.Heap = void 0;

const global_1 = __webpack_require__(4128);

const invlist_1 = __webpack_require__(7452);

const memoize_1 = __webpack_require__(1808);

const undefined = void 0;
let size = 16;

class Heap {
  constructor(cmp = Heap.max, stable = false) {
    this.cmp = cmp;
    this.stable = stable;
    this.array = (0, global_1.Array)(size);
    this.$length = 0;
  }

  get length() {
    return this.$length;
  }

  isEmpty() {
    return this.array[0] !== undefined;
  }

  peek() {
    return this.array[0]?.[1];
  }

  insert(value, order) {
    if (arguments.length < 2) {
      order = value;
    }

    const array = this.array;
    const node = array[this.$length] = [order, value, this.$length++];
    upHeapify(this.cmp, array, this.$length);
    return node;
  }

  replace(value, order) {
    if (arguments.length < 2) {
      order = value;
    }

    if (this.$length === 0) return void this.insert(value, order);
    const array = this.array;
    const replaced = array[0][1];
    array[0] = [order, value, 0];
    downHeapify(this.cmp, array, 1, this.$length, this.stable);
    return replaced;
  }

  extract() {
    if (this.$length === 0) return;
    const node = this.array[0];
    this.delete(node);
    return node[1];
  }

  delete(node) {
    const array = this.array;
    const index = node[2];
    if (array[index] !== node) throw new Error('Invalid node');
    swap(array, index, --this.$length); // @ts-expect-error

    array[this.$length] = undefined;
    index < this.$length && sort(this.cmp, array, index, this.$length, this.stable);
    return node[1];
  }

  update(node, order, value) {
    if (arguments.length < 2) {
      order = node[0];
    }

    const array = this.array;
    if (array[node[2]] !== node) throw new Error('Invalid node');

    if (arguments.length > 2) {
      node[1] = value;
    }

    if (this.cmp(node[0], node[0] = order) === 0) return;
    sort(this.cmp, array, node[2], this.$length, this.stable);
  }

  find(order) {
    return this.array.find(node => node && node[0] === order);
  }

  clear() {
    this.array = (0, global_1.Array)(size);
    this.$length = 0;
  }

}

exports.Heap = Heap;

Heap.max = (a, b) => a > b ? -1 : a < b ? 1 : 0;

Heap.min = (a, b) => a > b ? 1 : a < b ? -1 : 0;

class MultiHeap {
  constructor(cmp = MultiHeap.max, clean = true) {
    this.cmp = cmp;
    this.clean = clean;
    this.heap = new Heap(this.cmp);
    this.dict = new global_1.Map();
    this.list = (0, memoize_1.memoize)(order => {
      const list = new invlist_1.List();
      list[MultiHeap.order] = order;
      list[MultiHeap.heap] = this.heap.insert(list, order);
      return list;
    }, this.dict);
    this.$length = 0;
  }

  get length() {
    return this.$length;
  }

  isEmpty() {
    return this.heap.isEmpty();
  }

  peek() {
    return this.heap.peek()?.head.value;
  }

  insert(value, order) {
    if (arguments.length < 2) {
      order = value;
    }

    ++this.$length;
    return this.list(order).push(value);
  }

  extract() {
    if (this.$length === 0) return;
    --this.$length;
    const list = this.heap.peek();
    const value = list.shift();

    if (list.length === 0) {
      this.heap.extract();
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }

    return value;
  }

  delete(node) {
    const list = node.list;
    if (!list) throw new Error('Invalid node');
    --this.$length;

    if (list.length === 1) {
      this.heap.delete(list[MultiHeap.heap]);
      this.clean && this.dict.delete(list[MultiHeap.order]);
    }

    return node.delete();
  }

  update(node, order, value) {
    const list = node.list;
    if (!list) throw new Error('Invalid node');

    if (arguments.length < 2) {
      order = list[MultiHeap.order];
    }

    if (arguments.length > 2) {
      node.value = value;
    }

    if (this.cmp(list[MultiHeap.order], order) === 0) return node;
    this.delete(node);
    return this.insert(node.value, order);
  }

  find(order) {
    return this.dict.get(order);
  }

  clear() {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }

}

exports.MultiHeap = MultiHeap;
MultiHeap.order = Symbol('order');
MultiHeap.heap = Symbol('heap');
MultiHeap.max = Heap.max;
MultiHeap.min = Heap.min;

function sort(cmp, array, index, length, stable) {
  return upHeapify(cmp, array, index + 1) || downHeapify(cmp, array, index + 1, length, stable);
}

function upHeapify(cmp, array, index) {
  const order = array[index - 1][0];
  let changed = false;

  while (index > 1) {
    const parent = index / 2 | 0;
    if (cmp(array[parent - 1][0], order) <= 0) break;
    swap(array, index - 1, parent - 1);
    index = parent;
    changed ||= true;
  }

  return changed;
}

function downHeapify(cmp, array, index, length, stable) {
  let changed = false;

  while (index < length) {
    const left = index * 2;
    const right = index * 2 + 1;
    let min = index;

    if (left <= length && (stable ? cmp(array[left - 1][0], array[min - 1][0]) <= 0 : cmp(array[left - 1][0], array[min - 1][0]) < 0)) {
      min = left;
    }

    if (right <= length && (stable ? cmp(array[right - 1][0], array[min - 1][0]) <= 0 : cmp(array[right - 1][0], array[min - 1][0]) < 0)) {
      min = right;
    }

    if (min === index) break;
    swap(array, index - 1, min - 1);
    index = min;
    changed ||= true;
  }

  return changed;
}

function swap(array, index1, index2) {
  if (index1 === index2) return;
  const node1 = array[index1];
  const node2 = array[index2];
  node1[2] = index2;
  node2[2] = index1;
  array[index1] = node2;
  array[index2] = node1;
}

/***/ }),

/***/ 7452:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(2310), exports);

/***/ }),

/***/ 2310:
/***/ ((__unused_webpack_module, exports) => {

 // Circular Inverse List

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.List = void 0;
const undefined = void 0;

class List {
  constructor() {
    this.$length = 0;
    this.head = undefined;
  }

  get length() {
    return this.$length;
  }

  get tail() {
    return this.head?.next;
  }

  get last() {
    return this.head?.prev;
  }

  clear() {
    this.head = undefined;
    this.$length = 0;
  }

  unshift(value) {
    return this.head = this.push(value);
  }

  push(value) {
    return new Node(this, value, this.head, this.head?.prev);
  }

  unshiftNode(node) {
    return this.head = this.pushNode(node);
  }

  pushNode(node) {
    return this.insert(node, this.head);
  }

  unshiftRotationally(value) {
    const node = this.last;
    if (!node) return this.unshift(value);
    node.value = value;
    this.head = node;
    return node;
  }

  pushRotationally(value) {
    const node = this.head;
    if (!node) return this.push(value);
    node.value = value;
    this.head = node.next;
    return node;
  }

  shift() {
    return this.head?.delete();
  }

  pop() {
    return this.last?.delete();
  }

  insert(node, before = this.head) {
    if (node.list === this) return node.moveTo(before), node;
    node.delete();
    ++this.$length;
    this.head ??= node; // @ts-expect-error

    node.list = this;
    const next = node.next = before ?? node;
    const prev = node.prev = next.prev ?? node;
    next.prev = prev.next = node;
    return node;
  }

  find(f) {
    for (let head = this.head, node = head; node;) {
      if (f(node.value)) return node;
      node = node.next;
      if (node === head) break;
    }
  }

  toNodes() {
    const acc = [];

    for (let head = this.head, node = head; node;) {
      acc.push(node);
      node = node.next;
      if (node === head) break;
    }

    return acc;
  }

  toArray() {
    const acc = [];

    for (let head = this.head, node = head; node;) {
      acc.push(node.value);
      node = node.next;
      if (node === head) break;
    }

    return acc;
  }

  *[Symbol.iterator]() {
    for (let head = this.head, node = head; node;) {
      yield node.value;
      node = node.next;
      if (node === head) return;
    }
  }

}

exports.List = List;

class Node {
  constructor(list, value, next, prev) {
    this.list = list;
    this.value = value;
    this.next = next;
    this.prev = prev;
    ++list.$length;
    list.head ??= this;
    next && prev ? next.prev = prev.next = this : this.next = this.prev = this;
  }

  get alive() {
    return this.list !== undefined;
  }

  delete() {
    const list = this.list;
    if (!list) return this.value;
    --list.$length;
    const {
      next,
      prev
    } = this;

    if (list.head === this) {
      list.head = next === this ? undefined : next;
    }

    if (next) {
      next.prev = prev;
    }

    if (prev) {
      prev.next = next;
    } // @ts-expect-error


    this.list = undefined; // @ts-expect-error

    this.next = this.prev = undefined;
    return this.value;
  }

  insertBefore(value) {
    return new Node(this.list, value, this, this.prev);
  }

  insertAfter(value) {
    return new Node(this.list, value, this.next, this);
  }

  moveTo(before) {
    if (!before) return false;
    if (this === before) return false;
    if (before.list !== this.list) return before.list.insert(this, before), true;
    const a1 = this;
    const b1 = before;
    if (a1.next === b1) return false;
    const b0 = b1.prev;
    const a0 = a1.prev;
    const a2 = a1.next;
    b0.next = a1;
    a1.next = b1;
    b1.prev = a1;
    a1.prev = b0;
    a0.next = a2;
    a2.prev = a0;
    return true;
  }

  moveToHead() {
    this.moveTo(this.list.head);
    this.list.head = this;
  }

  moveToLast() {
    this.moveTo(this.list.head);
  }

  swap(node) {
    const node1 = this;
    const node2 = node;
    if (node1 === node2) return false;
    const node3 = node2.next;
    if (node1.list !== node2.list) throw new Error(`Spica: InvList: Cannot swap nodes across lists.`);
    node2.moveTo(node1);
    node1.moveTo(node3);

    switch (this.list.head) {
      case node1:
        this.list.head = node2;
        break;

      case node2:
        this.list.head = node1;
        break;
    }

    return true;
  }

}

/***/ }),

/***/ 6512:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(1869), exports);

/***/ }),

/***/ 1808:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.reduce = exports.memoize = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const compare_1 = __webpack_require__(5529);

const undefined = void 0;

function memoize(f, identify = (...as) => as[0], memory) {
  if (typeof identify === 'object') return memoize(f, undefined, identify);
  return (0, alias_1.isArray)(memory) ? memoizeArray(f, identify, memory) : memoizeObject(f, identify, memory ?? new global_1.Map());
}

exports.memoize = memoize;

function memoizeArray(f, identify, memory) {
  let nullish = false;
  return (...as) => {
    const b = identify(...as);
    let z = memory[b];
    if (z !== undefined || nullish && memory[b] !== undefined) return z;
    z = f(...as);
    nullish ||= z === undefined;
    memory[b] = z;
    return z;
  };
}

function memoizeObject(f, identify, memory) {
  let nullish = false;
  return (...as) => {
    const b = identify(...as);
    let z = memory.get(b);
    if (z !== undefined || nullish && memory.has(b)) return z;
    z = f(...as);
    nullish ||= z === undefined;
    memory.set(b, z);
    return z;
  };
}

function reduce(f, identify = (...as) => as[0]) {
  let key = {};
  let val;
  return (...as) => {
    const b = identify(...as);

    if (!(0, compare_1.equal)(key, b)) {
      key = b;
      val = f(...as);
    }

    return val;
  };
}

exports.reduce = reduce;

/***/ }),

/***/ 9983:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Applicative = void 0;

const functor_1 = __webpack_require__(8946);

const curry_1 = __webpack_require__(4877);

class Applicative extends functor_1.Functor {}

exports.Applicative = Applicative;

(function (Applicative) {
  function ap(af, aa) {
    return aa ? af.bind(f => aa.fmap((0, curry_1.curry)(f))) : aa => ap(af, aa);
  }

  Applicative.ap = ap;
})(Applicative = exports.Applicative || (exports.Applicative = {}));

/***/ }),

/***/ 8554:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Right = exports.Left = exports.Either = void 0;

const monad_1 = __webpack_require__(7991);

const promise_1 = __webpack_require__(4879);

const function_1 = __webpack_require__(6288);

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

      throw new TypeError(`Spica: Either: Invalid monad value: ${m}`);
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
      if (done) return m;
      const r = m.extract(function_1.noop, a => [a]);
      if (!r) return m;
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
    return fm instanceof Either ? fm.extract(b => promise_1.AtomicPromise.resolve(new Left(b)), a => promise_1.AtomicPromise.resolve(a).then(Either.Return)) : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => [...as, a])), Either.Return([]));
  }

  Either.sequence = sequence;
})(Either = exports.Either || (exports.Either = {}));

class Left extends Either {
  constructor(value) {
    super(throwCallError);
    this.value = value;
  }

  bind(_) {
    return this;
  }

  extract(left) {
    if (!left) throw this.value;
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

/***/ }),

/***/ 14:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Right = exports.Left = exports.Either = void 0;

const Monad = __importStar(__webpack_require__(8554));

const function_1 = __webpack_require__(6288);

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

/***/ }),

/***/ 8946:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Functor = void 0;

const lazy_1 = __webpack_require__(7395);

class Functor extends lazy_1.Lazy {}

exports.Functor = Functor;

(function (Functor) {
  function fmap(m, f) {
    return f ? m.fmap(f) : f => m.fmap(f);
  }

  Functor.fmap = fmap;
})(Functor = exports.Functor || (exports.Functor = {}));

/***/ }),

/***/ 7395:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Lazy = void 0;

class Lazy {
  constructor(thunk) {
    this.thunk = thunk;
    this.$memory = void 0;
  }

  evaluate() {
    return this.$memory ??= this.thunk();
  }

}

exports.Lazy = Lazy;

/***/ }),

/***/ 1605:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Nothing = exports.Just = exports.Maybe = void 0;

const monadplus_1 = __webpack_require__(4716);

const promise_1 = __webpack_require__(4879);

const function_1 = __webpack_require__(6288);

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

      throw new TypeError(`Spica: Maybe: Invalid monad value: ${m}`);
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
      if (done) return m;
      const r = m.extract(function_1.noop, a => [a]);
      if (!r) return m;
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
    return fm instanceof Maybe ? fm.extract(() => promise_1.AtomicPromise.resolve(Maybe.mzero), a => promise_1.AtomicPromise.resolve(a).then(Maybe.Return)) : fm.reduce((acc, m) => acc.bind(as => m.fmap(a => [...as, a])), Maybe.Return([]));
  }

  Maybe.sequence = sequence;
})(Maybe = exports.Maybe || (exports.Maybe = {}));

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
    if (!nothing) throw new Error(`Spica: Maybe: Nothig value is extracted.`);
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
})(Maybe = exports.Maybe || (exports.Maybe = {}));

function throwCallError() {
  throw new Error(`Spica: Maybe: Invalid thunk call.`);
}

/***/ }),

/***/ 1869:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Nothing = exports.Just = exports.Maybe = void 0;

const Monad = __importStar(__webpack_require__(1605));

const function_1 = __webpack_require__(6288);

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

/***/ }),

/***/ 7991:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Monad = void 0;

const applicative_1 = __webpack_require__(9983);

class Monad extends applicative_1.Applicative {}

exports.Monad = Monad;

(function (Monad) {
  function bind(m, f) {
    return f ? m.bind(f) : f => bind(m, f);
  }

  Monad.bind = bind; //export declare function sequence<a>(fm: Monad<PromiseLike<a>>): AtomicPromise<Monad<a>>;
})(Monad = exports.Monad || (exports.Monad = {}));

/***/ }),

/***/ 4716:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MonadPlus = void 0;

const monad_1 = __webpack_require__(7991);

class MonadPlus extends monad_1.Monad {}

exports.MonadPlus = MonadPlus;

(function (MonadPlus) {})(MonadPlus = exports.MonadPlus || (exports.MonadPlus = {}));

/***/ }),

/***/ 4615:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Observation = void 0;

const global_1 = __webpack_require__(4128);

const invlist_1 = __webpack_require__(7452);

const array_1 = __webpack_require__(8112);

const exception_1 = __webpack_require__(7822);

class ListenerNode {
  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
    this.monitors = new invlist_1.List();
    this.subscribers = new invlist_1.List();
    this.index = new global_1.Map();
    this.children = new invlist_1.List();
  }

  clear() {
    const {
      monitors,
      subscribers,
      index,
      children
    } = this;

    for (let child = children.head, i = children.length; child && i--;) {
      if (child.value.clear()) {
        const next = child.next;
        index.delete(child.value.name);
        child.delete();
        child = next;
      } else {
        child = child.next;
      }
    }

    subscribers.clear();
    return monitors.length === 0 && children.length === 0;
  }

}

class Observation {
  constructor(opts) {
    this.id = global_1.Number.MIN_SAFE_INTEGER;
    this.node = new ListenerNode(void 0);
    this.limit = opts?.limit ?? 10;
  }

  monitor(namespace, monitor, options = {}) {
    if (typeof monitor !== 'function') throw new global_1.Error(`Spica: Observation: Invalid listener: ${monitor}`);
    const {
      monitors
    } = this.seekNode(namespace, 0
    /* SeekMode.Extensible */
    );
    if (monitors.length === this.limit) throw new global_1.Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === global_1.Number.MAX_SAFE_INTEGER) throw new global_1.Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const node = monitors.push({
      id: ++this.id,
      type: 0
      /* ListenerType.Monitor */
      ,
      namespace,
      listener: monitor,
      options
    });
    return () => void node.delete();
  }

  on(namespace, subscriber, options = {}) {
    if (typeof subscriber !== 'function') throw new global_1.Error(`Spica: Observation: Invalid listener: ${subscriber}`);
    const {
      subscribers
    } = this.seekNode(namespace, 0
    /* SeekMode.Extensible */
    );
    if (subscribers.length === this.limit) throw new global_1.Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === global_1.Number.MAX_SAFE_INTEGER) throw new global_1.Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const node = subscribers.push({
      id: ++this.id,
      type: 1
      /* ListenerType.Subscriber */
      ,
      namespace,
      listener: subscriber,
      options
    });
    return () => void node.delete();
  }

  once(namespace, subscriber) {
    return this.on(namespace, subscriber, {
      once: true
    });
  }

  off(namespace, subscriber) {
    return subscriber ? void this.seekNode(namespace, 1
    /* SeekMode.Breakable */
    )?.subscribers?.find(item => item.listener === subscriber)?.delete() : void this.seekNode(namespace, 1
    /* SeekMode.Breakable */
    )?.clear();
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
    this.relaies ??= new global_1.WeakSet();
    if (this.relaies.has(source)) throw new global_1.Error(`Spica: Observation: Relay source is already registered.`);
    this.relaies.add(source);
    return source.monitor([], (data, namespace) => void this.emit(namespace, data));
  }

  refs(namespace) {
    const node = this.seekNode(namespace, 1
    /* SeekMode.Breakable */
    );
    if (!node) return [];
    return (0, array_1.push)(this.refsBelow(node, 0
    /* ListenerType.Monitor */
    ), this.refsBelow(node, 1
    /* ListenerType.Subscriber */
    )).reduce((acc, listeners) => (0, array_1.push)(acc, listeners.toArray()), []);
  }

  drain(namespace, data, tracker) {
    const node = this.seekNode(namespace, 1
    /* SeekMode.Breakable */
    );
    const results = [];
    const sss = node ? this.refsBelow(node, 1
    /* ListenerType.Subscriber */
    ) : [];

    for (let i = 0; i < sss.length; ++i) {
      const items = sss[i];
      if (items.length === 0) continue;
      const recents = [];

      for (let node = items.head, min = node.value.id, max = node.prev.value.id; node && min <= node.value.id && node.value.id <= max;) {
        min = node.value.id + 1;
        const item = node.value;
        item.options.once && node.delete();

        try {
          const result = item.listener(data, namespace);
          tracker && results.push(result);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
        }

        node.alive && recents.push(node); // TODO: Use Array.findLast.

        node = node.next ?? findLast(recents, item => item.next) ?? items.head;
      }
    }

    const mss = this.refsAbove(node || this.seekNode(namespace, 2
    /* SeekMode.Closest */
    ), 0
    /* ListenerType.Monitor */
    );

    for (let i = 0; i < mss.length; ++i) {
      const items = mss[i];
      if (items.length === 0) continue;
      const recents = [];

      for (let node = items.head, min = node.value.id, max = node.prev.value.id; node && min <= node.value.id && node.value.id <= max;) {
        min = node.value.id + 1;
        const item = node.value;
        item.options.once && node.delete();

        try {
          item.listener(data, namespace);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
        }

        node.alive && recents.push(node); // TODO: Use Array.findLast.

        node = node.next ?? findLast(recents, item => item.next) ?? items.head;
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

  refsAbove({
    parent,
    monitors,
    subscribers
  }, type) {
    const acc = type === 0
    /* ListenerType.Monitor */
    ? [monitors] : [subscribers];

    while (parent) {
      type === 0
      /* ListenerType.Monitor */
      ? acc.push(parent.monitors) : acc.push(parent.subscribers);
      parent = parent.parent;
    }

    return acc;
  }

  refsBelow(node, type) {
    return this.refsBelow_(node, type, [])[0];
  }

  refsBelow_({
    monitors,
    subscribers,
    index,
    children
  }, type, acc) {
    type === 0
    /* ListenerType.Monitor */
    ? acc.push(monitors) : acc.push(subscribers);
    let count = 0;

    for (let child = children.head, i = children.length; child && i--;) {
      const cnt = this.refsBelow_(child.value, type, acc)[1];
      count += cnt;

      if (cnt === 0) {
        const next = child.next;
        index.delete(child.value.name);
        child.delete();
        child = next;
      } else {
        child = child.next;
      }
    }

    return [acc, monitors.length + subscribers.length + count];
  }

  seekNode(namespace, mode) {
    let node = this.node;

    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const {
        index,
        children
      } = node;
      let child = index.get(name);

      if (!child) {
        switch (mode) {
          case 1
          /* SeekMode.Breakable */
          :
            return;

          case 2
          /* SeekMode.Closest */
          :
            return node;
        }

        child = new ListenerNode(name, node);
        index.set(name, child);
        children.push(child);
      }

      node = child;
    }

    return node;
  }

}

exports.Observation = Observation;

function findLast(array, f) {
  for (let i = array.length; i--;) {
    if (f(array[i])) return array[i];
  }
}

/***/ }),

/***/ 4879:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _a, _b;

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.never = exports.isPromiseLike = exports.Internal = exports.AtomicPromise = exports.internal = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const function_1 = __webpack_require__(6288);

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
          const {
            status
          } = value[exports.internal];

          switch (status.state) {
            case 2
            /* State.fulfilled */
            :
              results[i] = status.value;
              ++count;
              continue;

            case 3
            /* State.rejected */
            :
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
          const {
            status
          } = value[exports.internal];

          switch (status.state) {
            case 2
            /* State.fulfilled */
            :
              return resolve(status.value);

            case 3
            /* State.rejected */
            :
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
          const {
            status
          } = value[exports.internal];

          switch (status.state) {
            case 2
            /* State.fulfilled */
            :
              results[i] = {
                status: 'fulfilled',
                value: status.value
              };
              ++count;
              continue;

            case 3
            /* State.rejected */
            :
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
          const {
            status
          } = value[exports.internal];

          switch (status.state) {
            case 2
            /* State.fulfilled */
            :
              return resolve(status.value);

            case 3
            /* State.rejected */
            :
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
    this.status = {
      state: 0
      /* State.pending */

    };
    this.fulfillReactions = [];
    this.rejectReactions = [];
  }

  get isPending() {
    return this.status.state === 0
    /* State.pending */
    ;
  }

  resolve(value) {
    if (this.status.state !== 0
    /* State.pending */
    ) return;

    if (!isPromiseLike(value)) {
      this.status = {
        state: 2
        /* State.fulfilled */
        ,
        value: value
      };
      return this.resume();
    }

    if (isAtomicPromiseLike(value)) {
      const core = value[exports.internal];

      switch (core.status.state) {
        case 2
        /* State.fulfilled */
        :
        case 3
        /* State.rejected */
        :
          this.status = core.status;
          return this.resume();

        default:
          return core.then(() => (this.status = core.status, this.resume()), () => (this.status = core.status, this.resume()));
      }
    }

    this.status = {
      state: 1
      /* State.resolved */
      ,
      promise: value
    };
    return void value.then(value => {
      this.status = {
        state: 2
        /* State.fulfilled */
        ,
        value
      };
      this.resume();
    }, reason => {
      this.status = {
        state: 3
        /* State.rejected */
        ,
        reason
      };
      this.resume();
    });
  }

  reject(reason) {
    if (this.status.state !== 0
    /* State.pending */
    ) return;
    this.status = {
      state: 3
      /* State.rejected */
      ,
      reason
    };
    return this.resume();
  }

  then(resolve, reject, onfulfilled, onrejected) {
    const {
      status,
      fulfillReactions,
      rejectReactions
    } = this;

    switch (status.state) {
      case 2
      /* State.fulfilled */
      :
        if (fulfillReactions.length !== 0) break;
        return call(resolve, reject, resolve, onfulfilled, status.value);

      case 3
      /* State.rejected */
      :
        if (rejectReactions.length !== 0) break;
        return call(resolve, reject, reject, onrejected, status.reason);
    }

    fulfillReactions.push([resolve, reject, resolve, onfulfilled]);
    rejectReactions.push([resolve, reject, reject, onrejected]);
  }

  resume() {
    const {
      status,
      fulfillReactions,
      rejectReactions
    } = this;

    switch (status.state) {
      case 0
      /* State.pending */
      :
      case 1
      /* State.resolved */
      :
        return;

      case 2
      /* State.fulfilled */
      :
        if (rejectReactions.length !== 0) {
          this.rejectReactions = [];
        }

        if (fulfillReactions.length === 0) return;
        react(fulfillReactions, status.value);
        this.fulfillReactions = [];
        return;

      case 3
      /* State.rejected */
      :
        if (fulfillReactions.length !== 0) {
          this.fulfillReactions = [];
        }

        if (rejectReactions.length === 0) return;
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
  if (!callback) return cont(param);

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

/***/ }),

/***/ 4934:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MultiQueue = exports.PriorityQueue = exports.Queue = void 0;

const global_1 = __webpack_require__(4128);

const heap_1 = __webpack_require__(818);

const memoize_1 = __webpack_require__(1808);

const undefined = void 0;
const size = 2048;
const initsize = 16;

class Queue {
  constructor() {
    this.head = new FixedQueue(initsize);
    this.tail = this.head;
    this.count = 0;
    this.irregular = 0;
  }

  get length() {
    return this.count === 0 ? this.head.length : this.head.length + this.tail.length + (size - 1) * (this.count - 2) + (this.irregular || size) - 1;
  }

  isEmpty() {
    return this.head.isEmpty();
  }

  peek(index = 0) {
    return index === 0 ? this.head.peek(0) : this.tail.peek(-1);
  }

  push(value) {
    const tail = this.tail;

    if (tail.isFull()) {
      if (tail.next.isEmpty()) {
        this.tail = tail.next;
      } else {
        this.tail = tail.next = new FixedQueue(size, tail.next);
      }

      ++this.count;

      if (tail.size !== size && tail !== this.head) {
        this.irregular = tail.size;
      }
    }

    this.tail.push(value);
  }

  pop() {
    const head = this.head;
    const value = head.pop();

    if (head.isEmpty() && !head.next.isEmpty()) {
      --this.count;
      this.head = head.next;

      if (this.head.size === this.irregular) {
        this.irregular = 0;
      }
    }

    return value;
  }

  clear() {
    this.head = this.tail = new FixedQueue(initsize);
    this.count = 0;
    this.irregular = 0;
  }

  *[Symbol.iterator]() {
    while (!this.isEmpty()) {
      yield this.pop();
    }

    return;
  }

}

exports.Queue = Queue;

class FixedQueue {
  constructor(size, next) {
    this.size = size;
    this.array = (0, global_1.Array)(this.size);
    this.mask = this.array.length - 1;
    this.head = 0;
    this.tail = 0;
    this.next = next ?? this;
  }

  get length() {
    return this.tail >= this.head ? this.tail - this.head : this.array.length - this.head + this.tail;
  }

  isEmpty() {
    return this.tail === this.head;
  }

  isFull() {
    return (this.tail + 1 & this.mask) === this.head;
  }

  peek(index = 0) {
    return index === 0 ? this.array[this.head] : this.array[this.tail - 1 & this.mask];
  }

  push(value) {
    this.array[this.tail] = value;
    this.tail = this.tail + 1 & this.mask;
  }

  pop() {
    if (this.isEmpty()) return;
    const value = this.array[this.head];
    this.array[this.head] = undefined;
    this.head = this.head + 1 & this.mask;
    return value;
  }

}

class PriorityQueue {
  constructor(cmp = PriorityQueue.max, clean = true) {
    this.clean = clean;
    this.dict = new global_1.Map();
    this.queue = (0, memoize_1.memoize)(priority => {
      const queue = new Queue();
      queue[PriorityQueue.priority] = priority;
      this.heap.insert(queue, priority);
      return queue;
    }, this.dict);
    this.$length = 0;
    this.heap = new heap_1.Heap(cmp);
  }

  get length() {
    return this.$length;
  }

  isEmpty() {
    return this.$length === 0;
  }

  peek(priority) {
    return arguments.length === 0 ? this.heap.peek()?.peek() : this.dict.get(priority)?.peek();
  }

  push(priority, value) {
    ++this.$length;
    this.queue(priority).push(value);
  }

  pop(priority) {
    if (this.$length === 0) return;
    --this.$length;
    const queue = arguments.length === 0 ? this.heap.peek() : this.dict.get(priority);
    const value = queue?.pop();

    if (queue?.isEmpty()) {
      this.heap.extract();
      this.clean && this.dict.delete(queue[PriorityQueue.priority]);
    }

    return value;
  }

  clear() {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }

  *[Symbol.iterator]() {
    while (!this.isEmpty()) {
      yield this.pop();
    }

    return;
  }

}

exports.PriorityQueue = PriorityQueue;
PriorityQueue.priority = Symbol('priority');
PriorityQueue.max = heap_1.Heap.max;
PriorityQueue.min = heap_1.Heap.min;

class MultiQueue {
  constructor(entries) {
    this.dict = new global_1.Map();
    if (entries) for (const {
      0: k,
      1: v
    } of entries) {
      this.set(k, v);
    }
  }

  get length() {
    return this.dict.size;
  }

  isEmpty() {
    return this.dict.size === 0;
  }

  peek(key) {
    return this.dict.get(key)?.peek();
  }

  push(key, value) {
    let vs = this.dict.get(key);
    if (vs) return void vs.push(value);
    vs = new Queue();
    vs.push(value);
    this.dict.set(key, vs);
  }

  pop(key) {
    return this.dict.get(key)?.pop();
  }

  clear() {
    this.dict = new global_1.Map();
  }

  take(key, count) {
    if (count === void 0) return this.pop(key);
    const vs = this.dict.get(key);
    const acc = [];

    while (vs && !vs.isEmpty() && count--) {
      acc.push(vs.pop());
    }

    return acc;
  }

  ref(key) {
    let vs = this.dict.get(key);
    if (vs) return vs;
    vs = new Queue();
    this.dict.set(key, vs);
    return vs;
  }

  get size() {
    return this.length;
  }

  get(key) {
    return this.peek(key);
  }

  set(key, value) {
    this.push(key, value);
    return this;
  }

  has(key) {
    return this.dict.has(key);
  }

  delete(key) {
    return this.dict.delete(key);
  }

  *[Symbol.iterator]() {
    for (const {
      0: k,
      1: vs
    } of this.dict) {
      while (!vs.isEmpty()) {
        yield [k, vs.pop()];
      }
    }

    return;
  }

}

exports.MultiQueue = MultiQueue;

/***/ }),

/***/ 5026:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.cothrottle = exports.debounce = exports.throttle = void 0;

const global_1 = __webpack_require__(4128);

const clock_1 = __webpack_require__(7681);

const exception_1 = __webpack_require__(7822);

function throttle(interval, callback, capacity = 1) {
  // Bug: Karma and TypeScript
  let timer = 0;
  let buffer = [];
  return function self(data) {
    if (capacity === 1) {
      buffer = [data];
    } else {
      buffer.length === capacity && buffer.shift();
      buffer.push(data);
    }

    if (timer !== 0) return;
    timer = (0, global_1.setTimeout)(async () => {
      const buf = buffer;
      buffer = [];

      try {
        await callback.call(this, buf[buf.length - 1], buf);
      } catch (reason) {
        (0, exception_1.causeAsyncException)(reason);
      }

      timer = 0;
      buffer.length > 0 && self.call(this, buffer.pop());
    }, interval);
  };
}

exports.throttle = throttle;

function debounce(delay, callback, capacity = 1) {
  // Bug: Karma and TypeScript
  let timer = 0;
  let buffer = [];
  let callable = true;
  return function self(data) {
    if (capacity === 1) {
      buffer = [data];
    } else {
      buffer.length === capacity && buffer.shift();
      buffer.push(data);
    }

    if (timer !== 0) return;
    timer = (0, global_1.setTimeout)(() => {
      timer = 0;
      (0, global_1.setTimeout)(async () => {
        if (timer !== 0) return;
        if (!callable) return;
        const buf = buffer;
        buffer = [];
        callable = false;

        try {
          await callback.call(this, buf[buf.length - 1], buf);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
        }

        callable = true;
        buffer.length > 0 && self.call(this, buffer.pop());
      }, delay);
    }, delay);
  };
}

exports.debounce = debounce;

function cothrottle(routine, resource, scheduler) {
  return async function* () {
    let start = (0, clock_1.now)();

    for await (const value of routine()) {
      if (resource - ((0, clock_1.now)() - start) > 0) {
        yield value;
      } else {
        await scheduler();
        start = (0, clock_1.now)();
      }
    }
  };
}

exports.cothrottle = cothrottle;

/***/ }),

/***/ 8520:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.wait = exports.captureTimers = exports.setRepeatTimer = exports.setTimer = void 0;

const global_1 = __webpack_require__(4128);

const function_1 = __webpack_require__(6288);

exports.setTimer = template(false);
exports.setRepeatTimer = template(true);

function template(repeat) {
  return (timeout, handler, unhandler) => {
    let params;
    let id = (0, global_1.setTimeout)(async function loop() {
      params = [await handler()];
      if (!repeat) return;
      id = (0, global_1.setTimeout)(loop, timeout);
    }, timeout);
    return (0, function_1.singleton)(() => {
      (0, global_1.clearTimeout)(id);
      params && unhandler?.(params[0]);
    });
  };
}

function captureTimers(callback) {
  const start = (0, global_1.setTimeout)(function_1.noop);
  (0, global_1.clearTimeout)(start);
  if (typeof start !== 'number') throw new Error('Timer ID is not a number');
  return (0, function_1.singleton)((...as) => {
    const end = (0, global_1.setTimeout)(function_1.noop);
    (0, global_1.clearTimeout)(end);

    for (let i = start; i < end; ++i) {
      (0, global_1.clearTimeout)(i);
    }

    callback?.(...as);
  });
}

exports.captureTimers = captureTimers;

function wait(ms) {
  return ms === 0 ? Promise.resolve(void 0) : new Promise(resolve => void (0, global_1.setTimeout)(resolve, ms));
}

exports.wait = wait;

/***/ }),

/***/ 5177:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.isPrimitive = exports.is = exports.type = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const ObjectPrototype = Object.prototype;
const ArrayPrototype = Array.prototype;

function type(value) {
  const type = typeof value;

  switch (type) {
    case 'function':
      return 'Function';

    case 'object':
      if (value === null) return 'null';
      const tag = value[global_1.Symbol.toStringTag];
      if (tag) return tag;

      switch ((0, alias_1.ObjectGetPrototypeOf)(value)) {
        case ArrayPrototype:
          return 'Array';

        case ObjectPrototype:
          return 'Object';

        default:
          return (0, alias_1.toString)(value).slice(8, -1);
      }

    default:
      return type;
  }
}

exports.type = type;

function is(type, value) {
  switch (type) {
    case 'null':
      return value === null;

    case 'array':
      return (0, alias_1.isArray)(value);

    case 'object':
      return value !== null && typeof value === type;

    default:
      return typeof value === type;
  }
}

exports.is = is;

function isPrimitive(value) {
  switch (typeof value) {
    case 'function':
      return false;

    case 'object':
      return value === null;

    default:
      return true;
  }
}

exports.isPrimitive = isPrimitive;

/***/ }),

/***/ 7099:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.uuid = void 0;

const global_1 = __webpack_require__(4128); // Version 4


const format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

function uuid() {
  let acc = '';

  for (let i = 0; i < format.length; ++i) {
    const c = format[i];

    switch (c) {
      case 'x':
        acc += HEX[rnd16()];
        continue;

      case 'y':
        acc += HEX[rnd16() & 0x03 | 0x08];
        continue;

      default:
        acc += c;
        continue;
    }
  }

  return acc;
}

exports.uuid = uuid;
const HEX = [...Array(16)].map((_, i) => i.toString(16)).join('');
const buffer = new Uint16Array(512);
const digit = 16;
const mask = digit - 1;
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

/***/ }),

/***/ 4279:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(8593), exports);

/***/ }),

/***/ 9886:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Ownership = exports.StorageChannel = exports.StoreChannel = void 0;

const api_1 = __webpack_require__(8557);

const api_2 = __webpack_require__(8347);

const channel_1 = __webpack_require__(2825);

const channel_2 = __webpack_require__(6023);

__exportStar(__webpack_require__(8557), exports);

__exportStar(__webpack_require__(8347), exports);

class StoreChannel extends api_1.StoreChannel {
  constructor(name, config) {
    super(name, config.schemas, config);
  }

}

exports.StoreChannel = StoreChannel;

(function (StoreChannel) {
  StoreChannel.Value = api_1.StoreChannel.Value;
})(StoreChannel = exports.StoreChannel || (exports.StoreChannel = {}));

class StorageChannel extends api_2.StorageChannel {
  constructor(name, config) {
    super(name, api_2.localStorage || api_2.sessionStorage || api_2.fakeStorage, config);
  }

}

exports.StorageChannel = StorageChannel;

(function (StorageChannel) {
  StorageChannel.Value = api_2.StorageChannel.Value;
})(StorageChannel = exports.StorageChannel || (exports.StorageChannel = {}));

class Ownership extends channel_2.Ownership {
  constructor(name) {
    super(new channel_1.Channel(name, false));
  }

}

exports.Ownership = Ownership;

/***/ }),

/***/ 8089:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.hasBinary = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = void 0;

const global_1 = __webpack_require__(4128);

const type_1 = __webpack_require__(5177);

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
        return value === null || isBinary(value) || global_1.Object.entries(value).every(isValidProperty);
      } catch {
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
  return !(0, type_1.isPrimitive)(value) ? isBinary(value) || global_1.Object.values(value).some(hasBinary) : false;
}

exports.hasBinary = hasBinary;

/***/ }),

/***/ 7155:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.EventRecordValue = exports.SavedEventRecord = exports.LoadedEventRecord = exports.StoredEventRecord = exports.UnstoredEventRecord = exports.EventRecordType = void 0;

const global_1 = __webpack_require__(4128);

const identifier_1 = __webpack_require__(4581);

const value_1 = __webpack_require__(8089);

const assign_1 = __webpack_require__(4401);

exports.EventRecordType = {
  Put: 'put',
  Delete: 'delete',
  Snapshot: 'snapshot'
};

class EventRecord {
  constructor(id, type, key, value, date) {
    this.id = id;
    this.type = type;
    this.key = key;
    this.value = value;
    this.date = date;
    if (typeof this.id !== 'number' || this.id >= 0 === false || !global_1.Number.isSafeInteger(this.id)) throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${this.id}`);
    if (typeof this.type !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${this.type}`);
    if (typeof this.key !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${this.key}`);
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${JSON.stringify(this.value)}`);
    if (typeof this.date !== 'number' || this.date >= 0 === false || !global_1.Number.isFinite(this.date)) throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${this.date}`);
    this.prop = this.type === exports.EventRecordType.Put ? global_1.Object.keys(value).filter(value_1.isValidPropertyName)[0] : '';
    if (typeof this.prop !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop: ${this.key}`);

    switch (type) {
      case exports.EventRecordType.Put:
        if (!(0, value_1.isValidPropertyName)(this.prop)) throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        this.value = value = new EventRecordValue({
          [this.prop]: value[this.prop]
        });
        return;

      case exports.EventRecordType.Snapshot:
        if (this.prop !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        this.value = value = new EventRecordValue(value);
        return;

      case exports.EventRecordType.Delete:
        if (this.prop !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        this.value = value = new EventRecordValue();
        return;

      default:
        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${type}`);
    }
  }

}

class UnstoredEventRecord extends EventRecord {
  constructor(key, value, type = exports.EventRecordType.Put, date = global_1.Date.now()) {
    super((0, identifier_1.makeEventId)(0), type, key, value, date);
    this.EVENT_RECORD; // Must not have id property.

    if (this.id !== 0) throw new TypeError(`ClientChannel: UnstoredEventRecord: Invalid event id: ${this.id}`);
  }

}

exports.UnstoredEventRecord = UnstoredEventRecord;

class StoredEventRecord extends EventRecord {
  constructor(id, key, value, type, date) {
    super(id, type, key, value, date);
    if (this.id > 0 === false) throw new TypeError(`ClientChannel: StoredEventRecord: Invalid event id: ${this.id}`);
  }

}

exports.StoredEventRecord = StoredEventRecord;

class LoadedEventRecord extends StoredEventRecord {
  constructor({
    id,
    key,
    value,
    type,
    date
  }) {
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

/***/ }),

/***/ 4581:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.makeEventId = void 0;
var Identifier;

(function (Identifier) {})(Identifier || (Identifier = {}));

function makeEventId(id) {
  return id;
}

exports.makeEventId = makeEventId;

/***/ }),

/***/ 7929:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.compose = exports.record = exports.EventStore = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const api_1 = __webpack_require__(3648);

const identifier_1 = __webpack_require__(4581);

const event_1 = __webpack_require__(7155);

const value_1 = __webpack_require__(8089);

const observer_1 = __webpack_require__(4615);

const clock_1 = __webpack_require__(7681);

const concat_1 = __webpack_require__(302);

const exception_1 = __webpack_require__(7822);

var EventStoreSchema;

(function (EventStoreSchema) {
  EventStoreSchema.id = 'id';
  EventStoreSchema.key = 'key'; //export const type = 'type';
  //export const prop = 'prop';
  //export const value = 'value';
  //export const date = 'date';
  //export const surrogateKeyDateField = 'key+date';
})(EventStoreSchema || (EventStoreSchema = {}));

class EventStore {
  constructor(name, listen, relation) {
    this.name = name;
    this.listen = listen;
    this.relation = relation;
    this.alive = true;
    this.memory = new observer_1.Observation({
      limit: 1
    });
    this.status = {
      store: this,
      ids: new global_1.Map(),
      dates: new global_1.Map(),

      update(event) {
        this.dates.set(event.key, (0, alias_1.max)(event.date, this.dates.get(event.key) || 0));
        this.ids.set(event.key, (0, identifier_1.makeEventId)((0, alias_1.max)(event.id, this.ids.get(event.key) || 0)));

        if (event instanceof event_1.LoadedEventRecord) {
          return void this.store.events.load.emit([event.key, event.prop, event.type], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
        }

        if (event instanceof event_1.SavedEventRecord) {
          return void this.store.events.save.emit([event.key, event.prop, event.type], new EventStore.Event(event.type, event.id, event.key, event.prop, event.date));
        }
      }

    };
    this.events = {
      load: new observer_1.Observation(),
      save: new observer_1.Observation(),
      loss: new observer_1.Observation(),
      clear: new observer_1.Observation()
    };
    this.tx = {
      rwc: 0
    };
    this.counter = 0;
    this.snapshotCycle = 9; // Clean events.

    this.events.load.monitor([], event => {
      switch (event.type) {
        case EventStore.EventType.Delete:
        case EventStore.EventType.Snapshot:
          clean(event);
      }
    });
    this.events.save.monitor([], event => {
      switch (event.type) {
        case EventStore.EventType.Delete:
        case EventStore.EventType.Snapshot:
          this.clean(event.key);
          clean(event);
      }
    });

    const clean = event => {
      for (const ev of this.memory.reflect([event.key])) {
        0 < ev.id && ev.id < event.id && this.memory.off([ev.key, ev.prop, true, ev.id]);
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
          store.createIndex(EventStoreSchema.id, EventStoreSchema.id, {
            unique: true
          });
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
    if (++this.tx.rwc < 25 || !this.tx.rw) return;
    const tx = this.tx.rw;
    this.tx.rwc = 0;
    this.tx.rw = void 0;
    tx.commit();
    return this.tx.rw;
  }

  set txrw(tx) {
    if (this.tx.rw === tx) return;
    this.tx.rwc = 0;
    this.tx.rw = tx;

    const clear = () => {
      if (this.tx.rw !== tx) return;
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
    if (!this.alive) return void cb?.(new Error('Session is already closed.'));
    const events = [];
    return void this.listen(db => {
      if (!this.alive) return void cb?.(new Error('Session is already closed.'));
      if (cancellation?.isCancelled) return void cb?.(new Error('Request is cancelled.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = tx.objectStore(this.name).index(EventStoreSchema.key).openCursor(key, 'prev');
      req.addEventListener('success', () => {
        const cursor = req.result;
        if (!cursor) return;
        let event;

        try {
          event = new event_1.LoadedEventRecord(cursor.value);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
          cursor.delete();
          return void cursor.continue();
        }

        if (event.id < this.meta(key).id) return;
        events.unshift(event);
        if (event.type !== EventStore.EventType.Put) return;
        cursor.continue();
      });
      tx.addEventListener('complete', () => {
        // Remove overridable events.
        for (const [, event] of new global_1.Map(events.map(ev => [ev.prop, ev]))) {
          this.memory.off([event.key, event.prop, event.id > 0, event.id]);
          this.memory.on([event.key, event.prop, event.id > 0, event.id], () => event);
          this.status.update(event);
        }

        try {
          cb?.(req.error);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
        }

        if (events.length >= this.snapshotCycle) {
          this.snapshot(key);
        }
      });
      tx.addEventListener('complete', () => void cancellation?.close());
      tx.addEventListener('error', () => (void cancellation?.close(), void cb?.(tx.error || req.error)));
      tx.addEventListener('abort', () => (void cancellation?.close(), void cb?.(tx.error || req.error)));
      cancellation?.register(() => void tx.abort());
    }, () => void cb?.(new Error('Request has failed.')));
  }

  keys() {
    return this.memory.reflect([]).reduce((keys, ev) => keys.at(-1) !== ev.key ? (0, concat_1.concat)(keys, [ev.key]) : keys, []).sort();
  }

  has(key) {
    return compose(key, this.memory.reflect([key])).type !== EventStore.EventType.Delete;
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
    return global_1.Object.assign(global_1.Object.create(null), compose(key, this.memory.reflect([key])).value);
  }

  add(event, tx) {
    if (!this.alive) return;
    const revert = this.memory.on([event.key, event.prop, false, ++this.counter], () => event);
    this.status.update(event);

    const active = () => this.memory.reflect([event.key, event.prop, false]).includes(event);

    const loss = () => void this.events.loss.emit([event.key, event.prop, event.type], new EventStore.Event(event.type, (0, identifier_1.makeEventId)(0), event.key, event.prop, event.date));

    return void this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
      if (!active()) return;
      const req = tx.objectStore(this.name).add(record(event));
      const ev = event;
      tx.addEventListener('complete', () => {
        revert();
        const event = new event_1.SavedEventRecord((0, identifier_1.makeEventId)(req.result), ev.key, ev.value, ev.type, ev.date);
        this.memory.off([event.key, event.prop, true, event.id]);
        this.memory.on([event.key, event.prop, true, event.id], () => event);
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
    return void this.add(new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.Delete));
  }

  snapshot(key) {
    if (!this.alive) return;
    return void this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
      if (!this.has(key) || this.meta(key).id === 0) return;
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
          if (events.length <= 1) return;
          if (events.at(-1).type === EventStore.EventType.Snapshot) return;
          const event = compose(key, events);
          if (event.id > 0) return;

          switch (event.type) {
            case EventStore.EventType.Snapshot:
              // Snapshot's date must not be later than unsaved event's date.
              return void this.add(new event_1.UnstoredEventRecord(event.key, event.value, event.type, events.reduce((date, ev) => ev.date > date ? ev.date : date, 0)), tx);

            case EventStore.EventType.Delete:
              return void tx.commit();

            case EventStore.EventType.Put:
            default:
              throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${event.type}`);
          }
        }
      });
    }, () => void 0);
  }

  clean(key) {
    if (!this.alive) return;
    const events = [];
    let deletion = false;
    let clear;
    return void this.cursor(api_1.IDBKeyRange.only(key), EventStoreSchema.key, 'prev', 'readwrite', this.relation?.stores ?? [], (error, cursor, tx) => {
      if (!this.alive) return;
      if (error) return;

      if (cursor) {
        let event;

        try {
          event = new event_1.LoadedEventRecord(cursor.value);
        } catch (reason) {
          (0, exception_1.causeAsyncException)(reason);
          cursor.delete();
        }

        switch (event.type) {
          case EventStore.EventType.Put:
            clear ??= false;
            if (deletion) break;
            return void cursor.continue();

          case EventStore.EventType.Snapshot:
            clear ??= false;
            if (deletion) break;
            deletion = true;
            return void cursor.continue();

          case EventStore.EventType.Delete:
            clear ??= true;
            deletion = true;
            break;
        }

        events.unshift(event);
        cursor.delete();
        return void cursor.continue();
      } else if (tx) {
        if (clear && this.memory.reflect([key]).every(ev => ev.id > 0)) {
          this.relation?.delete(key, tx);
        }

        return;
      } else if (events.length > 0) {
        for (const event of events) {
          this.memory.off([event.key, event.prop, true, event.id]);
        }

        for (const event of this.memory.reflect([key]).filter(ev => 0 < ev.id && ev.id < events.at(-1).id)) {
          this.memory.off([event.key, event.prop, true, event.id]);
        }

        return;
      }
    });
  }

  cursor(query, index, direction, mode, stores, cb) {
    if (!this.alive) return void cb(new Error('Session is already closed.'), null, null);
    return void this.listen(db => {
      if (!this.alive) return void cb(new Error('Session is already closed.'), null, null);
      const tx = db.transaction([this.name, ...stores], mode);
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

  class Value extends event_1.EventRecordValue {}

  EventStore.Value = Value;
})(EventStore = exports.EventStore || (exports.EventStore = {}));

function record(event) {
  const record = { ...event
  };
  // @ts-expect-error
  delete record.id;
  return record;
}

exports.record = record;

function compose(key, events) {
  return group(events).map(events => events.reduceRight(compose, new event_1.UnstoredEventRecord(key, new EventStore.Value(), EventStore.EventType.Delete, 0))).reduce(ev => ev);

  function group(events) {
    return events.map((ev, i) => [ev, i]).sort(([a, ai], [b, bi]) => void 0 || global_1.indexedDB.cmp(a.key, b.key) || b.date - a.date || b.id > 0 && a.id > 0 && b.id - a.id || bi - ai).reduceRight(([head, ...tail], [event]) => {
      const prev = head[0];
      if (!prev) return [[event]];
      return prev.key === event.key ? (0, concat_1.concat)([(0, concat_1.concat)([event], head)], tail) : (0, concat_1.concat)([[event]], (0, concat_1.concat)([head], tail));
    }, [[]]);
  }

  function compose(target, source) {
    switch (source.type) {
      case EventStore.EventType.Put:
        return new event_1.UnstoredEventRecord(source.key, new EventStore.Value(target.value, {
          [source.prop]: source.value[source.prop]
        }), EventStore.EventType.Snapshot);

      case EventStore.EventType.Snapshot:
        return source;

      case EventStore.EventType.Delete:
        return source;
    }

    throw new TypeError(`ClientChannel: EventStore: Invalid event type: ${source}`);
  }
}

exports.compose = compose;

/***/ }),

/***/ 7216:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.KeyValueStore = void 0;

const global_1 = __webpack_require__(4128);

const clock_1 = __webpack_require__(7681);

const exception_1 = __webpack_require__(7822);

class KeyValueStore {
  constructor(name, index, listen) {
    this.name = name;
    this.index = index;
    this.listen = listen;
    this.alive = true;
    this.cache = new Map();
    this.tx = {
      rwc: 0
    };
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
    if (++this.tx.rwc < 25 || !this.tx.rw) return;
    const tx = this.tx.rw;
    this.tx.rwc = 0;
    this.tx.rw = void 0;
    tx.commit();
    return this.tx.rw;
  }

  set txrw(tx) {
    if (this.tx.rw === tx) return;
    this.tx.rwc = 0;
    this.tx.rw = tx;

    const clear = () => {
      if (this.tx.rw !== tx) return;
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
    if (!this.alive) return void cb?.(new Error('Session is already closed.'), key);
    return void this.listen(db => {
      if (!this.alive) return void cb?.(new Error('Session is already closed.'), key);
      if (cancellation?.isCancelled) return void cb?.(new Error('Request is cancelled.'), key);
      const tx = db.transaction(this.name, 'readonly');
      const req = this.index ? tx.objectStore(this.name).index(this.index).get(key) : tx.objectStore(this.name).get(key);
      req.addEventListener('success', () => void cb?.(tx.error || req.error, key, req.result) && this.cache.set(key, req.result));
      tx.addEventListener('complete', () => void cancellation?.close());
      tx.addEventListener('error', () => (void cancellation?.close(), void cb?.(tx.error || req.error, key)));
      tx.addEventListener('abort', () => (void cancellation?.close(), void cb?.(tx.error || req.error, key)));
      cancellation?.register(() => void tx.abort());
    }, () => void cb?.(new Error('Request has failed.'), key));
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
    if (!this.alive) return value;
    this.transact(db => this.alive && this.cache.has(key) ? db.transaction(this.name, 'readwrite') : void 0, tx => {
      this.index ? tx.objectStore(this.name).put(this.cache.get(key)) : tx.objectStore(this.name).put(this.cache.get(key), key);
      tx.addEventListener('complete', () => void cb?.(tx.error, key, value));
      tx.addEventListener('error', () => void cb?.(tx.error, key, value));
      tx.addEventListener('abort', () => void cb?.(tx.error, key, value));
    }, () => void cb?.(new Error('Request has failed.'), key, value));
    return value;
  }

  delete(key, cb) {
    this.cache.delete(key);
    if (!this.alive) return;
    this.transact(db => this.alive ? db.transaction(this.name, 'readwrite') : void 0, tx => {
      tx.objectStore(this.name).delete(key);
      tx.addEventListener('complete', () => void cb?.(tx.error, key));
      tx.addEventListener('error', () => void cb?.(tx.error, key));
      tx.addEventListener('abort', () => void cb?.(tx.error, key));
    }, () => void cb?.(new Error('Request has failed.'), key));
  }

  count(query, index) {
    return new global_1.Promise((resolve, reject) => void this.listen(db => {
      if (!this.alive) return void reject(new Error('Session is already closed.'));
      const tx = db.transaction(this.name, 'readonly');
      const req = index ? tx.objectStore(this.name).index(index).count(query ?? void 0) : tx.objectStore(this.name).count(query ?? void 0);
      req.addEventListener('success', () => void resolve(req.result));
      tx.addEventListener('complete', () => void reject(req.error));
      tx.addEventListener('error', () => void reject(req.error));
      tx.addEventListener('abort', () => void reject(req.error));
    }, () => void reject(new Error('Request has failed.'))));
  }

  getAll(query, count, index, mode, stores, cb) {
    if (!this.alive) return;
    this.listen(db => {
      if (!this.alive) return;
      const tx = db.transaction([this.name, ...stores], mode);
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
    if (!this.alive) return;
    this.listen(db => {
      if (!this.alive) return;
      const tx = db.transaction([this.name, ...stores], mode);
      const req = index ? tx.objectStore(this.name).index(index).openCursor(query, direction) : tx.objectStore(this.name).openCursor(query, direction);
      req.addEventListener('success', () => {
        const cursor = req.result;

        if (cursor) {
          try {
            this.cache.set(cursor.primaryKey, { ...cursor.value
            });
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

/***/ }),

/***/ 2825:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
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
  if (msg.version !== version) return;
  return msg;
}

const cache = new Set();

class Channel {
  constructor(name, debug) {
    this.name = name;
    this.debug = debug;
    this.channel = new BroadcastChannel(`clientchannel::${this.name}`);
    this.listeners = new Set();
    this.alive = true;
    if (cache.has(name)) throw new Error(`ClientChannel: Broadcast channel "${name}" is already open.`);
    cache.add(this.name);
  }

  ensureAliveness() {
    if (!this.alive) throw new Error(`ClientChannel: Broadcast channel "${this.name}" is already closed.`);
  }

  listen(type, listener) {
    this.ensureAliveness();
    this.listeners.add(handler);
    this.channel.addEventListener('message', handler);
    const {
      debug
    } = this;
    return () => {
      this.listeners.delete(handler);
      this.channel.removeEventListener('message', handler);
    };

    function handler(ev) {
      const msg = parse(ev.data);
      if (!msg || msg.type !== type) return;
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

/***/ }),

/***/ 903:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.build = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = exports.DAO = void 0;

var builder_1 = __webpack_require__(666);

Object.defineProperty(exports, "DAO", ({
  enumerable: true,
  get: function () {
    return builder_1.DAO;
  }
}));
Object.defineProperty(exports, "isValidProperty", ({
  enumerable: true,
  get: function () {
    return builder_1.isValidProperty;
  }
}));
Object.defineProperty(exports, "isValidPropertyName", ({
  enumerable: true,
  get: function () {
    return builder_1.isValidPropertyName;
  }
}));
Object.defineProperty(exports, "isValidPropertyValue", ({
  enumerable: true,
  get: function () {
    return builder_1.isValidPropertyValue;
  }
}));
Object.defineProperty(exports, "build", ({
  enumerable: true,
  get: function () {
    return builder_1.build;
  }
}));

/***/ }),

/***/ 666:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.build = exports.DAO = exports.isValidPropertyValue = exports.isValidPropertyName = exports.isValidProperty = void 0;

const global_1 = __webpack_require__(4128);

const value_1 = __webpack_require__(8089);

var value_2 = __webpack_require__(8089);

Object.defineProperty(exports, "isValidProperty", ({
  enumerable: true,
  get: function () {
    return value_2.isValidProperty;
  }
}));
Object.defineProperty(exports, "isValidPropertyName", ({
  enumerable: true,
  get: function () {
    return value_2.isValidPropertyName;
  }
}));
Object.defineProperty(exports, "isValidPropertyValue", ({
  enumerable: true,
  get: function () {
    return value_2.isValidPropertyValue;
  }
}));
var DAO;

(function (DAO) {
  DAO.meta = Symbol.for('clientchannel/DAO.meta');
  DAO.id = Symbol.for('clientchannel/DAO.id');
  DAO.key = Symbol.for('clientchannel/DAO.key');
  DAO.date = Symbol.for('clientchannel/DAO.data');
  DAO.event = Symbol.for('clientchannel/DAO.event');
})(DAO = exports.DAO || (exports.DAO = {}));

function build(source, target, set, get) {
  if (typeof source[DAO.key] !== 'string') throw new TypeError(`ClientChannel: DAO: Invalid key: ${source[DAO.key]}`);
  const descmap = { ...global_1.Object.entries(target).filter(value_1.isValidProperty).reduce((map, [prop, iniValue]) => {
      {
        const desc = global_1.Object.getOwnPropertyDescriptor(target, prop) ?? {};
        if (desc.get || desc.set) return map;
      }

      if (!(prop in source)) {
        source[prop] = iniValue;
      }

      map[prop] = {
        enumerable: true,

        get() {
          const value = source[prop];
          get?.(prop, value);
          return value;
        },

        set(newValue) {
          if (!(0, value_1.isValidPropertyValue)(newValue)) throw new TypeError(`ClientChannel: DAO: Invalid value: ${JSON.stringify(newValue)}`);
          const oldValue = source[prop];
          source[prop] = newValue;
          set?.(prop, newValue, oldValue);
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
  global_1.Object.defineProperties(target, descmap);
  global_1.Object.seal(target);
  return target;
}

exports.build = build;

/***/ }),

/***/ 8557:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StoreChannel = void 0;

var channel_1 = __webpack_require__(1159);

Object.defineProperty(exports, "StoreChannel", ({
  enumerable: true,
  get: function () {
    return channel_1.StoreChannel;
  }
}));

/***/ }),

/***/ 312:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ChannelStore = void 0;

const global_1 = __webpack_require__(4128);

const api_1 = __webpack_require__(3648);

const api_2 = __webpack_require__(903);

const data_1 = __webpack_require__(7808);

const access_1 = __webpack_require__(1735);

const expiry_1 = __webpack_require__(7163);

const channel_1 = __webpack_require__(2825);

const channel_2 = __webpack_require__(6023);

const observer_1 = __webpack_require__(4615);

const cancellation_1 = __webpack_require__(412);

const promise_1 = __webpack_require__(4879);

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
      load: new observer_1.Observation({
        limit: global_1.Infinity
      }),
      save: new observer_1.Observation({
        limit: global_1.Infinity
      }),
      loss: new observer_1.Observation({
        limit: global_1.Infinity
      })
    };
    this.ages = new Map();
    if (cache.has(name)) throw new Error(`ClientChannel: Store channel "${name}" is already open.`);
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

    })); // NOTE: Deleting databases on devtools won't trigger the `destroy` event
    // but `indexedDB.deleteDatabase()` triggers the event as expected.

    this.cancellation.register(api_1.idbEventStream.on([name, "destroy"
    /* IDBEventType.destroy */
    ], () => void this.stores.rebuild()));
    this.cancellation.register(() => void this.stores.close());
    this.cancellation.register(() => void this.ownership.close());
    this.cancellation.register(() => void this.channel.close());
    this.cancellation.register(this.channel.listen('save', ({
      key
    }) => void this.load(key)));
    this.events$.save.monitor([], ({
      key
    }) => void this.channel.post(new SaveMessage(key)));
    if (this.capacity === global_1.Infinity) return;
    this.events$.load.monitor([], ({
      key,
      type
    }) => {
      if (type === ChannelStore.EventType.Delete) {
        this.keys.delete(key);
      } else if (!this.keys.has(key)) {
        this.keys.add(key);
      }
    });
    this.events$.save.monitor([], ({
      key,
      type
    }) => {
      if (type === ChannelStore.EventType.Delete) {
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
    if (!this.alive) throw new Error(`ClientChannel: Store channel "${this.name}" is already closed.`);
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
    if (!this.alive) return;
    this.stores.access.set(key);
    this.stores.expiry.set(key, this.ages.get(key) ?? this.age);
  }

  expire(key, age = this.age) {
    this.ensureAliveness();
    this.ages.set(key, age);
  }

  recent(cb, timeout) {
    if (typeof cb === 'number') return this.recent(void 0, cb);
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
  })(Value = ChannelStore.Value || (ChannelStore.Value = {}));

  ChannelStore.Event = data_1.DataStore.Event;
  ChannelStore.EventType = data_1.DataStore.EventType;
  ChannelStore.Record = data_1.DataStore.Record;
})(ChannelStore = exports.ChannelStore || (exports.ChannelStore = {}));

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
      stores: [this.access.name, this.expiry.name],
      delete: (key, tx) => {
        tx.objectStore(this.access.name).delete(key);
        tx.objectStore(this.expiry.name).delete(key);
      }
    });
    this.cancellation.register(() => this.data.close());
    this.cancellation.register(() => this.access.close());
    this.cancellation.register(() => this.expiry.close());
    this.cancellation.register(this.store.events$.load.relay(this.data.events.load));
    this.cancellation.register(this.store.events$.save.relay(this.data.events.save)); // @ts-expect-error

    this.cancellation.register(this.store.events.load.relay(this.data.events.load)); // @ts-expect-error

    this.cancellation.register(this.store.events.save.relay(this.data.events.save)); // @ts-expect-error

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

/***/ }),

/***/ 1735:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _a, _b;

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.AccessStore = exports.name = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const store_1 = __webpack_require__(7216);

const timer_1 = __webpack_require__(8520);

exports.name = 'access';

class AccessStore {
  constructor(chan, cancellation, ownership, listen, capacity) {
    this.chan = chan;
    this.cancellation = cancellation;
    this.ownership = ownership;
    this.listen = listen;
    this.capacity = capacity;
    this.name = exports.name;
    this.store = new class extends store_1.KeyValueStore {}(exports.name, "key"
    /* AccessStoreSchema.key */
    , this.listen);

    this.schedule = (() => {
      let untimer;
      let delay = 10 * 1000;
      let schedule = global_1.Infinity;
      return timeout => {
        if (this.capacity === global_1.Infinity) return;
        timeout = (0, alias_1.min)(timeout, 60 * 60 * 1000);
        if (global_1.Date.now() + timeout >= schedule) return;
        schedule = global_1.Date.now() + timeout;
        untimer?.();
        untimer = (0, timer_1.setTimer)(timeout, async () => {
          if (!this.cancellation.isAlive) return;
          if (schedule === 0) return;
          schedule = global_1.Infinity;
          if (!this.ownership.take('store', delay)) return void this.schedule(delay *= 2);
          if (this.chan.lock) return void this.schedule(delay);
          let untimer = (0, timer_1.setRepeatTimer)(1000, () => {
            if (this.ownership.extend('store', delay)) return;
            untimer();
          });
          this.chan.lock = true;
          const size = await this.store.count(null, "key"
          /* AccessStoreSchema.key */
          ).catch(() => NaN);
          this.chan.lock = false;
          if (size >= 0 === false) return void untimer() || void this.schedule(delay *= 2);
          if (size <= this.capacity) return void untimer();
          const limit = 100;
          schedule = 0;
          this.chan.lock = true;
          return void this.store.getAll(null, (0, alias_1.min)(size - this.capacity, limit), "date"
          /* AccessStoreSchema.date */
          , 'readonly', [], (error, cursor, tx) => {
            if (!cursor && !tx) return;
            this.chan.lock = false;
            schedule = global_1.Infinity;
            untimer();
            if (!this.cancellation.isAlive) return;
            if (error) return void this.schedule(delay * 10);
            if (!cursor) return;
            if (!this.ownership.extend('store', delay)) return void this.schedule(delay *= 2);

            for (const {
              key
            } of cursor) {
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
          keyPath: "key"
          /* AccessStoreSchema.key */
          ,
          autoIncrement: false
        });

        if (!store.indexNames.contains("key"
        /* AccessStoreSchema.key */
        )) {
          store.createIndex("key"
          /* AccessStoreSchema.key */
          , "key"
          /* AccessStoreSchema.key */
          , {
            unique: true
          });
        }

        if (!store.indexNames.contains("date"
        /* AccessStoreSchema.date */
        )) {
          store.createIndex("date"
          /* AccessStoreSchema.date */
          , "date"
          /* AccessStoreSchema.date */
          );
        }

        return true;
      },

      verify(db) {
        return db.objectStoreNames.contains(exports.name) && db.transaction(exports.name).objectStore(exports.name).indexNames.contains("key"
        /* AccessStoreSchema.key */
        ) && db.transaction(exports.name).objectStore(exports.name).indexNames.contains("date"
        /* AccessStoreSchema.date */
        );
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
      void this.store.cursor(null, "date"
      /* AccessStoreSchema.date */
      , 'prev', 'readonly', [], (error, cursor) => {
        if (done) return;
        if (error) return void reject(error);
        if (!cursor) return void resolve(keys);
        const {
          key,
          active
        } = cursor.value;

        if (active) {
          keys.push(key);
          if (cb?.(key, keys) === false) return void resolve(keys);
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
    this.active = active; // Bug: TypeScript

    this[_a] = '';
    this[_b] = global_1.Date.now();
    this["key"
    /* AccessStoreSchema.key */
    ] = key;
  }

}

_a = "key"
/* AccessStoreSchema.key */
, _b = "date"
/* AccessStoreSchema.date */
;

/***/ }),

/***/ 7808:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.DataStore = exports.name = void 0;

const store_1 = __webpack_require__(7929);

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
})(DataStore = exports.DataStore || (exports.DataStore = {}));

/***/ }),

/***/ 7163:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _a, _b;

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ExpiryStore = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const store_1 = __webpack_require__(7216);

const timer_1 = __webpack_require__(8520);

const name = 'expiry';

class ExpiryStore {
  constructor(chan, cancellation, ownership, listen) {
    this.chan = chan;
    this.cancellation = cancellation;
    this.ownership = ownership;
    this.listen = listen;
    this.name = name;
    this.store = new class extends store_1.KeyValueStore {}(name, "key"
    /* ExpiryStoreSchema.key */
    , this.listen);

    this.schedule = (() => {
      let untimer;
      let delay = 10 * 1000;
      let schedule = global_1.Infinity;
      return timeout => {
        timeout = (0, alias_1.min)(timeout, 60 * 60 * 1000);
        if (global_1.Date.now() + timeout >= schedule) return;
        schedule = global_1.Date.now() + timeout;
        untimer?.();
        untimer = (0, timer_1.setTimer)(timeout, () => {
          if (!this.cancellation.isAlive) return;
          if (schedule === 0) return;
          schedule = global_1.Infinity;
          if (!this.ownership.take('store', delay)) return void this.schedule(delay *= 2);
          if (this.chan.lock) return void this.schedule(delay);
          let untimer = (0, timer_1.setRepeatTimer)(1000, () => {
            if (this.ownership.extend('store', delay)) return;
            untimer();
          });
          const limit = 100;
          schedule = 0;
          this.chan.lock = true;
          return void this.store.getAll(null, limit, "expiry"
          /* ExpiryStoreSchema.expiry */
          , 'readonly', [], (error, cursor, tx) => {
            if (!cursor && !tx) return;
            this.chan.lock = false;
            schedule = global_1.Infinity;
            untimer();
            if (!this.cancellation.isAlive) return;
            if (error) return void this.schedule(delay * 10);
            if (!cursor) return;
            if (!this.ownership.extend('store', delay)) return void this.schedule(delay *= 2);

            for (const {
              key,
              expiry
            } of cursor) {
              if (expiry > global_1.Date.now()) return void this.schedule(expiry - global_1.Date.now());
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
          keyPath: "key"
          /* ExpiryStoreSchema.key */
          ,
          autoIncrement: false
        });

        if (!store.indexNames.contains("key"
        /* ExpiryStoreSchema.key */
        )) {
          store.createIndex("key"
          /* ExpiryStoreSchema.key */
          , "key"
          /* ExpiryStoreSchema.key */
          , {
            unique: true
          });
        }

        if (!store.indexNames.contains("expiry"
        /* ExpiryStoreSchema.expiry */
        )) {
          store.createIndex("expiry"
          /* ExpiryStoreSchema.expiry */
          , "expiry"
          /* ExpiryStoreSchema.expiry */
          );
        }

        return true;
      },

      verify(db) {
        return db.objectStoreNames.contains(name) && db.transaction(name).objectStore(name).indexNames.contains("key"
        /* ExpiryStoreSchema.key */
        ) && db.transaction(name).objectStore(name).indexNames.contains("expiry"
        /* ExpiryStoreSchema.expiry */
        );
      },

      destroy() {
        return true;
      }

    };
  }

  load(key, cancellation) {
    return this.store.load(key, (err, key, value) => !err && value?.expiry > this.store.get(key)?.expiry, cancellation);
  }

  set(key, age) {
    if (age === global_1.Infinity) return void this.store.delete(key);
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
    // Bug: TypeScript
    this[_a] = ''; // Bug: TypeScript

    this[_b] = 0;
    this["key"
    /* ExpiryStoreSchema.key */
    ] = key;
    this["expiry"
    /* ExpiryStoreSchema.expiry */
    ] = expiry;
  }

}

_a = "key"
/* ExpiryStoreSchema.key */
, _b = "expiry"
/* ExpiryStoreSchema.expiry */
;

/***/ }),

/***/ 1159:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StoreChannel = void 0;

const global_1 = __webpack_require__(4128);

const api_1 = __webpack_require__(903);

const channel_1 = __webpack_require__(312);

const api_2 = __webpack_require__(8347);

const observer_1 = __webpack_require__(4615);

const throttle_1 = __webpack_require__(5026);

const compare_1 = __webpack_require__(5529);

class StoreChannel extends channel_1.ChannelStore {
  constructor(name, schemas, {
    migrate,
    destroy = () => true,
    age = Infinity,
    capacity = Infinity,
    debug = false
  } = {}) {
    super(name, destroy, age, capacity, debug);
    this.schemas = schemas;
    this.sources = new Map();
    this.links = new Map();

    const update = (key, prop) => {
      const source = this.sources.get(key);
      const memory = this.get(key);
      const link = this.link$(key);
      const props = prop === '' ? global_1.Object.keys(memory) : prop in memory ? [prop] : [];
      const changes = props.map(prop => {
        const newValue = memory[prop];
        const oldValue = source[prop];
        source[prop] = newValue;
        return {
          prop,
          newValue,
          oldValue
        };
      }).filter(({
        newValue,
        oldValue
      }) => !(0, compare_1.equal)(newValue, oldValue));
      if (changes.length === 0) return;
      migrate?.(link);

      for (const {
        prop,
        oldValue
      } of changes) {
        source[StoreChannel.Value.event].emit([api_2.StorageChannel.EventType.recv, prop], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.recv, prop, memory[prop], oldValue));
      }
    };

    this.events$.load.monitor([], ({
      key,
      prop,
      type
    }) => {
      if (!this.sources.has(key)) return;

      switch (type) {
        case StoreChannel.EventType.Put:
        case StoreChannel.EventType.Snapshot:
          return void update(key, prop);

        case StoreChannel.EventType.Delete:
          return;
      }
    });
  }

  link$(key) {
    if (this.links.has(key)) return this.links.get(key);
    const source = this.get(key);
    this.sources.set(key, source);
    this.links.set(key, (0, api_1.build)(global_1.Object.defineProperties(source, {
      [StoreChannel.Value.meta]: {
        get: () => this.meta(key)
      },
      [StoreChannel.Value.id]: {
        get: () => this.meta(key).id
      },
      [StoreChannel.Value.key]: {
        get: () => this.meta(key).key
      },
      [StoreChannel.Value.date]: {
        get: () => this.meta(key).date
      },
      [StoreChannel.Value.event]: {
        value: new observer_1.Observation({
          limit: Infinity
        })
      }
    }), '' in this.schemas ? (this.schemas[key] ?? this.schemas[''])(key) : this.schemas[key](key), (prop, newValue, oldValue) => {
      if (!this.alive || this.sources.get(key) !== source) return;
      this.add(new StoreChannel.Record(key, {
        [prop]: newValue
      }));
      if ((0, compare_1.equal)(newValue, oldValue)) return;
      source[StoreChannel.Value.event].emit([api_2.StorageChannel.EventType.send, prop], new api_2.StorageChannel.Event(api_2.StorageChannel.EventType.send, prop, newValue, oldValue));
    }, (0, throttle_1.throttle)(100, () => {
      this.alive && this.sources.get(key) === source && this.log(key);
    }))).get(key);
    return this.link$(key);
  }

  link(key, age) {
    this.ensureAliveness();
    this.expire(key, age);
    const link = this.link$(key);
    const source = this.sources.get(key);
    this.load(key, error => {
      !error && this.alive && this.sources.get(key) === source && this.log(key);
    });
    return link;
  }

  unlink(link) {
    const key = typeof link === 'string' ? link : link[StoreChannel.Value.key];
    if (key !== link) return link === this.links.get(key) && this.unlink(key);
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
})(StoreChannel = exports.StoreChannel || (exports.StoreChannel = {}));

/***/ }),

/***/ 6023:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Ownership = void 0;

const global_1 = __webpack_require__(4128);

const alias_1 = __webpack_require__(5406);

const channel_1 = __webpack_require__(2825);

const cancellation_1 = __webpack_require__(412);

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
      const {
        priority: oldPriority
      } = this.getOwnership(key);

      switch (true) {
        case newPriority < 0:
          // Release the foreign ownership.
          return newPriority === oldPriority ? void this.store.delete(key) : void 0;

        case oldPriority === 0:
          // Accept the foreign ownership.
          return void this.setOwnership(key, -newPriority, newTTL);

        case oldPriority > 0:
          // First commit wins.
          return oldPriority < newPriority && this.has(key) // Notify my valid ownership.
          ? void this.castOwnership(key) // Accept the foreign ownership.
          : void this.setOwnership(key, -newPriority, newTTL);

        case oldPriority < 0:
          // Update the foreign ownership.
          // Last statement wins.
          return void this.setOwnership(key, -newPriority, newTTL);

        default:
      }
    });
  }

  static genPriority() {
    return global_1.Date.now();
  }

  getOwnership(key) {
    return this.store.get(key) ?? {
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
    const {
      priority,
      ttl
    } = this.getOwnership(key);
    this.channel.post(new OwnershipMessage(key, priority, ttl));
  }

  has(key) {
    const {
      priority,
      ttl
    } = this.getOwnership(key);
    return priority >= 0 && Ownership.genPriority() <= priority + ttl;
  }

  isTakable(key) {
    const {
      priority,
      ttl
    } = this.getOwnership(key);
    return priority >= 0 || Ownership.genPriority() > (0, alias_1.abs)(priority) + ttl;
  }

  take(key, ttl, wait) {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.isTakable(key)) return wait === void 0 ? false : global_1.Promise.resolve(false);
    ttl = (0, alias_1.floor)((0, alias_1.min)((0, alias_1.max)(ttl, 1 * 1000), 60 * 1000));
    wait = wait === void 0 ? wait : (0, alias_1.min)(wait, 0);
    const priority = Ownership.genPriority() + Ownership.throttle + Ownership.margin;
    this.setOwnership(key, priority, ttl);
    return wait === void 0 ? this.has(key) : new global_1.Promise(resolve => void (0, global_1.setTimeout)(() => void resolve(this.extend(key, ttl)), wait));
  }

  extend(key, ttl) {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    return this.has(key) ? this.take(key, ttl) : false;
  }

  release(key) {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.has(key)) return;
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

/***/ }),

/***/ 8347:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.fakeStorage = exports.sessionStorage = exports.localStorage = exports.StorageChannel = void 0;

var channel_1 = __webpack_require__(3448);

Object.defineProperty(exports, "StorageChannel", ({
  enumerable: true,
  get: function () {
    return channel_1.StorageChannel;
  }
}));

var api_1 = __webpack_require__(2376);

Object.defineProperty(exports, "localStorage", ({
  enumerable: true,
  get: function () {
    return api_1.localStorage;
  }
}));
Object.defineProperty(exports, "sessionStorage", ({
  enumerable: true,
  get: function () {
    return api_1.sessionStorage;
  }
}));

var storage_1 = __webpack_require__(9336);

Object.defineProperty(exports, "fakeStorage", ({
  enumerable: true,
  get: function () {
    return storage_1.fakeStorage;
  }
}));

/***/ }),

/***/ 9336:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
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

/***/ }),

/***/ 3448:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.StorageChannel = void 0;

const global_1 = __webpack_require__(4128);

const api_1 = __webpack_require__(903);

const api_2 = __webpack_require__(2376);

const storage_1 = __webpack_require__(9336);

const observer_1 = __webpack_require__(4615);

const cancellation_1 = __webpack_require__(412);

const compare_1 = __webpack_require__(5529);

const cache = new Set();

class StorageChannel {
  constructor(name, storage = api_2.sessionStorage || storage_1.fakeStorage, config) {
    this.name = name;
    this.storage = storage;
    this.config = config;
    this.cancellation = new cancellation_1.Cancellation();
    this.mode = this.storage === api_2.localStorage ? 'local' : 'session';
    this.events = {
      send: new observer_1.Observation({
        limit: Infinity
      }),
      recv: new observer_1.Observation({
        limit: Infinity
      })
    };
    if (cache.has(name)) throw new Error(`ClientChannel: Storage channel "${name}" is already open.`);
    cache.add(name);
    this.cancellation.register(() => void cache.delete(name));
    this.cancellation.register(api_2.storageEventStream.on([this.mode, this.name], ({
      newValue
    }) => {
      const source = this.source;
      const memory = parse(newValue);
      const link = this.$link;
      if (!source || !link) return;
      void global_1.Object.entries(memory).filter(api_1.isValidProperty).forEach(([prop]) => {
        const newValue = memory[prop];
        const oldValue = source[prop];
        if ((0, compare_1.equal)(newValue, oldValue)) return;
        source[prop] = newValue;
        this.config.migrate?.(link);
        const event = new StorageChannel.Event(StorageChannel.EventType.recv, prop, source[prop], oldValue);
        this.events.recv.emit([event.prop], event);
        source[StorageChannel.Value.event].emit([event.type, event.prop], event);
      });
    }));
  }

  get alive() {
    return this.cancellation.isAlive;
  }

  ensureAliveness() {
    if (!this.alive) throw new Error(`ClientChannel: Storage channel "${this.name}" is already closed.`);
  }

  link() {
    this.ensureAliveness();
    if (this.$link) return this.$link;
    const source = this.source = { ...parse(this.storage.getItem(this.name)),
      [StorageChannel.Value.key]: this.name,
      [StorageChannel.Value.event]: new observer_1.Observation({
        limit: Infinity
      })
    };
    this.$link = (0, api_1.build)(source, this.config.schema(), (prop, newValue, oldValue) => {
      if (!this.alive || this.source !== source) return;
      this.storage.setItem(this.name, JSON.stringify(global_1.Object.fromEntries(global_1.Object.entries(source).filter(api_1.isValidProperty))));
      const event = new StorageChannel.Event(StorageChannel.EventType.send, prop, newValue, oldValue);
      this.events.send.emit([event.prop], event);
      source[StorageChannel.Value.event].emit([event.type, event.prop], event);
    });
    this.config.migrate?.(this.$link);
    return this.link();
  }

  unlink(link) {
    if (link && this.$link !== link) return false;
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
  })(Value = StorageChannel.Value || (StorageChannel.Value = {}));

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
  })(EventType = StorageChannel.EventType || (StorageChannel.EventType = {}));
})(StorageChannel = exports.StorageChannel || (exports.StorageChannel = {}));

function parse(item) {
  try {
    return JSON.parse(item || '{}') || {};
  } catch {
    return {};
  }
}

/***/ }),

/***/ 6480:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.verifyStorageAccess = exports.isStorageAvailable = void 0;

var storage_1 = __webpack_require__(8404);

Object.defineProperty(exports, "isStorageAvailable", ({
  enumerable: true,
  get: function () {
    return storage_1.isStorageAvailable;
  }
}));
Object.defineProperty(exports, "verifyStorageAccess", ({
  enumerable: true,
  get: function () {
    return storage_1.verifyStorageAccess;
  }
}));

/***/ }),

/***/ 8404:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.verifyStorageAccess = exports.isStorageAvailable = void 0;

const uuid_1 = __webpack_require__(7099);

exports.isStorageAvailable = verifyStorageAccess();

function verifyStorageAccess() {
  try {
    if (!self.navigator.cookieEnabled) throw void 0;
    const key = 'clientchannel#' + (0, uuid_1.uuid)();
    self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw void 0;
    self.sessionStorage.removeItem(key);
    return exports.isStorageAvailable = true;
  } catch {
    return exports.isStorageAvailable = false;
  }
}

exports.verifyStorageAccess = verifyStorageAccess;

/***/ }),

/***/ 3648:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.IDBEvent = exports.idbEventStream = exports.destroy = exports.close = exports.listen_ = exports.open = exports.IDBKeyRange = exports.indexedDB = void 0;

var global_1 = __webpack_require__(1657);

Object.defineProperty(exports, "indexedDB", ({
  enumerable: true,
  get: function () {
    return global_1.indexedDB;
  }
}));
Object.defineProperty(exports, "IDBKeyRange", ({
  enumerable: true,
  get: function () {
    return global_1.IDBKeyRange;
  }
}));

var access_1 = __webpack_require__(8805);

Object.defineProperty(exports, "open", ({
  enumerable: true,
  get: function () {
    return access_1.open;
  }
}));
Object.defineProperty(exports, "listen_", ({
  enumerable: true,
  get: function () {
    return access_1.listen_;
  }
}));
Object.defineProperty(exports, "close", ({
  enumerable: true,
  get: function () {
    return access_1.close;
  }
}));
Object.defineProperty(exports, "destroy", ({
  enumerable: true,
  get: function () {
    return access_1.destroy;
  }
}));

var event_1 = __webpack_require__(2282);

Object.defineProperty(exports, "idbEventStream", ({
  enumerable: true,
  get: function () {
    return event_1.idbEventStream;
  }
}));
Object.defineProperty(exports, "IDBEvent", ({
  enumerable: true,
  get: function () {
    return event_1.IDBEvent;
  }
}));

/***/ }),

/***/ 8805:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.destroy = exports.close = exports.listen_ = exports.open = void 0;

const state_1 = __webpack_require__(5996);

const transition_1 = __webpack_require__(83);

const event_1 = __webpack_require__(2282);

const api_1 = __webpack_require__(6480);

const function_1 = __webpack_require__(6288);

function open(database, config) {
  operate(database, "open"
  /* Command.open */
  , config);
  return (success, failure) => void request(database, success, failure);
}

exports.open = open;
exports.listen_ = request;

function close(database) {
  return void operate(database, "close"
  /* Command.close */
  , {
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
  return void operate(database, "destroy"
  /* Command.destroy */
  , {
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
  if (state_1.commands.get(database) === "destroy"
  /* Command.destroy */
  ) {
    switch (command) {
      case "open"
      /* Command.open */
      :
      case "close"
      /* Command.close */
      :
        return void event_1.idbEventStream.once([database, "destroy"
        /* IDBEventType.destroy */
        ], () => void operate(database, command, config));
    }
  }

  state_1.commands.set(database, command);
  state_1.configs.set(database, config);
  if (!state_1.isIDBAvailable || !api_1.isStorageAvailable) return;

  if (state_1.states.has(database)) {
    return void request(database, function_1.noop);
  } else {
    return void (0, transition_1.handle)(database);
  }
}

function request(database, success, failure = function_1.noop) {
  if (!state_1.isIDBAvailable) return void failure(new Error('Database is unavailable.'));
  if (!api_1.isStorageAvailable) return void failure(new Error('Storage is unavailable.'));
  if (!state_1.requests.has(database)) return void failure(new Error('Database is inactive.'));
  state_1.requests.get(database).enqueue(success, failure);
  (0, transition_1.handle)(database);
}

/***/ }),

/***/ 2282:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.IDBEvent = exports.idbEventStream = exports.idbEventStream$ = void 0;

const observer_1 = __webpack_require__(4615);

exports.idbEventStream$ = new observer_1.Observation({
  limit: Infinity
});
exports.idbEventStream = exports.idbEventStream$;

class IDBEvent {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }

}

exports.IDBEvent = IDBEvent;

/***/ }),

/***/ 5996:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
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
    if (!state || !state.alive || state.queue !== this) return void failure(new Error('Request is invalid.'));
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
      } catch {
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
    if (curr?.alive === false) return;

    if (this instanceof InitialState) {
      this.alive = !curr;
      if (!this.alive) return;
      exports.requests.set(database, exports.requests.get(database) || new RequestQueue(database));
    } else {
      this.alive = !!curr;
      if (!this.alive || !curr) return;
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
    switch (this.command) {
      case "close"
      /* Command.close */
      :
      case "destroy"
      /* Command.destroy */
      :
        exports.requests.get(this.database)?.clear();
        exports.commands.delete(this.database);
        exports.configs.delete(this.database);
        exports.requests.delete(this.database);
    }

    exports.states.delete(this.database);
    this.alive = false;
  }

}

exports.EndState = EndState;

/***/ }),

/***/ 83:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.handle = void 0;

const global_1 = __webpack_require__(1657);

const state_1 = __webpack_require__(5996);

const event_1 = __webpack_require__(2282);

const api_1 = __webpack_require__(6480);

const exception_1 = __webpack_require__(7822);

function handle(database) {
  const state = state_1.states.get(database);
  return state instanceof state_1.SuccessState ? void handleSuccessState(state) : void handleInitialState(new state_1.InitialState(database));
}

exports.handle = handle;

function handleInitialState(state) {
  if (!state.alive) return;
  const {
    database,
    version
  } = state;

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
  if (!state.alive) return;
  const {
    database,
    session
  } = state;

  session.onblocked = () => void handleBlockedState(new state_1.BlockState(state, session));

  session.onupgradeneeded = () => void handleUpgradeState(new state_1.UpgradeState(state, session));

  session.onsuccess = () => void handleSuccessState(new state_1.SuccessState(state, session.result));

  session.onerror = event => void handleErrorState(new state_1.ErrorState(state, session.error, event));

  event_1.idbEventStream$.emit([database, "block"
  /* IDBEventType.block */
  ], new event_1.IDBEvent(database, "block"
  /* IDBEventType.block */
  ));
}

function handleUpgradeState(state) {
  if (!state.alive) return;
  const {
    session,
    config
  } = state;
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
  if (!state.alive) return;
  const {
    database,
    connection,
    config,
    queue
  } = state;

  connection.onversionchange = () => {
    const curr = new state_1.EndState(state);
    connection.close();
    event_1.idbEventStream$.emit([database, "destroy"
    /* IDBEventType.destroy */
    ], new event_1.IDBEvent(database, "destroy"
    /* IDBEventType.destroy */
    ));
    handleEndState(curr);
  };

  connection.onerror = event => void handleErrorState(new state_1.ErrorState(state, event.target.error, event));

  connection.onabort = event => void handleAbortState(new state_1.AbortState(state, event));

  connection.onclose = () => void handleEndState(new state_1.EndState(state));

  switch (state.command) {
    case "open"
    /* Command.open */
    :
      {
        VALIDATION: try {
          if (config.verify(connection)) break VALIDATION;
          connection.close();
          return void handleEndState(new state_1.EndState(state, connection.version + 1));
        } catch (reason) {
          connection.close();
          return void handleCrashState(new state_1.CrashState(state, reason));
        }

        event_1.idbEventStream$.emit([database, "connect"
        /* IDBEventType.connect */
        ], new event_1.IDBEvent(database, "connect"
        /* IDBEventType.connect */
        ));

        try {
          while (queue.size > 0 && state.alive) {
            const {
              success,
              failure
            } = queue.dequeue();

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

    case "close"
    /* Command.close */
    :
      {
        const curr = new state_1.EndState(state);
        connection.close();
        return void handleEndState(curr);
      }

    case "destroy"
    /* Command.destroy */
    :
      {
        const curr = new state_1.DestroyState(state);
        connection.close();
        return void handleDestroyState(curr);
      }
  }
}

function handleErrorState(state) {
  if (!state.alive) return;
  const {
    database,
    error,
    event,
    config
  } = state;
  event.preventDefault();
  event_1.idbEventStream$.emit([database, "error"
  /* IDBEventType.error */
  ], new event_1.IDBEvent(database, "error"
  /* IDBEventType.error */
  ));

  if (config.destroy(error, event)) {
    return void handleDestroyState(new state_1.DestroyState(state));
  } else {
    return void handleEndState(new state_1.EndState(state));
  }
}

function handleAbortState(state) {
  if (!state.alive) return;
  const {
    database,
    event
  } = state;
  event.preventDefault();
  event_1.idbEventStream$.emit([database, "abort"
  /* IDBEventType.abort */
  ], new event_1.IDBEvent(database, "abort"
  /* IDBEventType.abort */
  ));
  return void handleEndState(new state_1.EndState(state));
}

function handleCrashState(state) {
  if (!state.alive) return;
  const {
    database,
    reason,
    config
  } = state;
  event_1.idbEventStream$.emit([database, "crash"
  /* IDBEventType.crash */
  ], new event_1.IDBEvent(database, "crash"
  /* IDBEventType.crash */
  ));

  if (config.destroy(reason)) {
    return void handleDestroyState(new state_1.DestroyState(state));
  } else {
    return void handleEndState(new state_1.EndState(state));
  }
}

function handleDestroyState(state) {
  if (!state.alive) return;
  if (!state_1.isIDBAvailable || !(0, api_1.verifyStorageAccess)()) return void handleEndState(new state_1.EndState(state));
  const {
    database
  } = state;
  const deleteRequest = global_1.indexedDB.deleteDatabase(database);

  deleteRequest.onsuccess = () => (void event_1.idbEventStream$.emit([database, "destroy"
  /* IDBEventType.destroy */
  ], new event_1.IDBEvent(database, "destroy"
  /* IDBEventType.destroy */
  )), void handleEndState(new state_1.EndState(state)));

  deleteRequest.onerror = event => void handleErrorState(new state_1.ErrorState(state, deleteRequest.error, event));
}

function handleEndState(state) {
  if (!state.alive) return;
  const {
    database,
    version,
    command
  } = state;
  state.complete();
  event_1.idbEventStream$.emit([database, "disconnect"
  /* IDBEventType.disconnect */
  ], new event_1.IDBEvent(database, "disconnect"
  /* IDBEventType.disconnect */
  ));
  if (!state_1.isIDBAvailable || !(0, api_1.verifyStorageAccess)()) return;

  switch (command) {
    case "open"
    /* Command.open */
    :
      return void handleInitialState(new state_1.InitialState(database, version));

    case "close"
    /* Command.close */
    :
    case "destroy"
    /* Command.destroy */
    :
      return;
  }
}

/***/ }),

/***/ 1657:
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.IDBKeyRange = exports.indexedDB = void 0;
exports.indexedDB = self.indexedDB;
exports.IDBKeyRange = self.IDBKeyRange;

/***/ }),

/***/ 2376:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.storageEventStream$ = exports.storageEventStream = exports.sessionStorage = exports.localStorage = void 0;

var global_1 = __webpack_require__(5157);

Object.defineProperty(exports, "localStorage", ({
  enumerable: true,
  get: function () {
    return global_1.localStorage;
  }
}));
Object.defineProperty(exports, "sessionStorage", ({
  enumerable: true,
  get: function () {
    return global_1.sessionStorage;
  }
}));

var event_1 = __webpack_require__(4085);

Object.defineProperty(exports, "storageEventStream", ({
  enumerable: true,
  get: function () {
    return event_1.storageEventStream;
  }
}));
Object.defineProperty(exports, "storageEventStream$", ({
  enumerable: true,
  get: function () {
    return event_1.storageEventStream$;
  }
}));

/***/ }),

/***/ 4085:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.storageEventStream = exports.storageEventStream$ = void 0;

const global_1 = __webpack_require__(5157);

const observer_1 = __webpack_require__(4615);

exports.storageEventStream$ = new observer_1.Observation({
  limit: Infinity
});
exports.storageEventStream = exports.storageEventStream$;
void self.addEventListener('storage', event => {
  switch (event.storageArea) {
    case global_1.localStorage:
      return void exports.storageEventStream$.emit(event.key === null ? ['local'] : ['local', event.key], event);

    case global_1.sessionStorage:
      return void exports.storageEventStream$.emit(event.key === null ? ['session'] : ['session', event.key], event);

    default:
      return;
  }
});

/***/ }),

/***/ 5157:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.sessionStorage = exports.localStorage = void 0;

const api_1 = __webpack_require__(6480);

exports.localStorage = api_1.isStorageAvailable ? self.localStorage : void 0;
exports.sessionStorage = api_1.isStorageAvailable ? self.sessionStorage : void 0;

/***/ }),

/***/ 8593:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {



var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

__exportStar(__webpack_require__(9886), exports);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(8767);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});