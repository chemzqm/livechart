;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("ramitos-resize/src/resize.js", function(exports, require, module){
var binds = {};

module.exports.bind = function (element, cb, ms) {
  if(!binds[element]) binds[element] = {};
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  if(!ms) ms = 250;
  
  binds[element][cb] = setInterval(function () {
    if((width === element.offsetWidth) && (height === element.offsetHeight)) return;
    height = element.offsetHeight;
    width = element.offsetWidth;
    cb(element);
  }, ms);
};

module.exports.unbind = function (element, cb) {
  if(!binds[element][cb]) return;
  clearInterval(binds[element][cb]);
};
});
require.register("component-debounce/index.js", function(exports, require, module){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

});
require.register("component-to-function/index.js", function(exports, require, module){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

});
require.register("component-min/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Return the min value in `arr` with optional callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} [fn]
 * @return {Number}
 * @api public
 */

module.exports = function(arr, fn){
  var min;

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < arr.length; ++i) {
      var ret = fn(arr[i], i);
      if (null == min) min = ret;
      min = ret < min
        ? ret
        : min;
    }
  } else {
    for (var i = 0; i < arr.length; ++i) {
      if (null == min) min = arr[i];
      min = arr[i] < min
        ? arr[i]
        : min;
    }
  }

  return min;
};
});
require.register("component-max/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Return the max value in `arr` with optional callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} [fn]
 * @return {Number}
 * @api public
 */

module.exports = function(arr, fn){
  var max = -Infinity;

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < arr.length; ++i) {
      var ret = fn(arr[i], i);
      max = ret > max
        ? ret
        : max;
    }
  } else {
    for (var i = 0; i < arr.length; ++i) {
      max = arr[i] > max
        ? arr[i]
        : max;
    }
  }

  return max;
};
});
require.register("component-raf/index.js", function(exports, require, module){

/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  setTimeout(fn, ms);
  prev = curr;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame;

exports.cancel = function(id){
  cancel.call(window, id);
};

});
require.register("component-ease/index.js", function(exports, require, module){

exports.linear = function(n){
  return n;
};

exports.inQuad = function(n){
  return n * n;
};

exports.outQuad = function(n){
  return n * (2 - n);
};

exports.inOutQuad = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return - 0.5 * (--n * (n - 2) - 1);
};

exports.inCube = function(n){
  return n * n * n;
};

exports.outCube = function(n){
  return --n * n * n + 1;
};

exports.inOutCube = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2 ) * n * n + 2);
};

exports.inQuart = function(n){
  return n * n * n * n;
};

exports.outQuart = function(n){
  return 1 - (--n * n * n * n);
};

exports.inOutQuart = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

exports.inQuint = function(n){
  return n * n * n * n * n;
}

exports.outQuint = function(n){
  return --n * n * n * n * n + 1;
}

exports.inOutQuint = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

exports.inSine = function(n){
  return 1 - Math.cos(n * Math.PI / 2 );
};

exports.outSine = function(n){
  return Math.sin(n * Math.PI / 2);
};

exports.inOutSine = function(n){
  return .5 * (1 - Math.cos(Math.PI * n));
};

exports.inExpo = function(n){
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

exports.outExpo = function(n){
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

exports.inOutExpo = function(n){
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

exports.inCirc = function(n){
  return 1 - Math.sqrt(1 - n * n);
};

exports.outCirc = function(n){
  return Math.sqrt(1 - (--n * n));
};

exports.inOutCirc = function(n){
  n *= 2
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

exports.inBack = function(n){
  var s = 1.70158;
  return n * n * (( s + 1 ) * n - s);
};

exports.outBack = function(n){
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

exports.inOutBack = function(n){
  var s = 1.70158 * 1.525;
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );
};

exports.inBounce = function(n){
  return 1 - exports.outBounce(1 - n);
};

exports.outBounce = function(n){
  if ( n < ( 1 / 2.75 ) ) {
    return 7.5625 * n * n;
  } else if ( n < ( 2 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;
  } else if ( n < ( 2.5 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;
  } else {
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;
  }
};

exports.inOutBounce = function(n){
  if (n < .5) return exports.inBounce(n * 2) * .5;
  return exports.outBounce(n * 2 - 1) * .5 + .5;
};

// aliases

exports['in-quad'] = exports.inQuad;
exports['out-quad'] = exports.outQuad;
exports['in-out-quad'] = exports.inOutQuad;
exports['in-cube'] = exports.inCube;
exports['out-cube'] = exports.outCube;
exports['in-out-cube'] = exports.inOutCube;
exports['in-quart'] = exports.inQuart;
exports['out-quart'] = exports.outQuart;
exports['in-out-quart'] = exports.inOutQuart;
exports['in-quint'] = exports.inQuint;
exports['out-quint'] = exports.outQuint;
exports['in-out-quint'] = exports.inOutQuint;
exports['in-sine'] = exports.inSine;
exports['out-sine'] = exports.outSine;
exports['in-out-sine'] = exports.inOutSine;
exports['in-expo'] = exports.inExpo;
exports['out-expo'] = exports.outExpo;
exports['in-out-expo'] = exports.inOutExpo;
exports['in-circ'] = exports.inCirc;
exports['out-circ'] = exports.outCirc;
exports['in-out-circ'] = exports.inOutCirc;
exports['in-back'] = exports.inBack;
exports['out-back'] = exports.outBack;
exports['in-out-back'] = exports.inOutBack;
exports['in-bounce'] = exports.inBounce;
exports['out-bounce'] = exports.outBounce;
exports['in-out-bounce'] = exports.inOutBounce;

});
require.register("component-tween/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , ease = require('ease');

/**
 * Expose `Tween`.
 */

module.exports = Tween;

/**
 * Initialize a new `Tween` with `obj`.
 *
 * @param {Object|Array} obj
 * @api public
 */

function Tween(obj) {
  if (!(this instanceof Tween)) return new Tween(obj);
  this._from = obj;
  this.ease('linear');
  this.duration(500);
}

/**
 * Mixin emitter.
 */

Emitter(Tween.prototype);

/**
 * Reset the tween.
 *
 * @api public
 */

Tween.prototype.reset = function(){
  this.isArray = Array.isArray(this._from);
  this._curr = clone(this._from);
  this._done = false;
  this._start = Date.now();
  return this;
};

/**
 * Tween to `obj` and reset internal state.
 *
 *    tween.to({ x: 50, y: 100 })
 *
 * @param {Object|Array} obj
 * @return {Tween} self
 * @api public
 */

Tween.prototype.to = function(obj){
  this.reset();
  this._to = obj;
  return this;
};

/**
 * Set duration to `ms` [500].
 *
 * @param {Number} ms
 * @return {Tween} self
 * @api public
 */

Tween.prototype.duration = function(ms){
  this._duration = ms;
  return this;
};

/**
 * Set easing function to `fn`.
 *
 *    tween.ease('in-out-sine')
 *
 * @param {String|Function} fn
 * @return {Tween}
 * @api public
 */

Tween.prototype.ease = function(fn){
  fn = 'function' == typeof fn ? fn : ease[fn];
  if (!fn) throw new TypeError('invalid easing function');
  this._ease = fn;
  return this;
};

/**
 * Stop the tween and immediately emit "stop" and "end".
 *
 * @return {Tween}
 * @api public
 */

Tween.prototype.stop = function(){
  this.stopped = true;
  this._done = true;
  this.emit('stop');
  this.emit('end');
  return this;
};

/**
 * Perform a step.
 *
 * @return {Tween} self
 * @api private
 */

Tween.prototype.step = function(){
  if (this._done) return;

  // duration
  var duration = this._duration;
  var now = Date.now();
  var delta = now - this._start;
  var done = delta >= duration;

  // complete
  if (done) {
    this._from = this._to;
    this._update(this._to);
    this._done = true;
    this.emit('end');
    return this;
  }

  // tween
  var from = this._from;
  var to = this._to;
  var curr = this._curr;
  var fn = this._ease;
  var p = (now - this._start) / duration;
  var n = fn(p);

  // array
  if (this.isArray) {
    for (var i = 0; i < from.length; ++i) {
      curr[i] = from[i] + (to[i] - from[i]) * n;
    }

    this._update(curr);
    return this;
  }

  // objech
  for (var k in from) {
    curr[k] = from[k] + (to[k] - from[k]) * n;
  }

  this._update(curr);
  return this;
};

/**
 * Set update function to `fn` or
 * when no argument is given this performs
 * a "step".
 *
 * @param {Function} fn
 * @return {Tween} self
 * @api public
 */

Tween.prototype.update = function(fn){
  if (0 == arguments.length) return this.step();
  this._update = fn;
  return this;
};

/**
 * Clone `obj`.
 *
 * @api private
 */

function clone(obj) {
  if (Array.isArray(obj)) return obj.slice();
  var ret = {};
  for (var key in obj) ret[key] = obj[key];
  return ret;
}

});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("visionmedia-configurable.js/index.js", function(exports, require, module){

/**
 * Make `obj` configurable.
 *
 * @param {Object} obj
 * @return {Object} the `obj`
 * @api public
 */

module.exports = function(obj){

  /**
   * Mixin settings.
   */

  obj.settings = {};

  /**
   * Set config `name` to `val`, or
   * multiple with an object.
   *
   * @param {String|Object} name
   * @param {Mixed} val
   * @return {Object} self
   * @api public
   */

  obj.set = function(name, val){
    if (1 == arguments.length) {
      for (var key in name) {
        this.set(key, name[key]);
      }
    } else {
      this.settings[name] = val;
    }

    return this;
  };

  /**
   * Get setting `name`.
   *
   * @param {String} name
   * @return {Mixed}
   * @api public
   */

  obj.get = function(name){
    return this.settings[name];
  };

  /**
   * Enable `name`.
   *
   * @param {String} name
   * @return {Object} self
   * @api public
   */

  obj.enable = function(name){
    return this.set(name, true);
  };

  /**
   * Disable `name`.
   *
   * @param {String} name
   * @return {Object} self
   * @api public
   */

  obj.disable = function(name){
    return this.set(name, false);
  };

  /**
   * Check if `name` is enabled.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  obj.enabled = function(name){
    return !! this.get(name);
  };

  /**
   * Check if `name` is disabled.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  obj.disabled = function(name){
    return ! this.get(name);
  };

  return obj;
};
});
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});
require.register("component-style/index.js", function(exports, require, module){

/**
 * Expose `style`.
 */

module.exports = style;

/**
 * Return the style for `prop` using the given `selector`.
 *
 * @param {String} selector
 * @param {String} prop
 * @return {String}
 * @api public
 */

function style(selector, prop) {
  var cache = style.cache = style.cache || {}
    , cid = selector + ':' + prop;

  if (cache[cid]) return cache[cid];

  var parts = selector.split(/ +/)
    , len = parts.length
    , parent = document.createElement('div')
    , root = parent
    , child
    , part;

  for (var i = 0; i < len; ++i) {
    part = parts[i];
    child = document.createElement('div');
    parent.appendChild(child);
    parent = child;
    if ('#' == part[0]) {
      child.setAttribute('id', part.substr(1));
    } else if ('.' == part[0]) {
      child.setAttribute('class', part.substr(1));
    }
  }

  document.body.appendChild(root);
  var ret = getComputedStyle(child)[prop];
  document.body.removeChild(root);
  return cache[cid] = ret;
}
});
require.register("livechart/index.js", function(exports, require, module){
var LineChart = require('./lib/linechart');
var AreaChart = require('./lib/areachart');
var PieChart = require('./lib/piechart');
var BarChart = require('./lib/barchart');
var ArcChart = require('./lib/arcchart');
var PolarChart = require('./lib/polarchart');
var Histogram = require('./lib/histogram');

module.exports.LineChart = LineChart;
module.exports.AreaChart = AreaChart;
module.exports.PolarChart = PolarChart;
module.exports.PieChart = PieChart;
module.exports.BarChart = BarChart;
module.exports.ArcChart = ArcChart;
module.exports.Histogram = Histogram;

});
require.register("livechart/lib/chart.js", function(exports, require, module){
var autoscale = require('autoscale-canvas');
var resize = require('resize');
var debounce = require ('debounce');
var Configurable = require('configurable.js');
var Emitter = require ('emitter');
var raf = require ('raf');
var style = require ('style');
var Tween = require ('tween');
var min = require ('min');
var max = require ('max');


var styles = window.getComputedStyle;

function Chart (dom) {
  this.parent = dom;
  this.styles = {
    color: style('.livechart .text', 'color'),
    fontSize: style('.livechart .text', 'font-size') || '10px',
    titleColor: style('.livechart .title', 'color'),
    titleSize: style('.livechart .title', 'font-size') || '14px',
    labelColor: style('.livechart .label', 'color')
  };
  var canvas = this.canvas  = document.createElement('canvas');
  resize.bind(dom, debounce(this.resize.bind(this)), 200);
  dom.appendChild(this.canvas);
  this.resize();
  this.settings = {};
  this.set('format', function (v) { return v; });
}

Configurable(Chart.prototype);
Emitter(Chart.prototype);

Chart.prototype.resize = function() {
  var dom = this.parent;
  var canvas = this.canvas;
  var width = parseInt(styles(dom).width, 10);
  var height = parseInt(styles(dom).height, 10);
  this.height = canvas.height = height;
  this.width = canvas.width = width;
  autoscale(canvas);
  var ctx = this.ctx = canvas.getContext('2d');
  this.emit('resize');
}

Chart.prototype.start = function() {
  var self = this;
  var delta = 0;
  var tween = Tween({d: 0})
    .ease(this.get('ease') || 'in-out-quad')
    .to({d: 1})
    .duration(this.get('duration') || 500);

  tween.update(function(o){
    delta = o.d;
    self.draw(delta);
  });

  tween.on('end', function(){
    self.emit('end');
    animate = function (){ }
  });

  function animate () {
    raf(animate);
    tween.update();
  }
  animate();
}

Chart.prototype.tween = function(from, to) {
  return function (delta) {
    for (var prop in from) {
      this[prop] = from[prop] + (to[prop] - from[prop]) * delta;
    }
  }
}

Chart.prototype.drawLabels = function() {
  var labels = this.get('labels');
  if (!labels) return;
  var ctx = this.ctx;
  var colors = this.get('colors');
  ctx.save();
  ctx.setTransform(window.devicePixelRatio || 1 ,0 ,0 ,window.devicePixelRatio || 1 ,0, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '12px helvetica';
  labels.forEach(function(text, i) {
    var color = colors[i];
    ctx.fillStyle = color;
    drawRoundRect(ctx, 5, i * 18 + 5 , 18, 14 );
    ctx.fillStyle = this.styles.labelColor;
    ctx.fillText(text, 28, i* 18 + 5);
  }.bind(this));
  ctx.restore();
}

/**
 * Called by every chart before drawing
 * @api private
 */
Chart.prototype.draw = function() {
  var ctx = this.ctx;
  ctx.clearRect(-100, 0, this.width + 100, this.height);
  ctx.save();
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.translate(this.dims.x, this.dims.y);
}

Chart.prototype.toRgb = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

Chart.prototype.calcRectDimensions = function(chart) {
  var paddings = {
    t: getChartStyle(chart, 'paddingTop', true),
    b: getChartStyle(chart, 'paddingBottom', true),
    l: getChartStyle(chart, 'paddingLeft', true),
    r: getChartStyle(chart, 'paddingRight', true)
  }
  this.dims = {
    x: paddings.l,
    y: this.height - paddings.b,
    w: this.width - paddings.l - paddings.r,
    h: this.height - paddings.b - paddings.t
  }
}

Chart.prototype.calcCircleDimensions = function(chart) {
  var padding = getChartStyle(chart, 'paddingTop', true);
  var min = Math.min(this.height, this.width);
  var r = (min - padding*2)/2;
  this.dims = {
    x: (this.width - min)/2 + padding + r,
    y: (this.height - min)/2 + padding + r,
    r: r
  }
}

Chart.prototype.getRange = function(){
  var minValue = min(this.items, 'value');
  var maxValue = max(this.items, 'value');
  minValue = Math.min(minValue, this.get('min'));
  maxValue = Math.max(maxValue, this.get('max'));
  this.set('min', minValue);
  this.set('max', maxValue);
  return {
    min: minValue,
    max: maxValue
  }
}

function drawRoundRect (ctx, x, y , w, h) {
  var r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w ,y , x + w, y + r);
  ctx.lineTo(x + w , y + h - r);
  ctx.quadraticCurveTo(x + w , y + h, x + w - r, y + h);
  ctx.lineTo(x + r , y + h);
  ctx.quadraticCurveTo(x , y + h, x, y + h - r);
  ctx.lineTo(x , y + r);
  ctx.quadraticCurveTo(x , y , x + r, y);
  ctx.fill();
}

/**
 * 
 * @param {String} cn chart name
 * @param {String} sn style name
 * @param {Boolean} parse whether to parse int
 * @api public
 */
function getChartStyle (cn, sn, parse) {
  var v = style('.livechart .' + cn, sn);
  v = parse? parseInt(v, 10) : v;
  return v;
}

module.exports = Chart;

});
require.register("livechart/lib/barchart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function BarChart(parent){
  this.on('resize', function() {
    this.calcRectDimensions('barchart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('max', 100);
  this.set('min', 0);
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);
  this.items = [];
}

inherit(BarChart, Chart);

BarChart.prototype.add = function(vs){
  var items = this.items;
  if (items.length === 0) {
    vs.forEach(function(v, i) {
      items.push({
        value: v,
        index: i
      });
    })
  }
  else {
    items.forEach(function(bar) {
      var v = vs[bar.index];
      bar.value = v;
    })
  }
  var r = this.getRange();
  this.items = items.sort(function(a, b) {
    return b.value - a.value;
  })
  var space = this.getSpace();
  this.items.forEach(function(bar, i) {
    var tx= (i + 1) * space;
    var ty = 0 - (this.dims.h) * (bar.value - r.min)/(r.max - r.min);
    bar.onFrame = this.tween({
      x: bar.x || tx,
      y: bar.y || 0
    }, {
      x: tx,
      y: ty
    })
  }.bind(this));
  this.start();
}

BarChart.prototype.getSpace = function(){
  var c = this.get('labels').length;
  return (this.dims.w)/(c + 1);
}

BarChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var labels = this.get('labels');
  var ctx = this.ctx;
  var format = this.get('format');
  var cw = parseInt(style('.livechart .barchart .item', 'width'), 10);
  this.items.forEach(function(item) {
    var i = item.index;
    ctx.fillStyle = colors[i];
    ctx.fillRect(item.x - cw/2, item.y, cw, 0 - item.y);
    //label
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var label = labels[i];
    ctx.fillText(label, item.x, 4);
    //value
    ctx.textBaseline = 'bottom';
    var v = format(item.value);
    ctx.fillText(v, item.x, item.y - 4);
  })
  //bottom line
  ctx.strokeStyle = fontColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.dims.w, 0);
  ctx.stroke();
  //title
  var title = this.get('title');
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.titleColor;
  ctx.font = this.styles.titleSize + ' helvetica';
  ctx.fillText(title, this.dims.w/2, - this.dims.h - 5);
  ctx.restore();
}

module.exports = BarChart;

});
require.register("livechart/lib/piechart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');

function PieChart(parent){
  this.on('resize', function() {
    this.calcCircleDimensions('piechart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('colors', ['#F38630', '#E0E4CC', '#69D2E7', '#9D9B7F', '#F7464A', '#584A5E']);
  this.items = [];
}

inherit(PieChart, Chart);

PieChart.prototype.add = function(vs){
  var items = this.items;
  var init = (items.length === 0);
  var total = vs.reduce(function(res, v) {
    return res + v;
  }, 0);
  vs.forEach(function(v, i) {
    if (init) {
      items.push({ value: v/total });
    } else {
      items[i].value = v/total;
    }
  });
  this.items.forEach(function(item, i) {
    var a = item.value * Math.PI * 2;
    item.onFrame = this.tween({
      a: item.a || 0
    }, {
      a: a
    })
  }.bind(this));
  this.start();
}

PieChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var r = this.dims.r;
  var ctx = this.ctx;
  ctx.strokeStyle = '#ffffff';
  ctx.rotate(- Math.PI/2);
  this.items.forEach(function(item, i) {
    var a = item.a;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.arc(0, 0, r, 0, a, false);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.rotate(a);
  });
  //draw text
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  var angle = 0;
  ctx.rotate(Math.PI/2);
  this.items.forEach(function(item) {
    var a = angle + item.a/2;
    angle += item.a;
    if (item.value < 0.05) return;
    var x = (r/2) * Math.sin(a);
    var y = - (r/2) * Math.cos(a);
    ctx.fillText((item.value * 100).toFixed(1), x, y);
  })
  this.drawLabels();
  ctx.restore();
}

module.exports = PieChart;

});
require.register("livechart/lib/linechart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function LineChart(parent){
  this.on('resize', function() {
    this.calcRectDimensions('linechart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('count', 5);
  this.set('colors', ['#F7464A', '#4A46F7']);
}

inherit(LineChart, Chart);

LineChart.prototype.add = function(v){
  v = ( v instanceof Array)? v : [v];
  if (!this.series) {
    this.series = v.map(function() {
      return [];
    });
  }
  v.forEach(function(d, i) {
    this.series[i].push({
      value: d
    });
  }.bind(this));
  var count = this.get('count');
  if (this.series[0].length > count + 1) {
    this.series.forEach(function(ps) {
      ps.shift();
    });
  }
  var space = this.getSpace();
  this.series.forEach(function(ps) {
    ps.forEach(function(p, i) {
      var v = p.value;
      var ty = this.getY(v, ps);
      var tx = (i + count - ps.length) * space;
      if (!p.x) {
        p.x = tx;
        p.y = ty;
        p.onFrame = function(){};
      } else {
        p.onFrame = this.tween({ x: p.x, y: p.y }, { x: tx, y: ty });
      }
    }.bind(this));
  }.bind(this));
  this.start();
}

LineChart.prototype.getSpace = function(){
   return this.dims.w/(this.get('count') - 1);
}

LineChart.prototype.getY = function(v, ps){
  var minValue = min(ps, 'value');
  var maxValue = max(ps, 'value');
  var h = this.dims.h;
  if (minValue == maxValue) return - h/2;
  var y = 0 - h * (v - minValue)/(maxValue - minValue);
  return y;
}

LineChart.prototype.drawValues = function(p1, p2) {
  var ctx = this.ctx;
  var format = this.get('format');
  ctx.textBaseline = 'bottom';
  var top = p1.y <= p2.y ? p1 : p2;
  var bottom = p1.y > p2.y ? p1 : p2;
  var tv = format(top.value);
  var bv = format(bottom.value);
  ctx.fillText(tv, top.x, top.y - 5);
  ctx.textBaseline = 'top';
  ctx.fillText(bv, bottom.x, bottom.y + 5);
}

LineChart.prototype.drawLine = function(ps, i) {
  var ctx = this.ctx;
  var color = this.get('colors')[i];
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.beginPath();
  //ctx.shadowColor = 'rgb(153,153,153)';
  //ctx.shadowOffsetY = 1;
  //ctx.shadowBlur = 10;
  ps.forEach(function(p, i) {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  })
  ctx.stroke();
}

LineChart.prototype.drawXaxis = function() {
  var count = this.get('count');
  var ctx = this.ctx;
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.styles.color;
  ctx.fillStyle = this.styles.color;
  var y = parseInt(this.styles.fontSize, 10) + 10;
  ctx.moveTo(- this.dims.x, y);
  ctx.lineTo(this.dims.w + 5 , y);
  ctx.stroke();
  var space = this.getSpace();
  ctx.textBaseline = 'top';
  for (var i = 0; i < count; i++) {
    var x = i * space;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x , y + 2);
    ctx.stroke();
    ctx.fillText((count - 1 - i) , x, y + 2);
  }
}
LineChart.prototype.draw = function(delta) {
  var radius = parseInt(style('.livechart .linechart .point', 'width'), 10);
  var ctx = this.ctx;
  this.series.forEach(function(ps) {
    ps.forEach(function(p) {
      p.onFrame(delta);
    });
  })
  Chart.prototype.draw.call(this);
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.color;
  if (this.series.length > 1) {
    this.series[0].forEach(function(p1, i) {
      var p2 = this.series[1][i];
      this.drawValues(p1, p2);
    }.bind(this));
  } else {
    var ps = this.series[0];
    ps.forEach(function(p) {
      var v = p.value;
      ctx.fillText(v, p.x, p.y - 5);
    })
  }
  this.series.forEach(function(ps, i) {
    //line
    this.drawLine(ps, i);
    //point
    ps.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
      ctx.fill();
    });
  }.bind(this));
  this.drawLabels();
  this.drawXaxis();
  ctx.restore();
}

module.exports = LineChart;

});
require.register("livechart/lib/areachart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var LineChart = require ('./linechart');
var style = require ('style');

function AreaChart(parent){
  this.on('resize', function() {
    this.calcRectDimensions('areachart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('count', 10);
  this.set('colors', ['#DCDCDC', '#97BBCD']);
}

inherit(AreaChart, LineChart);

AreaChart.prototype.drawLine = function(ps, i) {
  var ctx = this.ctx;
  var color = this.get('colors')[i];
  var rgb = this.toRgb(color);
  ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', 0.5)';
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.lineWidth = 2;
  var space = this.getSpace();
  ps.forEach(function(p, i) {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      var prev = ps[i - 1];
      if (p.x - prev.x < space/2) {
        ctx.lineTo(p.x, p.y);
      } else{
        ctx.bezierCurveTo(prev.x + space/2, prev.y, prev.x + space/2, p.y, p.x, p.y);
      }
    }
  })
  ctx.stroke();
  var y = parseInt(this.styles.fontSize, 10) + 10;
  ctx.lineTo(ps[ps.length - 1].x, y);
  ctx.lineTo(ps[0].x, y);
  ctx.fill();
}

AreaChart.prototype.draw = function(delta) {
  var radius = parseInt(style('.livechart .areachart .point', 'width'), 10);
  var borderWidth = parseInt(style('.livechart .areachart .pointborder', 'width'), 10);
  var borderColor = style('.livechart .areachart .pointborder', 'color');
  var ctx = this.ctx;
  this.series.forEach(function(ps) {
    ps.forEach(function(p) {
      p.onFrame(delta);
    });
  })
  Chart.prototype.draw.call(this);
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.color;
  ctx.strokeStyle = this.styles.color;
  if (this.series.length > 1) {
    this.series[0].forEach(function(p1, i) {
      var p2 = this.series[1][i];
      this.drawValues(p1, p2);
    }.bind(this));
  } else {
    var ps = this.series[0];
    ps.forEach(function(p) {
      var v = p.value;
      ctx.fillText(v, p.x, p.y - 5);
    })
  }
  this.series.forEach(function(ps, i) {
    //line
    this.drawLine(ps, i);
    var color = this.get('colors')[i];
    ctx.fillStyle = color;
    //point
    ps.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.arc(p.x, p.y, radius + 1, 0, Math.PI*2, false);
      ctx.stroke();
    });
  }.bind(this));
  this.drawXaxis();
  ctx.restore();
}

module.exports = AreaChart;

});
require.register("livechart/lib/arcchart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function ArcChart(parent){
  this.on('resize', function() {
    this.calcCircleDimensions('arcchart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('colors', ['#97BBCD', '#DCDCDC']);
  this.items = [];
}

inherit(ArcChart, Chart);

ArcChart.prototype.add = function(vs){
  if (typeof vs === 'number') vs = [vs];
  var items = this.items;
  var init = items.length === 0;
  vs.forEach(function(v, i) {
    if (init) {
      items.push({ value: v })
    } else {
      items[i].value = v;
    }
  });
  items.forEach(function(item, i) {
    var a = item.value * Math.PI * 2;
    item.onFrame = this.tween({
      a: item.a || 0
    }, {
      a: a
    })
  }.bind(this));
  this.start();
}

ArcChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  });
  Chart.prototype.draw.call(this);
  var colors = this.get('colors');
  var radius = this.dims.r;
  var ctx = this.ctx;
  var itemClass = '.livechar .arcchart .item';
  var width = parseInt(style(itemClass, 'width'), 10);
  var gap = parseInt(style(itemClass, 'marginTop'), 10);
  this.items.forEach(function(item, i) {
    var a = item.a;
    var r = radius - (width + gap)*i;
    var color = colors[i];
    var rgb = this.toRgb(color);
    ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', ' + item.value + ')';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, - (r - width));
    ctx.lineTo(0 , - r);
    ctx.arc(0, 0, r, - Math.PI/2, a - Math.PI/2, false);
    ctx.lineTo((r - width)*Math.cos(a - Math.PI/2), (r - width)*Math.sin(a - Math.PI/2));
    ctx.arc(0, 0, r - width, a - Math.PI/2, - Math.PI/2, true);
    ctx.fill();
    ctx.stroke();
  }.bind(this));
  //draw text
  ctx.font = '20px helvetica';
  if (this.items.length === 1) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors[0];
    ctx.fillText((this.items[0].value*100).toFixed(1), 0, 0);
  } else {
    ctx.strokeStyle = '#eeeeee';
    ctx.beginPath();
    ctx.moveTo(15, - 15);
    ctx.lineTo(- 15, 15);
    ctx.stroke();
    this.items.forEach(function(item, i) {
      ctx.fillStyle = colors[i];
      var text = (item.value * 100).toFixed(1);
      if (i === 0) {
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'right';
        ctx.fillText(text, 0 , 0);
      } else {
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(text, 0, 0);
      }
    })
  }
  this.drawLabels();
  ctx.restore();
}

module.exports = ArcChart;

});
require.register("livechart/lib/polarchart.js", function(exports, require, module){
var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function PolarChart(parent){
  this.on('resize', function() {
    this.calcCircleDimensions('polarchart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);
  this.set('steps', [20, 40, 60, 80, 100]);
  this.items = [];
}

inherit(PolarChart, Chart);

PolarChart.prototype.add = function(vs){
  var items = this.items;
  var init = (items.length === 0);
  vs.forEach(function(v, i) {
    if (init) { items.push({ r: 0 }) }
    items[i].onFrame = this.tween({
      r: items[i].r
    }, {
      r: v
    });
  }.bind(this));
  this.start();
}

PolarChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var colors = this.get('colors');
  var stepAngle = Math.PI * 2/this.items.length;
  var radius = this.dims.r;
  var ctx = this.ctx;
  ctx.rotate(- Math.PI/2);
  var borderColor = style('.livechart .polarchart .space', 'color');
  var borderWidth = style('.livechart .polarchart .space', 'width');
  this.items.forEach(function(item, i) {
    var r = item.r;
    var rgb = this.toRgb(colors[i]);
    ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius * r, 0, stepAngle, false);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.rotate(stepAngle);
  }.bind(this));
  //draw circles
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  var steps = this.get('steps');
  steps.forEach(function(v) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * v/100, 0, Math.PI*2, false);
    ctx.stroke();
  })
  ctx.rotate(Math.PI/2);
  //draw text
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  var labelSize = style('.livechart .polarchart .label', 'font-size');
  ctx.font =  labelSize+ ' helvetica';
  var size = parseInt(labelSize, 10);
  var color = style('.livechart .polarchart .label', 'color');
  steps.forEach(function(t) {
    var w = ctx.measureText(t).width;
    var y = - radius*t/100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(- w/2 - 2, y - size/2 -2, w + 4, size + 4);
    ctx.fillStyle = color;
    ctx.fillText(t, 0, y);
  })
  this.drawLabels();
  ctx.restore();
}

module.exports = PolarChart;

});
require.register("livechart/lib/histogram.js", function(exports, require, module){
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function Histogram(parent){
  this.on('resize', function() {
    this.calcRectDimensions('histogram');
  }.bind(this))
  Chart.call(this, parent);
  this.set('count', 50);
  this.set('max', 100);
  this.set('min', 0);
  this.set('colors', ['#69D2E7']);
  this.items = [];
  this.labels = [];
}

inherit(Histogram, Chart);


Histogram.prototype.add = function(v){
  var bars = this.items;
  var bar = { value: v };
  var count = this.get('count');
  bars.push(bar)
  if (bars.length > count) {
    bars.shift();
  }
  var r = this.getRange();
  var space = this.getSpace();
  bars.forEach(function(bar, i) {
    var ty = 0 - this.dims.h * (bar.value - r.min)/(r.max - r.min);
    var tx= (i + count - bars.length) * space;
    if (!bar.x) {
      bar.x = tx;
      bar.y = ty;
      bar.onFrame = function() { }
    } else {
      bar.onFrame = this.tween({ x: bar.x, y: bar.y }, { x: tx, y: ty });
    }
  }.bind(this));
  var ctx = this.ctx;
  ctx.font = this.styles.fontSize + ' helvetica';
  var dw = ctx.measureText('00:00:00').width + 5;
  var first = this.labels[0];
  var last = this.labels[this.labels.length - 1];
  var tw = this.dims.w - space * 1/4;
  if(first && first.x < space) this.labels.shift();
  this.labels.forEach(function(label) {
    var x = label.x || 0;
    label.c = (typeof label.c === 'undefined')? 1 : label.c + 1;
    var tx = this.dims.w - space/4 - label.c * space;
    label.onFrame = this.tween({x: x}, {x: tx});
  }.bind(this));
  if (this.labels.length === 0 || (last && (tw - last.x >= dw))) {
    var s = currentTime();
    this.labels.push({
      text: s ,
      x: tw,
      onFrame: function(){ }
    });
  }
  this.start();
}

Histogram.prototype.getSpace = function(){
  var c = this.get('count');
  return 2 * (this.dims.w)/(c * 2 - 1);
}

function pad (v) {
  return v.toString().length > 1? v.toString() : '0' + v;
}

function currentTime () {
  var d = new Date();
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

function labelFormat (v) {
  if (v > 1000) {
    return (v/1000).toFixed(1) + 'k';
  }
  return v.toFixed(0);
}

Histogram.prototype.drawXaxis = function() {
  var ctx = this.ctx;
  var space = this.getSpace();
  ctx.strokeStyle = this.styles.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = this.styles.color;
  this.labels.forEach(function(label) {
    var x = label.x;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 5);
    ctx.stroke();
    ctx.fillText(label.text, x, 8);
  }.bind(this));
}

Histogram.prototype.draw = function(delta) {
  this.labels.forEach(function(label) {
    label.onFrame(delta);
  })
  this.items.forEach(function(bar) {
    bar.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var count = this.get('count');
  var color = this.get('colors')[0];
  var w = this.getSpace()/2;
  var ctx = this.ctx;
  ctx.fillStyle = color;
  this.items.forEach(function(item) {
    ctx.fillRect(item.x, item.y, w, 0 - item.y);
  })
  //min & max
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = this.styles.color;
  var min = this.get('min');
  var max = this.get('max');
  ctx.fillText(labelFormat(min), -2, 0);
  ctx.textBaseline = 'top';
  ctx.fillText(labelFormat(max), -2 , - this.dims.h);
  //bottom line
  ctx.strokeStyle = this.styles.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.dims.w + 5 , 0);
  ctx.stroke();
  this.drawXaxis();
  ctx.restore();
}

module.exports = Histogram;

});











require.alias("ramitos-resize/src/resize.js", "livechart/deps/resize/src/resize.js");
require.alias("ramitos-resize/src/resize.js", "livechart/deps/resize/index.js");
require.alias("ramitos-resize/src/resize.js", "resize/index.js");
require.alias("ramitos-resize/src/resize.js", "ramitos-resize/index.js");
require.alias("component-debounce/index.js", "livechart/deps/debounce/index.js");
require.alias("component-debounce/index.js", "livechart/deps/debounce/index.js");
require.alias("component-debounce/index.js", "debounce/index.js");
require.alias("component-debounce/index.js", "component-debounce/index.js");
require.alias("component-min/index.js", "livechart/deps/min/index.js");
require.alias("component-min/index.js", "min/index.js");
require.alias("component-to-function/index.js", "component-min/deps/to-function/index.js");

require.alias("component-max/index.js", "livechart/deps/max/index.js");
require.alias("component-max/index.js", "max/index.js");
require.alias("component-to-function/index.js", "component-max/deps/to-function/index.js");

require.alias("component-raf/index.js", "livechart/deps/raf/index.js");
require.alias("component-raf/index.js", "raf/index.js");

require.alias("component-tween/index.js", "livechart/deps/tween/index.js");
require.alias("component-tween/index.js", "tween/index.js");
require.alias("component-emitter/index.js", "component-tween/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-ease/index.js", "component-tween/deps/ease/index.js");

require.alias("component-inherit/index.js", "livechart/deps/inherit/index.js");
require.alias("component-inherit/index.js", "inherit/index.js");

require.alias("component-emitter/index.js", "livechart/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("visionmedia-configurable.js/index.js", "livechart/deps/configurable.js/index.js");
require.alias("visionmedia-configurable.js/index.js", "configurable.js/index.js");

require.alias("component-autoscale-canvas/index.js", "livechart/deps/autoscale-canvas/index.js");
require.alias("component-autoscale-canvas/index.js", "autoscale-canvas/index.js");

require.alias("component-style/index.js", "livechart/deps/style/index.js");
require.alias("component-style/index.js", "style/index.js");

require.alias("livechart/index.js", "livechart/index.js");if (typeof exports == "object") {
  module.exports = require("livechart");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("livechart"); });
} else {
  this["livechart"] = require("livechart");
}})();