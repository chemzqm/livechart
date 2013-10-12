
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
require.register("ramitos-resize/src/resize.js", Function("exports, require, module",
"var binds = {};\n\
\n\
module.exports.bind = function (element, cb, ms) {\n\
  if(!binds[element]) binds[element] = {};\n\
  var height = element.offsetHeight;\n\
  var width = element.offsetWidth;\n\
  if(!ms) ms = 250;\n\
  \n\
  binds[element][cb] = setInterval(function () {\n\
    if((width === element.offsetWidth) && (height === element.offsetHeight)) return;\n\
    height = element.offsetHeight;\n\
    width = element.offsetWidth;\n\
    cb(element);\n\
  }, ms);\n\
};\n\
\n\
module.exports.unbind = function (element, cb) {\n\
  if(!binds[element][cb]) return;\n\
  clearInterval(binds[element][cb]);\n\
};//@ sourceURL=ramitos-resize/src/resize.js"
));
require.register("component-debounce/index.js", Function("exports, require, module",
"/**\n\
 * Debounces a function by the given threshold.\n\
 *\n\
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/\n\
 * @param {Function} function to wrap\n\
 * @param {Number} timeout in ms (`100`)\n\
 * @param {Boolean} whether to execute at the beginning (`false`)\n\
 * @api public\n\
 */\n\
\n\
module.exports = function debounce(func, threshold, execAsap){\n\
  var timeout;\n\
\n\
  return function debounced(){\n\
    var obj = this, args = arguments;\n\
\n\
    function delayed () {\n\
      if (!execAsap) {\n\
        func.apply(obj, args);\n\
      }\n\
      timeout = null;\n\
    }\n\
\n\
    if (timeout) {\n\
      clearTimeout(timeout);\n\
    } else if (execAsap) {\n\
      func.apply(obj, args);\n\
    }\n\
\n\
    timeout = setTimeout(delayed, threshold || 100);\n\
  };\n\
};\n\
//@ sourceURL=component-debounce/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\"\n\
  return new Function('_', 'return _.' + str);\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-min/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * Return the min value in `arr` with optional callback `fn(val, i)`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} [fn]\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(arr, fn){\n\
  var min;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < arr.length; ++i) {\n\
      var ret = fn(arr[i], i);\n\
      if (null == min) min = ret;\n\
      min = ret < min\n\
        ? ret\n\
        : min;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < arr.length; ++i) {\n\
      if (null == min) min = arr[i];\n\
      min = arr[i] < min\n\
        ? arr[i]\n\
        : min;\n\
    }\n\
  }\n\
\n\
  return min;\n\
};//@ sourceURL=component-min/index.js"
));
require.register("component-max/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * Return the max value in `arr` with optional callback `fn(val, i)`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} [fn]\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(arr, fn){\n\
  var max = -Infinity;\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < arr.length; ++i) {\n\
      var ret = fn(arr[i], i);\n\
      max = ret > max\n\
        ? ret\n\
        : max;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < arr.length; ++i) {\n\
      max = arr[i] > max\n\
        ? arr[i]\n\
        : max;\n\
    }\n\
  }\n\
\n\
  return max;\n\
};//@ sourceURL=component-max/index.js"
));
require.register("component-raf/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `requestAnimationFrame()`.\n\
 */\n\
\n\
exports = module.exports = window.requestAnimationFrame\n\
  || window.webkitRequestAnimationFrame\n\
  || window.mozRequestAnimationFrame\n\
  || window.oRequestAnimationFrame\n\
  || window.msRequestAnimationFrame\n\
  || fallback;\n\
\n\
/**\n\
 * Fallback implementation.\n\
 */\n\
\n\
var prev = new Date().getTime();\n\
function fallback(fn) {\n\
  var curr = new Date().getTime();\n\
  var ms = Math.max(0, 16 - (curr - prev));\n\
  setTimeout(fn, ms);\n\
  prev = curr;\n\
}\n\
\n\
/**\n\
 * Cancel.\n\
 */\n\
\n\
var cancel = window.cancelAnimationFrame\n\
  || window.webkitCancelAnimationFrame\n\
  || window.mozCancelAnimationFrame\n\
  || window.oCancelAnimationFrame\n\
  || window.msCancelAnimationFrame;\n\
\n\
exports.cancel = function(id){\n\
  cancel.call(window, id);\n\
};\n\
//@ sourceURL=component-raf/index.js"
));
require.register("component-tween/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , ease = require('ease');\n\
\n\
/**\n\
 * Expose `Tween`.\n\
 */\n\
\n\
module.exports = Tween;\n\
\n\
/**\n\
 * Initialize a new `Tween` with `obj`.\n\
 *\n\
 * @param {Object|Array} obj\n\
 * @api public\n\
 */\n\
\n\
function Tween(obj) {\n\
  if (!(this instanceof Tween)) return new Tween(obj);\n\
  this._from = obj;\n\
  this.ease('linear');\n\
  this.duration(500);\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Tween.prototype);\n\
\n\
/**\n\
 * Reset the tween.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.reset = function(){\n\
  this.isArray = Array.isArray(this._from);\n\
  this._curr = clone(this._from);\n\
  this._done = false;\n\
  this._start = Date.now();\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Tween to `obj` and reset internal state.\n\
 *\n\
 *    tween.to({ x: 50, y: 100 })\n\
 *\n\
 * @param {Object|Array} obj\n\
 * @return {Tween} self\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.to = function(obj){\n\
  this.reset();\n\
  this._to = obj;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set duration to `ms` [500].\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Tween} self\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.duration = function(ms){\n\
  this._duration = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set easing function to `fn`.\n\
 *\n\
 *    tween.ease('in-out-sine')\n\
 *\n\
 * @param {String|Function} fn\n\
 * @return {Tween}\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.ease = function(fn){\n\
  fn = 'function' == typeof fn ? fn : ease[fn];\n\
  if (!fn) throw new TypeError('invalid easing function');\n\
  this._ease = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Stop the tween and immediately emit \"stop\" and \"end\".\n\
 *\n\
 * @return {Tween}\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.stop = function(){\n\
  this.stopped = true;\n\
  this._done = true;\n\
  this.emit('stop');\n\
  this.emit('end');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Perform a step.\n\
 *\n\
 * @return {Tween} self\n\
 * @api private\n\
 */\n\
\n\
Tween.prototype.step = function(){\n\
  if (this._done) return;\n\
\n\
  // duration\n\
  var duration = this._duration;\n\
  var now = Date.now();\n\
  var delta = now - this._start;\n\
  var done = delta >= duration;\n\
\n\
  // complete\n\
  if (done) {\n\
    this._from = this._to;\n\
    this._update(this._to);\n\
    this._done = true;\n\
    this.emit('end');\n\
    return this;\n\
  }\n\
\n\
  // tween\n\
  var from = this._from;\n\
  var to = this._to;\n\
  var curr = this._curr;\n\
  var fn = this._ease;\n\
  var p = (now - this._start) / duration;\n\
  var n = fn(p);\n\
\n\
  // array\n\
  if (this.isArray) {\n\
    for (var i = 0; i < from.length; ++i) {\n\
      curr[i] = from[i] + (to[i] - from[i]) * n;\n\
    }\n\
\n\
    this._update(curr);\n\
    return this;\n\
  }\n\
\n\
  // objech\n\
  for (var k in from) {\n\
    curr[k] = from[k] + (to[k] - from[k]) * n;\n\
  }\n\
\n\
  this._update(curr);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set update function to `fn` or\n\
 * when no argument is given this performs\n\
 * a \"step\".\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Tween} self\n\
 * @api public\n\
 */\n\
\n\
Tween.prototype.update = function(fn){\n\
  if (0 == arguments.length) return this.step();\n\
  this._update = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clone `obj`.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function clone(obj) {\n\
  if (Array.isArray(obj)) return obj.slice();\n\
  var ret = {};\n\
  for (var key in obj) ret[key] = obj[key];\n\
  return ret;\n\
}\n\
//@ sourceURL=component-tween/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("visionmedia-configurable.js/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Make `obj` configurable.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} the `obj`\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj){\n\
\n\
  /**\n\
   * Mixin settings.\n\
   */\n\
\n\
  obj.settings = {};\n\
\n\
  /**\n\
   * Set config `name` to `val`, or\n\
   * multiple with an object.\n\
   *\n\
   * @param {String|Object} name\n\
   * @param {Mixed} val\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.set = function(name, val){\n\
    if (1 == arguments.length) {\n\
      for (var key in name) {\n\
        this.set(key, name[key]);\n\
      }\n\
    } else {\n\
      this.settings[name] = val;\n\
    }\n\
\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Get setting `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Mixed}\n\
   * @api public\n\
   */\n\
\n\
  obj.get = function(name){\n\
    return this.settings[name];\n\
  };\n\
\n\
  /**\n\
   * Enable `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.enable = function(name){\n\
    return this.set(name, true);\n\
  };\n\
\n\
  /**\n\
   * Disable `name`.\n\
   *\n\
   * @param {String} name\n\
   * @return {Object} self\n\
   * @api public\n\
   */\n\
\n\
  obj.disable = function(name){\n\
    return this.set(name, false);\n\
  };\n\
\n\
  /**\n\
   * Check if `name` is enabled.\n\
   *\n\
   * @param {String} name\n\
   * @return {Boolean}\n\
   * @api public\n\
   */\n\
\n\
  obj.enabled = function(name){\n\
    return !! this.get(name);\n\
  };\n\
\n\
  /**\n\
   * Check if `name` is disabled.\n\
   *\n\
   * @param {String} name\n\
   * @return {Boolean}\n\
   * @api public\n\
   */\n\
\n\
  obj.disabled = function(name){\n\
    return ! this.get(name);\n\
  };\n\
\n\
  return obj;\n\
};//@ sourceURL=visionmedia-configurable.js/index.js"
));
require.register("component-autoscale-canvas/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Retina-enable the given `canvas`.\n\
 *\n\
 * @param {Canvas} canvas\n\
 * @return {Canvas}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(canvas){\n\
  var ctx = canvas.getContext('2d');\n\
  var ratio = window.devicePixelRatio || 1;\n\
  if (1 != ratio) {\n\
    canvas.style.width = canvas.width + 'px';\n\
    canvas.style.height = canvas.height + 'px';\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx.scale(ratio, ratio);\n\
  }\n\
  return canvas;\n\
};//@ sourceURL=component-autoscale-canvas/index.js"
));
require.register("component-style/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `style`.\n\
 */\n\
\n\
module.exports = style;\n\
\n\
/**\n\
 * Return the style for `prop` using the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
function style(selector, prop) {\n\
  var cache = style.cache = style.cache || {}\n\
    , cid = selector + ':' + prop;\n\
\n\
  if (cache[cid]) return cache[cid];\n\
\n\
  var parts = selector.split(/ +/)\n\
    , len = parts.length\n\
    , parent = document.createElement('div')\n\
    , root = parent\n\
    , child\n\
    , part;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    part = parts[i];\n\
    child = document.createElement('div');\n\
    parent.appendChild(child);\n\
    parent = child;\n\
    if ('#' == part[0]) {\n\
      child.setAttribute('id', part.substr(1));\n\
    } else if ('.' == part[0]) {\n\
      child.setAttribute('class', part.substr(1));\n\
    }\n\
  }\n\
\n\
  document.body.appendChild(root);\n\
  var ret = getComputedStyle(child)[prop];\n\
  document.body.removeChild(root);\n\
  return cache[cid] = ret;\n\
}//@ sourceURL=component-style/index.js"
));
require.register("chemzqm-highlight.js/index.js", Function("exports, require, module",
"module.exports = require('./lib/highlight.js');\n\
//@ sourceURL=chemzqm-highlight.js/index.js"
));
require.register("chemzqm-highlight.js/lib/1c.js", Function("exports, require, module",
"module.exports = function(hljs){\n\
  var IDENT_RE_RU = '[a-zA-Zа-яА-Я][a-zA-Z0-9_а-яА-Я]*';\n\
  var OneS_KEYWORDS = 'возврат дата для если и или иначе иначеесли исключение конецесли ' +\n\
    'конецпопытки конецпроцедуры конецфункции конеццикла константа не перейти перем ' +\n\
    'перечисление по пока попытка прервать продолжить процедура строка тогда фс функция цикл ' +\n\
    'число экспорт';\n\
  var OneS_BUILT_IN = 'ansitooem oemtoansi ввестивидсубконто ввестидату ввестизначение ' +\n\
    'ввестиперечисление ввестипериод ввестиплансчетов ввестистроку ввестичисло вопрос ' +\n\
    'восстановитьзначение врег выбранныйплансчетов вызватьисключение датагод датамесяц ' +\n\
    'датачисло добавитьмесяц завершитьработусистемы заголовоксистемы записьжурналарегистрации ' +\n\
    'запуститьприложение зафиксироватьтранзакцию значениевстроку значениевстрокувнутр ' +\n\
    'значениевфайл значениеизстроки значениеизстрокивнутр значениеизфайла имякомпьютера ' +\n\
    'имяпользователя каталогвременныхфайлов каталогиб каталогпользователя каталогпрограммы ' +\n\
    'кодсимв командасистемы конгода конецпериодаби конецрассчитанногопериодаби ' +\n\
    'конецстандартногоинтервала конквартала конмесяца коннедели лев лог лог10 макс ' +\n\
    'максимальноеколичествосубконто мин монопольныйрежим названиеинтерфейса названиенабораправ ' +\n\
    'назначитьвид назначитьсчет найти найтипомеченныенаудаление найтиссылки началопериодаби ' +\n\
    'началостандартногоинтервала начатьтранзакцию начгода начквартала начмесяца начнедели ' +\n\
    'номерднягода номерднянедели номернеделигода нрег обработкаожидания окр описаниеошибки ' +\n\
    'основнойжурналрасчетов основнойплансчетов основнойязык открытьформу открытьформумодально ' +\n\
    'отменитьтранзакцию очиститьокносообщений периодстр полноеимяпользователя получитьвремята ' +\n\
    'получитьдатута получитьдокументта получитьзначенияотбора получитьпозициюта ' +\n\
    'получитьпустоезначение получитьта прав праводоступа предупреждение префиксавтонумерации ' +\n\
    'пустаястрока пустоезначение рабочаядаттьпустоезначение рабочаядата разделительстраниц ' +\n\
    'разделительстрок разм разобратьпозициюдокумента рассчитатьрегистрына ' +\n\
    'рассчитатьрегистрыпо сигнал симв символтабуляции создатьобъект сокрл сокрлп сокрп ' +\n\
    'сообщить состояние сохранитьзначение сред статусвозврата стрдлина стрзаменить ' +\n\
    'стрколичествострок стрполучитьстроку  стрчисловхождений сформироватьпозициюдокумента ' +\n\
    'счетпокоду текущаядата текущеевремя типзначения типзначениястр удалитьобъекты ' +\n\
    'установитьтана установитьтапо фиксшаблон формат цел шаблон';\n\
  var DQUOTE =  {className: 'dquote',  begin: '\"\"'};\n\
  var STR_START = {\n\
      className: 'string',\n\
      begin: '\"', end: '\"|$',\n\
      contains: [DQUOTE],\n\
      relevance: 0\n\
    };\n\
  var STR_CONT = {\n\
    className: 'string',\n\
    begin: '\\\\|', end: '\"|$',\n\
    contains: [DQUOTE]\n\
  };\n\
\n\
  return {\n\
    case_insensitive: true,\n\
    lexems: IDENT_RE_RU,\n\
    keywords: {keyword: OneS_KEYWORDS, built_in: OneS_BUILT_IN},\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.NUMBER_MODE,\n\
      STR_START, STR_CONT,\n\
      {\n\
        className: 'function',\n\
        begin: '(процедура|функция)', end: '$',\n\
        lexems: IDENT_RE_RU,\n\
        keywords: 'процедура функция',\n\
        contains: [\n\
          {className: 'title', begin: IDENT_RE_RU},\n\
          {\n\
            className: 'tail',\n\
            endsWithParent: true,\n\
            contains: [\n\
              {\n\
                className: 'params',\n\
                begin: '\\\\(', end: '\\\\)',\n\
                lexems: IDENT_RE_RU,\n\
                keywords: 'знач',\n\
                contains: [STR_START, STR_CONT]\n\
              },\n\
              {\n\
                className: 'export',\n\
                begin: 'экспорт', endsWithParent: true,\n\
                lexems: IDENT_RE_RU,\n\
                keywords: 'экспорт',\n\
                contains: [hljs.C_LINE_COMMENT_MODE]\n\
              }\n\
            ]\n\
          },\n\
          hljs.C_LINE_COMMENT_MODE\n\
        ]\n\
      },\n\
      {className: 'preprocessor', begin: '#', end: '$'},\n\
      {className: 'date', begin: '\\'\\\\d{2}\\\\.\\\\d{2}\\\\.(\\\\d{2}|\\\\d{4})\\''}\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/1c.js"
));
require.register("chemzqm-highlight.js/lib/actionscript.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';\n\
  var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';\n\
\n\
  var AS3_REST_ARG_MODE = {\n\
    className: 'rest_arg',\n\
    begin: '[.]{3}', end: IDENT_RE,\n\
    relevance: 10\n\
  };\n\
  var TITLE_MODE = {className: 'title', begin: IDENT_RE};\n\
\n\
  return {\n\
    keywords: {\n\
      keyword: 'as break case catch class const continue default delete do dynamic each ' +\n\
        'else extends final finally for function get if implements import in include ' +\n\
        'instanceof interface internal is namespace native new override package private ' +\n\
        'protected public return set static super switch this throw try typeof use var void ' +\n\
        'while with',\n\
      literal: 'true false null undefined'\n\
    },\n\
    contains: [\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'package',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'package',\n\
        contains: [TITLE_MODE]\n\
      },\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'class interface',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true,\n\
            keywords: 'extends implements'\n\
          },\n\
          TITLE_MODE\n\
        ]\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        beginWithKeyword: true, end: ';',\n\
        keywords: 'import include'\n\
      },\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '[{;]',\n\
        keywords: 'function',\n\
        illegal: '\\\\S',\n\
        contains: [\n\
          TITLE_MODE,\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', end: '\\\\)',\n\
            contains: [\n\
              hljs.APOS_STRING_MODE,\n\
              hljs.QUOTE_STRING_MODE,\n\
              hljs.C_LINE_COMMENT_MODE,\n\
              hljs.C_BLOCK_COMMENT_MODE,\n\
              AS3_REST_ARG_MODE\n\
            ]\n\
          },\n\
          {\n\
            className: 'type',\n\
            begin: ':',\n\
            end: IDENT_FUNC_RETURN_TYPE_RE,\n\
            relevance: 10\n\
          }\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/actionscript.js"
));
require.register("chemzqm-highlight.js/lib/apache.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var NUMBER = {className: 'number', begin: '[\\\\$%]\\\\d+'};\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: {\n\
      keyword: 'acceptfilter acceptmutex acceptpathinfo accessfilename action addalt ' +\n\
        'addaltbyencoding addaltbytype addcharset adddefaultcharset adddescription ' +\n\
        'addencoding addhandler addicon addiconbyencoding addiconbytype addinputfilter ' +\n\
        'addlanguage addmoduleinfo addoutputfilter addoutputfilterbytype addtype alias ' +\n\
        'aliasmatch allow allowconnect allowencodedslashes allowoverride anonymous ' +\n\
        'anonymous_logemail anonymous_mustgiveemail anonymous_nouserid anonymous_verifyemail ' +\n\
        'authbasicauthoritative authbasicprovider authdbduserpwquery authdbduserrealmquery ' +\n\
        'authdbmgroupfile authdbmtype authdbmuserfile authdefaultauthoritative ' +\n\
        'authdigestalgorithm authdigestdomain authdigestnccheck authdigestnonceformat ' +\n\
        'authdigestnoncelifetime authdigestprovider authdigestqop authdigestshmemsize ' +\n\
        'authgroupfile authldapbinddn authldapbindpassword authldapcharsetconfig ' +\n\
        'authldapcomparednonserver authldapdereferencealiases authldapgroupattribute ' +\n\
        'authldapgroupattributeisdn authldapremoteuserattribute authldapremoteuserisdn ' +\n\
        'authldapurl authname authnprovideralias authtype authuserfile authzdbmauthoritative ' +\n\
        'authzdbmtype authzdefaultauthoritative authzgroupfileauthoritative ' +\n\
        'authzldapauthoritative authzownerauthoritative authzuserauthoritative ' +\n\
        'balancermember browsermatch browsermatchnocase bufferedlogs cachedefaultexpire ' +\n\
        'cachedirlength cachedirlevels cachedisable cacheenable cachefile ' +\n\
        'cacheignorecachecontrol cacheignoreheaders cacheignorenolastmod ' +\n\
        'cacheignorequerystring cachelastmodifiedfactor cachemaxexpire cachemaxfilesize ' +\n\
        'cacheminfilesize cachenegotiateddocs cacheroot cachestorenostore cachestoreprivate ' +\n\
        'cgimapextension charsetdefault charsetoptions charsetsourceenc checkcaseonly ' +\n\
        'checkspelling chrootdir contentdigest cookiedomain cookieexpires cookielog ' +\n\
        'cookiename cookiestyle cookietracking coredumpdirectory customlog dav ' +\n\
        'davdepthinfinity davgenericlockdb davlockdb davmintimeout dbdexptime dbdkeep ' +\n\
        'dbdmax dbdmin dbdparams dbdpersist dbdpreparesql dbdriver defaulticon ' +\n\
        'defaultlanguage defaulttype deflatebuffersize deflatecompressionlevel ' +\n\
        'deflatefilternote deflatememlevel deflatewindowsize deny directoryindex ' +\n\
        'directorymatch directoryslash documentroot dumpioinput dumpiologlevel dumpiooutput ' +\n\
        'enableexceptionhook enablemmap enablesendfile errordocument errorlog example ' +\n\
        'expiresactive expiresbytype expiresdefault extendedstatus extfilterdefine ' +\n\
        'extfilteroptions fileetag filterchain filterdeclare filterprotocol filterprovider ' +\n\
        'filtertrace forcelanguagepriority forcetype forensiclog gracefulshutdowntimeout ' +\n\
        'group header headername hostnamelookups identitycheck identitychecktimeout ' +\n\
        'imapbase imapdefault imapmenu include indexheadinsert indexignore indexoptions ' +\n\
        'indexorderdefault indexstylesheet isapiappendlogtoerrors isapiappendlogtoquery ' +\n\
        'isapicachefile isapifakeasync isapilognotsupported isapireadaheadbuffer keepalive ' +\n\
        'keepalivetimeout languagepriority ldapcacheentries ldapcachettl ' +\n\
        'ldapconnectiontimeout ldapopcacheentries ldapopcachettl ldapsharedcachefile ' +\n\
        'ldapsharedcachesize ldaptrustedclientcert ldaptrustedglobalcert ldaptrustedmode ' +\n\
        'ldapverifyservercert limitinternalrecursion limitrequestbody limitrequestfields ' +\n\
        'limitrequestfieldsize limitrequestline limitxmlrequestbody listen listenbacklog ' +\n\
        'loadfile loadmodule lockfile logformat loglevel maxclients maxkeepaliverequests ' +\n\
        'maxmemfree maxrequestsperchild maxrequestsperthread maxspareservers maxsparethreads ' +\n\
        'maxthreads mcachemaxobjectcount mcachemaxobjectsize mcachemaxstreamingbuffer ' +\n\
        'mcacheminobjectsize mcacheremovalalgorithm mcachesize metadir metafiles metasuffix ' +\n\
        'mimemagicfile minspareservers minsparethreads mmapfile mod_gzip_on ' +\n\
        'mod_gzip_add_header_count mod_gzip_keep_workfiles mod_gzip_dechunk ' +\n\
        'mod_gzip_min_http mod_gzip_minimum_file_size mod_gzip_maximum_file_size ' +\n\
        'mod_gzip_maximum_inmem_size mod_gzip_temp_dir mod_gzip_item_include ' +\n\
        'mod_gzip_item_exclude mod_gzip_command_version mod_gzip_can_negotiate ' +\n\
        'mod_gzip_handle_methods mod_gzip_static_suffix mod_gzip_send_vary ' +\n\
        'mod_gzip_update_static modmimeusepathinfo multiviewsmatch namevirtualhost noproxy ' +\n\
        'nwssltrustedcerts nwsslupgradeable options order passenv pidfile protocolecho ' +\n\
        'proxybadheader proxyblock proxydomain proxyerroroverride proxyftpdircharset ' +\n\
        'proxyiobuffersize proxymaxforwards proxypass proxypassinterpolateenv ' +\n\
        'proxypassmatch proxypassreverse proxypassreversecookiedomain ' +\n\
        'proxypassreversecookiepath proxypreservehost proxyreceivebuffersize proxyremote ' +\n\
        'proxyremotematch proxyrequests proxyset proxystatus proxytimeout proxyvia ' +\n\
        'readmename receivebuffersize redirect redirectmatch redirectpermanent ' +\n\
        'redirecttemp removecharset removeencoding removehandler removeinputfilter ' +\n\
        'removelanguage removeoutputfilter removetype requestheader require rewritebase ' +\n\
        'rewritecond rewriteengine rewritelock rewritelog rewriteloglevel rewritemap ' +\n\
        'rewriteoptions rewriterule rlimitcpu rlimitmem rlimitnproc satisfy scoreboardfile ' +\n\
        'script scriptalias scriptaliasmatch scriptinterpretersource scriptlog ' +\n\
        'scriptlogbuffer scriptloglength scriptsock securelisten seerequesttail ' +\n\
        'sendbuffersize serveradmin serveralias serverlimit servername serverpath ' +\n\
        'serverroot serversignature servertokens setenv setenvif setenvifnocase sethandler ' +\n\
        'setinputfilter setoutputfilter ssienableaccess ssiendtag ssierrormsg ssistarttag ' +\n\
        'ssitimeformat ssiundefinedecho sslcacertificatefile sslcacertificatepath ' +\n\
        'sslcadnrequestfile sslcadnrequestpath sslcarevocationfile sslcarevocationpath ' +\n\
        'sslcertificatechainfile sslcertificatefile sslcertificatekeyfile sslciphersuite ' +\n\
        'sslcryptodevice sslengine sslhonorciperorder sslmutex ssloptions ' +\n\
        'sslpassphrasedialog sslprotocol sslproxycacertificatefile ' +\n\
        'sslproxycacertificatepath sslproxycarevocationfile sslproxycarevocationpath ' +\n\
        'sslproxyciphersuite sslproxyengine sslproxymachinecertificatefile ' +\n\
        'sslproxymachinecertificatepath sslproxyprotocol sslproxyverify ' +\n\
        'sslproxyverifydepth sslrandomseed sslrequire sslrequiressl sslsessioncache ' +\n\
        'sslsessioncachetimeout sslusername sslverifyclient sslverifydepth startservers ' +\n\
        'startthreads substitute suexecusergroup threadlimit threadsperchild ' +\n\
        'threadstacksize timeout traceenable transferlog typesconfig unsetenv ' +\n\
        'usecanonicalname usecanonicalphysicalport user userdir virtualdocumentroot ' +\n\
        'virtualdocumentrootip virtualscriptalias virtualscriptaliasip ' +\n\
        'win32disableacceptex xbithack',\n\
      literal: 'on off'\n\
    },\n\
    contains: [\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        className: 'sqbracket',\n\
        begin: '\\\\s\\\\[', end: '\\\\]$'\n\
      },\n\
      {\n\
        className: 'cbracket',\n\
        begin: '[\\\\$%]\\\\{', end: '\\\\}',\n\
        contains: ['self', NUMBER]\n\
      },\n\
      NUMBER,\n\
      {className: 'tag', begin: '</?', end: '>'},\n\
      hljs.QUOTE_STRING_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/apache.js"
));
require.register("chemzqm-highlight.js/lib/applescript.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: ''});\n\
  var TITLE = {\n\
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE\n\
  };\n\
  var PARAMS = {\n\
    className: 'params',\n\
    begin: '\\\\(', end: '\\\\)',\n\
    contains: ['self', hljs.C_NUMBER_MODE, STRING]\n\
  };\n\
  var COMMENTS = [\n\
    {\n\
      className: 'comment',\n\
      begin: '--', end: '$',\n\
    },\n\
    {\n\
      className: 'comment',\n\
      begin: '\\\\(\\\\*', end: '\\\\*\\\\)',\n\
      contains: ['self', {begin: '--', end: '$'}] //allow nesting\n\
    },\n\
    hljs.HASH_COMMENT_MODE\n\
  ];\n\
\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'about above after against and around as at back before beginning ' +\n\
        'behind below beneath beside between but by considering ' +\n\
        'contain contains continue copy div does eighth else end equal ' +\n\
        'equals error every exit fifth first for fourth from front ' +\n\
        'get given global if ignoring in into is it its last local me ' +\n\
        'middle mod my ninth not of on onto or over prop property put ref ' +\n\
        'reference repeat returning script second set seventh since ' +\n\
        'sixth some tell tenth that the then third through thru ' +\n\
        'timeout times to transaction try until where while whose with ' +\n\
        'without',\n\
      constant:\n\
        'AppleScript false linefeed return pi quote result space tab true',\n\
      type:\n\
        'alias application boolean class constant date file integer list ' +\n\
        'number real record string text',\n\
      command:\n\
        'activate beep count delay launch log offset read round ' +\n\
        'run say summarize write',\n\
      property:\n\
        'character characters contents day frontmost id item length ' +\n\
        'month name paragraph paragraphs rest reverse running time version ' +\n\
        'weekday word words year'\n\
    },\n\
    contains: [\n\
      STRING,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'type',\n\
        begin: '\\\\bPOSIX file\\\\b'\n\
      },\n\
      {\n\
        className: 'command',\n\
        begin:\n\
          '\\\\b(clipboard info|the clipboard|info for|list (disks|folder)|' +\n\
          'mount volume|path to|(close|open for) access|(get|set) eof|' +\n\
          'current date|do shell script|get volume settings|random number|' +\n\
          'set volume|system attribute|system info|time to GMT|' +\n\
          '(load|run|store) script|scripting components|' +\n\
          'ASCII (character|number)|localized string|' +\n\
          'choose (application|color|file|file name|' +\n\
          'folder|from list|remote application|URL)|' +\n\
          'display (alert|dialog))\\\\b|^\\\\s*return\\\\b'\n\
      },\n\
      {\n\
        className: 'constant',\n\
        begin:\n\
          '\\\\b(text item delimiters|current application|missing value)\\\\b'\n\
      },\n\
      {\n\
        className: 'keyword',\n\
        begin:\n\
          '\\\\b(apart from|aside from|instead of|out of|greater than|' +\n\
          \"isn't|(doesn't|does not) (equal|come before|come after|contain)|\" +\n\
          '(greater|less) than( or equal)?|(starts?|ends|begins?) with|' +\n\
          'contained by|comes (before|after)|a (ref|reference))\\\\b'\n\
      },\n\
      {\n\
        className: 'property',\n\
        begin:\n\
          '\\\\b(POSIX path|(date|time) string|quoted form)\\\\b'\n\
      },\n\
      {\n\
        className: 'function_start',\n\
        beginWithKeyword: true,\n\
        keywords: 'on',\n\
        illegal: '[${=;\\\\n\
]',\n\
        contains: [TITLE, PARAMS]\n\
      }\n\
    ].concat(COMMENTS)\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/applescript.js"
));
require.register("chemzqm-highlight.js/lib/avrasm.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: {\n\
      keyword:\n\
        /* mnemonic */\n\
        'adc add adiw and andi asr bclr bld brbc brbs brcc brcs break breq brge brhc brhs ' +\n\
        'brid brie brlo brlt brmi brne brpl brsh brtc brts brvc brvs bset bst call cbi cbr ' +\n\
        'clc clh cli cln clr cls clt clv clz com cp cpc cpi cpse dec eicall eijmp elpm eor ' +\n\
        'fmul fmuls fmulsu icall ijmp in inc jmp ld ldd ldi lds lpm lsl lsr mov movw mul ' +\n\
        'muls mulsu neg nop or ori out pop push rcall ret reti rjmp rol ror sbc sbr sbrc sbrs ' +\n\
        'sec seh sbi sbci sbic sbis sbiw sei sen ser ses set sev sez sleep spm st std sts sub ' +\n\
        'subi swap tst wdr',\n\
      built_in:\n\
        /* general purpose registers */\n\
        'r0 r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15 r16 r17 r18 r19 r20 r21 r22 ' +\n\
        'r23 r24 r25 r26 r27 r28 r29 r30 r31 x|0 xh xl y|0 yh yl z|0 zh zl ' +\n\
        /* IO Registers (ATMega128) */\n\
        'ucsr1c udr1 ucsr1a ucsr1b ubrr1l ubrr1h ucsr0c ubrr0h tccr3c tccr3a tccr3b tcnt3h ' +\n\
        'tcnt3l ocr3ah ocr3al ocr3bh ocr3bl ocr3ch ocr3cl icr3h icr3l etimsk etifr tccr1c ' +\n\
        'ocr1ch ocr1cl twcr twdr twar twsr twbr osccal xmcra xmcrb eicra spmcsr spmcr portg ' +\n\
        'ddrg ping portf ddrf sreg sph spl xdiv rampz eicrb eimsk gimsk gicr eifr gifr timsk ' +\n\
        'tifr mcucr mcucsr tccr0 tcnt0 ocr0 assr tccr1a tccr1b tcnt1h tcnt1l ocr1ah ocr1al ' +\n\
        'ocr1bh ocr1bl icr1h icr1l tccr2 tcnt2 ocr2 ocdr wdtcr sfior eearh eearl eedr eecr ' +\n\
        'porta ddra pina portb ddrb pinb portc ddrc pinc portd ddrd pind spdr spsr spcr udr0 ' +\n\
        'ucsr0a ucsr0b ubrr0l acsr admux adcsr adch adcl porte ddre pine pinf'\n\
    },\n\
    contains: [\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      {className: 'comment', begin: ';',  end: '$'},\n\
      hljs.C_NUMBER_MODE, // 0x..., decimal, float\n\
      hljs.BINARY_NUMBER_MODE, // 0b...\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\b(\\\\$[a-zA-Z0-9]+|0o[0-7]+)' // $..., 0o...\n\
      },\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\\'', end: '[^\\\\\\\\]\\'',\n\
        illegal: '[^\\\\\\\\][^\\']'\n\
      },\n\
      {className: 'label',  begin: '^[A-Za-z0-9_.$]+:'},\n\
      {className: 'preprocessor', begin: '#', end: '$'},\n\
      {  // директивы «.include» «.macro» и т.д.\n\
        className: 'preprocessor',\n\
        begin: '\\\\.[a-zA-Z]+'\n\
      },\n\
      {  // подстановка в «.macro»\n\
        className: 'localvars',\n\
        begin: '@[0-9]+'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/avrasm.js"
));
require.register("chemzqm-highlight.js/lib/axapta.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: 'false int abstract private char interface boolean static null if for true ' +\n\
      'while long throw finally protected extends final implements return void enum else ' +\n\
      'break new catch byte super class case short default double public try this switch ' +\n\
      'continue reverse firstfast firstonly forupdate nofetch sum avg minof maxof count ' +\n\
      'order group by asc desc index hint like dispaly edit client server ttsbegin ' +\n\
      'ttscommit str real date container anytype common div mod',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#', end: '$'\n\
      },\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, end: '{',\n\
        illegal: ':',\n\
        keywords: 'class interface',\n\
        contains: [\n\
          {\n\
            className: 'inheritance',\n\
            beginWithKeyword: true,\n\
            keywords: 'extends implements',\n\
            relevance: 10\n\
          },\n\
          {\n\
            className: 'title',\n\
            begin: hljs.UNDERSCORE_IDENT_RE\n\
          }\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/axapta.js"
));
require.register("chemzqm-highlight.js/lib/bash.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var BASH_LITERAL = 'true false';\n\
  var BASH_KEYWORD = 'if then else elif fi for break continue while in do done echo exit return set declare';\n\
  var VAR1 = {\n\
    className: 'variable', begin: '\\\\$[a-zA-Z0-9_#]+'\n\
  };\n\
  var VAR2 = {\n\
    className: 'variable', begin: '\\\\${([^}]|\\\\\\\\})+}'\n\
  };\n\
  var QUOTE_STRING = {\n\
    className: 'string',\n\
    begin: '\"', end: '\"',\n\
    illegal: '\\\\n\
',\n\
    contains: [hljs.BACKSLASH_ESCAPE, VAR1, VAR2],\n\
    relevance: 0\n\
  };\n\
  var APOS_STRING = {\n\
    className: 'string',\n\
    begin: '\\'', end: '\\'',\n\
    contains: [{begin: '\\'\\''}],\n\
    relevance: 0\n\
  };\n\
  var TEST_CONDITION = {\n\
    className: 'test_condition',\n\
    begin: '', end: '',\n\
    contains: [QUOTE_STRING, APOS_STRING, VAR1, VAR2],\n\
    keywords: {\n\
      literal: BASH_LITERAL\n\
    },\n\
    relevance: 0\n\
  };\n\
\n\
  return {\n\
    keywords: {\n\
      keyword: BASH_KEYWORD,\n\
      literal: BASH_LITERAL\n\
    },\n\
    contains: [\n\
      {\n\
        className: 'shebang',\n\
        begin: '(#!\\\\/bin\\\\/bash)|(#!\\\\/bin\\\\/sh)',\n\
        relevance: 10\n\
      },\n\
      VAR1,\n\
      VAR2,\n\
      hljs.HASH_COMMENT_MODE,\n\
      QUOTE_STRING,\n\
      APOS_STRING,\n\
      hljs.inherit(TEST_CONDITION, {begin: '\\\\[ ', end: ' \\\\]', relevance: 0}),\n\
      hljs.inherit(TEST_CONDITION, {begin: '\\\\[\\\\[ ', end: ' \\\\]\\\\]'})\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/bash.js"
));
require.register("chemzqm-highlight.js/lib/brainfuck.js", Function("exports, require, module",
"module.exports = function(hljs){\n\
  return {\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: '[^\\\\[\\\\]\\\\.,\\\\+\\\\-<> \\r\\n\
]',\n\
        excludeEnd: true,\n\
        end: '[\\\\[\\\\]\\\\.,\\\\+\\\\-<> \\r\\n\
]',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'title',\n\
        begin: '[\\\\[\\\\]]',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '[\\\\.,]'\n\
      },\n\
      {\n\
        className: 'literal',\n\
        begin: '[\\\\+\\\\-]'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/brainfuck.js"
));
require.register("chemzqm-highlight.js/lib/clojure.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var keywords = {\n\
    built_in:\n\
      // Clojure keywords\n\
      'def cond apply if-not if-let if not not= = &lt; < > &lt;= <= >= == + / * - rem '+\n\
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+\n\
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+\n\
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+\n\
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+\n\
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+\n\
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+\n\
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+\n\
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+\n\
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+\n\
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+\n\
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for doseq dosync dotimes and or '+\n\
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+\n\
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+\n\
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+\n\
      'intern refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+\n\
      'assoc! dissoc! pop! disj! import use class type num float double short byte boolean bigint biginteger '+\n\
      'bigdec print-method print-dup throw-if throw printf format load compile get-in update-in pr pr-on newline '+\n\
      'flush read slurp read-line subvec with-open memfn time ns assert re-find re-groups rand-int rand mod locking '+\n\
      'assert-valid-fdecl alias namespace resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+\n\
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+\n\
      'new next conj set! memfn to-array future future-call into-array aset gen-class reduce merge map filter find empty '+\n\
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+\n\
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+\n\
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+\n\
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+\n\
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'\n\
   };\n\
\n\
  var CLJ_IDENT_RE = '[a-zA-Z_0-9\\\\!\\\\.\\\\?\\\\-\\\\+\\\\*\\\\/\\\\<\\\\=\\\\>\\\\&\\\\#\\\\$\\';]+';\n\
  var SIMPLE_NUMBER_RE = '[\\\\s:\\\\(\\\\{]+\\\\d+(\\\\.\\\\d+)?';\n\
\n\
  var NUMBER = {\n\
    className: 'number', begin: SIMPLE_NUMBER_RE,\n\
    relevance: 0\n\
  };\n\
  var STRING = {\n\
    className: 'string',\n\
    begin: '\"', end: '\"',\n\
    contains: [hljs.BACKSLASH_ESCAPE],\n\
    relevance: 0\n\
  };\n\
  var COMMENT = {\n\
    className: 'comment',\n\
    begin: ';', end: '$',\n\
    relevance: 0\n\
  };\n\
  var COLLECTION = {\n\
    className: 'collection',\n\
    begin: '[\\\\[\\\\{]', end: '[\\\\]\\\\}]'\n\
  };\n\
  var HINT = {\n\
    className: 'comment',\n\
    begin: '\\\\^' + CLJ_IDENT_RE\n\
  };\n\
  var HINT_COL = {\n\
    className: 'comment',\n\
    begin: '\\\\^\\\\{', end: '\\\\}'\n\
  };\n\
  var KEY = {\n\
    className: 'attribute',\n\
    begin: '[:]' + CLJ_IDENT_RE\n\
  };\n\
  var LIST = {\n\
    className: 'list',\n\
    begin: '\\\\(', end: '\\\\)',\n\
    relevance: 0\n\
  };\n\
  var BODY = {\n\
    endsWithParent: true, excludeEnd: true,\n\
    keywords: {literal: 'true false nil'},\n\
    relevance: 0\n\
  };\n\
  var TITLE = {\n\
    keywords: keywords,\n\
    lexems: CLJ_IDENT_RE,\n\
    className: 'title', begin: CLJ_IDENT_RE,\n\
    starts: BODY\n\
  };\n\
\n\
  LIST.contains = [{className: 'comment', begin: 'comment'}, TITLE];\n\
  BODY.contains = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER];\n\
  COLLECTION.contains = [LIST, STRING, HINT, COMMENT, KEY, COLLECTION, NUMBER];\n\
\n\
  return {\n\
    illegal: '\\\\S',\n\
    contains: [\n\
      COMMENT,\n\
      LIST\n\
    ]\n\
  }\n\
};//@ sourceURL=chemzqm-highlight.js/lib/clojure.js"
));
require.register("chemzqm-highlight.js/lib/cmake.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: 'add_custom_command add_custom_target add_definitions add_dependencies ' +\n\
      'add_executable add_library add_subdirectory add_test aux_source_directory ' +\n\
      'break build_command cmake_minimum_required cmake_policy configure_file ' +\n\
      'create_test_sourcelist define_property else elseif enable_language enable_testing ' +\n\
      'endforeach endfunction endif endmacro endwhile execute_process export find_file ' +\n\
      'find_library find_package find_path find_program fltk_wrap_ui foreach function ' +\n\
      'get_cmake_property get_directory_property get_filename_component get_property ' +\n\
      'get_source_file_property get_target_property get_test_property if include ' +\n\
      'include_directories include_external_msproject include_regular_expression install ' +\n\
      'link_directories load_cache load_command macro mark_as_advanced message option ' +\n\
      'output_required_files project qt_wrap_cpp qt_wrap_ui remove_definitions return ' +\n\
      'separate_arguments set set_directory_properties set_property ' +\n\
      'set_source_files_properties set_target_properties set_tests_properties site_name ' +\n\
      'source_group string target_link_libraries try_compile try_run unset variable_watch ' +\n\
      'while build_name exec_program export_library_dependencies install_files ' +\n\
      'install_programs install_targets link_libraries make_directory remove subdir_depends ' +\n\
      'subdirs use_mangled_mesa utility_source variable_requires write_file',\n\
    contains: [\n\
      {\n\
        className: 'envvar',\n\
        begin: '\\\\${', end: '}'\n\
      },\n\
      hljs.HASH_COMMENT_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.NUMBER_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/cmake.js"
));
require.register("chemzqm-highlight.js/lib/coffeescript.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var KEYWORDS = {\n\
    keyword:\n\
      // JS keywords\n\
      'in if for while finally new do return else break catch instanceof throw try this ' +\n\
      'switch continue typeof delete debugger super ' +\n\
      // Coffee keywords\n\
      'then unless until loop of by when and or is isnt not',\n\
    literal:\n\
      // JS literals\n\
      'true false null undefined ' +\n\
      // Coffee literals\n\
      'yes no on off ',\n\
    reserved: 'case default function var void with const let enum export import native ' +\n\
      '__hasProp __extends __slice __bind __indexOf'\n\
  };\n\
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';\n\
  var TITLE = {className: 'title', begin: JS_IDENT_RE};\n\
  var SUBST = {\n\
    className: 'subst',\n\
    begin: '#\\\\{', end: '}',\n\
    keywords: KEYWORDS,\n\
    contains: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]\n\
  };\n\
\n\
  return {\n\
    keywords: KEYWORDS,\n\
    contains: [\n\
      // Numbers\n\
      hljs.BINARY_NUMBER_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      // Strings\n\
      hljs.APOS_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\"\"\"', end: '\"\"\"',\n\
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '\"', end: '\"',\n\
        contains: [hljs.BACKSLASH_ESCAPE, SUBST],\n\
        relevance: 0\n\
      },\n\
      // Comments\n\
      {\n\
        className: 'comment',\n\
        begin: '###', end: '###'\n\
      },\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        className: 'regexp',\n\
        begin: '///', end: '///',\n\
        contains: [hljs.HASH_COMMENT_MODE]\n\
      },\n\
      {\n\
        className: 'regexp', begin: '//[gim]*'\n\
      },\n\
      {\n\
        className: 'regexp',\n\
        begin: '/\\\\S(\\\\\\\\.|[^\\\\n\
])*/[gim]*' // \\S is required to parse x / 2 / 3 as two divisions\n\
      },\n\
      {\n\
        begin: '`', end: '`',\n\
        excludeBegin: true, excludeEnd: true,\n\
        subLanguage: 'javascript'\n\
      },\n\
      {\n\
        className: 'function',\n\
        begin: JS_IDENT_RE + '\\\\s*=\\\\s*(\\\\(.+\\\\))?\\\\s*[-=]>',\n\
        returnBegin: true,\n\
        contains: [\n\
          TITLE,\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', end: '\\\\)'\n\
          }\n\
        ]\n\
      },\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, keywords: 'class',\n\
        end: '$',\n\
        illegal: ':',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true, keywords: 'extends',\n\
            endsWithParent: true,\n\
            illegal: ':',\n\
            contains: [TITLE]\n\
          },\n\
          TITLE\n\
        ]\n\
      },\n\
      {\n\
        className: 'property',\n\
        begin: '@' + JS_IDENT_RE\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/coffeescript.js"
));
require.register("chemzqm-highlight.js/lib/cpp.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var CPP_KEYWORDS = {\n\
    keyword: 'false int float while private char catch export virtual operator sizeof ' +\n\
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +\n\
      'unsigned long throw volatile static protected bool template mutable if public friend ' +\n\
      'do return goto auto void enum else break new extern using true class asm case typeid ' +\n\
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +\n\
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +\n\
      'noexcept nullptr static_assert thread_local restrict _Bool complex',\n\
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +\n\
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +\n\
      'unordered_map unordered_multiset unordered_multimap array shared_ptr'\n\
  };\n\
  return {\n\
    keywords: CPP_KEYWORDS,\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\\'\\\\\\\\?.', end: '\\'',\n\
        illegal: '.'\n\
      },\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\b(\\\\d+(\\\\.\\\\d*)?|\\\\.\\\\d+)(u|U|l|L|ul|UL|f|F)'\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#', end: '$'\n\
      },\n\
      {\n\
        className: 'stl_container',\n\
        begin: '\\\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\\\s*<', end: '>',\n\
        keywords: CPP_KEYWORDS,\n\
        relevance: 10,\n\
        contains: ['self']\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/cpp.js"
));
require.register("chemzqm-highlight.js/lib/cs.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords:\n\
      // Normal keywords.\n\
      'abstract as base bool break byte case catch char checked class const continue decimal ' +\n\
      'default delegate do double else enum event explicit extern false finally fixed float ' +\n\
      'for foreach goto if implicit in int interface internal is lock long namespace new null ' +\n\
      'object operator out override params private protected public readonly ref return sbyte ' +\n\
      'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +\n\
      'uint ulong unchecked unsafe ushort using virtual volatile void while ' +\n\
      // Contextual keywords.\n\
      'ascending descending from get group into join let orderby partial select set value var '+\n\
      'where yield',\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: '///', end: '$', returnBegin: true,\n\
        contains: [\n\
          {\n\
            className: 'xmlDocTag',\n\
            begin: '///|<!--|-->'\n\
          },\n\
          {\n\
            className: 'xmlDocTag',\n\
            begin: '</?', end: '>'\n\
          }\n\
        ]\n\
      },\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#', end: '$',\n\
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '@\"', end: '\"',\n\
        contains: [{begin: '\"\"'}]\n\
      },\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_NUMBER_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/cs.js"
));
require.register("chemzqm-highlight.js/lib/css.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var FUNCTION = {\n\
    className: 'function',\n\
    begin: hljs.IDENT_RE + '\\\\(', end: '\\\\)',\n\
    contains: [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]\n\
  };\n\
  return {\n\
    case_insensitive: true,\n\
    illegal: '[=/|\\']',\n\
    contains: [\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      {\n\
        className: 'id', begin: '\\\\#[A-Za-z0-9_-]+'\n\
      },\n\
      {\n\
        className: 'class', begin: '\\\\.[A-Za-z0-9_-]+',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'attr_selector',\n\
        begin: '\\\\[', end: '\\\\]',\n\
        illegal: '$'\n\
      },\n\
      {\n\
        className: 'pseudo',\n\
        begin: ':(:)?[a-zA-Z0-9\\\\_\\\\-\\\\+\\\\(\\\\)\\\\\"\\\\\\']+'\n\
      },\n\
      {\n\
        className: 'at_rule',\n\
        begin: '@(font-face|page)',\n\
        lexems: '[a-z-]+',\n\
        keywords: 'font-face page'\n\
      },\n\
      {\n\
        className: 'at_rule',\n\
        begin: '@', end: '[{;]', // at_rule eating first \"{\" is a good thing\n\
                                 // because it doesn’t let it to be parsed as\n\
                                 // a rule set but instead drops parser into\n\
                                 // the default mode which is how it should be.\n\
        excludeEnd: true,\n\
        keywords: 'import page media charset',\n\
        contains: [\n\
          FUNCTION,\n\
          hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,\n\
          hljs.NUMBER_MODE\n\
        ]\n\
      },\n\
      {\n\
        className: 'tag', begin: hljs.IDENT_RE,\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'rules',\n\
        begin: '{', end: '}',\n\
        illegal: '[^\\\\s]',\n\
        relevance: 0,\n\
        contains: [\n\
          hljs.C_BLOCK_COMMENT_MODE,\n\
          {\n\
            className: 'rule',\n\
            begin: '[^\\\\s]', returnBegin: true, end: ';', endsWithParent: true,\n\
            contains: [\n\
              {\n\
                className: 'attribute',\n\
                begin: '[A-Z\\\\_\\\\.\\\\-]+', end: ':',\n\
                excludeEnd: true,\n\
                illegal: '[^\\\\s]',\n\
                starts: {\n\
                  className: 'value',\n\
                  endsWithParent: true, excludeEnd: true,\n\
                  contains: [\n\
                    FUNCTION,\n\
                    hljs.NUMBER_MODE,\n\
                    hljs.QUOTE_STRING_MODE,\n\
                    hljs.APOS_STRING_MODE,\n\
                    hljs.C_BLOCK_COMMENT_MODE,\n\
                    {\n\
                      className: 'hexcolor', begin: '\\\\#[0-9A-F]+'\n\
                    },\n\
                    {\n\
                      className: 'important', begin: '!important'\n\
                    }\n\
                  ]\n\
                }\n\
              }\n\
            ]\n\
          }\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/css.js"
));
require.register("chemzqm-highlight.js/lib/d.js", Function("exports, require, module",
"module.exports = /**\n\
 * Known issues:\n\
 *\n\
 * - invalid hex string literals will be recognized as a double quoted strings\n\
 *   but 'x' at the beginning of string will not be matched\n\
 *\n\
 * - delimited string literals are not checked for matching end delimiter\n\
 *   (not possible to do with js regexp)\n\
 *\n\
 * - content of token string is colored as a string (i.e. no keyword coloring inside a token string)\n\
 *   also, content of token string is not validated to contain only valid D tokens\n\
 *\n\
 * - special token sequence rule is not strictly following D grammar (anything following #line\n\
 *   up to the end of line is matched as special token sequence)\n\
 */\n\
\n\
function(hljs) {\n\
\n\
\t/**\n\
\t * Language keywords\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_KEYWORDS = {\n\
\t\tkeyword:\n\
\t\t\t'abstract alias align asm assert auto body break byte case cast catch class ' +\n\
\t\t\t'const continue debug default delete deprecated do else enum export extern final ' +\n\
\t\t\t'finally for foreach foreach_reverse|10 goto if immutable import in inout int ' +\n\
\t\t\t'interface invariant is lazy macro mixin module new nothrow out override package ' +\n\
\t\t\t'pragma private protected public pure ref return scope shared static struct ' +\n\
\t\t\t'super switch synchronized template this throw try typedef typeid typeof union ' +\n\
\t\t\t'unittest version void volatile while with __FILE__ __LINE__ __gshared|10 ' +\n\
\t\t\t'__thread __traits __DATE__ __EOF__ __TIME__ __TIMESTAMP__ __VENDOR__ __VERSION__',\n\
\t\tbuilt_in:\n\
\t\t\t'bool cdouble cent cfloat char creal dchar delegate double dstring float function ' +\n\
\t\t\t'idouble ifloat ireal long real short string ubyte ucent uint ulong ushort wchar ' +\n\
\t\t\t'wstring',\n\
\t\tliteral:\n\
\t\t\t'false null true'\n\
\t};\n\
\n\
\t/**\n\
\t * Number literal regexps\n\
\t *\n\
\t * @type {String}\n\
\t */\n\
\tvar decimal_integer_re = '(0|[1-9][\\\\d_]*)',\n\
\t\tdecimal_integer_nosus_re = '(0|[1-9][\\\\d_]*|\\\\d[\\\\d_]*|[\\\\d_]+?\\\\d)',\n\
\t\tbinary_integer_re = '0[bB][01_]+',\n\
\t\thexadecimal_digits_re = '([\\\\da-fA-F][\\\\da-fA-F_]*|_[\\\\da-fA-F][\\\\da-fA-F_]*)',\n\
\t\thexadecimal_integer_re = '0[xX]' + hexadecimal_digits_re,\n\
\n\
\t\tdecimal_exponent_re = '([eE][+-]?' + decimal_integer_nosus_re + ')',\n\
\t\tdecimal_float_re = '(' + decimal_integer_nosus_re + '(\\\\.\\\\d*|' + decimal_exponent_re + ')|' +\n\
\t\t\t\t\t\t\t\t'\\\\d+\\\\.' + decimal_integer_nosus_re + decimal_integer_nosus_re + '|' +\n\
\t\t\t\t\t\t\t\t'\\\\.' + decimal_integer_re + decimal_exponent_re + '?' +\n\
\t\t\t\t\t\t\t')',\n\
\t\thexadecimal_float_re = '(0[xX](' +\n\
\t\t\t\t\t\t\t\t\thexadecimal_digits_re + '\\\\.' + hexadecimal_digits_re + '|'+\n\
\t\t\t\t\t\t\t\t\t'\\\\.?' + hexadecimal_digits_re +\n\
\t\t\t\t\t\t\t   ')[pP][+-]?' + decimal_integer_nosus_re + ')',\n\
\n\
\t\tinteger_re = '(' +\n\
\t\t\tdecimal_integer_re + '|' +\n\
\t\t\tbinary_integer_re  + '|' +\n\
\t\t \thexadecimal_integer_re   +\n\
\t\t')',\n\
\n\
\t\tfloat_re = '(' +\n\
\t\t\thexadecimal_float_re + '|' +\n\
\t\t\tdecimal_float_re  +\n\
\t\t')';\n\
\n\
\t/**\n\
\t * Escape sequence supported in D string and character literals\n\
\t *\n\
\t * @type {String}\n\
\t */\n\
\tvar escape_sequence_re = '\\\\\\\\(' +\n\
\t\t\t\t\t\t\t'[\\'\"\\\\?\\\\\\\\abfnrtv]|' +\t// common escapes\n\
\t\t\t\t\t\t\t'u[\\\\dA-Fa-f]{4}|' + \t\t// four hex digit unicode codepoint\n\
\t\t\t\t\t\t\t'[0-7]{1,3}|' + \t\t\t// one to three octal digit ascii char code\n\
\t\t\t\t\t\t\t'x[\\\\dA-Fa-f]{2}|' +\t\t// two hex digit ascii char code\n\
\t\t\t\t\t\t\t'U[\\\\dA-Fa-f]{8}' +\t\t\t// eight hex digit unicode codepoint\n\
\t\t\t\t\t\t  ')|' +\n\
\t\t\t\t\t\t  '&[a-zA-Z\\\\d]{2,};';\t\t\t// named character entity\n\
\n\
\n\
\t/**\n\
\t * D integer number literals\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_INTEGER_MODE = {\n\
\t\tclassName: 'number',\n\
    \tbegin: '\\\\b' + integer_re + '(L|u|U|Lu|LU|uL|UL)?',\n\
    \trelevance: 0\n\
\t};\n\
\n\
\t/**\n\
\t * [D_FLOAT_MODE description]\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_FLOAT_MODE = {\n\
\t\tclassName: 'number',\n\
\t\tbegin: '\\\\b(' +\n\
\t\t\t\tfloat_re + '([fF]|L|i|[fF]i|Li)?|' +\n\
\t\t\t\tinteger_re + '(i|[fF]i|Li)' +\n\
\t\t\t')',\n\
\t\trelevance: 0\n\
\t};\n\
\n\
\t/**\n\
\t * D character literal\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_CHARACTER_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: '\\'(' + escape_sequence_re + '|.)', end: '\\'',\n\
\t\tillegal: '.'\n\
\t};\n\
\n\
\t/**\n\
\t * D string escape sequence\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_ESCAPE_SEQUENCE = {\n\
\t\tbegin: escape_sequence_re,\n\
\t\trelevance: 0\n\
\t}\n\
\n\
\t/**\n\
\t * D double quoted string literal\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_STRING_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: '\"',\n\
\t\tcontains: [D_ESCAPE_SEQUENCE],\n\
\t\tend: '\"[cwd]?',\n\
\t\trelevance: 0\n\
\t};\n\
\n\
\t/**\n\
\t * D wysiwyg and delimited string literals\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_WYSIWYG_DELIMITED_STRING_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: '[rq]\"',\n\
\t\tend: '\"[cwd]?',\n\
\t\trelevance: 5\n\
\t};\n\
\n\
\t/**\n\
\t * D alternate wysiwyg string literal\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_ALTERNATE_WYSIWYG_STRING_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: '`',\n\
\t\tend: '`[cwd]?'\n\
\t};\n\
\n\
\t/**\n\
\t * D hexadecimal string literal\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_HEX_STRING_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: 'x\"[\\\\da-fA-F\\\\s\\\\n\
\\\\r]*\"[cwd]?',\n\
\t\trelevance: 10\n\
\t};\n\
\n\
\t/**\n\
\t * D delimited string literal\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_TOKEN_STRING_MODE = {\n\
\t\tclassName: 'string',\n\
\t\tbegin: 'q\"\\\\{',\n\
\t\tend: '\\\\}\"'\n\
\t};\n\
\n\
\t/**\n\
\t * Hashbang support\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_HASHBANG_MODE = {\n\
\t\tclassName: 'shebang',\n\
\t\tbegin: '^#!',\n\
\t\tend: '$',\n\
\t\trelevance: 5\n\
\t};\n\
\n\
\t/**\n\
\t * D special token sequence\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_SPECIAL_TOKEN_SEQUENCE_MODE = {\n\
\t\tclassName: 'preprocessor',\n\
\t\tbegin: '#(line)',\n\
\t\tend: '$',\n\
\t\trelevance: 5\n\
\t};\n\
\n\
\t/**\n\
\t * D attributes\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_ATTRIBUTE_MODE = {\n\
\t\tclassName: 'keyword',\n\
\t\tbegin: '@[a-zA-Z_][a-zA-Z_\\\\d]*'\n\
\t};\n\
\n\
\t/**\n\
\t * D nesting comment\n\
\t *\n\
\t * @type {Object}\n\
\t */\n\
\tvar D_NESTING_COMMENT_MODE = {\n\
\t\tclassName: 'comment',\n\
\t\tbegin: '\\\\/\\\\+',\n\
\t\tcontains: ['self'],\n\
\t\tend: '\\\\+\\\\/',\n\
\t\trelevance: 10\n\
\t}\n\
\n\
\treturn {\n\
\t\tlexems: hljs.UNDERSCORE_IDENT_RE,\n\
\t\tkeywords: D_KEYWORDS,\n\
\t\tcontains: [\n\
\t\t\thljs.C_LINE_COMMENT_MODE,\n\
  \t\t\thljs.C_BLOCK_COMMENT_MODE,\n\
  \t\t\tD_NESTING_COMMENT_MODE,\n\
  \t\t\tD_HEX_STRING_MODE,\n\
  \t\t\tD_STRING_MODE,\n\
  \t\t\tD_WYSIWYG_DELIMITED_STRING_MODE,\n\
  \t\t\tD_ALTERNATE_WYSIWYG_STRING_MODE,\n\
  \t\t\tD_TOKEN_STRING_MODE,\n\
  \t\t\tD_FLOAT_MODE,\n\
  \t\t\tD_INTEGER_MODE,\n\
  \t\t\tD_CHARACTER_MODE,\n\
  \t\t\tD_HASHBANG_MODE,\n\
  \t\t\tD_SPECIAL_TOKEN_SEQUENCE_MODE,\n\
  \t\t\tD_ATTRIBUTE_MODE\n\
\t\t]\n\
\t};\n\
};//@ sourceURL=chemzqm-highlight.js/lib/d.js"
));
require.register("chemzqm-highlight.js/lib/delphi.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var DELPHI_KEYWORDS = 'and safecall cdecl then string exports library not pascal set ' +\n\
    'virtual file in array label packed end. index while const raise for to implementation ' +\n\
    'with except overload destructor downto finally program exit unit inherited override if ' +\n\
    'type until function do begin repeat goto nil far initialization object else var uses ' +\n\
    'external resourcestring interface end finalization class asm mod case on shr shl of ' +\n\
    'register xorwrite threadvar try record near stored constructor stdcall inline div out or ' +\n\
    'procedure';\n\
  var DELPHI_CLASS_KEYWORDS = 'safecall stdcall pascal stored const implementation ' +\n\
    'finalization except to finally program inherited override then exports string read not ' +\n\
    'mod shr try div shl set library message packed index for near overload label downto exit ' +\n\
    'public goto interface asm on of constructor or private array unit raise destructor var ' +\n\
    'type until function else external with case default record while protected property ' +\n\
    'procedure published and cdecl do threadvar file in if end virtual write far out begin ' +\n\
    'repeat nil initialization object uses resourcestring class register xorwrite inline static';\n\
  var CURLY_COMMENT =  {\n\
    className: 'comment',\n\
    begin: '{', end: '}',\n\
    relevance: 0\n\
  };\n\
  var PAREN_COMMENT = {\n\
    className: 'comment',\n\
    begin: '\\\\(\\\\*', end: '\\\\*\\\\)',\n\
    relevance: 10\n\
  };\n\
  var STRING = {\n\
    className: 'string',\n\
    begin: '\\'', end: '\\'',\n\
    contains: [{begin: '\\'\\''}],\n\
    relevance: 0\n\
  };\n\
  var CHAR_STRING = {\n\
    className: 'string', begin: '(#\\\\d+)+'\n\
  };\n\
  var FUNCTION = {\n\
    className: 'function',\n\
    beginWithKeyword: true, end: '[:;]',\n\
    keywords: 'function constructor|10 destructor|10 procedure|10',\n\
    contains: [\n\
      {\n\
        className: 'title', begin: hljs.IDENT_RE\n\
      },\n\
      {\n\
        className: 'params',\n\
        begin: '\\\\(', end: '\\\\)',\n\
        keywords: DELPHI_KEYWORDS,\n\
        contains: [STRING, CHAR_STRING]\n\
      },\n\
      CURLY_COMMENT, PAREN_COMMENT\n\
    ]\n\
  };\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: DELPHI_KEYWORDS,\n\
    illegal: '(\"|\\\\$[G-Zg-z]|\\\\/\\\\*|</)',\n\
    contains: [\n\
      CURLY_COMMENT, PAREN_COMMENT, hljs.C_LINE_COMMENT_MODE,\n\
      STRING, CHAR_STRING,\n\
      hljs.NUMBER_MODE,\n\
      FUNCTION,\n\
      {\n\
        className: 'class',\n\
        begin: '=\\\\bclass\\\\b', end: 'end;',\n\
        keywords: DELPHI_CLASS_KEYWORDS,\n\
        contains: [\n\
          STRING, CHAR_STRING,\n\
          CURLY_COMMENT, PAREN_COMMENT, hljs.C_LINE_COMMENT_MODE,\n\
          FUNCTION\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/delphi.js"
));
require.register("chemzqm-highlight.js/lib/diff.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    contains: [\n\
      {\n\
        className: 'chunk',\n\
        begin: '^\\\\@\\\\@ +\\\\-\\\\d+,\\\\d+ +\\\\+\\\\d+,\\\\d+ +\\\\@\\\\@$',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'chunk',\n\
        begin: '^\\\\*\\\\*\\\\* +\\\\d+,\\\\d+ +\\\\*\\\\*\\\\*\\\\*$',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'chunk',\n\
        begin: '^\\\\-\\\\-\\\\- +\\\\d+,\\\\d+ +\\\\-\\\\-\\\\-\\\\-$',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: 'Index: ', end: '$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '=====', end: '=====$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '^\\\\-\\\\-\\\\-', end: '$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '^\\\\*{3} ', end: '$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '^\\\\+\\\\+\\\\+', end: '$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '\\\\*{5}', end: '\\\\*{5}$'\n\
      },\n\
      {\n\
        className: 'addition',\n\
        begin: '^\\\\+', end: '$'\n\
      },\n\
      {\n\
        className: 'deletion',\n\
        begin: '^\\\\-', end: '$'\n\
      },\n\
      {\n\
        className: 'change',\n\
        begin: '^\\\\!', end: '$'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/diff.js"
));
require.register("chemzqm-highlight.js/lib/django.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
\n\
  function allowsDjangoSyntax(mode, parent) {\n\
    return (\n\
      parent == undefined || // default mode\n\
      (!mode.className && parent.className == 'tag') || // tag_internal\n\
      mode.className == 'value' // value\n\
    );\n\
  }\n\
\n\
  function copy(mode, parent) {\n\
    var result = {};\n\
    for (var key in mode) {\n\
      if (key != 'contains') {\n\
        result[key] = mode[key];\n\
      }\n\
      var contains = [];\n\
      for (var i = 0; mode.contains && i < mode.contains.length; i++) {\n\
        contains.push(copy(mode.contains[i], mode));\n\
      }\n\
      if (allowsDjangoSyntax(mode, parent)) {\n\
        contains = DJANGO_CONTAINS.concat(contains);\n\
      }\n\
      if (contains.length) {\n\
        result.contains = contains;\n\
      }\n\
    }\n\
    return result;\n\
  }\n\
\n\
  var FILTER = {\n\
    className: 'filter',\n\
    begin: '\\\\|[A-Za-z]+\\\\:?', excludeEnd: true,\n\
    keywords:\n\
      'truncatewords removetags linebreaksbr yesno get_digit timesince random striptags ' +\n\
      'filesizeformat escape linebreaks length_is ljust rjust cut urlize fix_ampersands ' +\n\
      'title floatformat capfirst pprint divisibleby add make_list unordered_list urlencode ' +\n\
      'timeuntil urlizetrunc wordcount stringformat linenumbers slice date dictsort ' +\n\
      'dictsortreversed default_if_none pluralize lower join center default ' +\n\
      'truncatewords_html upper length phone2numeric wordwrap time addslashes slugify first ' +\n\
      'escapejs force_escape iriencode last safe safeseq truncatechars localize unlocalize ' +\n\
      'localtime utc timezone',\n\
    contains: [\n\
      {className: 'argument', begin: '\"', end: '\"'}\n\
    ]\n\
  };\n\
\n\
  var DJANGO_CONTAINS = [\n\
    {\n\
      className: 'template_comment',\n\
      begin: '{%\\\\s*comment\\\\s*%}', end: '{%\\\\s*endcomment\\\\s*%}'\n\
    },\n\
    {\n\
      className: 'template_comment',\n\
      begin: '{#', end: '#}'\n\
    },\n\
    {\n\
      className: 'template_tag',\n\
      begin: '{%', end: '%}',\n\
      keywords:\n\
        'comment endcomment load templatetag ifchanged endifchanged if endif firstof for ' +\n\
        'endfor in ifnotequal endifnotequal widthratio extends include spaceless ' +\n\
        'endspaceless regroup by as ifequal endifequal ssi now with cycle url filter ' +\n\
        'endfilter debug block endblock else autoescape endautoescape csrf_token empty elif ' +\n\
        'endwith static trans blocktrans endblocktrans get_static_prefix get_media_prefix ' +\n\
        'plural get_current_language language get_available_languages ' +\n\
        'get_current_language_bidi get_language_info get_language_info_list localize ' +\n\
        'endlocalize localtime endlocaltime timezone endtimezone get_current_timezone',\n\
      contains: [FILTER]\n\
    },\n\
    {\n\
      className: 'variable',\n\
      begin: '{{', end: '}}',\n\
      contains: [FILTER]\n\
    }\n\
  ];\n\
\n\
  var result = copy(hljs.LANGUAGES.xml);\n\
  result.case_insensitive = true;\n\
  return result;\n\
};//@ sourceURL=chemzqm-highlight.js/lib/django.js"
));
require.register("chemzqm-highlight.js/lib/dos.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: {\n\
      flow: 'if else goto for in do call exit not exist errorlevel defined equ neq lss leq gtr geq',\n\
      keyword: 'shift cd dir echo setlocal endlocal set pause copy',\n\
      stream: 'prn nul lpt3 lpt2 lpt1 con com4 com3 com2 com1 aux',\n\
      winutils: 'ping net ipconfig taskkill xcopy ren del'\n\
    },\n\
    contains: [\n\
      {\n\
        className: 'envvar', begin: '%%[^ ]'\n\
      },\n\
      {\n\
        className: 'envvar', begin: '%[^ ]+?%'\n\
      },\n\
      {\n\
        className: 'envvar', begin: '![^ ]+?!'\n\
      },\n\
      {\n\
        className: 'number', begin: '\\\\b\\\\d+',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '@?rem', end: '$'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/dos.js"
));
require.register("chemzqm-highlight.js/lib/erlang-repl.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: {\n\
      special_functions:\n\
        'spawn spawn_link self',\n\
      reserved:\n\
        'after and andalso|10 band begin bnot bor bsl bsr bxor case catch cond div end fun if ' +\n\
        'let not of or orelse|10 query receive rem try when xor'\n\
    },\n\
    contains: [\n\
      {\n\
        className: 'prompt', begin: '^[0-9]+> ',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '%', end: '$'\n\
      },\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\b(\\\\d+#[a-fA-F0-9]+|\\\\d+(\\\\.\\\\d+)?([eE][-+]?\\\\d+)?)',\n\
        relevance: 0\n\
      },\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'constant', begin: '\\\\?(::)?([A-Z]\\\\w*(::)?)+'\n\
      },\n\
      {\n\
        className: 'arrow', begin: '->'\n\
      },\n\
      {\n\
        className: 'ok', begin: 'ok'\n\
      },\n\
      {\n\
        className: 'exclamation_mark', begin: '!'\n\
      },\n\
      {\n\
        className: 'function_or_atom',\n\
        begin: '(\\\\b[a-z\\'][a-zA-Z0-9_\\']*:[a-z\\'][a-zA-Z0-9_\\']*)|(\\\\b[a-z\\'][a-zA-Z0-9_\\']*)',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'variable',\n\
        begin: '[A-Z][a-zA-Z0-9_\\']*',\n\
        relevance: 0\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/erlang-repl.js"
));
require.register("chemzqm-highlight.js/lib/erlang.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var BASIC_ATOM_RE = '[a-z\\'][a-zA-Z0-9_\\']*';\n\
  var FUNCTION_NAME_RE = '(' + BASIC_ATOM_RE + ':' + BASIC_ATOM_RE + '|' + BASIC_ATOM_RE + ')';\n\
  var ERLANG_RESERVED = {\n\
    keyword:\n\
      'after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun let ' +\n\
      'not of orelse|10 query receive rem try when xor',\n\
    literal:\n\
      'false true'\n\
  };\n\
\n\
  var COMMENT = {\n\
    className: 'comment',\n\
    begin: '%', end: '$',\n\
    relevance: 0\n\
  };\n\
  var NUMBER = {\n\
    className: 'number',\n\
    begin: '\\\\b(\\\\d+#[a-fA-F0-9]+|\\\\d+(\\\\.\\\\d+)?([eE][-+]?\\\\d+)?)',\n\
    relevance: 0\n\
  };\n\
  var NAMED_FUN = {\n\
    begin: 'fun\\\\s+' + BASIC_ATOM_RE + '/\\\\d+'\n\
  };\n\
  var FUNCTION_CALL = {\n\
    begin: FUNCTION_NAME_RE + '\\\\(', end: '\\\\)',\n\
    returnBegin: true,\n\
    relevance: 0,\n\
    contains: [\n\
      {\n\
        className: 'function_name', begin: FUNCTION_NAME_RE,\n\
        relevance: 0\n\
      },\n\
      {\n\
        begin: '\\\\(', end: '\\\\)', endsWithParent: true,\n\
        returnEnd: true,\n\
        relevance: 0\n\
        // \"contains\" defined later\n\
      }\n\
    ]\n\
  };\n\
  var TUPLE = {\n\
    className: 'tuple',\n\
    begin: '{', end: '}',\n\
    relevance: 0\n\
    // \"contains\" defined later\n\
  };\n\
  var VAR1 = {\n\
    className: 'variable',\n\
    begin: '\\\\b_([A-Z][A-Za-z0-9_]*)?',\n\
    relevance: 0\n\
  };\n\
  var VAR2 = {\n\
    className: 'variable',\n\
    begin: '[A-Z][a-zA-Z0-9_]*',\n\
    relevance: 0\n\
  };\n\
  var RECORD_ACCESS = {\n\
    begin: '#', end: '}',\n\
    illegal: '.',\n\
    relevance: 0,\n\
    returnBegin: true,\n\
    contains: [\n\
      {\n\
        className: 'record_name',\n\
        begin: '#' + hljs.UNDERSCORE_IDENT_RE,\n\
        relevance: 0\n\
      },\n\
      {\n\
        begin: '{', endsWithParent: true,\n\
        relevance: 0\n\
        // \"contains\" defined later\n\
      }\n\
    ]\n\
  };\n\
\n\
  var BLOCK_STATEMENTS = {\n\
    keywords: ERLANG_RESERVED,\n\
    begin: '(fun|receive|if|try|case)', end: 'end'\n\
  };\n\
  BLOCK_STATEMENTS.contains = [\n\
    COMMENT,\n\
    NAMED_FUN,\n\
    hljs.inherit(hljs.APOS_STRING_MODE, {className: ''}),\n\
    BLOCK_STATEMENTS,\n\
    FUNCTION_CALL,\n\
    hljs.QUOTE_STRING_MODE,\n\
    NUMBER,\n\
    TUPLE,\n\
    VAR1, VAR2,\n\
    RECORD_ACCESS\n\
  ];\n\
\n\
  var BASIC_MODES = [\n\
    COMMENT,\n\
    NAMED_FUN,\n\
    BLOCK_STATEMENTS,\n\
    FUNCTION_CALL,\n\
    hljs.QUOTE_STRING_MODE,\n\
    NUMBER,\n\
    TUPLE,\n\
    VAR1, VAR2,\n\
    RECORD_ACCESS\n\
  ];\n\
  FUNCTION_CALL.contains[1].contains = BASIC_MODES;\n\
  TUPLE.contains = BASIC_MODES;\n\
  RECORD_ACCESS.contains[1].contains = BASIC_MODES;\n\
\n\
  var PARAMS = {\n\
    className: 'params',\n\
    begin: '\\\\(', end: '\\\\)',\n\
    contains: BASIC_MODES\n\
  };\n\
  return {\n\
    keywords: ERLANG_RESERVED,\n\
    illegal: '(</|\\\\*=|\\\\+=|-=|/=|/\\\\*|\\\\*/|\\\\(\\\\*|\\\\*\\\\))',\n\
    contains: [\n\
      {\n\
        className: 'function',\n\
        begin: '^' + BASIC_ATOM_RE + '\\\\s*\\\\(', end: '->',\n\
        returnBegin: true,\n\
        illegal: '\\\\(|#|//|/\\\\*|\\\\\\\\|:',\n\
        contains: [\n\
          PARAMS,\n\
          {\n\
            className: 'title', begin: BASIC_ATOM_RE\n\
          }\n\
        ],\n\
        starts: {\n\
          end: ';|\\\\.',\n\
          keywords: ERLANG_RESERVED,\n\
          contains: BASIC_MODES\n\
        }\n\
      },\n\
      COMMENT,\n\
      {\n\
        className: 'pp',\n\
        begin: '^-', end: '\\\\.',\n\
        relevance: 0,\n\
        excludeEnd: true,\n\
        returnBegin: true,\n\
        lexems: '-' + hljs.IDENT_RE,\n\
        keywords:\n\
          '-module -record -undef -export -ifdef -ifndef -author -copyright -doc -vsn ' +\n\
          '-import -include -include_lib -compile -define -else -endif -file -behaviour ' +\n\
          '-behavior',\n\
        contains: [PARAMS]\n\
      },\n\
      NUMBER,\n\
      hljs.QUOTE_STRING_MODE,\n\
      RECORD_ACCESS,\n\
      VAR1, VAR2,\n\
      TUPLE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/erlang.js"
));
require.register("chemzqm-highlight.js/lib/glsl.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'atomic_uint attribute bool break bvec2 bvec3 bvec4 case centroid coherent const continue default ' +\n\
        'discard dmat2 dmat2x2 dmat2x3 dmat2x4 dmat3 dmat3x2 dmat3x3 dmat3x4 dmat4 dmat4x2 dmat4x3 ' +\n\
        'dmat4x4 do double dvec2 dvec3 dvec4 else flat float for highp if iimage1D iimage1DArray ' +\n\
        'iimage2D iimage2DArray iimage2DMS iimage2DMSArray iimage2DRect iimage3D iimageBuffer iimageCube ' +\n\
        'iimageCubeArray image1D image1DArray image2D image2DArray image2DMS image2DMSArray image2DRect ' +\n\
        'image3D imageBuffer imageCube imageCubeArray in inout int invariant isampler1D isampler1DArray ' +\n\
        'isampler2D isampler2DArray isampler2DMS isampler2DMSArray isampler2DRect isampler3D isamplerBuffer ' +\n\
        'isamplerCube isamplerCubeArray ivec2 ivec3 ivec4 layout lowp mat2 mat2x2 mat2x3 mat2x4 mat3 mat3x2 ' +\n\
        'mat3x3 mat3x4 mat4 mat4x2 mat4x3 mat4x4 mediump noperspective out patch precision readonly restrict ' +\n\
        'return sample sampler1D sampler1DArray sampler1DArrayShadow sampler1DShadow sampler2D sampler2DArray ' +\n\
        'sampler2DArrayShadow sampler2DMS sampler2DMSArray sampler2DRect sampler2DRectShadow sampler2DShadow ' +\n\
        'sampler3D samplerBuffer samplerCube samplerCubeArray samplerCubeArrayShadow samplerCubeShadow smooth ' +\n\
        'struct subroutine switch uimage1D uimage1DArray uimage2D uimage2DArray uimage2DMS uimage2DMSArray ' +\n\
        'uimage2DRect uimage3D uimageBuffer uimageCube uimageCubeArray uint uniform usampler1D usampler1DArray ' +\n\
        'usampler2D usampler2DArray usampler2DMS usampler2DMSArray usampler2DRect usampler3D usamplerBuffer ' +\n\
        'usamplerCube usamplerCubeArray uvec2 uvec3 uvec4 varying vec2 vec3 vec4 void volatile while writeonly',\n\
      built_in:\n\
        'gl_BackColor gl_BackLightModelProduct gl_BackLightProduct gl_BackMaterial ' +\n\
        'gl_BackSecondaryColor gl_ClipDistance gl_ClipPlane gl_ClipVertex gl_Color ' +\n\
        'gl_DepthRange gl_EyePlaneQ gl_EyePlaneR gl_EyePlaneS gl_EyePlaneT gl_Fog gl_FogCoord ' +\n\
        'gl_FogFragCoord gl_FragColor gl_FragCoord gl_FragData gl_FragDepth gl_FrontColor ' +\n\
        'gl_FrontFacing gl_FrontLightModelProduct gl_FrontLightProduct gl_FrontMaterial ' +\n\
        'gl_FrontSecondaryColor gl_InstanceID gl_InvocationID gl_Layer gl_LightModel ' +\n\
        'gl_LightSource gl_MaxAtomicCounterBindings gl_MaxAtomicCounterBufferSize ' +\n\
        'gl_MaxClipDistances gl_MaxClipPlanes gl_MaxCombinedAtomicCounterBuffers ' +\n\
        'gl_MaxCombinedAtomicCounters gl_MaxCombinedImageUniforms gl_MaxCombinedImageUnitsAndFragmentOutputs ' +\n\
        'gl_MaxCombinedTextureImageUnits gl_MaxDrawBuffers gl_MaxFragmentAtomicCounterBuffers ' +\n\
        'gl_MaxFragmentAtomicCounters gl_MaxFragmentImageUniforms gl_MaxFragmentInputComponents ' +\n\
        'gl_MaxFragmentUniformComponents gl_MaxFragmentUniformVectors gl_MaxGeometryAtomicCounterBuffers ' +\n\
        'gl_MaxGeometryAtomicCounters gl_MaxGeometryImageUniforms gl_MaxGeometryInputComponents ' +\n\
        'gl_MaxGeometryOutputComponents gl_MaxGeometryOutputVertices gl_MaxGeometryTextureImageUnits ' +\n\
        'gl_MaxGeometryTotalOutputComponents gl_MaxGeometryUniformComponents gl_MaxGeometryVaryingComponents ' +\n\
        'gl_MaxImageSamples gl_MaxImageUnits gl_MaxLights gl_MaxPatchVertices gl_MaxProgramTexelOffset ' +\n\
        'gl_MaxTessControlAtomicCounterBuffers gl_MaxTessControlAtomicCounters gl_MaxTessControlImageUniforms ' +\n\
        'gl_MaxTessControlInputComponents gl_MaxTessControlOutputComponents gl_MaxTessControlTextureImageUnits ' +\n\
        'gl_MaxTessControlTotalOutputComponents gl_MaxTessControlUniformComponents ' +\n\
        'gl_MaxTessEvaluationAtomicCounterBuffers gl_MaxTessEvaluationAtomicCounters ' +\n\
        'gl_MaxTessEvaluationImageUniforms gl_MaxTessEvaluationInputComponents gl_MaxTessEvaluationOutputComponents ' +\n\
        'gl_MaxTessEvaluationTextureImageUnits gl_MaxTessEvaluationUniformComponents ' +\n\
        'gl_MaxTessGenLevel gl_MaxTessPatchComponents gl_MaxTextureCoords gl_MaxTextureImageUnits ' +\n\
        'gl_MaxTextureUnits gl_MaxVaryingComponents gl_MaxVaryingFloats gl_MaxVaryingVectors ' +\n\
        'gl_MaxVertexAtomicCounterBuffers gl_MaxVertexAtomicCounters gl_MaxVertexAttribs ' +\n\
        'gl_MaxVertexImageUniforms gl_MaxVertexOutputComponents gl_MaxVertexTextureImageUnits ' +\n\
        'gl_MaxVertexUniformComponents gl_MaxVertexUniformVectors gl_MaxViewports gl_MinProgramTexelOffset'+\n\
        'gl_ModelViewMatrix gl_ModelViewMatrixInverse gl_ModelViewMatrixInverseTranspose ' +\n\
        'gl_ModelViewMatrixTranspose gl_ModelViewProjectionMatrix gl_ModelViewProjectionMatrixInverse ' +\n\
        'gl_ModelViewProjectionMatrixInverseTranspose gl_ModelViewProjectionMatrixTranspose ' +\n\
        'gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 gl_MultiTexCoord4 ' +\n\
        'gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 gl_Normal gl_NormalMatrix ' +\n\
        'gl_NormalScale gl_ObjectPlaneQ gl_ObjectPlaneR gl_ObjectPlaneS gl_ObjectPlaneT gl_PatchVerticesIn ' +\n\
        'gl_PerVertex gl_Point gl_PointCoord gl_PointSize gl_Position gl_PrimitiveID gl_PrimitiveIDIn ' +\n\
        'gl_ProjectionMatrix gl_ProjectionMatrixInverse gl_ProjectionMatrixInverseTranspose ' +\n\
        'gl_ProjectionMatrixTranspose gl_SampleID gl_SampleMask gl_SampleMaskIn gl_SamplePosition ' +\n\
        'gl_SecondaryColor gl_TessCoord gl_TessLevelInner gl_TessLevelOuter gl_TexCoord gl_TextureEnvColor ' +\n\
        'gl_TextureMatrixInverseTranspose gl_TextureMatrixTranspose gl_Vertex gl_VertexID ' +\n\
        'gl_ViewportIndex gl_in gl_out EmitStreamVertex EmitVertex EndPrimitive EndStreamPrimitive ' +\n\
        'abs acos acosh all any asin asinh atan atanh atomicCounter atomicCounterDecrement ' +\n\
        'atomicCounterIncrement barrier bitCount bitfieldExtract bitfieldInsert bitfieldReverse ' +\n\
        'ceil clamp cos cosh cross dFdx dFdy degrees determinant distance dot equal exp exp2 faceforward ' +\n\
        'findLSB findMSB floatBitsToInt floatBitsToUint floor fma fract frexp ftransform fwidth greaterThan ' +\n\
        'greaterThanEqual imageAtomicAdd imageAtomicAnd imageAtomicCompSwap imageAtomicExchange ' +\n\
        'imageAtomicMax imageAtomicMin imageAtomicOr imageAtomicXor imageLoad imageStore imulExtended ' +\n\
        'intBitsToFloat interpolateAtCentroid interpolateAtOffset interpolateAtSample inverse inversesqrt ' +\n\
        'isinf isnan ldexp length lessThan lessThanEqual log log2 matrixCompMult max memoryBarrier ' +\n\
        'min mix mod modf noise1 noise2 noise3 noise4 normalize not notEqual outerProduct packDouble2x32 ' +\n\
        'packHalf2x16 packSnorm2x16 packSnorm4x8 packUnorm2x16 packUnorm4x8 pow radians reflect refract ' +\n\
        'round roundEven shadow1D shadow1DLod shadow1DProj shadow1DProjLod shadow2D shadow2DLod shadow2DProj ' +\n\
        'shadow2DProjLod sign sin sinh smoothstep sqrt step tan tanh texelFetch texelFetchOffset texture ' +\n\
        'texture1D texture1DLod texture1DProj texture1DProjLod texture2D texture2DLod texture2DProj ' +\n\
        'texture2DProjLod texture3D texture3DLod texture3DProj texture3DProjLod textureCube textureCubeLod ' +\n\
        'textureGather textureGatherOffset textureGatherOffsets textureGrad textureGradOffset textureLod ' +\n\
        'textureLodOffset textureOffset textureProj textureProjGrad textureProjGradOffset textureProjLod ' +\n\
        'textureProjLodOffset textureProjOffset textureQueryLod textureSize transpose trunc uaddCarry ' +\n\
        'uintBitsToFloat umulExtended unpackDouble2x32 unpackHalf2x16 unpackSnorm2x16 unpackSnorm4x8 ' +\n\
        'unpackUnorm2x16 unpackUnorm4x8 usubBorrow gl_TextureMatrix gl_TextureMatrixInverse',\n\
      literal: 'true false'\n\
    },\n\
    illegal: '\"',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#', end: '$'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/glsl.js"
));
require.register("chemzqm-highlight.js/lib/go.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var GO_KEYWORDS = {\n\
    keyword:\n\
      'break default func interface select case map struct chan else goto package switch ' +\n\
      'const fallthrough if range type continue for import return var go defer',\n\
    constant:\n\
       'true false iota nil',\n\
    typename:\n\
      'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' +\n\
      'uint16 uint32 uint64 int uint uintptr rune',\n\
    built_in:\n\
      'append cap close complex copy imag len make new panic print println real recover delete'\n\
  };\n\
  return {\n\
    keywords: GO_KEYWORDS,\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\\'', end: '[^\\\\\\\\]\\'',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '`', end: '`'\n\
      },\n\
      {\n\
        className: 'number',\n\
        begin: '[^a-zA-Z_0-9](\\\\-|\\\\+)?\\\\d+(\\\\.\\\\d+|\\\\/\\\\d+)?((d|e|f|l|s)(\\\\+|\\\\-)?\\\\d+)?',\n\
        relevance: 0\n\
      },\n\
      hljs.C_NUMBER_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/go.js"
));
require.register("chemzqm-highlight.js/lib/haskell.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var TYPE = {\n\
    className: 'type',\n\
    begin: '\\\\b[A-Z][\\\\w\\']*',\n\
    relevance: 0\n\
  };\n\
  var CONTAINER = {\n\
    className: 'container',\n\
    begin: '\\\\(', end: '\\\\)',\n\
    contains: [\n\
      {className: 'type', begin: '\\\\b[A-Z][\\\\w]*(\\\\((\\\\.\\\\.|,|\\\\w+)\\\\))?'},\n\
      {className: 'title', begin: '[_a-z][\\\\w\\']*'}\n\
    ]\n\
  };\n\
  var CONTAINER2 = {\n\
    className: 'container',\n\
    begin: '{', end: '}',\n\
    contains: CONTAINER.contains\n\
  }\n\
\n\
  return {\n\
    keywords:\n\
      'let in if then else case of where do module import hiding qualified type data ' +\n\
      'newtype deriving class instance not as foreign ccall safe unsafe',\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: '--', end: '$'\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '{-#', end: '#-}'\n\
      },\n\
      {\n\
        className: 'comment',\n\
        contains: ['self'],\n\
        begin: '{-', end: '-}'\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '\\\\s+\\'', end: '\\'',\n\
        contains: [hljs.BACKSLASH_ESCAPE],\n\
        relevance: 0\n\
      },\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'import',\n\
        begin: '\\\\bimport', end: '$',\n\
        keywords: 'import qualified as hiding',\n\
        contains: [CONTAINER],\n\
        illegal: '\\\\W\\\\.|;'\n\
      },\n\
      {\n\
        className: 'module',\n\
        begin: '\\\\bmodule', end: 'where',\n\
        keywords: 'module where',\n\
        contains: [CONTAINER],\n\
        illegal: '\\\\W\\\\.|;'\n\
      },\n\
      {\n\
        className: 'class',\n\
        begin: '\\\\b(class|instance)', end: 'where',\n\
        keywords: 'class where instance',\n\
        contains: [TYPE]\n\
      },\n\
      {\n\
        className: 'typedef',\n\
        begin: '\\\\b(data|(new)?type)', end: '$',\n\
        keywords: 'data type newtype deriving',\n\
        contains: [TYPE, CONTAINER, CONTAINER2]\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'shebang',\n\
        begin: '#!\\\\/usr\\\\/bin\\\\/env\\ runhaskell', end: '$'\n\
      },\n\
      TYPE,\n\
      {\n\
        className: 'title', begin: '^[_a-z][\\\\w\\']*'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/haskell.js"
));
require.register("chemzqm-highlight.js/lib/highlight.js", Function("exports, require, module",
"var hljs = new function() {\n\
\n\
  /* Utility functions */\n\
\n\
  function escape(value) {\n\
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');\n\
  }\n\
\n\
  function findCode(pre) {\n\
    for (var node = pre.firstChild; node; node = node.nextSibling) {\n\
      if (node.nodeName == 'CODE')\n\
        return node;\n\
      if (!(node.nodeType == 3 && node.nodeValue.match(/\\s+/)))\n\
        break;\n\
    }\n\
  }\n\
\n\
  function blockText(block, ignoreNewLines) {\n\
    return Array.prototype.map.call(block.childNodes, function(node) {\n\
      if (node.nodeType == 3) {\n\
        return ignoreNewLines ? node.nodeValue.replace(/\\n\
/g, '') : node.nodeValue;\n\
      }\n\
      if (node.nodeName == 'BR') {\n\
        return '\\n\
';\n\
      }\n\
      return blockText(node, ignoreNewLines);\n\
    }).join('');\n\
  }\n\
\n\
  function blockLanguage(block) {\n\
    var classes = (block.className + ' ' + block.parentNode.className).split(/\\s+/);\n\
    classes = classes.map(function(c) {return c.replace(/^language-/, '')});\n\
    for (var i = 0; i < classes.length; i++) {\n\
      if (languages[classes[i]] || classes[i] == 'no-highlight') {\n\
        return classes[i];\n\
      }\n\
    }\n\
  }\n\
\n\
  /* Stream merging */\n\
\n\
  function nodeStream(node) {\n\
    var result = [];\n\
    (function _nodeStream(node, offset) {\n\
      for (var child = node.firstChild; child; child = child.nextSibling) {\n\
        if (child.nodeType == 3)\n\
          offset += child.nodeValue.length;\n\
        else if (child.nodeName == 'BR')\n\
          offset += 1;\n\
        else if (child.nodeType == 1) {\n\
          result.push({\n\
            event: 'start',\n\
            offset: offset,\n\
            node: child\n\
          });\n\
          offset = _nodeStream(child, offset);\n\
          result.push({\n\
            event: 'stop',\n\
            offset: offset,\n\
            node: child\n\
          });\n\
        }\n\
      }\n\
      return offset;\n\
    })(node, 0);\n\
    return result;\n\
  }\n\
\n\
  function mergeStreams(stream1, stream2, value) {\n\
    var processed = 0;\n\
    var result = '';\n\
    var nodeStack = [];\n\
\n\
    function selectStream() {\n\
      if (stream1.length && stream2.length) {\n\
        if (stream1[0].offset != stream2[0].offset)\n\
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;\n\
        else {\n\
          /*\n\
          To avoid starting the stream just before it should stop the order is\n\
          ensured that stream1 always starts first and closes last:\n\
\n\
          if (event1 == 'start' && event2 == 'start')\n\
            return stream1;\n\
          if (event1 == 'start' && event2 == 'stop')\n\
            return stream2;\n\
          if (event1 == 'stop' && event2 == 'start')\n\
            return stream1;\n\
          if (event1 == 'stop' && event2 == 'stop')\n\
            return stream2;\n\
\n\
          ... which is collapsed to:\n\
          */\n\
          return stream2[0].event == 'start' ? stream1 : stream2;\n\
        }\n\
      } else {\n\
        return stream1.length ? stream1 : stream2;\n\
      }\n\
    }\n\
\n\
    function open(node) {\n\
      function attr_str(a) {return ' ' + a.nodeName + '=\"' + escape(a.value) + '\"'};\n\
      return '<' + node.nodeName + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';\n\
    }\n\
\n\
    while (stream1.length || stream2.length) {\n\
      var current = selectStream().splice(0, 1)[0];\n\
      result += escape(value.substr(processed, current.offset - processed));\n\
      processed = current.offset;\n\
      if ( current.event == 'start') {\n\
        result += open(current.node);\n\
        nodeStack.push(current.node);\n\
      } else if (current.event == 'stop') {\n\
        var node, i = nodeStack.length;\n\
        do {\n\
          i--;\n\
          node = nodeStack[i];\n\
          result += ('</' + node.nodeName.toLowerCase() + '>');\n\
        } while (node != current.node);\n\
        nodeStack.splice(i, 1);\n\
        while (i < nodeStack.length) {\n\
          result += open(nodeStack[i]);\n\
          i++;\n\
        }\n\
      }\n\
    }\n\
    return result + escape(value.substr(processed));\n\
  }\n\
\n\
  /* Initialization */\n\
\n\
  function compileLanguage(language) {\n\
\n\
    function langRe(value, global) {\n\
      return RegExp(\n\
        value,\n\
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')\n\
      );\n\
    }\n\
\n\
    function compileMode(mode, parent) {\n\
      if (mode.compiled)\n\
        return;\n\
      mode.compiled = true;\n\
\n\
      var keywords = []; // used later with beginWithKeyword but filled as a side-effect of keywords compilation\n\
      if (mode.keywords) {\n\
        var compiled_keywords = {};\n\
\n\
        function flatten(className, str) {\n\
          str.split(' ').forEach(function(kw) {\n\
            var pair = kw.split('|');\n\
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];\n\
            keywords.push(pair[0]);\n\
          });\n\
        }\n\
\n\
        mode.lexemsRe = langRe(mode.lexems || hljs.IDENT_RE, true);\n\
        if (typeof mode.keywords == 'string') { // string\n\
          flatten('keyword', mode.keywords)\n\
        } else {\n\
          for (var className in mode.keywords) {\n\
            if (!mode.keywords.hasOwnProperty(className))\n\
              continue;\n\
            flatten(className, mode.keywords[className]);\n\
          }\n\
        }\n\
        mode.keywords = compiled_keywords;\n\
      }\n\
      if (parent) {\n\
        if (mode.beginWithKeyword) {\n\
          mode.begin = '\\\\b(' + keywords.join('|') + ')\\\\s';\n\
        }\n\
        mode.beginRe = langRe(mode.begin ? mode.begin : '\\\\B|\\\\b');\n\
        if (!mode.end && !mode.endsWithParent)\n\
          mode.end = '\\\\B|\\\\b';\n\
        if (mode.end)\n\
          mode.endRe = langRe(mode.end);\n\
        mode.terminator_end = mode.end || '';\n\
        if (mode.endsWithParent && parent.terminator_end)\n\
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;\n\
      }\n\
      if (mode.illegal)\n\
        mode.illegalRe = langRe(mode.illegal);\n\
      if (mode.relevance === undefined)\n\
        mode.relevance = 1;\n\
      if (!mode.contains) {\n\
        mode.contains = [];\n\
      }\n\
      for (var i = 0; i < mode.contains.length; i++) {\n\
        if (mode.contains[i] == 'self') {\n\
          mode.contains[i] = mode;\n\
        }\n\
        compileMode(mode.contains[i], mode);\n\
      }\n\
      if (mode.starts) {\n\
        compileMode(mode.starts, parent);\n\
      }\n\
\n\
      var terminators = [];\n\
      for (var i = 0; i < mode.contains.length; i++) {\n\
        terminators.push(mode.contains[i].begin);\n\
      }\n\
      if (mode.terminator_end) {\n\
        terminators.push(mode.terminator_end);\n\
      }\n\
      if (mode.illegal) {\n\
        terminators.push(mode.illegal);\n\
      }\n\
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};\n\
    }\n\
\n\
    compileMode(language);\n\
  }\n\
\n\
  /*\n\
  Core highlighting function. Accepts a language name and a string with the\n\
  code to highlight. Returns an object with the following properties:\n\
\n\
  - relevance (int)\n\
  - keyword_count (int)\n\
  - value (an HTML string with highlighting markup)\n\
\n\
  */\n\
  function highlight(language_name, value) {\n\
\n\
    function subMode(lexem, mode) {\n\
      for (var i = 0; i < mode.contains.length; i++) {\n\
        var match = mode.contains[i].beginRe.exec(lexem);\n\
        if (match && match.index == 0) {\n\
          return mode.contains[i];\n\
        }\n\
      }\n\
    }\n\
\n\
    function endOfMode(mode, lexem) {\n\
      if (mode.end && mode.endRe.test(lexem)) {\n\
        return mode;\n\
      }\n\
      if (mode.endsWithParent) {\n\
        return endOfMode(mode.parent, lexem);\n\
      }\n\
    }\n\
\n\
    function isIllegal(lexem, mode) {\n\
      return mode.illegal && mode.illegalRe.test(lexem);\n\
    }\n\
\n\
    function keywordMatch(mode, match) {\n\
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];\n\
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];\n\
    }\n\
\n\
    function processKeywords() {\n\
      var buffer = escape(mode_buffer);\n\
      if (!top.keywords)\n\
        return buffer;\n\
      var result = '';\n\
      var last_index = 0;\n\
      top.lexemsRe.lastIndex = 0;\n\
      var match = top.lexemsRe.exec(buffer);\n\
      while (match) {\n\
        result += buffer.substr(last_index, match.index - last_index);\n\
        var keyword_match = keywordMatch(top, match);\n\
        if (keyword_match) {\n\
          keyword_count += keyword_match[1];\n\
          result += '<span class=\"'+ keyword_match[0] +'\">' + match[0] + '</span>';\n\
        } else {\n\
          result += match[0];\n\
        }\n\
        last_index = top.lexemsRe.lastIndex;\n\
        match = top.lexemsRe.exec(buffer);\n\
      }\n\
      return result + buffer.substr(last_index);\n\
    }\n\
\n\
    function processSubLanguage() {\n\
      if (top.subLanguage && !languages[top.subLanguage]) {\n\
        return escape(mode_buffer);\n\
      }\n\
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer) : highlightAuto(mode_buffer);\n\
      // Counting embedded language score towards the host language may be disabled\n\
      // with zeroing the containing mode relevance. Usecase in point is Markdown that\n\
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown\n\
      // score.\n\
      if (top.relevance > 0) {\n\
        keyword_count += result.keyword_count;\n\
        relevance += result.relevance;\n\
      }\n\
      return '<span class=\"' + result.language  + '\">' + result.value + '</span>';\n\
    }\n\
\n\
    function processBuffer() {\n\
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();\n\
    }\n\
\n\
    function startNewMode(mode, lexem) {\n\
      var markup = mode.className? '<span class=\"' + mode.className + '\">': '';\n\
      if (mode.returnBegin) {\n\
        result += markup;\n\
        mode_buffer = '';\n\
      } else if (mode.excludeBegin) {\n\
        result += escape(lexem) + markup;\n\
        mode_buffer = '';\n\
      } else {\n\
        result += markup;\n\
        mode_buffer = lexem;\n\
      }\n\
      top = Object.create(mode, {parent: {value: top}});\n\
      relevance += mode.relevance;\n\
    }\n\
\n\
    function processLexem(buffer, lexem) {\n\
      mode_buffer += buffer;\n\
      if (lexem === undefined) {\n\
        result += processBuffer();\n\
        return 0;\n\
      }\n\
\n\
      var new_mode = subMode(lexem, top);\n\
      if (new_mode) {\n\
        result += processBuffer();\n\
        startNewMode(new_mode, lexem);\n\
        return new_mode.returnBegin ? 0 : lexem.length;\n\
      }\n\
\n\
      var end_mode = endOfMode(top, lexem);\n\
      if (end_mode) {\n\
        if (!(end_mode.returnEnd || end_mode.excludeEnd)) {\n\
          mode_buffer += lexem;\n\
        }\n\
        result += processBuffer();\n\
        do {\n\
          if (top.className) {\n\
            result += '</span>';\n\
          }\n\
          top = top.parent;\n\
        } while (top != end_mode.parent);\n\
        if (end_mode.excludeEnd) {\n\
          result += escape(lexem);\n\
        }\n\
        mode_buffer = '';\n\
        if (end_mode.starts) {\n\
          startNewMode(end_mode.starts, '');\n\
        }\n\
        return end_mode.returnEnd ? 0 : lexem.length;\n\
      }\n\
\n\
      if (isIllegal(lexem, top))\n\
        throw 'Illegal';\n\
\n\
      /*\n\
      Parser should not reach this point as all types of lexems should be caught\n\
      earlier, but if it does due to some bug make sure it advances at least one\n\
      character forward to prevent infinite looping.\n\
      */\n\
      mode_buffer += lexem;\n\
      return lexem.length || 1;\n\
    }\n\
\n\
    var language = languages[language_name];\n\
    compileLanguage(language);\n\
    var top = language;\n\
    var mode_buffer = '';\n\
    var relevance = 0;\n\
    var keyword_count = 0;\n\
    var result = '';\n\
    try {\n\
      var match, count, index = 0;\n\
      while (true) {\n\
        top.terminators.lastIndex = index;\n\
        match = top.terminators.exec(value);\n\
        if (!match)\n\
          break;\n\
        count = processLexem(value.substr(index, match.index - index), match[0]);\n\
        index = match.index + count;\n\
      }\n\
      processLexem(value.substr(index))\n\
      return {\n\
        relevance: relevance,\n\
        keyword_count: keyword_count,\n\
        value: result,\n\
        language: language_name\n\
      };\n\
    } catch (e) {\n\
      if (e == 'Illegal') {\n\
        return {\n\
          relevance: 0,\n\
          keyword_count: 0,\n\
          value: escape(value)\n\
        };\n\
      } else {\n\
        throw e;\n\
      }\n\
    }\n\
  }\n\
\n\
  /*\n\
  Highlighting with language detection. Accepts a string with the code to\n\
  highlight. Returns an object with the following properties:\n\
\n\
  - language (detected language)\n\
  - relevance (int)\n\
  - keyword_count (int)\n\
  - value (an HTML string with highlighting markup)\n\
  - second_best (object with the same structure for second-best heuristically\n\
    detected language, may be absent)\n\
\n\
  */\n\
  function highlightAuto(text) {\n\
    var result = {\n\
      keyword_count: 0,\n\
      relevance: 0,\n\
      value: escape(text)\n\
    };\n\
    var second_best = result;\n\
    for (var key in languages) {\n\
      if (!languages.hasOwnProperty(key))\n\
        continue;\n\
      var current = highlight(key, text);\n\
      current.language = key;\n\
      if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {\n\
        second_best = current;\n\
      }\n\
      if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {\n\
        second_best = result;\n\
        result = current;\n\
      }\n\
    }\n\
    if (second_best.language) {\n\
      result.second_best = second_best;\n\
    }\n\
    return result;\n\
  }\n\
\n\
  /*\n\
  Post-processing of the highlighted markup:\n\
\n\
  - replace TABs with something more useful\n\
  - replace real line-breaks with '<br>' for non-pre containers\n\
\n\
  */\n\
  function fixMarkup(value, tabReplace, useBR) {\n\
    if (tabReplace) {\n\
      value = value.replace(/^((<[^>]+>|\\t)+)/gm, function(match, p1, offset, s) {\n\
        return p1.replace(/\\t/g, tabReplace);\n\
      });\n\
    }\n\
    if (useBR) {\n\
      value = value.replace(/\\n\
/g, '<br>');\n\
    }\n\
    return value;\n\
  }\n\
\n\
  /*\n\
  Applies highlighting to a DOM node containing code. Accepts a DOM node and\n\
  two optional parameters for fixMarkup.\n\
  */\n\
  function highlightBlock(block, tabReplace, useBR) {\n\
    var text = blockText(block, useBR);\n\
    var language = blockLanguage(block);\n\
    if (language == 'no-highlight')\n\
        return;\n\
    var result = language ? highlight(language, text) : highlightAuto(text);\n\
    language = result.language;\n\
    var original = nodeStream(block);\n\
    if (original.length) {\n\
      var pre = document.createElement('pre');\n\
      pre.innerHTML = result.value;\n\
      result.value = mergeStreams(original, nodeStream(pre), text);\n\
    }\n\
    result.value = fixMarkup(result.value, tabReplace, useBR);\n\
\n\
    var class_name = block.className;\n\
    if (!class_name.match('(\\\\s|^)(language-)?' + language + '(\\\\s|$)')) {\n\
      class_name = class_name ? (class_name + ' ' + language) : language;\n\
    }\n\
    block.innerHTML = result.value;\n\
    block.className = class_name;\n\
    block.result = {\n\
      language: language,\n\
      kw: result.keyword_count,\n\
      re: result.relevance\n\
    };\n\
    if (result.second_best) {\n\
      block.second_best = {\n\
        language: result.second_best.language,\n\
        kw: result.second_best.keyword_count,\n\
        re: result.second_best.relevance\n\
      };\n\
    }\n\
  }\n\
\n\
  /*\n\
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.\n\
  */\n\
  function initHighlighting() {\n\
    if (initHighlighting.called)\n\
      return;\n\
    initHighlighting.called = true;\n\
    Array.prototype.map.call(document.getElementsByTagName('pre'), findCode).\n\
      filter(Boolean).\n\
      forEach(function(code){highlightBlock(code, hljs.tabReplace)});\n\
  }\n\
\n\
  /*\n\
  Attaches highlighting to the page load event.\n\
  */\n\
  function initHighlightingOnLoad() {\n\
    window.addEventListener('DOMContentLoaded', initHighlighting, false);\n\
    window.addEventListener('load', initHighlighting, false);\n\
  }\n\
\n\
  var languages = {}; // a shortcut to avoid writing \"this.\" everywhere\n\
\n\
  /* Interface definition */\n\
\n\
  this.LANGUAGES = languages;\n\
  this.highlight = highlight;\n\
  this.highlightAuto = highlightAuto;\n\
  this.fixMarkup = fixMarkup;\n\
  this.highlightBlock = highlightBlock;\n\
  this.initHighlighting = initHighlighting;\n\
  this.initHighlightingOnLoad = initHighlightingOnLoad;\n\
\n\
  // Common regexps\n\
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';\n\
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';\n\
  this.NUMBER_RE = '\\\\b\\\\d+(\\\\.\\\\d+)?';\n\
  this.C_NUMBER_RE = '(\\\\b0[xX][a-fA-F0-9]+|(\\\\b\\\\d+(\\\\.\\\\d*)?|\\\\.\\\\d+)([eE][-+]?\\\\d+)?)'; // 0x..., 0..., decimal, float\n\
  this.BINARY_NUMBER_RE = '\\\\b(0b[01]+)'; // 0b...\n\
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\\\*|\\\\*=|\\\\+|\\\\+=|,|\\\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\\\?|\\\\[|\\\\{|\\\\(|\\\\^|\\\\^=|\\\\||\\\\|=|\\\\|\\\\||~';\n\
\n\
  // Common modes\n\
  this.BACKSLASH_ESCAPE = {\n\
    begin: '\\\\\\\\[\\\\s\\\\S]', relevance: 0\n\
  };\n\
  this.APOS_STRING_MODE = {\n\
    className: 'string',\n\
    begin: '\\'', end: '\\'',\n\
    illegal: '\\\\n\
',\n\
    contains: [this.BACKSLASH_ESCAPE],\n\
    relevance: 0\n\
  };\n\
  this.QUOTE_STRING_MODE = {\n\
    className: 'string',\n\
    begin: '\"', end: '\"',\n\
    illegal: '\\\\n\
',\n\
    contains: [this.BACKSLASH_ESCAPE],\n\
    relevance: 0\n\
  };\n\
  this.C_LINE_COMMENT_MODE = {\n\
    className: 'comment',\n\
    begin: '//', end: '$'\n\
  };\n\
  this.C_BLOCK_COMMENT_MODE = {\n\
    className: 'comment',\n\
    begin: '/\\\\*', end: '\\\\*/'\n\
  };\n\
  this.HASH_COMMENT_MODE = {\n\
    className: 'comment',\n\
    begin: '#', end: '$'\n\
  };\n\
  this.NUMBER_MODE = {\n\
    className: 'number',\n\
    begin: this.NUMBER_RE,\n\
    relevance: 0\n\
  };\n\
  this.C_NUMBER_MODE = {\n\
    className: 'number',\n\
    begin: this.C_NUMBER_RE,\n\
    relevance: 0\n\
  };\n\
  this.BINARY_NUMBER_MODE = {\n\
    className: 'number',\n\
    begin: this.BINARY_NUMBER_RE,\n\
    relevance: 0\n\
  };\n\
\n\
  // Utility functions\n\
  this.inherit = function(parent, obj) {\n\
    var result = {}\n\
    for (var key in parent)\n\
      result[key] = parent[key];\n\
    if (obj)\n\
      for (var key in obj)\n\
        result[key] = obj[key];\n\
    return result;\n\
  }\n\
}();\n\
hljs.LANGUAGES['bash'] = require('./bash.js')(hljs);\n\
hljs.LANGUAGES['erlang'] = require('./erlang.js')(hljs);\n\
hljs.LANGUAGES['cs'] = require('./cs.js')(hljs);\n\
hljs.LANGUAGES['brainfuck'] = require('./brainfuck.js')(hljs);\n\
hljs.LANGUAGES['ruby'] = require('./ruby.js')(hljs);\n\
hljs.LANGUAGES['rust'] = require('./rust.js')(hljs);\n\
hljs.LANGUAGES['rib'] = require('./rib.js')(hljs);\n\
hljs.LANGUAGES['diff'] = require('./diff.js')(hljs);\n\
hljs.LANGUAGES['javascript'] = require('./javascript.js')(hljs);\n\
hljs.LANGUAGES['glsl'] = require('./glsl.js')(hljs);\n\
hljs.LANGUAGES['rsl'] = require('./rsl.js')(hljs);\n\
hljs.LANGUAGES['lua'] = require('./lua.js')(hljs);\n\
hljs.LANGUAGES['xml'] = require('./xml.js')(hljs);\n\
hljs.LANGUAGES['markdown'] = require('./markdown.js')(hljs);\n\
hljs.LANGUAGES['css'] = require('./css.js')(hljs);\n\
hljs.LANGUAGES['lisp'] = require('./lisp.js')(hljs);\n\
hljs.LANGUAGES['profile'] = require('./profile.js')(hljs);\n\
hljs.LANGUAGES['http'] = require('./http.js')(hljs);\n\
hljs.LANGUAGES['java'] = require('./java.js')(hljs);\n\
hljs.LANGUAGES['php'] = require('./php.js')(hljs);\n\
hljs.LANGUAGES['haskell'] = require('./haskell.js')(hljs);\n\
hljs.LANGUAGES['1c'] = require('./1c.js')(hljs);\n\
hljs.LANGUAGES['python'] = require('./python.js')(hljs);\n\
hljs.LANGUAGES['smalltalk'] = require('./smalltalk.js')(hljs);\n\
hljs.LANGUAGES['tex'] = require('./tex.js')(hljs);\n\
hljs.LANGUAGES['actionscript'] = require('./actionscript.js')(hljs);\n\
hljs.LANGUAGES['sql'] = require('./sql.js')(hljs);\n\
hljs.LANGUAGES['vala'] = require('./vala.js')(hljs);\n\
hljs.LANGUAGES['ini'] = require('./ini.js')(hljs);\n\
hljs.LANGUAGES['d'] = require('./d.js')(hljs);\n\
hljs.LANGUAGES['axapta'] = require('./axapta.js')(hljs);\n\
hljs.LANGUAGES['perl'] = require('./perl.js')(hljs);\n\
hljs.LANGUAGES['scala'] = require('./scala.js')(hljs);\n\
hljs.LANGUAGES['cmake'] = require('./cmake.js')(hljs);\n\
hljs.LANGUAGES['objectivec'] = require('./objectivec.js')(hljs);\n\
hljs.LANGUAGES['avrasm'] = require('./avrasm.js')(hljs);\n\
hljs.LANGUAGES['vhdl'] = require('./vhdl.js')(hljs);\n\
hljs.LANGUAGES['coffeescript'] = require('./coffeescript.js')(hljs);\n\
hljs.LANGUAGES['nginx'] = require('./nginx.js')(hljs);\n\
hljs.LANGUAGES['erlang-repl'] = require('./erlang-repl.js')(hljs);\n\
hljs.LANGUAGES['r'] = require('./r.js')(hljs);\n\
hljs.LANGUAGES['json'] = require('./json.js')(hljs);\n\
hljs.LANGUAGES['django'] = require('./django.js')(hljs);\n\
hljs.LANGUAGES['delphi'] = require('./delphi.js')(hljs);\n\
hljs.LANGUAGES['vbscript'] = require('./vbscript.js')(hljs);\n\
hljs.LANGUAGES['mel'] = require('./mel.js')(hljs);\n\
hljs.LANGUAGES['dos'] = require('./dos.js')(hljs);\n\
hljs.LANGUAGES['apache'] = require('./apache.js')(hljs);\n\
hljs.LANGUAGES['applescript'] = require('./applescript.js')(hljs);\n\
hljs.LANGUAGES['cpp'] = require('./cpp.js')(hljs);\n\
hljs.LANGUAGES['matlab'] = require('./matlab.js')(hljs);\n\
hljs.LANGUAGES['parser3'] = require('./parser3.js')(hljs);\n\
hljs.LANGUAGES['clojure'] = require('./clojure.js')(hljs);\n\
hljs.LANGUAGES['go'] = require('./go.js')(hljs);\n\
module.exports = hljs;//@ sourceURL=chemzqm-highlight.js/lib/highlight.js"
));
require.register("chemzqm-highlight.js/lib/http.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    illegal: '\\\\S',\n\
    contains: [\n\
      {\n\
        className: 'status',\n\
        begin: '^HTTP/[0-9\\\\.]+', end: '$',\n\
        contains: [{className: 'number', begin: '\\\\b\\\\d{3}\\\\b'}]\n\
      },\n\
      {\n\
        className: 'request',\n\
        begin: '^[A-Z]+ (.*?) HTTP/[0-9\\\\.]+$', returnBegin: true, end: '$',\n\
        contains: [\n\
          {\n\
            className: 'string',\n\
            begin: ' ', end: ' ',\n\
            excludeBegin: true, excludeEnd: true\n\
          }\n\
        ]\n\
      },\n\
      {\n\
        className: 'attribute',\n\
        begin: '^\\\\w', end: ': ', excludeEnd: true,\n\
        illegal: '\\\\n\
|\\\\s|=',\n\
        starts: {className: 'string', end: '$'}\n\
      },\n\
      {\n\
        begin: '\\\\n\
\\\\n\
',\n\
        starts: {subLanguage: '', endsWithParent: true}\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/http.js"
));
require.register("chemzqm-highlight.js/lib/ini.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    illegal: '[^\\\\s]',\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: ';', end: '$'\n\
      },\n\
      {\n\
        className: 'title',\n\
        begin: '^\\\\[', end: '\\\\]'\n\
      },\n\
      {\n\
        className: 'setting',\n\
        begin: '^[a-z0-9\\\\[\\\\]_-]+[ \\\\t]*=[ \\\\t]*', end: '$',\n\
        contains: [\n\
          {\n\
            className: 'value',\n\
            endsWithParent: true,\n\
            keywords: 'on off true false yes no',\n\
            contains: [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE]\n\
          }\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/ini.js"
));
require.register("chemzqm-highlight.js/lib/java.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords:\n\
      'false synchronized int abstract float private char boolean static null if const ' +\n\
      'for true while long throw strictfp finally protected import native final return void ' +\n\
      'enum else break transient new catch instanceof byte super volatile case assert short ' +\n\
      'package default double public try this switch continue throws',\n\
    contains: [\n\
      {\n\
        className: 'javadoc',\n\
        begin: '/\\\\*\\\\*', end: '\\\\*/',\n\
        contains: [{\n\
          className: 'javadoctag', begin: '@[A-Za-z]+'\n\
        }],\n\
        relevance: 10\n\
      },\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'class interface',\n\
        illegal: ':',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true,\n\
            keywords: 'extends implements',\n\
            relevance: 10\n\
          },\n\
          {\n\
            className: 'title',\n\
            begin: hljs.UNDERSCORE_IDENT_RE\n\
          }\n\
        ]\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'annotation', begin: '@[A-Za-z]+'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/java.js"
));
require.register("chemzqm-highlight.js/lib/javascript.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'in if for while finally var new function do return void else break catch ' +\n\
        'instanceof with throw case default try this switch continue typeof delete ' +\n\
        'let yield const',\n\
      literal:\n\
        'true false null undefined NaN Infinity'\n\
    },\n\
    contains: [\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      { // \"value\" container\n\
        begin: '(' + hljs.RE_STARTERS_RE + '|\\\\b(case|return|throw)\\\\b)\\\\s*',\n\
        keywords: 'return throw case',\n\
        contains: [\n\
          hljs.C_LINE_COMMENT_MODE,\n\
          hljs.C_BLOCK_COMMENT_MODE,\n\
          {\n\
            className: 'regexp',\n\
            begin: '/', end: '/[gim]*',\n\
            illegal: '\\\\n\
',\n\
            contains: [{begin: '\\\\\\\\/'}]\n\
          },\n\
          { // E4X\n\
            begin: '<', end: '>;',\n\
            subLanguage: 'xml'\n\
          }\n\
        ],\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'function',\n\
        contains: [\n\
          {\n\
            className: 'title', begin: '[A-Za-z$_][0-9A-Za-z$_]*'\n\
          },\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', end: '\\\\)',\n\
            contains: [\n\
              hljs.C_LINE_COMMENT_MODE,\n\
              hljs.C_BLOCK_COMMENT_MODE\n\
            ],\n\
            illegal: '[\"\\'\\\\(]'\n\
          }\n\
        ],\n\
        illegal: '\\\\[|%'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/javascript.js"
));
require.register("chemzqm-highlight.js/lib/json.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var LITERALS = {literal: 'true false null'};\n\
  var TYPES = [\n\
    hljs.QUOTE_STRING_MODE,\n\
    hljs.C_NUMBER_MODE\n\
  ];\n\
  var VALUE_CONTAINER = {\n\
    className: 'value',\n\
    end: ',', endsWithParent: true, excludeEnd: true,\n\
    contains: TYPES,\n\
    keywords: LITERALS\n\
  };\n\
  var OBJECT = {\n\
    begin: '{', end: '}',\n\
    contains: [\n\
      {\n\
        className: 'attribute',\n\
        begin: '\\\\s*\"', end: '\"\\\\s*:\\\\s*', excludeBegin: true, excludeEnd: true,\n\
        contains: [hljs.BACKSLASH_ESCAPE],\n\
        illegal: '\\\\n\
',\n\
        starts: VALUE_CONTAINER\n\
      }\n\
    ],\n\
    illegal: '\\\\S'\n\
  };\n\
  var ARRAY = {\n\
    begin: '\\\\[', end: '\\\\]',\n\
    contains: [hljs.inherit(VALUE_CONTAINER, {className: null})], // inherit is also a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents\n\
    illegal: '\\\\S'\n\
  };\n\
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);\n\
  return {\n\
    contains: TYPES,\n\
    keywords: LITERALS,\n\
    illegal: '\\\\S'\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/json.js"
));
require.register("chemzqm-highlight.js/lib/lisp.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var LISP_IDENT_RE = '[a-zA-Z_\\\\-\\\\+\\\\*\\\\/\\\\<\\\\=\\\\>\\\\&\\\\#][a-zA-Z0-9_\\\\-\\\\+\\\\*\\\\/\\\\<\\\\=\\\\>\\\\&\\\\#]*';\n\
  var LISP_SIMPLE_NUMBER_RE = '(\\\\-|\\\\+)?\\\\d+(\\\\.\\\\d+|\\\\/\\\\d+)?((d|e|f|l|s)(\\\\+|\\\\-)?\\\\d+)?';\n\
  var LITERAL = {\n\
    className: 'literal',\n\
    begin: '\\\\b(t{1}|nil)\\\\b'\n\
  };\n\
  var NUMBERS = [\n\
    {\n\
      className: 'number', begin: LISP_SIMPLE_NUMBER_RE\n\
    },\n\
    {\n\
      className: 'number', begin: '#b[0-1]+(/[0-1]+)?'\n\
    },\n\
    {\n\
      className: 'number', begin: '#o[0-7]+(/[0-7]+)?'\n\
    },\n\
    {\n\
      className: 'number', begin: '#x[0-9a-f]+(/[0-9a-f]+)?'\n\
    },\n\
    {\n\
      className: 'number', begin: '#c\\\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\\\)'\n\
    }\n\
  ]\n\
  var STRING = {\n\
    className: 'string',\n\
    begin: '\"', end: '\"',\n\
    contains: [hljs.BACKSLASH_ESCAPE],\n\
    relevance: 0\n\
  };\n\
  var COMMENT = {\n\
    className: 'comment',\n\
    begin: ';', end: '$'\n\
  };\n\
  var VARIABLE = {\n\
    className: 'variable',\n\
    begin: '\\\\*', end: '\\\\*'\n\
  };\n\
  var KEYWORD = {\n\
    className: 'keyword',\n\
    begin: '[:&]' + LISP_IDENT_RE\n\
  };\n\
  var QUOTED_LIST = {\n\
    begin: '\\\\(', end: '\\\\)',\n\
    contains: ['self', LITERAL, STRING].concat(NUMBERS)\n\
  };\n\
  var QUOTED1 = {\n\
    className: 'quoted',\n\
    begin: '[\\'`]\\\\(', end: '\\\\)',\n\
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])\n\
  };\n\
  var QUOTED2 = {\n\
    className: 'quoted',\n\
    begin: '\\\\(quote ', end: '\\\\)',\n\
    keywords: {title: 'quote'},\n\
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])\n\
  };\n\
  var LIST = {\n\
    className: 'list',\n\
    begin: '\\\\(', end: '\\\\)'\n\
  };\n\
  var BODY = {\n\
    className: 'body',\n\
    endsWithParent: true, excludeEnd: true\n\
  };\n\
  LIST.contains = [{className: 'title', begin: LISP_IDENT_RE}, BODY];\n\
  BODY.contains = [QUOTED1, QUOTED2, LIST, LITERAL].concat(NUMBERS).concat([STRING, COMMENT, VARIABLE, KEYWORD]);\n\
\n\
  return {\n\
    illegal: '[^\\\\s]',\n\
    contains: NUMBERS.concat([\n\
      LITERAL,\n\
      STRING,\n\
      COMMENT,\n\
      QUOTED1, QUOTED2,\n\
      LIST\n\
    ])\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/lisp.js"
));
require.register("chemzqm-highlight.js/lib/lua.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var OPENING_LONG_BRACKET = '\\\\[=*\\\\[';\n\
  var CLOSING_LONG_BRACKET = '\\\\]=*\\\\]';\n\
  var LONG_BRACKETS = {\n\
    begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,\n\
    contains: ['self']\n\
  };\n\
  var COMMENTS = [\n\
    {\n\
      className: 'comment',\n\
      begin: '--(?!' + OPENING_LONG_BRACKET + ')', end: '$'\n\
    },\n\
    {\n\
      className: 'comment',\n\
      begin: '--' + OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,\n\
      contains: [LONG_BRACKETS],\n\
      relevance: 10\n\
    }\n\
  ]\n\
  return {\n\
    lexems: hljs.UNDERSCORE_IDENT_RE,\n\
    keywords: {\n\
      keyword:\n\
        'and break do else elseif end false for if in local nil not or repeat return then ' +\n\
        'true until while',\n\
      built_in:\n\
        '_G _VERSION assert collectgarbage dofile error getfenv getmetatable ipairs load ' +\n\
        'loadfile loadstring module next pairs pcall print rawequal rawget rawset require ' +\n\
        'select setfenv setmetatable tonumber tostring type unpack xpcall coroutine debug ' +\n\
        'io math os package string table'\n\
    },\n\
    contains: COMMENTS.concat([\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '\\\\)',\n\
        keywords: 'function',\n\
        contains: [\n\
          {\n\
            className: 'title',\n\
            begin: '([_a-zA-Z]\\\\w*\\\\.)*([_a-zA-Z]\\\\w*:)?[_a-zA-Z]\\\\w*'\n\
          },\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', endsWithParent: true,\n\
            contains: COMMENTS\n\
          }\n\
        ].concat(COMMENTS)\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,\n\
        contains: [LONG_BRACKETS],\n\
        relevance: 10\n\
      }\n\
    ])\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/lua.js"
));
require.register("chemzqm-highlight.js/lib/markdown.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    contains: [\n\
      // highlight headers\n\
      {\n\
        className: 'header',\n\
        begin: '^#{1,3}', end: '$'\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '^.+?\\\\n\
[=-]{2,}$'\n\
      },\n\
      // inline html\n\
      {\n\
        begin: '<', end: '>',\n\
        subLanguage: 'xml',\n\
        relevance: 0\n\
      },\n\
      // lists (indicators only)\n\
      {\n\
        className: 'bullet',\n\
        begin: '^([*+-]|(\\\\d+\\\\.))\\\\s+'\n\
      },\n\
      // strong segments\n\
      {\n\
        className: 'strong',\n\
        begin: '[*_]{2}.+?[*_]{2}'\n\
      },\n\
      // emphasis segments\n\
      {\n\
        className: 'emphasis',\n\
        begin: '\\\\*.+?\\\\*'\n\
      },\n\
      {\n\
        className: 'emphasis',\n\
        begin: '_.+?_',\n\
        relevance: 0\n\
      },\n\
      // blockquotes\n\
      {\n\
        className: 'blockquote',\n\
        begin: '^>\\\\s+', end: '$'\n\
      },\n\
      // code snippets\n\
      {\n\
        className: 'code',\n\
        begin: '`.+?`'\n\
      },\n\
      {\n\
        className: 'code',\n\
        begin: '^    ', end: '$',\n\
        relevance: 0\n\
      },\n\
      // horizontal rules\n\
      {\n\
        className: 'horizontal_rule',\n\
        begin: '^-{3,}', end: '$'\n\
      },\n\
      // using links - title and link\n\
      {\n\
        begin: '\\\\[.+?\\\\]\\\\(.+?\\\\)',\n\
        returnBegin: true,\n\
        contains: [\n\
          {\n\
            className: 'link_label',\n\
            begin: '\\\\[.+\\\\]'\n\
          },\n\
          {\n\
            className: 'link_url',\n\
            begin: '\\\\(', end: '\\\\)',\n\
            excludeBegin: true, excludeEnd: true\n\
          }\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/markdown.js"
));
require.register("chemzqm-highlight.js/lib/matlab.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
\n\
  var COMMON_CONTAINS = [\n\
    hljs.C_NUMBER_MODE,\n\
    {\n\
      className: 'string',\n\
      begin: '\\'', end: '\\'',\n\
      contains: [hljs.BACKSLASH_ESCAPE, {begin: '\\'\\''}],\n\
      relevance: 0\n\
    }\n\
  ];\n\
\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'break case catch classdef continue else elseif end enumerated events for function ' +\n\
        'global if methods otherwise parfor persistent properties return spmd switch try while',\n\
      built_in:\n\
        'sin sind sinh asin asind asinh cos cosd cosh acos acosd acosh tan tand tanh atan ' +\n\
        'atand atan2 atanh sec secd sech asec asecd asech csc cscd csch acsc acscd acsch cot ' +\n\
        'cotd coth acot acotd acoth hypot exp expm1 log log1p log10 log2 pow2 realpow reallog ' +\n\
        'realsqrt sqrt nthroot nextpow2 abs angle complex conj imag real unwrap isreal ' +\n\
        'cplxpair fix floor ceil round mod rem sign airy besselj bessely besselh besseli ' +\n\
        'besselk beta betainc betaln ellipj ellipke erf erfc erfcx erfinv expint gamma ' +\n\
        'gammainc gammaln psi legendre cross dot factor isprime primes gcd lcm rat rats perms ' +\n\
        'nchoosek factorial cart2sph cart2pol pol2cart sph2cart hsv2rgb rgb2hsv zeros ones ' +\n\
        'eye repmat rand randn linspace logspace freqspace meshgrid accumarray size length ' +\n\
        'ndims numel disp isempty isequal isequalwithequalnans cat reshape diag blkdiag tril ' +\n\
        'triu fliplr flipud flipdim rot90 find sub2ind ind2sub bsxfun ndgrid permute ipermute ' +\n\
        'shiftdim circshift squeeze isscalar isvector ans eps realmax realmin pi i inf nan ' +\n\
        'isnan isinf isfinite j why compan gallery hadamard hankel hilb invhilb magic pascal ' +\n\
        'rosser toeplitz vander wilkinson'\n\
    },\n\
    illegal: '(//|\"|#|/\\\\*|\\\\s+/\\\\w+)',\n\
    contains: [\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '$',\n\
        keywords: 'function',\n\
        contains: [\n\
          {\n\
              className: 'title',\n\
              begin: hljs.UNDERSCORE_IDENT_RE\n\
          },\n\
          {\n\
              className: 'params',\n\
              begin: '\\\\(', end: '\\\\)'\n\
          },\n\
          {\n\
              className: 'params',\n\
              begin: '\\\\[', end: '\\\\]'\n\
          }\n\
        ]\n\
      },\n\
      {\n\
        className: 'transposed_variable',\n\
        begin: '[a-zA-Z_][a-zA-Z_0-9]*(\\'+[\\\\.\\']*|[\\\\.\\']+)', end: ''\n\
      },\n\
      {\n\
        className: 'matrix',\n\
        begin: '\\\\[', end: '\\\\]\\'*[\\\\.\\']*',\n\
        contains: COMMON_CONTAINS\n\
      },\n\
      {\n\
        className: 'cell',\n\
        begin: '\\\\{', end: '\\\\}\\'*[\\\\.\\']*',\n\
        contains: COMMON_CONTAINS\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '\\\\%', end: '$'\n\
      }\n\
    ].concat(COMMON_CONTAINS)\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/matlab.js"
));
require.register("chemzqm-highlight.js/lib/mel.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords:\n\
      'int float string vector matrix if else switch case default while do for in break ' +\n\
      'continue global proc return about abs addAttr addAttributeEditorNodeHelp addDynamic ' +\n\
      'addNewShelfTab addPP addPanelCategory addPrefixToName advanceToNextDrivenKey ' +\n\
      'affectedNet affects aimConstraint air alias aliasAttr align alignCtx alignCurve ' +\n\
      'alignSurface allViewFit ambientLight angle angleBetween animCone animCurveEditor ' +\n\
      'animDisplay animView annotate appendStringArray applicationName applyAttrPreset ' +\n\
      'applyTake arcLenDimContext arcLengthDimension arclen arrayMapper art3dPaintCtx ' +\n\
      'artAttrCtx artAttrPaintVertexCtx artAttrSkinPaintCtx artAttrTool artBuildPaintMenu ' +\n\
      'artFluidAttrCtx artPuttyCtx artSelectCtx artSetPaintCtx artUserPaintCtx assignCommand ' +\n\
      'assignInputDevice assignViewportFactories attachCurve attachDeviceAttr attachSurface ' +\n\
      'attrColorSliderGrp attrCompatibility attrControlGrp attrEnumOptionMenu ' +\n\
      'attrEnumOptionMenuGrp attrFieldGrp attrFieldSliderGrp attrNavigationControlGrp ' +\n\
      'attrPresetEditWin attributeExists attributeInfo attributeMenu attributeQuery ' +\n\
      'autoKeyframe autoPlace bakeClip bakeFluidShading bakePartialHistory bakeResults ' +\n\
      'bakeSimulation basename basenameEx batchRender bessel bevel bevelPlus binMembership ' +\n\
      'bindSkin blend2 blendShape blendShapeEditor blendShapePanel blendTwoAttr blindDataType ' +\n\
      'boneLattice boundary boxDollyCtx boxZoomCtx bufferCurve buildBookmarkMenu ' +\n\
      'buildKeyframeMenu button buttonManip CBG cacheFile cacheFileCombine cacheFileMerge ' +\n\
      'cacheFileTrack camera cameraView canCreateManip canvas capitalizeString catch ' +\n\
      'catchQuiet ceil changeSubdivComponentDisplayLevel changeSubdivRegion channelBox ' +\n\
      'character characterMap characterOutlineEditor characterize chdir checkBox checkBoxGrp ' +\n\
      'checkDefaultRenderGlobals choice circle circularFillet clamp clear clearCache clip ' +\n\
      'clipEditor clipEditorCurrentTimeCtx clipSchedule clipSchedulerOutliner clipTrimBefore ' +\n\
      'closeCurve closeSurface cluster cmdFileOutput cmdScrollFieldExecuter ' +\n\
      'cmdScrollFieldReporter cmdShell coarsenSubdivSelectionList collision color ' +\n\
      'colorAtPoint colorEditor colorIndex colorIndexSliderGrp colorSliderButtonGrp ' +\n\
      'colorSliderGrp columnLayout commandEcho commandLine commandPort compactHairSystem ' +\n\
      'componentEditor compositingInterop computePolysetVolume condition cone confirmDialog ' +\n\
      'connectAttr connectControl connectDynamic connectJoint connectionInfo constrain ' +\n\
      'constrainValue constructionHistory container containsMultibyte contextInfo control ' +\n\
      'convertFromOldLayers convertIffToPsd convertLightmap convertSolidTx convertTessellation ' +\n\
      'convertUnit copyArray copyFlexor copyKey copySkinWeights cos cpButton cpCache ' +\n\
      'cpClothSet cpCollision cpConstraint cpConvClothToMesh cpForces cpGetSolverAttr cpPanel ' +\n\
      'cpProperty cpRigidCollisionFilter cpSeam cpSetEdit cpSetSolverAttr cpSolver ' +\n\
      'cpSolverTypes cpTool cpUpdateClothUVs createDisplayLayer createDrawCtx createEditor ' +\n\
      'createLayeredPsdFile createMotionField createNewShelf createNode createRenderLayer ' +\n\
      'createSubdivRegion cross crossProduct ctxAbort ctxCompletion ctxEditMode ctxTraverse ' +\n\
      'currentCtx currentTime currentTimeCtx currentUnit currentUnit curve curveAddPtCtx ' +\n\
      'curveCVCtx curveEPCtx curveEditorCtx curveIntersect curveMoveEPCtx curveOnSurface ' +\n\
      'curveSketchCtx cutKey cycleCheck cylinder dagPose date defaultLightListCheckBox ' +\n\
      'defaultNavigation defineDataServer defineVirtualDevice deformer deg_to_rad delete ' +\n\
      'deleteAttr deleteShadingGroupsAndMaterials deleteShelfTab deleteUI deleteUnusedBrushes ' +\n\
      'delrandstr detachCurve detachDeviceAttr detachSurface deviceEditor devicePanel dgInfo ' +\n\
      'dgdirty dgeval dgtimer dimWhen directKeyCtx directionalLight dirmap dirname disable ' +\n\
      'disconnectAttr disconnectJoint diskCache displacementToPoly displayAffected ' +\n\
      'displayColor displayCull displayLevelOfDetail displayPref displayRGBColor ' +\n\
      'displaySmoothness displayStats displayString displaySurface distanceDimContext ' +\n\
      'distanceDimension doBlur dolly dollyCtx dopeSheetEditor dot dotProduct ' +\n\
      'doubleProfileBirailSurface drag dragAttrContext draggerContext dropoffLocator ' +\n\
      'duplicate duplicateCurve duplicateSurface dynCache dynControl dynExport dynExpression ' +\n\
      'dynGlobals dynPaintEditor dynParticleCtx dynPref dynRelEdPanel dynRelEditor ' +\n\
      'dynamicLoad editAttrLimits editDisplayLayerGlobals editDisplayLayerMembers ' +\n\
      'editRenderLayerAdjustment editRenderLayerGlobals editRenderLayerMembers editor ' +\n\
      'editorTemplate effector emit emitter enableDevice encodeString endString endsWith env ' +\n\
      'equivalent equivalentTol erf error eval eval evalDeferred evalEcho event ' +\n\
      'exactWorldBoundingBox exclusiveLightCheckBox exec executeForEachObject exists exp ' +\n\
      'expression expressionEditorListen extendCurve extendSurface extrude fcheck fclose feof ' +\n\
      'fflush fgetline fgetword file fileBrowserDialog fileDialog fileExtension fileInfo ' +\n\
      'filetest filletCurve filter filterCurve filterExpand filterStudioImport ' +\n\
      'findAllIntersections findAnimCurves findKeyframe findMenuItem findRelatedSkinCluster ' +\n\
      'finder firstParentOf fitBspline flexor floatEq floatField floatFieldGrp floatScrollBar ' +\n\
      'floatSlider floatSlider2 floatSliderButtonGrp floatSliderGrp floor flow fluidCacheInfo ' +\n\
      'fluidEmitter fluidVoxelInfo flushUndo fmod fontDialog fopen formLayout format fprint ' +\n\
      'frameLayout fread freeFormFillet frewind fromNativePath fwrite gamma gauss ' +\n\
      'geometryConstraint getApplicationVersionAsFloat getAttr getClassification ' +\n\
      'getDefaultBrush getFileList getFluidAttr getInputDeviceRange getMayaPanelTypes ' +\n\
      'getModifiers getPanel getParticleAttr getPluginResource getenv getpid glRender ' +\n\
      'glRenderEditor globalStitch gmatch goal gotoBindPose grabColor gradientControl ' +\n\
      'gradientControlNoAttr graphDollyCtx graphSelectContext graphTrackCtx gravity grid ' +\n\
      'gridLayout group groupObjectsByName HfAddAttractorToAS HfAssignAS HfBuildEqualMap ' +\n\
      'HfBuildFurFiles HfBuildFurImages HfCancelAFR HfConnectASToHF HfCreateAttractor ' +\n\
      'HfDeleteAS HfEditAS HfPerformCreateAS HfRemoveAttractorFromAS HfSelectAttached ' +\n\
      'HfSelectAttractors HfUnAssignAS hardenPointCurve hardware hardwareRenderPanel ' +\n\
      'headsUpDisplay headsUpMessage help helpLine hermite hide hilite hitTest hotBox hotkey ' +\n\
      'hotkeyCheck hsv_to_rgb hudButton hudSlider hudSliderButton hwReflectionMap hwRender ' +\n\
      'hwRenderLoad hyperGraph hyperPanel hyperShade hypot iconTextButton iconTextCheckBox ' +\n\
      'iconTextRadioButton iconTextRadioCollection iconTextScrollList iconTextStaticLabel ' +\n\
      'ikHandle ikHandleCtx ikHandleDisplayScale ikSolver ikSplineHandleCtx ikSystem ' +\n\
      'ikSystemInfo ikfkDisplayMethod illustratorCurves image imfPlugins inheritTransform ' +\n\
      'insertJoint insertJointCtx insertKeyCtx insertKnotCurve insertKnotSurface instance ' +\n\
      'instanceable instancer intField intFieldGrp intScrollBar intSlider intSliderGrp ' +\n\
      'interToUI internalVar intersect iprEngine isAnimCurve isConnected isDirty isParentOf ' +\n\
      'isSameObject isTrue isValidObjectName isValidString isValidUiName isolateSelect ' +\n\
      'itemFilter itemFilterAttr itemFilterRender itemFilterType joint jointCluster jointCtx ' +\n\
      'jointDisplayScale jointLattice keyTangent keyframe keyframeOutliner ' +\n\
      'keyframeRegionCurrentTimeCtx keyframeRegionDirectKeyCtx keyframeRegionDollyCtx ' +\n\
      'keyframeRegionInsertKeyCtx keyframeRegionMoveKeyCtx keyframeRegionScaleKeyCtx ' +\n\
      'keyframeRegionSelectKeyCtx keyframeRegionSetKeyCtx keyframeRegionTrackCtx ' +\n\
      'keyframeStats lassoContext lattice latticeDeformKeyCtx launch launchImageEditor ' +\n\
      'layerButton layeredShaderPort layeredTexturePort layout layoutDialog lightList ' +\n\
      'lightListEditor lightListPanel lightlink lineIntersection linearPrecision linstep ' +\n\
      'listAnimatable listAttr listCameras listConnections listDeviceAttachments listHistory ' +\n\
      'listInputDeviceAxes listInputDeviceButtons listInputDevices listMenuAnnotation ' +\n\
      'listNodeTypes listPanelCategories listRelatives listSets listTransforms ' +\n\
      'listUnselected listerEditor loadFluid loadNewShelf loadPlugin ' +\n\
      'loadPluginLanguageResources loadPrefObjects localizedPanelLabel lockNode loft log ' +\n\
      'longNameOf lookThru ls lsThroughFilter lsType lsUI Mayatomr mag makeIdentity makeLive ' +\n\
      'makePaintable makeRoll makeSingleSurface makeTubeOn makebot manipMoveContext ' +\n\
      'manipMoveLimitsCtx manipOptions manipRotateContext manipRotateLimitsCtx ' +\n\
      'manipScaleContext manipScaleLimitsCtx marker match max memory menu menuBarLayout ' +\n\
      'menuEditor menuItem menuItemToShelf menuSet menuSetPref messageLine min minimizeApp ' +\n\
      'mirrorJoint modelCurrentTimeCtx modelEditor modelPanel mouse movIn movOut move ' +\n\
      'moveIKtoFK moveKeyCtx moveVertexAlongDirection multiProfileBirailSurface mute ' +\n\
      'nParticle nameCommand nameField namespace namespaceInfo newPanelItems newton nodeCast ' +\n\
      'nodeIconButton nodeOutliner nodePreset nodeType noise nonLinear normalConstraint ' +\n\
      'normalize nurbsBoolean nurbsCopyUVSet nurbsCube nurbsEditUV nurbsPlane nurbsSelect ' +\n\
      'nurbsSquare nurbsToPoly nurbsToPolygonsPref nurbsToSubdiv nurbsToSubdivPref ' +\n\
      'nurbsUVSet nurbsViewDirectionVector objExists objectCenter objectLayer objectType ' +\n\
      'objectTypeUI obsoleteProc oceanNurbsPreviewPlane offsetCurve offsetCurveOnSurface ' +\n\
      'offsetSurface openGLExtension openMayaPref optionMenu optionMenuGrp optionVar orbit ' +\n\
      'orbitCtx orientConstraint outlinerEditor outlinerPanel overrideModifier ' +\n\
      'paintEffectsDisplay pairBlend palettePort paneLayout panel panelConfiguration ' +\n\
      'panelHistory paramDimContext paramDimension paramLocator parent parentConstraint ' +\n\
      'particle particleExists particleInstancer particleRenderInfo partition pasteKey ' +\n\
      'pathAnimation pause pclose percent performanceOptions pfxstrokes pickWalk picture ' +\n\
      'pixelMove planarSrf plane play playbackOptions playblast plugAttr plugNode pluginInfo ' +\n\
      'pluginResourceUtil pointConstraint pointCurveConstraint pointLight pointMatrixMult ' +\n\
      'pointOnCurve pointOnSurface pointPosition poleVectorConstraint polyAppend ' +\n\
      'polyAppendFacetCtx polyAppendVertex polyAutoProjection polyAverageNormal ' +\n\
      'polyAverageVertex polyBevel polyBlendColor polyBlindData polyBoolOp polyBridgeEdge ' +\n\
      'polyCacheMonitor polyCheck polyChipOff polyClipboard polyCloseBorder polyCollapseEdge ' +\n\
      'polyCollapseFacet polyColorBlindData polyColorDel polyColorPerVertex polyColorSet ' +\n\
      'polyCompare polyCone polyCopyUV polyCrease polyCreaseCtx polyCreateFacet ' +\n\
      'polyCreateFacetCtx polyCube polyCut polyCutCtx polyCylinder polyCylindricalProjection ' +\n\
      'polyDelEdge polyDelFacet polyDelVertex polyDuplicateAndConnect polyDuplicateEdge ' +\n\
      'polyEditUV polyEditUVShell polyEvaluate polyExtrudeEdge polyExtrudeFacet ' +\n\
      'polyExtrudeVertex polyFlipEdge polyFlipUV polyForceUV polyGeoSampler polyHelix ' +\n\
      'polyInfo polyInstallAction polyLayoutUV polyListComponentConversion polyMapCut ' +\n\
      'polyMapDel polyMapSew polyMapSewMove polyMergeEdge polyMergeEdgeCtx polyMergeFacet ' +\n\
      'polyMergeFacetCtx polyMergeUV polyMergeVertex polyMirrorFace polyMoveEdge ' +\n\
      'polyMoveFacet polyMoveFacetUV polyMoveUV polyMoveVertex polyNormal polyNormalPerVertex ' +\n\
      'polyNormalizeUV polyOptUvs polyOptions polyOutput polyPipe polyPlanarProjection ' +\n\
      'polyPlane polyPlatonicSolid polyPoke polyPrimitive polyPrism polyProjection ' +\n\
      'polyPyramid polyQuad polyQueryBlindData polyReduce polySelect polySelectConstraint ' +\n\
      'polySelectConstraintMonitor polySelectCtx polySelectEditCtx polySeparate ' +\n\
      'polySetToFaceNormal polySewEdge polyShortestPathCtx polySmooth polySoftEdge ' +\n\
      'polySphere polySphericalProjection polySplit polySplitCtx polySplitEdge polySplitRing ' +\n\
      'polySplitVertex polyStraightenUVBorder polySubdivideEdge polySubdivideFacet ' +\n\
      'polyToSubdiv polyTorus polyTransfer polyTriangulate polyUVSet polyUnite polyWedgeFace ' +\n\
      'popen popupMenu pose pow preloadRefEd print progressBar progressWindow projFileViewer ' +\n\
      'projectCurve projectTangent projectionContext projectionManip promptDialog propModCtx ' +\n\
      'propMove psdChannelOutliner psdEditTextureFile psdExport psdTextureFile putenv pwd ' +\n\
      'python querySubdiv quit rad_to_deg radial radioButton radioButtonGrp radioCollection ' +\n\
      'radioMenuItemCollection rampColorPort rand randomizeFollicles randstate rangeControl ' +\n\
      'readTake rebuildCurve rebuildSurface recordAttr recordDevice redo reference ' +\n\
      'referenceEdit referenceQuery refineSubdivSelectionList refresh refreshAE ' +\n\
      'registerPluginResource rehash reloadImage removeJoint removeMultiInstance ' +\n\
      'removePanelCategory rename renameAttr renameSelectionList renameUI render ' +\n\
      'renderGlobalsNode renderInfo renderLayerButton renderLayerParent ' +\n\
      'renderLayerPostProcess renderLayerUnparent renderManip renderPartition ' +\n\
      'renderQualityNode renderSettings renderThumbnailUpdate renderWindowEditor ' +\n\
      'renderWindowSelectContext renderer reorder reorderDeformers requires reroot ' +\n\
      'resampleFluid resetAE resetPfxToPolyCamera resetTool resolutionNode retarget ' +\n\
      'reverseCurve reverseSurface revolve rgb_to_hsv rigidBody rigidSolver roll rollCtx ' +\n\
      'rootOf rot rotate rotationInterpolation roundConstantRadius rowColumnLayout rowLayout ' +\n\
      'runTimeCommand runup sampleImage saveAllShelves saveAttrPreset saveFluid saveImage ' +\n\
      'saveInitialState saveMenu savePrefObjects savePrefs saveShelf saveToolSettings scale ' +\n\
      'scaleBrushBrightness scaleComponents scaleConstraint scaleKey scaleKeyCtx sceneEditor ' +\n\
      'sceneUIReplacement scmh scriptCtx scriptEditorInfo scriptJob scriptNode scriptTable ' +\n\
      'scriptToShelf scriptedPanel scriptedPanelType scrollField scrollLayout sculpt ' +\n\
      'searchPathArray seed selLoadSettings select selectContext selectCurveCV selectKey ' +\n\
      'selectKeyCtx selectKeyframeRegionCtx selectMode selectPref selectPriority selectType ' +\n\
      'selectedNodes selectionConnection separator setAttr setAttrEnumResource ' +\n\
      'setAttrMapping setAttrNiceNameResource setConstraintRestPosition ' +\n\
      'setDefaultShadingGroup setDrivenKeyframe setDynamic setEditCtx setEditor setFluidAttr ' +\n\
      'setFocus setInfinity setInputDeviceMapping setKeyCtx setKeyPath setKeyframe ' +\n\
      'setKeyframeBlendshapeTargetWts setMenuMode setNodeNiceNameResource setNodeTypeFlag ' +\n\
      'setParent setParticleAttr setPfxToPolyCamera setPluginResource setProject ' +\n\
      'setStampDensity setStartupMessage setState setToolTo setUITemplate setXformManip sets ' +\n\
      'shadingConnection shadingGeometryRelCtx shadingLightRelCtx shadingNetworkCompare ' +\n\
      'shadingNode shapeCompare shelfButton shelfLayout shelfTabLayout shellField ' +\n\
      'shortNameOf showHelp showHidden showManipCtx showSelectionInTitle ' +\n\
      'showShadingGroupAttrEditor showWindow sign simplify sin singleProfileBirailSurface ' +\n\
      'size sizeBytes skinCluster skinPercent smoothCurve smoothTangentSurface smoothstep ' +\n\
      'snap2to2 snapKey snapMode snapTogetherCtx snapshot soft softMod softModCtx sort sound ' +\n\
      'soundControl source spaceLocator sphere sphrand spotLight spotLightPreviewPort ' +\n\
      'spreadSheetEditor spring sqrt squareSurface srtContext stackTrace startString ' +\n\
      'startsWith stitchAndExplodeShell stitchSurface stitchSurfacePoints strcmp ' +\n\
      'stringArrayCatenate stringArrayContains stringArrayCount stringArrayInsertAtIndex ' +\n\
      'stringArrayIntersector stringArrayRemove stringArrayRemoveAtIndex ' +\n\
      'stringArrayRemoveDuplicates stringArrayRemoveExact stringArrayToString ' +\n\
      'stringToStringArray strip stripPrefixFromName stroke subdAutoProjection ' +\n\
      'subdCleanTopology subdCollapse subdDuplicateAndConnect subdEditUV ' +\n\
      'subdListComponentConversion subdMapCut subdMapSewMove subdMatchTopology subdMirror ' +\n\
      'subdToBlind subdToPoly subdTransferUVsToCache subdiv subdivCrease ' +\n\
      'subdivDisplaySmoothness substitute substituteAllString substituteGeometry substring ' +\n\
      'surface surfaceSampler surfaceShaderList swatchDisplayPort switchTable symbolButton ' +\n\
      'symbolCheckBox sysFile system tabLayout tan tangentConstraint texLatticeDeformContext ' +\n\
      'texManipContext texMoveContext texMoveUVShellContext texRotateContext texScaleContext ' +\n\
      'texSelectContext texSelectShortestPathCtx texSmudgeUVContext texWinToolCtx text ' +\n\
      'textCurves textField textFieldButtonGrp textFieldGrp textManip textScrollList ' +\n\
      'textToShelf textureDisplacePlane textureHairColor texturePlacementContext ' +\n\
      'textureWindow threadCount threePointArcCtx timeControl timePort timerX toNativePath ' +\n\
      'toggle toggleAxis toggleWindowVisibility tokenize tokenizeList tolerance tolower ' +\n\
      'toolButton toolCollection toolDropped toolHasOptions toolPropertyWindow torus toupper ' +\n\
      'trace track trackCtx transferAttributes transformCompare transformLimits translator ' +\n\
      'trim trunc truncateFluidCache truncateHairCache tumble tumbleCtx turbulence ' +\n\
      'twoPointArcCtx uiRes uiTemplate unassignInputDevice undo undoInfo ungroup uniform unit ' +\n\
      'unloadPlugin untangleUV untitledFileName untrim upAxis updateAE userCtx uvLink ' +\n\
      'uvSnapshot validateShelfName vectorize view2dToolCtx viewCamera viewClipPlane ' +\n\
      'viewFit viewHeadOn viewLookAt viewManip viewPlace viewSet visor volumeAxis vortex ' +\n\
      'waitCursor warning webBrowser webBrowserPrefs whatIs window windowPref wire ' +\n\
      'wireContext workspace wrinkle wrinkleContext writeTake xbmLangPathList xform',\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_NUMBER_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '`', end: '`',\n\
        contains: [hljs.BACKSLASH_ESCAPE]\n\
      },\n\
      {\n\
        className: 'variable',\n\
        begin: '\\\\$\\\\d',\n\
        relevance: 5\n\
      },\n\
      {\n\
        className: 'variable',\n\
        begin: '[\\\\$\\\\%\\\\@\\\\*](\\\\^\\\\w\\\\b|#\\\\w+|[^\\\\s\\\\w{]|{\\\\w+}|\\\\w+)'\n\
      },\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/mel.js"
));
require.register("chemzqm-highlight.js/lib/nginx.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var VARS = [\n\
    {\n\
      className: 'variable', begin: '\\\\$\\\\d+'\n\
    },\n\
    {\n\
      className: 'variable', begin: '\\\\${', end: '}'\n\
    },\n\
    {\n\
      className: 'variable', begin: '[\\\\$\\\\@]' + hljs.UNDERSCORE_IDENT_RE\n\
    }\n\
  ];\n\
  var DEFAULT = {\n\
    endsWithParent: true,\n\
    lexems: '[a-z/_]+',\n\
    keywords: {\n\
      built_in:\n\
        'on off yes no true false none blocked debug info notice warn error crit ' +\n\
        'select break last permanent redirect kqueue rtsig epoll poll /dev/poll'\n\
    },\n\
    relevance: 0,\n\
    illegal: '=>',\n\
    contains: [\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\"', end: '\"',\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS),\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: \"'\", end: \"'\",\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS),\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'url',\n\
        begin: '([a-z]+):/', end: '\\\\s', endsWithParent: true, excludeEnd: true\n\
      },\n\
      {\n\
        className: 'regexp',\n\
        begin: \"\\\\s\\\\^\", end: \"\\\\s|{|;\", returnEnd: true,\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS)\n\
      },\n\
      // regexp locations (~, ~*)\n\
      {\n\
        className: 'regexp',\n\
        begin: \"~\\\\*?\\\\s+\", end: \"\\\\s|{|;\", returnEnd: true,\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS)\n\
      },\n\
      // *.example.com\n\
      {\n\
        className: 'regexp',\n\
        begin: \"\\\\*(\\\\.[a-z\\\\-]+)+\",\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS)\n\
      },\n\
      // sub.example.*\n\
      {\n\
        className: 'regexp',\n\
        begin: \"([a-z\\\\-]+\\\\.)+\\\\*\",\n\
        contains: [hljs.BACKSLASH_ESCAPE].concat(VARS)\n\
      },\n\
      // IP\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\b\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}(:\\\\d{1,5})?\\\\b'\n\
      },\n\
      // units\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\b\\\\d+[kKmMgGdshdwy]*\\\\b',\n\
        relevance: 0\n\
      }\n\
    ].concat(VARS)\n\
  };\n\
\n\
  return {\n\
    contains: [\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        begin: hljs.UNDERSCORE_IDENT_RE + '\\\\s', end: ';|{', returnBegin: true,\n\
        contains: [\n\
          {\n\
            className: 'title',\n\
            begin: hljs.UNDERSCORE_IDENT_RE,\n\
            starts: DEFAULT\n\
          }\n\
        ]\n\
      }\n\
    ],\n\
    illegal: '[^\\\\s\\\\}]'\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/nginx.js"
));
require.register("chemzqm-highlight.js/lib/objectivec.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var OBJC_KEYWORDS = {\n\
    keyword:\n\
      'int float while private char catch export sizeof typedef const struct for union ' +\n\
      'unsigned long volatile static protected bool mutable if public do return goto void ' +\n\
      'enum else break extern class asm case short default double throw register explicit ' +\n\
      'signed typename try this switch continue wchar_t inline readonly assign property ' +\n\
      'protocol self synchronized end synthesize id optional required implementation ' +\n\
      'nonatomic interface super unichar finally dynamic IBOutlet IBAction selector strong ' +\n\
      'weak readonly',\n\
    literal:\n\
    \t'false true FALSE TRUE nil YES NO NULL',\n\
    built_in:\n\
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +\n\
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +\n\
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +\n\
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +\n\
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +\n\
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +\n\
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +\n\
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +\n\
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +\n\
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +\n\
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection class ' +\n\
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +\n\
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'\n\
  };\n\
  return {\n\
    keywords: OBJC_KEYWORDS,\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\\'',\n\
        end: '[^\\\\\\\\]\\'',\n\
        illegal: '[^\\\\\\\\][^\\']'\n\
      },\n\
\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#import',\n\
        end: '$',\n\
        contains: [\n\
        {\n\
          className: 'title',\n\
          begin: '\\\"',\n\
          end: '\\\"'\n\
        },\n\
        {\n\
          className: 'title',\n\
          begin: '<',\n\
          end: '>'\n\
        }\n\
        ]\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#',\n\
        end: '$'\n\
      },\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true,\n\
        end: '({|$)',\n\
        keywords: 'interface class protocol implementation',\n\
        contains: [{\n\
          className: 'id',\n\
          begin: hljs.UNDERSCORE_IDENT_RE\n\
        }\n\
        ]\n\
      },\n\
      {\n\
        className: 'variable',\n\
        begin: '\\\\.'+hljs.UNDERSCORE_IDENT_RE\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/objectivec.js"
));
require.register("chemzqm-highlight.js/lib/parser3.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    subLanguage: 'xml',\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: '^#', end: '$'\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '\\\\^rem{', end: '}',\n\
        relevance: 10,\n\
        contains: [\n\
          {\n\
            begin: '{', end: '}',\n\
            contains: ['self']\n\
          }\n\
        ]\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '^@(?:BASE|USE|CLASS|OPTIONS)$',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'title',\n\
        begin: '@[\\\\w\\\\-]+\\\\[[\\\\w^;\\\\-]*\\\\](?:\\\\[[\\\\w^;\\\\-]*\\\\])?(?:.*)$'\n\
      },\n\
      {\n\
        className: 'variable',\n\
        begin: '\\\\$\\\\{?[\\\\w\\\\-\\\\.\\\\:]+\\\\}?'\n\
      },\n\
      {\n\
        className: 'keyword',\n\
        begin: '\\\\^[\\\\w\\\\-\\\\.\\\\:]+'\n\
      },\n\
      {\n\
        className: 'number',\n\
        begin: '\\\\^#[0-9a-fA-F]+'\n\
      },\n\
      hljs.C_NUMBER_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/parser3.js"
));
require.register("chemzqm-highlight.js/lib/perl.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +\n\
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +\n\
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +\n\
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +\n\
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +\n\
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +\n\
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +\n\
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +\n\
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +\n\
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +\n\
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +\n\
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +\n\
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +\n\
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +\n\
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +\n\
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +\n\
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +\n\
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +\n\
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';\n\
  var SUBST = {\n\
    className: 'subst',\n\
    begin: '[$@]\\\\{', end: '\\\\}',\n\
    keywords: PERL_KEYWORDS,\n\
    relevance: 10\n\
  };\n\
  var VAR1 = {\n\
    className: 'variable',\n\
    begin: '\\\\$\\\\d'\n\
  };\n\
  var VAR2 = {\n\
    className: 'variable',\n\
    begin: '[\\\\$\\\\%\\\\@\\\\*](\\\\^\\\\w\\\\b|#\\\\w+(\\\\:\\\\:\\\\w+)*|[^\\\\s\\\\w{]|{\\\\w+}|\\\\w+(\\\\:\\\\:\\\\w*)*)'\n\
  };\n\
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR1, VAR2];\n\
  var METHOD = {\n\
    begin: '->',\n\
    contains: [\n\
      {begin: hljs.IDENT_RE},\n\
      {begin: '{', end: '}'}\n\
    ]\n\
  };\n\
  var COMMENT = {\n\
    className: 'comment',\n\
    begin: '^(__END__|__DATA__)', end: '\\\\n\
$',\n\
    relevance: 5\n\
  }\n\
  var PERL_DEFAULT_CONTAINS = [\n\
    VAR1, VAR2,\n\
    hljs.HASH_COMMENT_MODE,\n\
    COMMENT,\n\
    {\n\
      className: 'comment',\n\
      begin: '^\\\\=\\\\w', end: '\\\\=cut', endsWithParent: true\n\
    },\n\
    METHOD,\n\
    {\n\
      className: 'string',\n\
      begin: 'q[qwxr]?\\\\s*\\\\(', end: '\\\\)',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'q[qwxr]?\\\\s*\\\\[', end: '\\\\]',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'q[qwxr]?\\\\s*\\\\{', end: '\\\\}',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'q[qwxr]?\\\\s*\\\\|', end: '\\\\|',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'q[qwxr]?\\\\s*\\\\<', end: '\\\\>',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'qw\\\\s+q', end: 'q',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '\\'', end: '\\'',\n\
      contains: [hljs.BACKSLASH_ESCAPE],\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '\"', end: '\"',\n\
      contains: STRING_CONTAINS,\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '`', end: '`',\n\
      contains: [hljs.BACKSLASH_ESCAPE]\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '{\\\\w+}',\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '\\-?\\\\w+\\\\s*\\\\=\\\\>',\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'number',\n\
      begin: '(\\\\b0[0-7_]+)|(\\\\b0x[0-9a-fA-F_]+)|(\\\\b[1-9][0-9_]*(\\\\.[0-9_]+)?)|[0_]\\\\b',\n\
      relevance: 0\n\
    },\n\
    { // regexp container\n\
      begin: '(' + hljs.RE_STARTERS_RE + '|\\\\b(split|return|print|reverse|grep)\\\\b)\\\\s*',\n\
      keywords: 'split return print reverse grep',\n\
      relevance: 0,\n\
      contains: [\n\
        hljs.HASH_COMMENT_MODE,\n\
        COMMENT,\n\
        {\n\
          className: 'regexp',\n\
          begin: '(s|tr|y)/(\\\\\\\\.|[^/])*/(\\\\\\\\.|[^/])*/[a-z]*',\n\
          relevance: 10\n\
        },\n\
        {\n\
          className: 'regexp',\n\
          begin: '(m|qr)?/', end: '/[a-z]*',\n\
          contains: [hljs.BACKSLASH_ESCAPE],\n\
          relevance: 0 // allows empty \"//\" which is a common comment delimiter in other languages\n\
        }\n\
      ]\n\
    },\n\
    {\n\
      className: 'sub',\n\
      beginWithKeyword: true, end: '(\\\\s*\\\\(.*?\\\\))?[;{]',\n\
      keywords: 'sub',\n\
      relevance: 5\n\
    },\n\
    {\n\
      className: 'operator',\n\
      begin: '-\\\\w\\\\b',\n\
      relevance: 0\n\
    }\n\
  ];\n\
  SUBST.contains = PERL_DEFAULT_CONTAINS;\n\
  METHOD.contains[1].contains = PERL_DEFAULT_CONTAINS;\n\
\n\
  return {\n\
    keywords: PERL_KEYWORDS,\n\
    contains: PERL_DEFAULT_CONTAINS\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/perl.js"
));
require.register("chemzqm-highlight.js/lib/php.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var VARIABLE = {\n\
    className: 'variable', begin: '\\\\$+[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*'\n\
  };\n\
  var STRINGS = [\n\
    hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),\n\
    hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),\n\
    {\n\
      className: 'string',\n\
      begin: 'b\"', end: '\"',\n\
      contains: [hljs.BACKSLASH_ESCAPE]\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: 'b\\'', end: '\\'',\n\
      contains: [hljs.BACKSLASH_ESCAPE]\n\
    }\n\
  ];\n\
  var NUMBERS = [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE];\n\
  var TITLE = {\n\
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE\n\
  };\n\
  return {\n\
    case_insensitive: true,\n\
    keywords:\n\
      'and include_once list abstract global private echo interface as static endswitch ' +\n\
      'array null if endwhile or const for endforeach self var while isset public ' +\n\
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +\n\
      'return implements parent clone use __CLASS__ __LINE__ else break print eval new ' +\n\
      'catch __METHOD__ case exception php_user_filter default die require __FUNCTION__ ' +\n\
      'enddeclare final try this switch continue endfor endif declare unset true false ' +\n\
      'namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ __halt_compiler',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        className: 'comment',\n\
        begin: '/\\\\*', end: '\\\\*/',\n\
        contains: [{\n\
            className: 'phpdoc',\n\
            begin: '\\\\s@[A-Za-z]+'\n\
        }]\n\
      },\n\
      {\n\
          className: 'comment',\n\
          excludeBegin: true,\n\
          begin: '__halt_compiler.+?;', endsWithParent: true\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: '<<<[\\'\"]?\\\\w+[\\'\"]?$', end: '^\\\\w+;',\n\
        contains: [hljs.BACKSLASH_ESCAPE]\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '<\\\\?php',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '\\\\?>'\n\
      },\n\
      VARIABLE,\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'function',\n\
        illegal: '\\\\$|\\\\[|%',\n\
        contains: [\n\
          TITLE,\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', end: '\\\\)',\n\
            contains: [\n\
              'self',\n\
              VARIABLE,\n\
              hljs.C_BLOCK_COMMENT_MODE\n\
            ].concat(STRINGS).concat(NUMBERS)\n\
          }\n\
        ]\n\
      },\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'class',\n\
        illegal: '[:\\\\(\\\\$]',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true, endsWithParent: true,\n\
            keywords: 'extends',\n\
            contains: [TITLE]\n\
          },\n\
          TITLE\n\
        ]\n\
      },\n\
      {\n\
        begin: '=>' // No markup, just a relevance booster\n\
      }\n\
    ].concat(STRINGS).concat(NUMBERS)\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/php.js"
));
require.register("chemzqm-highlight.js/lib/profile.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    contains: [\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'builtin',\n\
        begin: '{', end: '}$',\n\
        excludeBegin: true, excludeEnd: true,\n\
        contains: [hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE],\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'filename',\n\
        begin: '[a-zA-Z_][\\\\da-zA-Z_]+\\\\.[\\\\da-zA-Z_]{1,3}', end: ':',\n\
        excludeEnd: true\n\
      },\n\
      {\n\
        className: 'header',\n\
        begin: '(ncalls|tottime|cumtime)', end: '$',\n\
        keywords: 'ncalls tottime|10 cumtime|10 filename',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'summary',\n\
        begin: 'function calls', end: '$',\n\
        contains: [hljs.C_NUMBER_MODE],\n\
        relevance: 10\n\
      },\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      {\n\
        className: 'function',\n\
        begin: '\\\\(', end: '\\\\)$',\n\
        contains: [{\n\
          className: 'title',\n\
          begin: hljs.UNDERSCORE_IDENT_RE,\n\
          relevance: 0\n\
        }],\n\
        relevance: 0\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/profile.js"
));
require.register("chemzqm-highlight.js/lib/python.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var PROMPT = {\n\
    className: 'prompt',  begin: '^(>>>|\\\\.\\\\.\\\\.) '\n\
  }\n\
  var STRINGS = [\n\
    {\n\
      className: 'string',\n\
      begin: '(u|b)?r?\\'\\'\\'', end: '\\'\\'\\'',\n\
      contains: [PROMPT],\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '(u|b)?r?\"\"\"', end: '\"\"\"',\n\
      contains: [PROMPT],\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '(u|r|ur)\\'', end: '\\'',\n\
      contains: [hljs.BACKSLASH_ESCAPE],\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '(u|r|ur)\"', end: '\"',\n\
      contains: [hljs.BACKSLASH_ESCAPE],\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '(b|br)\\'', end: '\\'',\n\
      contains: [hljs.BACKSLASH_ESCAPE]\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '(b|br)\"', end: '\"',\n\
      contains: [hljs.BACKSLASH_ESCAPE]\n\
    }\n\
  ].concat([\n\
    hljs.APOS_STRING_MODE,\n\
    hljs.QUOTE_STRING_MODE\n\
  ]);\n\
  var TITLE = {\n\
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE\n\
  };\n\
  var PARAMS = {\n\
    className: 'params',\n\
    begin: '\\\\(', end: '\\\\)',\n\
    contains: ['self', hljs.C_NUMBER_MODE, PROMPT].concat(STRINGS)\n\
  };\n\
  var FUNC_CLASS_PROTO = {\n\
    beginWithKeyword: true, end: ':',\n\
    illegal: '[${=;\\\\n\
]',\n\
    contains: [TITLE, PARAMS],\n\
    relevance: 10\n\
  };\n\
\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'and elif is global as in if from raise for except finally print import pass return ' +\n\
        'exec else break not with class assert yield try while continue del or def lambda ' +\n\
        'nonlocal|10',\n\
      built_in:\n\
        'None True False Ellipsis NotImplemented'\n\
    },\n\
    illegal: '(</|->|\\\\?)',\n\
    contains: STRINGS.concat([\n\
      PROMPT,\n\
      hljs.HASH_COMMENT_MODE,\n\
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'function', keywords: 'def'}),\n\
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'class', keywords: 'class'}),\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'decorator',\n\
        begin: '@', end: '$'\n\
      },\n\
      {\n\
        begin: '\\\\b(print|exec)\\\\(' // don’t highlight keywords-turned-functions in Python 3\n\
      }\n\
    ])\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/python.js"
));
require.register("chemzqm-highlight.js/lib/r.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var IDENT_RE = '([a-zA-Z]|\\\\.[a-zA-Z.])[a-zA-Z0-9._]*';\n\
\n\
  return {\n\
    contains: [\n\
      hljs.HASH_COMMENT_MODE,\n\
      {\n\
        begin: IDENT_RE,\n\
        lexems: IDENT_RE,\n\
        keywords: {\n\
          keyword:\n\
            'function if in break next repeat else for return switch while try tryCatch|10 ' +\n\
            'stop warning require library attach detach source setMethod setGeneric ' +\n\
            'setGroupGeneric setClass ...|10',\n\
          literal:\n\
            'NULL NA TRUE FALSE T F Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 ' +\n\
            'NA_complex_|10'\n\
        },\n\
        relevance: 0\n\
      },\n\
      {\n\
        // hex value\n\
        className: 'number',\n\
        begin: \"0[xX][0-9a-fA-F]+[Li]?\\\\b\",\n\
        relevance: 0\n\
      },\n\
      {\n\
        // explicit integer\n\
        className: 'number',\n\
        begin: \"\\\\d+(?:[eE][+\\\\-]?\\\\d*)?L\\\\b\",\n\
        relevance: 0\n\
      },\n\
      {\n\
        // number with trailing decimal\n\
        className: 'number',\n\
        begin: \"\\\\d+\\\\.(?!\\\\d)(?:i\\\\b)?\",\n\
        relevance: 0\n\
      },\n\
      {\n\
        // number\n\
        className: 'number',\n\
        begin: \"\\\\d+(?:\\\\.\\\\d*)?(?:[eE][+\\\\-]?\\\\d*)?i?\\\\b\",\n\
        relevance: 0\n\
      },\n\
      {\n\
        // number with leading decimal\n\
        className: 'number',\n\
        begin: \"\\\\.\\\\d+(?:[eE][+\\\\-]?\\\\d*)?i?\\\\b\",\n\
        relevance: 0\n\
      },\n\
\n\
      {\n\
        // escaped identifier\n\
        begin: '`',\n\
        end: '`',\n\
        relevance: 0\n\
      },\n\
\n\
      {\n\
        className: 'string',\n\
        begin: '\"',\n\
        end: '\"',\n\
        contains: [hljs.BACKSLASH_ESCAPE],\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'string',\n\
        begin: \"'\",\n\
        end: \"'\",\n\
        contains: [hljs.BACKSLASH_ESCAPE],\n\
        relevance: 0\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/r.js"
));
require.register("chemzqm-highlight.js/lib/rib.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords:\n\
      'ArchiveRecord AreaLightSource Atmosphere Attribute AttributeBegin AttributeEnd Basis ' +\n\
      'Begin Blobby Bound Clipping ClippingPlane Color ColorSamples ConcatTransform Cone ' +\n\
      'CoordinateSystem CoordSysTransform CropWindow Curves Cylinder DepthOfField Detail ' +\n\
      'DetailRange Disk Displacement Display End ErrorHandler Exposure Exterior Format ' +\n\
      'FrameAspectRatio FrameBegin FrameEnd GeneralPolygon GeometricApproximation Geometry ' +\n\
      'Hider Hyperboloid Identity Illuminate Imager Interior LightSource ' +\n\
      'MakeCubeFaceEnvironment MakeLatLongEnvironment MakeShadow MakeTexture Matte ' +\n\
      'MotionBegin MotionEnd NuPatch ObjectBegin ObjectEnd ObjectInstance Opacity Option ' +\n\
      'Orientation Paraboloid Patch PatchMesh Perspective PixelFilter PixelSamples ' +\n\
      'PixelVariance Points PointsGeneralPolygons PointsPolygons Polygon Procedural Projection ' +\n\
      'Quantize ReadArchive RelativeDetail ReverseOrientation Rotate Scale ScreenWindow ' +\n\
      'ShadingInterpolation ShadingRate Shutter Sides Skew SolidBegin SolidEnd Sphere ' +\n\
      'SubdivisionMesh Surface TextureCoordinates Torus Transform TransformBegin TransformEnd ' +\n\
      'TransformPoints Translate TrimCurve WorldBegin WorldEnd',\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.HASH_COMMENT_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/rib.js"
));
require.register("chemzqm-highlight.js/lib/rsl.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        'float color point normal vector matrix while for if do return else break extern continue',\n\
      built_in:\n\
        'abs acos ambient area asin atan atmosphere attribute calculatenormal ceil cellnoise ' +\n\
        'clamp comp concat cos degrees depth Deriv diffuse distance Du Dv environment exp ' +\n\
        'faceforward filterstep floor format fresnel incident length lightsource log match ' +\n\
        'max min mod noise normalize ntransform opposite option phong pnoise pow printf ' +\n\
        'ptlined radians random reflect refract renderinfo round setcomp setxcomp setycomp ' +\n\
        'setzcomp shadow sign sin smoothstep specular specularbrdf spline sqrt step tan ' +\n\
        'texture textureinfo trace transform vtransform xcomp ycomp zcomp'\n\
    },\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#', end: '$'\n\
      },\n\
      {\n\
        className: 'shader',\n\
        beginWithKeyword: true, end: '\\\\(',\n\
        keywords: 'surface displacement light volume imager'\n\
      },\n\
      {\n\
        className: 'shading',\n\
        beginWithKeyword: true, end: '\\\\(',\n\
        keywords: 'illuminate illuminance gather'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/rsl.js"
));
require.register("chemzqm-highlight.js/lib/ruby.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var RUBY_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*(\\\\!|\\\\?)?';\n\
  var RUBY_METHOD_RE = '[a-zA-Z_]\\\\w*[!?=]?|[-+~]\\\\@|<<|>>|=~|===?|<=>|[<>]=?|\\\\*\\\\*|[-/+%^&*~`|]|\\\\[\\\\]=?';\n\
  var RUBY_KEYWORDS = {\n\
    keyword:\n\
      'and false then defined module in return redo if BEGIN retry end for true self when ' +\n\
      'next until do begin unless END rescue nil else break undef not super class case ' +\n\
      'require yield alias while ensure elsif or include'\n\
  };\n\
  var YARDOCTAG = {\n\
    className: 'yardoctag',\n\
    begin: '@[A-Za-z]+'\n\
  };\n\
  var COMMENTS = [\n\
    {\n\
      className: 'comment',\n\
      begin: '#', end: '$',\n\
      contains: [YARDOCTAG]\n\
    },\n\
    {\n\
      className: 'comment',\n\
      begin: '^\\\\=begin', end: '^\\\\=end',\n\
      contains: [YARDOCTAG],\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'comment',\n\
      begin: '^__END__', end: '\\\\n\
$'\n\
    }\n\
  ];\n\
  var SUBST = {\n\
    className: 'subst',\n\
    begin: '#\\\\{', end: '}',\n\
    lexems: RUBY_IDENT_RE,\n\
    keywords: RUBY_KEYWORDS\n\
  };\n\
  var STR_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST];\n\
  var STRINGS = [\n\
    {\n\
      className: 'string',\n\
      begin: '\\'', end: '\\'',\n\
      contains: STR_CONTAINS,\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '\"', end: '\"',\n\
      contains: STR_CONTAINS,\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?\\\\(', end: '\\\\)',\n\
      contains: STR_CONTAINS\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?\\\\[', end: '\\\\]',\n\
      contains: STR_CONTAINS\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?{', end: '}',\n\
      contains: STR_CONTAINS\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?<', end: '>',\n\
      contains: STR_CONTAINS,\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?/', end: '/',\n\
      contains: STR_CONTAINS,\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?%', end: '%',\n\
      contains: STR_CONTAINS,\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?-', end: '-',\n\
      contains: STR_CONTAINS,\n\
      relevance: 10\n\
    },\n\
    {\n\
      className: 'string',\n\
      begin: '%[qw]?\\\\|', end: '\\\\|',\n\
      contains: STR_CONTAINS,\n\
      relevance: 10\n\
    }\n\
  ];\n\
  var FUNCTION = {\n\
    className: 'function',\n\
    beginWithKeyword: true, end: ' |$|;',\n\
    keywords: 'def',\n\
    contains: [\n\
      {\n\
        className: 'title',\n\
        begin: RUBY_METHOD_RE,\n\
        lexems: RUBY_IDENT_RE,\n\
        keywords: RUBY_KEYWORDS\n\
      },\n\
      {\n\
        className: 'params',\n\
        begin: '\\\\(', end: '\\\\)',\n\
        lexems: RUBY_IDENT_RE,\n\
        keywords: RUBY_KEYWORDS\n\
      }\n\
    ].concat(COMMENTS)\n\
  };\n\
\n\
  var RUBY_DEFAULT_CONTAINS = COMMENTS.concat(STRINGS.concat([\n\
    {\n\
      className: 'class',\n\
      beginWithKeyword: true, end: '$|;',\n\
      keywords: 'class module',\n\
      contains: [\n\
        {\n\
          className: 'title',\n\
          begin: '[A-Za-z_]\\\\w*(::\\\\w+)*(\\\\?|\\\\!)?',\n\
          relevance: 0\n\
        },\n\
        {\n\
          className: 'inheritance',\n\
          begin: '<\\\\s*',\n\
          contains: [{\n\
            className: 'parent',\n\
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE\n\
          }]\n\
        }\n\
      ].concat(COMMENTS)\n\
    },\n\
    FUNCTION,\n\
    {\n\
      className: 'constant',\n\
      begin: '(::)?(\\\\b[A-Z]\\\\w*(::)?)+',\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'symbol',\n\
      begin: ':',\n\
      contains: STRINGS.concat([{begin: RUBY_METHOD_RE}]),\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'symbol',\n\
      begin: RUBY_IDENT_RE + ':',\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'number',\n\
      begin: '(\\\\b0[0-7_]+)|(\\\\b0x[0-9a-fA-F_]+)|(\\\\b[1-9][0-9_]*(\\\\.[0-9_]+)?)|[0_]\\\\b',\n\
      relevance: 0\n\
    },\n\
    {\n\
      className: 'number',\n\
      begin: '\\\\?\\\\w'\n\
    },\n\
    {\n\
      className: 'variable',\n\
      begin: '(\\\\$\\\\W)|((\\\\$|\\\\@\\\\@?)(\\\\w+))'\n\
    },\n\
    { // regexp container\n\
      begin: '(' + hljs.RE_STARTERS_RE + ')\\\\s*',\n\
      contains: COMMENTS.concat([\n\
        {\n\
          className: 'regexp',\n\
          begin: '/', end: '/[a-z]*',\n\
          illegal: '\\\\n\
',\n\
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]\n\
        }\n\
      ]),\n\
      relevance: 0\n\
    }\n\
  ]));\n\
  SUBST.contains = RUBY_DEFAULT_CONTAINS;\n\
  FUNCTION.contains[1].contains = RUBY_DEFAULT_CONTAINS;\n\
\n\
  return {\n\
    lexems: RUBY_IDENT_RE,\n\
    keywords: RUBY_KEYWORDS,\n\
    contains: RUBY_DEFAULT_CONTAINS\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/ruby.js"
));
require.register("chemzqm-highlight.js/lib/rust.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var TITLE = {\n\
    className: 'title',\n\
    begin: hljs.UNDERSCORE_IDENT_RE\n\
  };\n\
  var NUMBER = {\n\
    className: 'number',\n\
    begin: '\\\\b(0[xb][A-Za-z0-9_]+|[0-9_]+(\\\\.[0-9_]+)?([uif](8|16|32|64)?)?)',\n\
    relevance: 0\n\
  };\n\
  var KEYWORDS =\n\
    'alt any as assert be bind block bool break char check claim const cont dir do else enum ' +\n\
    'export f32 f64 fail false float fn for i16 i32 i64 i8 if iface impl import in int let ' +\n\
    'log mod mutable native note of prove pure resource ret self str syntax true type u16 u32 ' +\n\
    'u64 u8 uint unchecked unsafe use vec while';\n\
  return {\n\
    keywords: KEYWORDS,\n\
    illegal: '</',\n\
    contains: [\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),\n\
      hljs.APOS_STRING_MODE,\n\
      NUMBER,\n\
      {\n\
        className: 'function',\n\
        beginWithKeyword: true, end: '(\\\\(|<)',\n\
        keywords: 'fn',\n\
        contains: [TITLE]\n\
      },\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '#\\\\[', end: '\\\\]'\n\
      },\n\
      {\n\
        beginWithKeyword: true, end: '(=|<)',\n\
        keywords: 'type',\n\
        contains: [TITLE],\n\
        illegal: '\\\\S'\n\
      },\n\
      {\n\
        beginWithKeyword: true, end: '({|<)',\n\
        keywords: 'iface enum',\n\
        contains: [TITLE],\n\
        illegal: '\\\\S'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/rust.js"
));
require.register("chemzqm-highlight.js/lib/scala.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var ANNOTATION = {\n\
    className: 'annotation', begin: '@[A-Za-z]+'\n\
  };\n\
  var STRING = {\n\
    className: 'string',\n\
    begin: 'u?r?\"\"\"', end: '\"\"\"',\n\
    relevance: 10\n\
  };\n\
  return {\n\
    keywords:\n\
      'type yield lazy override def with val var false true sealed abstract private trait ' +\n\
      'object null if for while throw finally protected extends import final return else ' +\n\
      'break new catch super class case package default try this match continue throws',\n\
    contains: [\n\
      {\n\
        className: 'javadoc',\n\
        begin: '/\\\\*\\\\*', end: '\\\\*/',\n\
        contains: [{\n\
          className: 'javadoctag',\n\
          begin: '@[A-Za-z]+'\n\
        }],\n\
        relevance: 10\n\
      },\n\
      hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE,\n\
      hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,\n\
      {\n\
        className: 'class',\n\
        begin: '((case )?class |object |trait )', end: '({|$)', // beginWithKeyword won't work because a single \"case\" shouldn't start this mode\n\
        illegal: ':',\n\
        keywords: 'case class trait object',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true,\n\
            keywords: 'extends with',\n\
            relevance: 10\n\
          },\n\
          {\n\
            className: 'title',\n\
            begin: hljs.UNDERSCORE_IDENT_RE\n\
          },\n\
          {\n\
            className: 'params',\n\
            begin: '\\\\(', end: '\\\\)',\n\
            contains: [\n\
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,\n\
              ANNOTATION\n\
            ]\n\
          }\n\
        ]\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      ANNOTATION\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/scala.js"
));
require.register("chemzqm-highlight.js/lib/smalltalk.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var VAR_IDENT_RE = '[a-z][a-zA-Z0-9_]*';\n\
  var CHAR = {\n\
    className: 'char',\n\
    begin: '\\\\$.{1}'\n\
  };\n\
  var SYMBOL = {\n\
    className: 'symbol',\n\
    begin: '#' + hljs.UNDERSCORE_IDENT_RE\n\
  };\n\
  return {\n\
    keywords: 'self super nil true false thisContext', // only 6\n\
    contains: [\n\
      {\n\
        className: 'comment',\n\
        begin: '\"', end: '\"',\n\
        relevance: 0\n\
      },\n\
      hljs.APOS_STRING_MODE,\n\
      {\n\
        className: 'class',\n\
        begin: '\\\\b[A-Z][A-Za-z0-9_]*',\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'method',\n\
        begin: VAR_IDENT_RE + ':'\n\
      },\n\
      hljs.C_NUMBER_MODE,\n\
      SYMBOL,\n\
      CHAR,\n\
      {\n\
        className: 'localvars',\n\
        begin: '\\\\|\\\\s*((' + VAR_IDENT_RE + ')\\\\s*)+\\\\|'\n\
      },\n\
      {\n\
        className: 'array',\n\
        begin: '\\\\#\\\\(', end: '\\\\)',\n\
        contains: [\n\
          hljs.APOS_STRING_MODE,\n\
          CHAR,\n\
          hljs.C_NUMBER_MODE,\n\
          SYMBOL\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/smalltalk.js"
));
require.register("chemzqm-highlight.js/lib/sql.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    contains: [\n\
      {\n\
        className: 'operator',\n\
        begin: '(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant)\\\\b(?!:)', // negative look-ahead here is specifically to prevent stomping on SmallTalk\n\
        end: ';', endsWithParent: true,\n\
        keywords: {\n\
          keyword: 'all partial global month current_timestamp using go revoke smallint ' +\n\
            'indicator end-exec disconnect zone with character assertion to add current_user ' +\n\
            'usage input local alter match collate real then rollback get read timestamp ' +\n\
            'session_user not integer bit unique day minute desc insert execute like ilike|2 ' +\n\
            'level decimal drop continue isolation found where constraints domain right ' +\n\
            'national some module transaction relative second connect escape close system_user ' +\n\
            'for deferred section cast current sqlstate allocate intersect deallocate numeric ' +\n\
            'public preserve full goto initially asc no key output collation group by union ' +\n\
            'session both last language constraint column of space foreign deferrable prior ' +\n\
            'connection unknown action commit view or first into float year primary cascaded ' +\n\
            'except restrict set references names table outer open select size are rows from ' +\n\
            'prepare distinct leading create only next inner authorization schema ' +\n\
            'corresponding option declare precision immediate else timezone_minute external ' +\n\
            'varying translation true case exception join hour default double scroll value ' +\n\
            'cursor descriptor values dec fetch procedure delete and false int is describe ' +\n\
            'char as at in varchar null trailing any absolute current_time end grant ' +\n\
            'privileges when cross check write current_date pad begin temporary exec time ' +\n\
            'update catalog user sql date on identity timezone_hour natural whenever interval ' +\n\
            'work order cascade diagnostics nchar having left call do handler load replace ' +\n\
            'truncate start lock show pragma exists number',\n\
          aggregate: 'count sum min max avg'\n\
        },\n\
        contains: [\n\
          {\n\
            className: 'string',\n\
            begin: '\\'', end: '\\'',\n\
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\\'\\''}],\n\
            relevance: 0\n\
          },\n\
          {\n\
            className: 'string',\n\
            begin: '\"', end: '\"',\n\
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\"\"'}],\n\
            relevance: 0\n\
          },\n\
          {\n\
            className: 'string',\n\
            begin: '`', end: '`',\n\
            contains: [hljs.BACKSLASH_ESCAPE]\n\
          },\n\
          hljs.C_NUMBER_MODE\n\
        ]\n\
      },\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      {\n\
        className: 'comment',\n\
        begin: '--', end: '$'\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/sql.js"
));
require.register("chemzqm-highlight.js/lib/tex.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var COMMAND1 = {\n\
    className: 'command',\n\
    begin: '\\\\\\\\[a-zA-Zа-яА-я]+[\\\\*]?'\n\
  };\n\
  var COMMAND2 = {\n\
    className: 'command',\n\
    begin: '\\\\\\\\[^a-zA-Zа-яА-я0-9]'\n\
  };\n\
  var SPECIAL = {\n\
    className: 'special',\n\
    begin: '[{}\\\\[\\\\]\\\\&#~]',\n\
    relevance: 0\n\
  };\n\
\n\
  return {\n\
    contains: [\n\
      { // parameter\n\
        begin: '\\\\\\\\[a-zA-Zа-яА-я]+[\\\\*]? *= *-?\\\\d*\\\\.?\\\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?',\n\
        returnBegin: true,\n\
        contains: [\n\
          COMMAND1, COMMAND2,\n\
          {\n\
            className: 'number',\n\
            begin: ' *=', end: '-?\\\\d*\\\\.?\\\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?',\n\
            excludeBegin: true\n\
          }\n\
        ],\n\
        relevance: 10\n\
      },\n\
      COMMAND1, COMMAND2,\n\
      SPECIAL,\n\
      {\n\
        className: 'formula',\n\
        begin: '\\\\$\\\\$', end: '\\\\$\\\\$',\n\
        contains: [COMMAND1, COMMAND2, SPECIAL],\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'formula',\n\
        begin: '\\\\$', end: '\\\\$',\n\
        contains: [COMMAND1, COMMAND2, SPECIAL],\n\
        relevance: 0\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '%', end: '$',\n\
        relevance: 0\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/tex.js"
));
require.register("chemzqm-highlight.js/lib/vala.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    keywords: {\n\
      keyword:\n\
        // Value types\n\
        'char uchar unichar int uint long ulong short ushort int8 int16 int32 int64 uint8 ' +\n\
        'uint16 uint32 uint64 float double bool struct enum string void ' +\n\
        // Reference types\n\
        'weak unowned owned ' +\n\
        // Modifiers\n\
        'async signal static abstract interface override ' +\n\
        // Control Structures\n\
        'while do for foreach else switch case break default return try catch ' +\n\
        // Visibility\n\
        'public private protected internal ' +\n\
        // Other\n\
        'using new this get set const stdout stdin stderr var',\n\
      built_in:\n\
        'DBus GLib CCode Gee Object',\n\
      literal:\n\
        'false true null'\n\
    },\n\
    contains: [\n\
      {\n\
        className: 'class',\n\
        beginWithKeyword: true, end: '{',\n\
        keywords: 'class interface delegate namespace',\n\
        contains: [\n\
          {\n\
            beginWithKeyword: true,\n\
            keywords: 'extends implements'\n\
          },\n\
          {\n\
            className: 'title',\n\
            begin: hljs.UNDERSCORE_IDENT_RE\n\
          }\n\
        ]\n\
      },\n\
      hljs.C_LINE_COMMENT_MODE,\n\
      hljs.C_BLOCK_COMMENT_MODE,\n\
      {\n\
        className: 'string',\n\
        begin: '\"\"\"', end: '\"\"\"',\n\
        relevance: 5\n\
      },\n\
      hljs.APOS_STRING_MODE,\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'preprocessor',\n\
        begin: '^#', end: '$',\n\
        relevance: 2\n\
      },\n\
      {\n\
        className: 'constant',\n\
        begin: ' [A-Z_]+ ',\n\
        relevance: 0\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/vala.js"
));
require.register("chemzqm-highlight.js/lib/vbscript.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: {\n\
      keyword:\n\
        'call class const dim do loop erase execute executeglobal exit for each next function ' +\n\
        'if then else on error option explicit new private property let get public randomize ' +\n\
        'redim rem select case set stop sub while wend with end to elseif is or xor and not ' +\n\
        'class_initialize class_terminate default preserve in me byval byref step resume goto',\n\
      built_in:\n\
        'lcase month vartype instrrev ubound setlocale getobject rgb getref string ' +\n\
        'weekdayname rnd dateadd monthname now day minute isarray cbool round formatcurrency ' +\n\
        'conversions csng timevalue second year space abs clng timeserial fixs len asc ' +\n\
        'isempty maths dateserial atn timer isobject filter weekday datevalue ccur isdate ' +\n\
        'instr datediff formatdatetime replace isnull right sgn array snumeric log cdbl hex ' +\n\
        'chr lbound msgbox ucase getlocale cos cdate cbyte rtrim join hour oct typename trim ' +\n\
        'strcomp int createobject loadpicture tan formatnumber mid scriptenginebuildversion ' +\n\
        'scriptengine split scriptengineminorversion cint sin datepart ltrim sqr ' +\n\
        'scriptenginemajorversion time derived eval date formatpercent exp inputbox left ascw ' +\n\
        'chrw regexp server response request cstr err',\n\
      literal:\n\
        'true false null nothing empty'\n\
    },\n\
    illegal: '//',\n\
    contains: [\n\
      hljs.inherit(hljs.QUOTE_STRING_MODE, {contains: [{begin: '\"\"'}]}),\n\
      {\n\
        className: 'comment',\n\
        begin: '\\'', end: '$'\n\
      },\n\
      hljs.C_NUMBER_MODE\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/vbscript.js"
));
require.register("chemzqm-highlight.js/lib/vhdl.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  return {\n\
    case_insensitive: true,\n\
    keywords: {\n\
      keyword:\n\
        'abs access after alias all and architecture array assert attribute begin block ' +\n\
        'body buffer bus case component configuration constant context cover disconnect ' +\n\
        'downto default else elsif end entity exit fairness file for force function generate ' +\n\
        'generic group guarded if impure in inertial inout is label library linkage literal ' +\n\
        'loop map mod nand new next nor not null of on open or others out package port ' +\n\
        'postponed procedure process property protected pure range record register reject ' +\n\
        'release rem report restrict restrict_guarantee return rol ror select sequence ' +\n\
        'severity shared signal sla sll sra srl strong subtype then to transport type ' +\n\
        'unaffected units until use variable vmode vprop vunit wait when while with xnor xor',\n\
      typename:\n\
        'boolean bit character severity_level integer time delay_length natural positive ' +\n\
        'string bit_vector file_open_kind file_open_status std_ulogic std_ulogic_vector ' +\n\
        'std_logic std_logic_vector unsigned signed boolean_vector integer_vector ' +\n\
        'real_vector time_vector'\n\
    },\n\
    illegal: '{',\n\
    contains: [\n\
      hljs.C_BLOCK_COMMENT_MODE,        // VHDL-2008 block commenting.\n\
      {\n\
        className: 'comment',\n\
        begin: '--', end: '$'\n\
      },\n\
      hljs.QUOTE_STRING_MODE,\n\
      hljs.C_NUMBER_MODE,\n\
      {\n\
        className: 'literal',\n\
        begin: '\\'(U|X|0|1|Z|W|L|H|-)\\'',\n\
        contains: [hljs.BACKSLASH_ESCAPE]\n\
      },\n\
      {\n\
        className: 'attribute',\n\
        begin: '\\'[A-Za-z](_?[A-Za-z0-9])*',\n\
        contains: [hljs.BACKSLASH_ESCAPE]\n\
      }\n\
    ]\n\
  }; // return\n\
};//@ sourceURL=chemzqm-highlight.js/lib/vhdl.js"
));
require.register("chemzqm-highlight.js/lib/xml.js", Function("exports, require, module",
"module.exports = function(hljs) {\n\
  var XML_IDENT_RE = '[A-Za-z0-9\\\\._:-]+';\n\
  var TAG_INTERNALS = {\n\
    endsWithParent: true,\n\
    contains: [\n\
      {\n\
        className: 'attribute',\n\
        begin: XML_IDENT_RE,\n\
        relevance: 0\n\
      },\n\
      {\n\
        begin: '=\"', returnBegin: true, end: '\"',\n\
        contains: [{\n\
            className: 'value',\n\
            begin: '\"', endsWithParent: true\n\
        }]\n\
      },\n\
      {\n\
        begin: '=\\'', returnBegin: true, end: '\\'',\n\
        contains: [{\n\
          className: 'value',\n\
          begin: '\\'', endsWithParent: true\n\
        }]\n\
      },\n\
      {\n\
        begin: '=',\n\
        contains: [{\n\
          className: 'value',\n\
          begin: '[^\\\\s/>]+'\n\
        }]\n\
      }\n\
    ]\n\
  };\n\
  return {\n\
    case_insensitive: true,\n\
    contains: [\n\
      {\n\
        className: 'pi',\n\
        begin: '<\\\\?', end: '\\\\?>',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'doctype',\n\
        begin: '<!DOCTYPE', end: '>',\n\
        relevance: 10,\n\
        contains: [{begin: '\\\\[', end: '\\\\]'}]\n\
      },\n\
      {\n\
        className: 'comment',\n\
        begin: '<!--', end: '-->',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'cdata',\n\
        begin: '<\\\\!\\\\[CDATA\\\\[', end: '\\\\]\\\\]>',\n\
        relevance: 10\n\
      },\n\
      {\n\
        className: 'tag',\n\
        /*\n\
        The lookahead pattern (?=...) ensures that 'begin' only matches\n\
        '<style' as a single word, followed by a whitespace or an\n\
        ending braket. The '$' is needed for the lexem to be recognized\n\
        by hljs.subMode() that tests lexems outside the stream.\n\
        */\n\
        begin: '<style(?=\\\\s|>|$)', end: '>',\n\
        keywords: {title: 'style'},\n\
        contains: [TAG_INTERNALS],\n\
        starts: {\n\
          end: '</style>', returnEnd: true,\n\
          subLanguage: 'css'\n\
        }\n\
      },\n\
      {\n\
        className: 'tag',\n\
        // See the comment in the <style tag about the lookahead pattern\n\
        begin: '<script(?=\\\\s|>|$)', end: '>',\n\
        keywords: {title: 'script'},\n\
        contains: [TAG_INTERNALS],\n\
        starts: {\n\
          end: '</script>', returnEnd: true,\n\
          subLanguage: 'javascript'\n\
        }\n\
      },\n\
      {\n\
        begin: '<%', end: '%>',\n\
        subLanguage: 'vbscript'\n\
      },\n\
      {\n\
        className: 'tag',\n\
        begin: '</?', end: '/?>',\n\
        contains: [\n\
          {\n\
            className: 'title', begin: '[^ />]+'\n\
          },\n\
          TAG_INTERNALS\n\
        ]\n\
      }\n\
    ]\n\
  };\n\
};//@ sourceURL=chemzqm-highlight.js/lib/xml.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("ui-component-mouse/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var emitter = require('emitter')\n\
  , event = require('event');\n\
\n\
/**\n\
 * export `Mouse`\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  return new Mouse(el, obj);\n\
};\n\
\n\
/**\n\
 * initialize new `Mouse`.\n\
 * \n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 */\n\
\n\
function Mouse(el, obj){\n\
  this.obj = obj || {};\n\
  this.el = el;\n\
}\n\
\n\
/**\n\
 * mixin emitter.\n\
 */\n\
\n\
emitter(Mouse.prototype);\n\
\n\
/**\n\
 * bind mouse.\n\
 * \n\
 * @return {Mouse}\n\
 */\n\
\n\
Mouse.prototype.bind = function(){\n\
  var obj = this.obj\n\
    , self = this;\n\
\n\
  // up\n\
  function up(e){\n\
    obj.onmouseup && obj.onmouseup(e);\n\
    event.unbind(document, 'mousemove', move);\n\
    event.unbind(document, 'mouseup', up);\n\
    self.emit('up', e);\n\
  }\n\
\n\
  // move\n\
  function move(e){\n\
    obj.onmousemove && obj.onmousemove(e);\n\
    self.emit('move', e);\n\
  }\n\
\n\
  // down\n\
  self.down = function(e){\n\
    obj.onmousedown && obj.onmousedown(e);\n\
    event.bind(document, 'mouseup', up);\n\
    event.bind(document, 'mousemove', move);\n\
    self.emit('down', e);\n\
  };\n\
\n\
  // bind all.\n\
  event.bind(this.el, 'mousedown', self.down);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * unbind mouse.\n\
 * \n\
 * @return {Mouse}\n\
 */\n\
\n\
Mouse.prototype.unbind = function(){\n\
  event.unbind(this.el, 'mousedown', this.down);\n\
  this.down = null;\n\
};\n\
//@ sourceURL=ui-component-mouse/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("yields-merge/index.js", Function("exports, require, module",
"\n\
/**\n\
 * merge `b`'s properties with `a`'s.\n\
 *\n\
 * example:\n\
 *\n\
 *        var user = {};\n\
 *        merge(user, console);\n\
 *        // > { log: fn, dir: fn ..}\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Object}\n\
 */\n\
\n\
module.exports = function (a, b) {\n\
  for (var k in b) a[k] = b[k];\n\
  return a;\n\
};\n\
//@ sourceURL=yields-merge/index.js"
));
require.register("ui-component-resizable/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var configurable = require('configurable.js')\n\
  , emitter = require('emitter')\n\
  , classes = require('classes')\n\
  , mouse = require('mouse')\n\
  , domify = require('domify')\n\
  , tpl = require('./template')\n\
  , resize = require('./resize')\n\
  , merge = require('merge');\n\
\n\
/**\n\
 * export `Resizable`.\n\
 */\n\
\n\
module.exports = function(el, opts){\n\
  return new Resizable(el, opts);\n\
};\n\
\n\
/**\n\
 * initialize new `Resizable`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} opts\n\
 */\n\
\n\
function Resizable(el, opts){\n\
  this.settings = {};\n\
  this.set('handles', 'all');\n\
  this.set(opts || {});\n\
  this.els = [];\n\
  this.el = el;\n\
}\n\
\n\
/**\n\
 * mixins.\n\
 */\n\
\n\
configurable(Resizable.prototype);\n\
emitter(Resizable.prototype);\n\
\n\
/**\n\
 * build resizable.\n\
 *\n\
 * @return {Resizable}\n\
 */\n\
\n\
Resizable.prototype.build = function(){\n\
  var all = split(this.get('handles'))\n\
    , len = all.length\n\
    , handle\n\
    , cname\n\
    , axis;\n\
\n\
  // split handles\n\
  function split(str){\n\
    return 'all' == str\n\
      ? 'se.sw.ne.nw.e.w.s.n'.split('.')\n\
      : str.split(/ *, */);\n\
  }\n\
\n\
  // classes\n\
  this.classes = classes(this.el);\n\
  this.classes.add('resizable');\n\
\n\
  // append handles\n\
  for (var i = 0; i < len; ++i) {\n\
    cname = ' resizable-' + all[i];\n\
    axis = domify(tpl);\n\
    axis.className += cname;\n\
    axis.__axis = all[i];\n\
    this.els.push(axis);\n\
    this.el.appendChild(axis);\n\
  }\n\
\n\
  // bind mouse\n\
  this.mouse = mouse(this.el, this);\n\
  this.mouse.bind();\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * on-mousedown\n\
 */\n\
\n\
Resizable.prototype.onmousedown = function(e){\n\
  if (e.target.__axis) {\n\
    this.emit('start');\n\
    e.preventDefault();\n\
    e.stopImmediatePropagation();\n\
    this.axis = e.target.__axis;\n\
    var styles = window.getComputedStyle(this.el);\n\
    this.resizing = true;\n\
    this.x = e.pageX;\n\
    this.y = e.pageY;\n\
    this.h = parseInt(styles.height);\n\
    this.w = parseInt(styles.width);\n\
    this.left = parseInt(styles.left) || 0;\n\
    this.top = parseInt(styles.top) || 0;\n\
    this.classes.add('resizable-resizing');\n\
  }\n\
};\n\
\n\
/**\n\
 * on-mousemove\n\
 */\n\
\n\
Resizable.prototype.onmousemove = function(e){\n\
  if (this.resizing) {\n\
    this.emit('resize');\n\
    var fn = resize[this.axis];\n\
    var x = (e.pageX - this.x) || 0;\n\
    var y = (e.pageY - this.y) || 0;\n\
    var o = { x: x, y: y };\n\
    if (!fn) return;\n\
    var style = fn.call(this, e, o);\n\
    if (0 > style.width) return;\n\
    if (0 > style.height) return;\n\
    merge(this.el.style, style);\n\
  }\n\
};\n\
\n\
/**\n\
 * on-mouseup\n\
 */\n\
\n\
Resizable.prototype.onmouseup = function(e){\n\
  this.classes.remove('resizable-resizing');\n\
  this.resizing = null;\n\
  this.emit('end');\n\
};\n\
\n\
/**\n\
 * destroy resizable.\n\
 */\n\
\n\
Resizable.prototype.destroy = function(){\n\
  if (this.els.length) {\n\
    var el = this.el;\n\
    this.classes.remove('resizable');\n\
    this.classes = null;\n\
    this.mouse.unbind();\n\
    this.mouse = null;\n\
    while (el = this.els.pop()) {\n\
      this.el.removeChild(el);\n\
    }\n\
  }\n\
};\n\
//@ sourceURL=ui-component-resizable/index.js"
));
require.register("ui-component-resizable/template.js", Function("exports, require, module",
"module.exports = '<span class=\\'resizable-handle\\'></span>\\n\
';//@ sourceURL=ui-component-resizable/template.js"
));
require.register("ui-component-resizable/resize.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var merge = require('merge');\n\
\n\
/**\n\
 * east\n\
 */\n\
\n\
exports.e = function(_, o){\n\
  return {\n\
    width: this.w + o.x + 'px'\n\
  };\n\
};\n\
\n\
/**\n\
 * west\n\
 */\n\
\n\
exports.w = function(_, o){\n\
  return {\n\
    left: this.left + o.x + 'px',\n\
    width: this.w - o.x + 'px'\n\
  };\n\
};\n\
\n\
/**\n\
 * north\n\
 */\n\
\n\
exports.n = function(_, o){\n\
  return {\n\
    top: this.top + o.y + 'px',\n\
    height: this.h - o.y + 'px'\n\
  };\n\
};\n\
\n\
/**\n\
 * south\n\
 */\n\
\n\
exports.s = function(_, o){\n\
  return {\n\
    height: this.h + o.y + 'px'\n\
  };\n\
};\n\
\n\
/**\n\
 * south-east\n\
 */\n\
\n\
exports.se = function(){\n\
  return merge(\n\
    exports.s.apply(this, arguments),\n\
    exports.e.apply(this, arguments)\n\
  );\n\
};\n\
\n\
/**\n\
 * south-west\n\
 */\n\
\n\
exports.sw = function(){\n\
  return merge(\n\
    exports.s.apply(this, arguments),\n\
    exports.w.apply(this, arguments)\n\
  );\n\
};\n\
\n\
/**\n\
 * north-east\n\
 */\n\
\n\
exports.ne = function(){\n\
  return merge(\n\
    exports.n.apply(this, arguments),\n\
    exports.e.apply(this, arguments)\n\
  );\n\
};\n\
\n\
/**\n\
 * north-west\n\
 */\n\
\n\
exports.nw = function(){\n\
  return merge(\n\
    exports.n.apply(this, arguments),\n\
    exports.w.apply(this, arguments)\n\
  );\n\
};\n\
//@ sourceURL=ui-component-resizable/resize.js"
));
require.register("component-scroll-to/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Tween = require('tween');\n\
var raf = require('raf');\n\
\n\
/**\n\
 * Expose `scrollTo`.\n\
 */\n\
\n\
module.exports = scrollTo;\n\
\n\
/**\n\
 * Scroll to `(x, y)`.\n\
 *\n\
 * @param {Number} x\n\
 * @param {Number} y\n\
 * @api public\n\
 */\n\
\n\
function scrollTo(x, y, options) {\n\
  options = options || {};\n\
\n\
  // start position\n\
  var start = scroll();\n\
\n\
  // setup tween\n\
  var tween = Tween(start)\n\
    .ease(options.ease || 'out-circ')\n\
    .to({ top: y, left: x })\n\
    .duration(options.duration || 1000);\n\
\n\
  // scroll\n\
  tween.update(function(o){\n\
    window.scrollTo(o.left | 0, o.top | 0);\n\
  });\n\
\n\
  // handle end\n\
  tween.on('end', function(){\n\
    animate = function(){};\n\
  });\n\
\n\
  // animate\n\
  function animate() {\n\
    raf(animate);\n\
    tween.update();\n\
  }\n\
\n\
  animate();\n\
}\n\
\n\
/**\n\
 * Return scroll position.\n\
 *\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function scroll() {\n\
  var y = window.pageYOffset || document.documentElement.scrollTop;\n\
  var x = window.pageXOffset || document.documentElement.scrollLeft;\n\
  return { top: y, left: x };\n\
}\n\
//@ sourceURL=component-scroll-to/index.js"
));
require.register("component-ease/index.js", Function("exports, require, module",
"\n\
exports.linear = function(n){\n\
  return n;\n\
};\n\
\n\
exports.inQuad = function(n){\n\
  return n * n;\n\
};\n\
\n\
exports.outQuad = function(n){\n\
  return n * (2 - n);\n\
};\n\
\n\
exports.inOutQuad = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n;\n\
  return - 0.5 * (--n * (n - 2) - 1);\n\
};\n\
\n\
exports.inCube = function(n){\n\
  return n * n * n;\n\
};\n\
\n\
exports.outCube = function(n){\n\
  return --n * n * n + 1;\n\
};\n\
\n\
exports.inOutCube = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n;\n\
  return 0.5 * ((n -= 2 ) * n * n + 2);\n\
};\n\
\n\
exports.inQuart = function(n){\n\
  return n * n * n * n;\n\
};\n\
\n\
exports.outQuart = function(n){\n\
  return 1 - (--n * n * n * n);\n\
};\n\
\n\
exports.inOutQuart = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n * n;\n\
  return -0.5 * ((n -= 2) * n * n * n - 2);\n\
};\n\
\n\
exports.inQuint = function(n){\n\
  return n * n * n * n * n;\n\
}\n\
\n\
exports.outQuint = function(n){\n\
  return --n * n * n * n * n + 1;\n\
}\n\
\n\
exports.inOutQuint = function(n){\n\
  n *= 2;\n\
  if (n < 1) return 0.5 * n * n * n * n * n;\n\
  return 0.5 * ((n -= 2) * n * n * n * n + 2);\n\
};\n\
\n\
exports.inSine = function(n){\n\
  return 1 - Math.cos(n * Math.PI / 2 );\n\
};\n\
\n\
exports.outSine = function(n){\n\
  return Math.sin(n * Math.PI / 2);\n\
};\n\
\n\
exports.inOutSine = function(n){\n\
  return .5 * (1 - Math.cos(Math.PI * n));\n\
};\n\
\n\
exports.inExpo = function(n){\n\
  return 0 == n ? 0 : Math.pow(1024, n - 1);\n\
};\n\
\n\
exports.outExpo = function(n){\n\
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);\n\
};\n\
\n\
exports.inOutExpo = function(n){\n\
  if (0 == n) return 0;\n\
  if (1 == n) return 1;\n\
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);\n\
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);\n\
};\n\
\n\
exports.inCirc = function(n){\n\
  return 1 - Math.sqrt(1 - n * n);\n\
};\n\
\n\
exports.outCirc = function(n){\n\
  return Math.sqrt(1 - (--n * n));\n\
};\n\
\n\
exports.inOutCirc = function(n){\n\
  n *= 2\n\
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);\n\
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);\n\
};\n\
\n\
exports.inBack = function(n){\n\
  var s = 1.70158;\n\
  return n * n * (( s + 1 ) * n - s);\n\
};\n\
\n\
exports.outBack = function(n){\n\
  var s = 1.70158;\n\
  return --n * n * ((s + 1) * n + s) + 1;\n\
};\n\
\n\
exports.inOutBack = function(n){\n\
  var s = 1.70158 * 1.525;\n\
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );\n\
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );\n\
};\n\
\n\
exports.inBounce = function(n){\n\
  return 1 - exports.outBounce(1 - n);\n\
};\n\
\n\
exports.outBounce = function(n){\n\
  if ( n < ( 1 / 2.75 ) ) {\n\
    return 7.5625 * n * n;\n\
  } else if ( n < ( 2 / 2.75 ) ) {\n\
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;\n\
  } else if ( n < ( 2.5 / 2.75 ) ) {\n\
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;\n\
  } else {\n\
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;\n\
  }\n\
};\n\
\n\
exports.inOutBounce = function(n){\n\
  if (n < .5) return exports.inBounce(n * 2) * .5;\n\
  return exports.outBounce(n * 2 - 1) * .5 + .5;\n\
};\n\
\n\
// aliases\n\
\n\
exports['in-quad'] = exports.inQuad;\n\
exports['out-quad'] = exports.outQuad;\n\
exports['in-out-quad'] = exports.inOutQuad;\n\
exports['in-cube'] = exports.inCube;\n\
exports['out-cube'] = exports.outCube;\n\
exports['in-out-cube'] = exports.inOutCube;\n\
exports['in-quart'] = exports.inQuart;\n\
exports['out-quart'] = exports.outQuart;\n\
exports['in-out-quart'] = exports.inOutQuart;\n\
exports['in-quint'] = exports.inQuint;\n\
exports['out-quint'] = exports.outQuint;\n\
exports['in-out-quint'] = exports.inOutQuint;\n\
exports['in-sine'] = exports.inSine;\n\
exports['out-sine'] = exports.outSine;\n\
exports['in-out-sine'] = exports.inOutSine;\n\
exports['in-expo'] = exports.inExpo;\n\
exports['out-expo'] = exports.outExpo;\n\
exports['in-out-expo'] = exports.inOutExpo;\n\
exports['in-circ'] = exports.inCirc;\n\
exports['out-circ'] = exports.outCirc;\n\
exports['in-out-circ'] = exports.inOutCirc;\n\
exports['in-back'] = exports.inBack;\n\
exports['out-back'] = exports.outBack;\n\
exports['in-out-back'] = exports.inOutBack;\n\
exports['in-bounce'] = exports.inBounce;\n\
exports['out-bounce'] = exports.outBounce;\n\
exports['in-out-bounce'] = exports.inOutBounce;\n\
//@ sourceURL=component-ease/index.js"
));


require.register("livechart/index.js", Function("exports, require, module",
"var LineChart = require('./lib/linechart');\n\
var AreaChart = require('./lib/areachart');\n\
var PieChart = require('./lib/piechart');\n\
var BarChart = require('./lib/barchart');\n\
var ArcChart = require('./lib/arcchart');\n\
var PolarChart = require('./lib/polarchart');\n\
var Histogram = require('./lib/histogram');\n\
\n\
module.exports.LineChart = LineChart;\n\
module.exports.AreaChart = AreaChart;\n\
module.exports.PolarChart = PolarChart;\n\
module.exports.PieChart = PieChart;\n\
module.exports.BarChart = BarChart;\n\
module.exports.ArcChart = ArcChart;\n\
module.exports.Histogram = Histogram;\n\
//@ sourceURL=livechart/index.js"
));
require.register("livechart/lib/chart.js", Function("exports, require, module",
"var autoscale = require('autoscale-canvas');\n\
var resize = require('resize');\n\
var debounce = require ('debounce');\n\
var Configurable = require('configurable.js');\n\
var Emitter = require ('emitter');\n\
var raf = require ('raf');\n\
var style = require ('style');\n\
var Tween = require ('tween');\n\
\n\
\n\
var styles = window.getComputedStyle;\n\
\n\
function Chart (dom) {\n\
  this.parent = dom;\n\
  this.styles = {\n\
    color: style('.livechart .text', 'color'),\n\
    fontSize: style('.livechart .text', 'font-size') || '10px',\n\
    titleColor: style('.livechart .title', 'color'),\n\
    titleSize: style('.livechart .title', 'font-size') || '14px'\n\
  };\n\
  var canvas = this.canvas  = document.createElement('canvas');\n\
  resize.bind(dom, debounce(this.resize.bind(this)), 200);\n\
  dom.appendChild(this.canvas);\n\
  this.resize();\n\
  this.settings = {};\n\
  this.set('format', function (v) { return v; });\n\
}\n\
\n\
Configurable(Chart.prototype);\n\
Emitter(Chart.prototype);\n\
\n\
Chart.prototype.resize = function() {\n\
  var dom = this.parent;\n\
  var canvas = this.canvas;\n\
  var width = parseInt(styles(dom).width, 10);\n\
  var height = parseInt(styles(dom).height, 10);\n\
  this.height = canvas.height = height;\n\
  this.width = canvas.width = width;\n\
  autoscale(canvas);\n\
  var ctx = this.ctx = canvas.getContext('2d');\n\
  //origin at left bottom\n\
  ctx.translate(0, this.height);\n\
}\n\
\n\
Chart.prototype.start = function() {\n\
  var self = this;\n\
  var delta = 0;\n\
  var tween = Tween({d: 0})\n\
    .ease(this.get('ease') || 'in-out-quad')\n\
    .to({d: 1})\n\
    .duration(this.get('duration') || 500);\n\
\n\
  tween.update(function(o){\n\
    delta = o.d;\n\
    self.draw(delta);\n\
  });\n\
\n\
  tween.on('end', function(){\n\
    self.emit('end');\n\
    animate = function (){ }\n\
  });\n\
\n\
  function animate () {\n\
    raf(animate);\n\
    tween.update();\n\
  }\n\
  animate();\n\
}\n\
\n\
Chart.prototype.tween = function(from, to) {\n\
  return function (delta) {\n\
    for (var prop in from) {\n\
      this[prop] = from[prop] + (to[prop] - from[prop]) * delta;\n\
    }\n\
  }\n\
}\n\
\n\
Chart.prototype.drawLabels = function() {\n\
  var labels = this.get('labels');\n\
  if (!labels) return;\n\
  var ctx = this.ctx;\n\
  var colors = this.get('colors');\n\
  ctx.save();\n\
  ctx.setTransform(1, 0, 0, 1, 0, 0);\n\
  var h = parseInt(this.styles.fontSize, 10) + 10;\n\
  ctx.textAlign = 'left';\n\
  ctx.textBaseline = 'middle';\n\
  ctx.font = '24px helvetica';\n\
  labels.forEach(function(text, i) {\n\
    var color = colors[i];\n\
    ctx.fillStyle = color;\n\
    drawRoundRect(ctx, 5, i * (h + 10) + 5 , 25, h );\n\
    ctx.fillStyle = this.styles.color;\n\
    ctx.fillText(text, 40, i*(h+10) + h/2 + 5);\n\
  }.bind(this));\n\
  ctx.restore();\n\
}\n\
\n\
Chart.prototype.toRgb = function(hex) {\n\
  var result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);\n\
  return result ? {\n\
      r: parseInt(result[1], 16),\n\
      g: parseInt(result[2], 16),\n\
      b: parseInt(result[3], 16)\n\
  } : null;\n\
}\n\
\n\
function drawRoundRect (ctx, x, y , w, h) {\n\
  var r = 5;\n\
  ctx.beginPath();\n\
  ctx.moveTo(x + r, y);\n\
  ctx.lineTo(x + w - r, y);\n\
  ctx.quadraticCurveTo(x + w ,y , x + w, y + r);\n\
  ctx.lineTo(x + w , y + h - r);\n\
  ctx.quadraticCurveTo(x + w , y + h, x + w - r, y + h);\n\
  ctx.lineTo(x + r , y + h);\n\
  ctx.quadraticCurveTo(x , y + h, x, y + h - r);\n\
  ctx.lineTo(x , y + r);\n\
  ctx.quadraticCurveTo(x , y , x + r, y);\n\
  ctx.fill();\n\
}\n\
\n\
module.exports = Chart;\n\
//@ sourceURL=livechart/lib/chart.js"
));
require.register("livechart/lib/barchart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
var style = require ('style');\n\
\n\
var pl = parseInt(style('.livechart .barchart', 'padding-left'), 10);\n\
var pr = parseInt(style('.livechart .barchart', 'padding-right'), 10);\n\
var pb = parseInt(style('.livechart .barchart', 'padding-bottom'), 10);\n\
var pt = parseInt(style('.livechart .barchart', 'padding-top'), 10);\n\
var columnWidth = parseInt(style('.livechart .barchart .item', 'width'), 10);\n\
\n\
function BarChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('max', 100);\n\
  this.set('min', 0);\n\
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);\n\
  this.bars = [];\n\
}\n\
\n\
inherit(BarChart, Chart);\n\
\n\
BarChart.prototype.getRange = function(){\n\
  var minValue = min(this.bars, 'value');\n\
  var maxValue = max(this.bars, 'value');\n\
  minValue = Math.min(minValue, this.get('min'));\n\
  maxValue = Math.max(maxValue, this.get('max'));\n\
  this.set('min', minValue);\n\
  this.set('max', maxValue);\n\
  return {\n\
    min: minValue,\n\
    max: maxValue\n\
  }\n\
}\n\
\n\
BarChart.prototype.add = function(vs){\n\
  var bars = this.bars;\n\
  var init = (this.bars.length === 0);\n\
  if (init) {\n\
    vs.forEach(function(v, i) {\n\
      bars.push({\n\
        value: v,\n\
        index: i\n\
      });\n\
    })\n\
  }\n\
  else {\n\
    bars.forEach(function(bar) {\n\
      var v = vs[bar.index];\n\
      bar.value = v;\n\
    })\n\
  }\n\
  var r = this.getRange();\n\
  this.bars = this.bars.sort(function(a, b) {\n\
    return b.value - a.value;\n\
  })\n\
  var space = this.getSpace();\n\
  this.bars.forEach(function(bar, i) {\n\
    var tx= (i + 1) * space;\n\
    var ty = 0 - (this.height - pb - pt) * (bar.value - r.min)/(r.max - r.min);\n\
    bar.onFrame = this.tween({\n\
      x: bar.x || tx,\n\
      y: bar.y || 0\n\
    }, {\n\
      x: tx,\n\
      y: ty\n\
    })\n\
  }.bind(this));\n\
  this.start();\n\
}\n\
\n\
BarChart.prototype.getSpace = function(){\n\
  var count = this.get('labels').length;\n\
  return (this.width - pl)/(count + 1);\n\
}\n\
\n\
BarChart.prototype.draw = function(delta) {\n\
  this.bars.forEach(function(item) {\n\
    item.onFrame(delta);\n\
  })\n\
  var fontColor = this.styles.color;\n\
  var colors = this.get('colors');\n\
  var labels = this.get('labels');\n\
  var ctx = this.ctx;\n\
  var format = this.get('format');\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  ctx.translate(pl, -pb);\n\
  this.bars.forEach(function(item) {\n\
    var i = item.index;\n\
    ctx.fillStyle = colors[i];\n\
    ctx.fillRect(item.x - columnWidth/2, item.y, columnWidth, 0 - item.y);\n\
    //label\n\
    ctx.fillStyle = fontColor;\n\
    ctx.textAlign = 'center';\n\
    ctx.textBaseline = 'top';\n\
    var label = labels[i];\n\
    ctx.fillText(label, item.x, 4);\n\
    //value\n\
    ctx.textBaseline = 'bottom';\n\
    var v = format(item.value);\n\
    ctx.fillText(v, item.x, item.y - 4);\n\
  })\n\
  //bottom line\n\
  ctx.strokeStyle = fontColor;\n\
  ctx.beginPath();\n\
  ctx.moveTo(0, 0);\n\
  ctx.lineTo(this.width - pl - pr, 0);\n\
  ctx.stroke();\n\
  //title\n\
  var title = this.get('title');\n\
  ctx.textBaseline = 'top';\n\
  ctx.textAlign = 'center';\n\
  ctx.fillStyle = this.styles.titleColor;\n\
  ctx.font = this.styles.titleSize + ' helvetica';\n\
  ctx.fillText(title, (this.width - pl -pr)/2, - this.height + pb + 5);\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = BarChart;\n\
//@ sourceURL=livechart/lib/barchart.js"
));
require.register("livechart/lib/piechart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
\n\
function PieChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('colors', ['#F38630', '#E0E4CC', '#69D2E7', '#9D9B7F', '#F7464A', '#584A5E']);\n\
  this.items = [];\n\
}\n\
\n\
inherit(PieChart, Chart);\n\
\n\
PieChart.prototype.add = function(vs){\n\
  var items = this.items;\n\
  var init = (items.length === 0);\n\
  var total = vs.reduce(function(res, v) {\n\
    return res + v;\n\
  }, 0);\n\
  vs.forEach(function(v, i) {\n\
    if (init) {\n\
      items.push({ value: v/total });\n\
    } else {\n\
      items[i].value = v/total;\n\
    }\n\
  });\n\
  this.items.forEach(function(item, i) {\n\
    var a = item.value * Math.PI * 2;\n\
    item.onFrame = this.tween({\n\
      a: item.a || 0\n\
    }, {\n\
      a: a\n\
    })\n\
  }.bind(this));\n\
  this.start();\n\
}\n\
\n\
PieChart.prototype.draw = function(delta) {\n\
  this.items.forEach(function(item) {\n\
    item.onFrame(delta);\n\
  })\n\
  var fontColor = this.styles.color;\n\
  var colors = this.get('colors');\n\
  var w = Math.min(this.width, this.height);\n\
  var radius = (w - 10)/2;\n\
  var tx = (this.width - w)/2 + w/2;\n\
  var ty = (this.height - w)/2 + w/2;\n\
  var ctx = this.ctx;\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  ctx.strokeStyle = '#ffffff';\n\
  ctx.translate(tx, - ty);\n\
  ctx.lineWidth = 1;\n\
  ctx.rotate(- Math.PI/2);\n\
  this.items.forEach(function(item, i) {\n\
    var a = item.a;\n\
    ctx.fillStyle = colors[i];\n\
    ctx.beginPath();\n\
    ctx.moveTo(0, 0);\n\
    ctx.lineTo(radius, 0);\n\
    ctx.arc(0, 0, radius, 0, a, false);\n\
    ctx.fill();\n\
    ctx.beginPath();\n\
    ctx.moveTo(0, 0);\n\
    ctx.lineTo(radius, 0);\n\
    ctx.stroke();\n\
    ctx.rotate(a);\n\
  });\n\
  //draw text\n\
  ctx.textBaseline = 'middle';\n\
  ctx.textAlign = 'center';\n\
  ctx.fillStyle = '#ffffff';\n\
  var angle = 0;\n\
  ctx.rotate(Math.PI/2);\n\
  this.items.forEach(function(item) {\n\
    var a = angle + item.a/2;\n\
    angle += item.a;\n\
    if (item.value < 0.05) return;\n\
    var x = (radius/2) * Math.sin(a);\n\
    var y = - (radius/2) * Math.cos(a);\n\
    ctx.fillText((item.value * 100).toFixed(1), x, y);\n\
  })\n\
  this.drawLabels();\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = PieChart;\n\
//@ sourceURL=livechart/lib/piechart.js"
));
require.register("livechart/lib/linechart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
var style = require ('style');\n\
\n\
var pl = parseInt(style('.livechart .linechart', 'padding-left'), 10);\n\
var pr = parseInt(style('.livechart .linechart', 'padding-right'), 10);\n\
var pb = parseInt(style('.livechart .linechart', 'padding-bottom'), 10);\n\
var pt = parseInt(style('.livechart .linechart', 'padding-top'), 10);\n\
var radius = parseInt(style('.livechart .linechart', 'border-radius'), 10);\n\
\n\
function LineChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('count', 5);\n\
  this.set('colors', ['#F7464A', '#4A46F7']);\n\
}\n\
\n\
inherit(LineChart, Chart);\n\
\n\
LineChart.prototype.add = function(v){\n\
  v = ( v instanceof Array)? v : [v];\n\
  if (!this.series) {\n\
    this.series = v.map(function() {\n\
      return [];\n\
    });\n\
  }\n\
  v.forEach(function(d, i) {\n\
    this.series[i].push({\n\
      value: d\n\
    });\n\
  }.bind(this));\n\
  var count = this.get('count');\n\
  if (this.series[0].length > count + 1) {\n\
    this.series.forEach(function(ps) {\n\
      ps.shift();\n\
    });\n\
  }\n\
  var space = this.getSpace();\n\
  this.series.forEach(function(ps) {\n\
    ps.forEach(function(p, i) {\n\
      var v = p.value;\n\
      var ty = this.getY(v, ps);\n\
      var tx = (i + count - ps.length) * space;\n\
      if (!p.x) {\n\
        p.x = tx;\n\
        p.y = ty;\n\
        p.onFrame = function(){};\n\
      } else {\n\
        p.onFrame = this.tween({ x: p.x, y: p.y }, { x: tx, y: ty });\n\
      }\n\
    }.bind(this));\n\
  }.bind(this));\n\
  this.start();\n\
}\n\
\n\
LineChart.prototype.getSpace = function(){\n\
   return (this.width - pl - pr)/(this.get('count') - 1);\n\
}\n\
\n\
LineChart.prototype.getY = function(v, ps){\n\
  var minValue = min(ps, 'value');\n\
  var maxValue = max(ps, 'value');\n\
  var h = this.height - pb -2*pt;\n\
  if (minValue == maxValue) return - h/2;\n\
  var y = 0 - h * (v - minValue)/(maxValue - minValue);\n\
  return y;\n\
}\n\
\n\
LineChart.prototype.drawValues = function(p1, p2) {\n\
  var ctx = this.ctx;\n\
  var format = this.get('format');\n\
  ctx.textBaseline = 'bottom';\n\
  var top = p1.y <= p2.y ? p1 : p2;\n\
  var bottom = p1.y > p2.y ? p1 : p2;\n\
  var tv = format(top.value);\n\
  var bv = format(bottom.value);\n\
  ctx.fillText(tv, top.x, top.y - 5);\n\
  ctx.textBaseline = 'top';\n\
  ctx.fillText(bv, bottom.x, bottom.y + 5);\n\
}\n\
\n\
LineChart.prototype.drawLine = function(ps, i) {\n\
  var ctx = this.ctx;\n\
  var color = this.get('colors')[i];\n\
  ctx.fillStyle = color;\n\
  ctx.strokeStyle = color;\n\
  ctx.beginPath();\n\
  //ctx.shadowColor = 'rgb(153,153,153)';\n\
  //ctx.shadowOffsetY = 1;\n\
  //ctx.shadowBlur = 10;\n\
  ps.forEach(function(p, i) {\n\
    if (i === 0) {\n\
      ctx.moveTo(p.x, p.y);\n\
    } else {\n\
      ctx.lineTo(p.x, p.y);\n\
    }\n\
  })\n\
  ctx.stroke();\n\
}\n\
\n\
LineChart.prototype.draw = function(delta) {\n\
  this.series.forEach(function(ps) {\n\
    ps.forEach(function(p) {\n\
      p.onFrame(delta);\n\
    });\n\
  })\n\
  var count = this.get('count');\n\
  var ctx = this.ctx;\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  this.drawLabels();\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.translate(pl, -pb);\n\
  ctx.textAlign = 'center';\n\
  ctx.fillStyle = this.styles.color;\n\
  ctx.strokeStyle = this.styles.color;\n\
  if (this.series.length > 1) {\n\
    this.series[0].forEach(function(p1, i) {\n\
      var p2 = this.series[1][i];\n\
      this.drawValues(p1, p2);\n\
    }.bind(this));\n\
  } else {\n\
    var ps = this.series[0];\n\
    ps.forEach(function(p) {\n\
      var v = p.value;\n\
      ctx.fillText(v, p.x, p.y - 5);\n\
    })\n\
  }\n\
  //bottom line\n\
  ctx.beginPath();\n\
  var ly = pb - 15;\n\
  var lx = - (pl - 5);\n\
  ctx.moveTo(lx, ly);\n\
  ctx.lineTo(this.width - pl - 5 , ly);\n\
  ctx.stroke();\n\
  var space = this.getSpace();\n\
  ctx.textBaseline = 'top';\n\
  for (var i = 0; i < count; i++) {\n\
    var x = i * space;\n\
    ctx.beginPath();\n\
    ctx.moveTo(x, ly);\n\
    ctx.lineTo(x , ly + 2);\n\
    ctx.stroke();\n\
    ctx.fillText((count - 1 - i) , x, ly + 2);\n\
  }\n\
  this.series.forEach(function(ps, i) {\n\
    //line\n\
    this.drawLine(ps, i);\n\
    //point\n\
    ps.forEach(function(p) {\n\
      ctx.beginPath();\n\
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);\n\
      ctx.fill();\n\
    });\n\
  }.bind(this));\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = LineChart;\n\
//@ sourceURL=livechart/lib/linechart.js"
));
require.register("livechart/lib/areachart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
var style = require ('style');\n\
\n\
var pl = parseInt(style('.livechart .linechart', 'padding-left'), 10);\n\
var pr = parseInt(style('.livechart .linechart', 'padding-right'), 10);\n\
var pb = parseInt(style('.livechart .linechart', 'padding-bottom'), 10);\n\
var pt = parseInt(style('.livechart .linechart', 'padding-top'), 10);\n\
var radius = parseInt(style('.livechart .linechart', 'border-radius'), 10);\n\
\n\
function AreaChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('count', 10);\n\
  this.set('colors', ['#DCDCDC', '#97BBCD']);\n\
}\n\
\n\
inherit(AreaChart, Chart);\n\
\n\
AreaChart.prototype.add = function(v){\n\
  v = ( v instanceof Array)? v : [v];\n\
  if (!this.series) {\n\
    this.series = v.map(function() {\n\
      return [];\n\
    });\n\
  }\n\
  v.forEach(function(d, i) {\n\
    this.series[i].push({\n\
      value: d\n\
    });\n\
  }.bind(this));\n\
  var count = this.get('count');\n\
  if (this.series[0].length > count + 1) {\n\
    this.series.forEach(function(ps) {\n\
      ps.shift();\n\
    });\n\
  }\n\
  var space = this.getSpace();\n\
  this.series.forEach(function(ps) {\n\
    ps.forEach(function(p, i) {\n\
      var v = p.value;\n\
      var tx = (i + count - ps.length) * space;\n\
      var ty = this.getY(v, ps);\n\
      if (!p.x) {\n\
        p.x = tx;\n\
        p.y = ty;\n\
        p.onFrame = function(){};\n\
      } else {\n\
        p.onFrame = this.tween({ x: p.x, y: p.y }, { x: tx, y: ty });\n\
      }\n\
    }.bind(this));\n\
  }.bind(this))\n\
  this.start();\n\
}\n\
\n\
AreaChart.prototype.getSpace = function(){\n\
   return (this.width - pl - pr)/(this.get('count') - 1);\n\
}\n\
\n\
AreaChart.prototype.getY = function(v, ps){\n\
  var minValue = min(ps, 'value');\n\
  var maxValue = max(ps, 'value');\n\
  var h = this.height - pb -2*pt;\n\
  if (minValue == maxValue) return - h/2;\n\
  var y = 0 - h * (v - minValue)/(maxValue - minValue);\n\
  return y;\n\
}\n\
\n\
AreaChart.prototype.drawValues = function(p1, p2) {\n\
  var ctx = this.ctx;\n\
  var format = this.get('format');\n\
  ctx.textBaseline = 'bottom';\n\
  var top = p1.y <= p2.y ? p1 : p2;\n\
  var bottom = p1.y > p2.y ? p1 : p2;\n\
  var tv = format(top.value);\n\
  var bv = format(bottom.value);\n\
  ctx.fillText(tv, top.x, top.y - 5);\n\
  ctx.textBaseline = 'top';\n\
  ctx.fillText(bv, bottom.x, bottom.y + 5);\n\
}\n\
\n\
AreaChart.prototype.drawLine = function(ps, i) {\n\
  var ctx = this.ctx;\n\
  var color = this.get('colors')[i];\n\
  var rgb = this.toRgb(color);\n\
  ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', 0.5)';\n\
  ctx.strokeStyle = color;\n\
  ctx.beginPath();\n\
  //ctx.shadowColor = 'rgb(153,153,153)';\n\
  //ctx.shadowOffsetY = 1;\n\
  //ctx.shadowBlur = 10;\n\
  ctx.lineWidth = 2;\n\
  var space = this.getSpace();\n\
  ps.forEach(function(p, i) {\n\
    if (i === 0) {\n\
      ctx.moveTo(p.x, p.y);\n\
    } else {\n\
      var prev = ps[i - 1];\n\
      if (p.x - prev.x < space/2) {\n\
        ctx.lineTo(p.x, p.y);\n\
      } else{\n\
        ctx.bezierCurveTo(prev.x + space/2, prev.y, prev.x + space/2, p.y, p.x, p.y);\n\
      }\n\
    }\n\
  })\n\
  ctx.stroke();\n\
  ctx.lineTo(ps[ps.length - 1].x, 20);\n\
  ctx.lineTo(ps[0].x, 20);\n\
  ctx.fill();\n\
}\n\
\n\
AreaChart.prototype.draw = function(delta) {\n\
  this.series.forEach(function(ps) {\n\
    ps.forEach(function(p) {\n\
      p.onFrame(delta);\n\
    });\n\
  })\n\
  var count = this.get('count');\n\
  var ctx = this.ctx;\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  this.drawLabels();\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.translate(pl, -pb);\n\
  ctx.textAlign = 'center';\n\
  ctx.fillStyle = this.styles.color;\n\
  ctx.strokeStyle = this.styles.color;\n\
  if (this.series.length > 1) {\n\
    this.series[0].forEach(function(p1, i) {\n\
      var p2 = this.series[1][i];\n\
      this.drawValues(p1, p2);\n\
    }.bind(this));\n\
  } else {\n\
    var ps = this.series[0];\n\
    ps.forEach(function(p) {\n\
      var v = p.value;\n\
      ctx.fillText(v, p.x, p.y - 5);\n\
    })\n\
  }\n\
  //bottom line\n\
  ctx.beginPath();\n\
  var ly = pb - 15;\n\
  var lx = - (pl - 5);\n\
  ctx.moveTo(lx, ly);\n\
  ctx.lineTo(this.width - pl - 5 , ly);\n\
  ctx.stroke();\n\
  var space = this.getSpace();\n\
  ctx.textBaseline = 'top';\n\
  for (var i = 0; i < count; i++) {\n\
    var x = i * space;\n\
    ctx.beginPath();\n\
    ctx.moveTo(x, ly);\n\
    ctx.lineTo(x , ly + 2);\n\
    ctx.stroke();\n\
    ctx.fillText((count - 1 - i) , x, ly + 2);\n\
  }\n\
  this.series.forEach(function(ps, i) {\n\
    //line\n\
    this.drawLine(ps, i);\n\
    var color = this.get('colors')[i];\n\
    ctx.fillStyle = color;\n\
    //point\n\
    ps.forEach(function(p) {\n\
      ctx.beginPath();\n\
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);\n\
      ctx.fill();\n\
      ctx.beginPath();\n\
      ctx.strokeStyle = '#ffffff';\n\
      ctx.lineWidth = 1;\n\
      ctx.arc(p.x, p.y, radius + 1, 0, Math.PI*2, false);\n\
      ctx.stroke();\n\
    });\n\
  }.bind(this));\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = AreaChart;\n\
//@ sourceURL=livechart/lib/areachart.js"
));
require.register("livechart/lib/arcchart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
\n\
function ArcChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('colors', ['#97BBCD', '#DCDCDC']);\n\
  this.items = [];\n\
}\n\
\n\
inherit(ArcChart, Chart);\n\
\n\
ArcChart.prototype.add = function(vs){\n\
  if (typeof vs === 'number') vs = [vs];\n\
  var items = this.items;\n\
  var init = (items.length === 0);\n\
  vs.forEach(function(v, i) {\n\
    if (init) {\n\
      items.push({ value: v })\n\
    } else {\n\
      items[i].value = v;\n\
    }\n\
  });\n\
  this.items.forEach(function(item, i) {\n\
    var a = item.value * Math.PI * 2;\n\
    item.onFrame = this.tween({\n\
      a: item.a || 0\n\
    }, {\n\
      a: a\n\
    })\n\
  }.bind(this));\n\
  this.start();\n\
}\n\
\n\
ArcChart.prototype.draw = function(delta) {\n\
  this.items.forEach(function(item) {\n\
    item.onFrame(delta);\n\
  })\n\
  var fontColor = this.styles.color;\n\
  var colors = this.get('colors');\n\
  var w = Math.min(this.width, this.height);\n\
  var radius = (w - 10)/2;\n\
  var tx = (this.width - w)/2 + w/2;\n\
  var ty = (this.height - w)/2 + w/2;\n\
  var ctx = this.ctx;\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  ctx.translate(tx, - ty);\n\
  var width = 10;\n\
  var gap = 5;\n\
  this.items.forEach(function(item, i) {\n\
    var a = item.a;\n\
    var r = radius - (width + gap)*i;\n\
    var color = colors[i];\n\
    var rgb = this.toRgb(color);\n\
    ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', ' + item.value + ')';\n\
    ctx.strokeStyle = color;\n\
    ctx.beginPath();\n\
    ctx.moveTo(0, - (r - width));\n\
    ctx.lineTo(0 , - r);\n\
    ctx.arc(0, 0, r, - Math.PI/2, a - Math.PI/2, false);\n\
    ctx.lineTo((r - width)*Math.cos(a - Math.PI/2), (r - width)*Math.sin(a - Math.PI/2));\n\
    ctx.arc(0, 0, r - width, a - Math.PI/2, - Math.PI/2, true);\n\
    ctx.fill();\n\
    ctx.stroke();\n\
  }.bind(this));\n\
  //draw text\n\
  ctx.font = '20px helvetica';\n\
  if (this.items.length === 1) {\n\
    ctx.textBaseline = 'middle';\n\
    ctx.textAlign = 'center';\n\
    ctx.fillStyle = colors[0];\n\
    ctx.fillText((this.items[0].value*100).toFixed(1), 0, 0);\n\
  } else {\n\
    ctx.strokeStyle = '#eeeeee';\n\
    ctx.beginPath();\n\
    ctx.moveTo(15, - 15);\n\
    ctx.lineTo(- 15, 15);\n\
    ctx.stroke();\n\
    this.items.forEach(function(item, i) {\n\
      ctx.fillStyle = colors[i];\n\
      var text = (item.value * 100).toFixed(1);\n\
      if (i === 0) {\n\
        ctx.textBaseline = 'bottom';\n\
        ctx.textAlign = 'right';\n\
        ctx.fillText(text, 0 , 0);\n\
      } else {\n\
        ctx.textBaseline = 'top';\n\
        ctx.textAlign = 'left';\n\
        ctx.fillText(text, 0, 0);\n\
      }\n\
    })\n\
  }\n\
  this.drawLabels();\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = ArcChart;\n\
//@ sourceURL=livechart/lib/arcchart.js"
));
require.register("livechart/lib/polarchart.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
var style = require ('style');\n\
\n\
var fontSize = style('.livechart .polarchart .label', 'font-size');\n\
var color = style('.livechart .polarchart .label', 'color');\n\
var steps = [20, 40, 60, 80, 100];\n\
\n\
function PolarChart(parent){\n\
  Chart.call(this, parent);\n\
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);\n\
  this.items = [];\n\
}\n\
\n\
inherit(PolarChart, Chart);\n\
\n\
PolarChart.prototype.add = function(vs){\n\
  var items = this.items;\n\
  var init = (items.length === 0);\n\
  vs.forEach(function(v, i) {\n\
    if (init) { items.push({ r: 0 }) }\n\
    items[i].onFrame = this.tween({\n\
      r: items[i].r\n\
    }, {\n\
      r: v\n\
    });\n\
  }.bind(this));\n\
  this.start();\n\
}\n\
\n\
PolarChart.prototype.draw = function(delta) {\n\
  this.items.forEach(function(item) {\n\
    item.onFrame(delta);\n\
  })\n\
  var fontColor = this.styles.color;\n\
  var colors = this.get('colors');\n\
  var stepAngle = Math.PI * 2/this.items.length;\n\
  var w = Math.min(this.width, this.height);\n\
  var radius = (w - 10)/2;\n\
  var tx = (this.width - w)/2 + w/2;\n\
  var ty = (this.height - w)/2 + w/2;\n\
  var ctx = this.ctx;\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  ctx.translate(tx, - ty);\n\
  ctx.lineWidth = 1;\n\
  ctx.rotate(- Math.PI/2);\n\
  ctx.strokeStyle = '#ffffff';\n\
  this.items.forEach(function(item, i) {\n\
    var r = item.r;\n\
    var rgb = this.toRgb(colors[i]);\n\
    ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.9)';\n\
    ctx.beginPath();\n\
    ctx.moveTo(0, 0);\n\
    ctx.lineTo(radius, 0);\n\
    ctx.arc(0, 0, radius * r, 0, stepAngle, false);\n\
    ctx.fill();\n\
    ctx.beginPath();\n\
    ctx.moveTo(0, 0);\n\
    ctx.lineTo(radius, 0);\n\
    ctx.stroke();\n\
    ctx.rotate(stepAngle);\n\
  }.bind(this));\n\
  //draw circles\n\
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';\n\
  steps.forEach(function(v) {\n\
    ctx.beginPath();\n\
    ctx.arc(0, 0, radius * v/100, 0, Math.PI*2, false);\n\
    ctx.stroke();\n\
  })\n\
  ctx.rotate(Math.PI/2);\n\
  //draw text\n\
  ctx.textBaseline = 'middle';\n\
  ctx.textAlign = 'center';\n\
  ctx.font = fontSize + ' helvetica';\n\
  var size = parseInt(fontSize, 10);\n\
  steps.forEach(function(t) {\n\
    var w = ctx.measureText(t).width;\n\
    var y = - radius*t/100;\n\
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';\n\
    ctx.fillRect(- w/2 - 2, y - size/2 -2, w + 4, size + 4);\n\
    ctx.fillStyle = color;\n\
    ctx.fillText(t, 0, y);\n\
  })\n\
  this.drawLabels();\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = PolarChart;\n\
//@ sourceURL=livechart/lib/polarchart.js"
));
require.register("livechart/lib/histogram.js", Function("exports, require, module",
"var min = require ('min');\n\
var max = require ('max');\n\
var inherit = require('inherit');\n\
var Chart = require ('./chart');\n\
var style = require ('style');\n\
\n\
var pl = parseInt(style('.livechart .histogram', 'padding-left'), 10);\n\
var pr = parseInt(style('.livechart .histogram', 'padding-right'), 10);\n\
var pb = parseInt(style('.livechart .histogram', 'padding-bottom'), 10);\n\
var pt = parseInt(style('.livechart .histogram', 'padding-top'), 10);\n\
\n\
function Histogram(parent){\n\
  Chart.call(this, parent);\n\
  this.set('count', 50);\n\
  this.set('max', 100);\n\
  this.set('min', 0);\n\
  this.set('colors', ['#69D2E7']);\n\
  this.bars = [];\n\
  this.labels = [];\n\
}\n\
\n\
inherit(Histogram, Chart);\n\
\n\
Histogram.prototype.getRange = function(){\n\
  var minValue = min(this.bars, 'value');\n\
  var maxValue = max(this.bars, 'value');\n\
  minValue = Math.min(minValue, this.get('min'));\n\
  maxValue = Math.max(maxValue, this.get('max'));\n\
  this.set('min', minValue);\n\
  this.set('max', maxValue);\n\
  return {\n\
    min: minValue,\n\
    max: maxValue\n\
  }\n\
}\n\
\n\
Histogram.prototype.add = function(v){\n\
  var bars = this.bars;\n\
  var bar = { value: v };\n\
  var count = this.get('count');\n\
  bars.push(bar)\n\
  if (bars.length > count) {\n\
    bars.shift();\n\
  }\n\
  var r = this.getRange();\n\
  var space = this.getSpace();\n\
  bars.forEach(function(bar, i) {\n\
    var ty = 0 - (this.height - pb - pt) * (bar.value - r.min)/(r.max - r.min);\n\
    var tx= (i + count - bars.length) * space;\n\
    if (!bar.x) {\n\
      bar.x = tx;\n\
      bar.y = ty;\n\
      bar.onFrame = function() { }\n\
    } else {\n\
      bar.onFrame = this.tween({ x: bar.x, y: bar.y }, { x: tx, y: ty });\n\
    }\n\
  }.bind(this));\n\
  var ctx = this.ctx;\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  var d = this.getSpace();\n\
  var dw = ctx.measureText('00:00:00').width + 5;\n\
  var first = this.labels[0];\n\
  var last = this.labels[this.labels.length - 1];\n\
  var tw = this.width - pl - pr - space * 1/4;\n\
  if(first && first.x <= d) this.labels.shift();\n\
  this.labels.forEach(function(label) {\n\
    var x = label.x;\n\
    label.onFrame = this.tween({x: x}, {x: x - d});\n\
  }.bind(this));\n\
  if (this.labels.length === 0 || (last && (tw - last.x >= dw))) {\n\
    var s = currentTime();\n\
    this.labels.push({\n\
      text: s ,\n\
      x: tw,\n\
      onFrame: function(){ }\n\
    });\n\
  }\n\
  this.start();\n\
}\n\
\n\
Histogram.prototype.getSpace = function(){\n\
  var c = this.get('count');\n\
  return 2 * (this.width - pl - pr)/(c * 2 - 1);\n\
}\n\
\n\
function pad (v) {\n\
  return v.toString().length > 1? v.toString() : '0' + v;\n\
}\n\
\n\
function currentTime () {\n\
  var d = new Date();\n\
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());\n\
}\n\
\n\
function labelFormat (v) {\n\
  if (v > 1000) {\n\
    return (v/1000).toFixed(1) + 'k';\n\
  }\n\
  return v.toFixed(0);\n\
}\n\
\n\
Histogram.prototype.drawLabels = function() {\n\
  var ctx = this.ctx;\n\
  var space = this.getSpace();\n\
  ctx.strokeStyle = this.styles.color;\n\
  ctx.textAlign = 'center';\n\
  ctx.textBaseline = 'top';\n\
  ctx.fillStyle = this.styles.color;\n\
  this.labels.forEach(function(label) {\n\
    var x = label.x;\n\
    ctx.beginPath();\n\
    ctx.moveTo(x, 0);\n\
    ctx.lineTo(x, 5);\n\
    ctx.stroke();\n\
    ctx.fillText(label.text, x, 8);\n\
  }.bind(this));\n\
}\n\
\n\
Histogram.prototype.draw = function(delta) {\n\
  this.labels.forEach(function(label) {\n\
    label.onFrame(delta);\n\
  })\n\
  this.bars.forEach(function(bar) {\n\
    bar.onFrame(delta);\n\
  })\n\
  var count = this.get('count');\n\
  var color = this.get('colors')[0];\n\
  var w = this.getSpace()/2;\n\
  var ctx = this.ctx;\n\
  ctx.font = this.styles.fontSize + ' helvetica';\n\
  ctx.clearRect(0, - this.height, this.width, this.height);\n\
  ctx.save();\n\
  ctx.translate(pl, -pb);\n\
  ctx.fillStyle = color;\n\
  this.bars.forEach(function(item) {\n\
    ctx.fillRect(item.x, item.y, w, 0 - item.y);\n\
  })\n\
  //min & max\n\
  ctx.textAlign = 'right';\n\
  ctx.textBaseline = 'middle';\n\
  ctx.fillStyle = this.styles.color;\n\
  var min = this.get('min');\n\
  var max = this.get('max');\n\
  ctx.fillText(labelFormat(min), -2, 0);\n\
  ctx.textBaseline = 'top';\n\
  ctx.fillText(labelFormat(max), -2 , pb + pt - this.height);\n\
  //bottom line\n\
  ctx.strokeStyle = this.styles.color;\n\
  ctx.beginPath();\n\
  ctx.moveTo(0, 0);\n\
  ctx.lineTo(this.width - pl - 5 , 0);\n\
  ctx.stroke();\n\
  this.drawLabels();\n\
  ctx.restore();\n\
}\n\
\n\
module.exports = Histogram;\n\
//@ sourceURL=livechart/lib/histogram.js"
));




















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

require.alias("chemzqm-highlight.js/index.js", "livechart/deps/highlight.js/index.js");
require.alias("chemzqm-highlight.js/lib/1c.js", "livechart/deps/highlight.js/lib/1c.js");
require.alias("chemzqm-highlight.js/lib/actionscript.js", "livechart/deps/highlight.js/lib/actionscript.js");
require.alias("chemzqm-highlight.js/lib/apache.js", "livechart/deps/highlight.js/lib/apache.js");
require.alias("chemzqm-highlight.js/lib/applescript.js", "livechart/deps/highlight.js/lib/applescript.js");
require.alias("chemzqm-highlight.js/lib/avrasm.js", "livechart/deps/highlight.js/lib/avrasm.js");
require.alias("chemzqm-highlight.js/lib/axapta.js", "livechart/deps/highlight.js/lib/axapta.js");
require.alias("chemzqm-highlight.js/lib/bash.js", "livechart/deps/highlight.js/lib/bash.js");
require.alias("chemzqm-highlight.js/lib/brainfuck.js", "livechart/deps/highlight.js/lib/brainfuck.js");
require.alias("chemzqm-highlight.js/lib/clojure.js", "livechart/deps/highlight.js/lib/clojure.js");
require.alias("chemzqm-highlight.js/lib/cmake.js", "livechart/deps/highlight.js/lib/cmake.js");
require.alias("chemzqm-highlight.js/lib/coffeescript.js", "livechart/deps/highlight.js/lib/coffeescript.js");
require.alias("chemzqm-highlight.js/lib/cpp.js", "livechart/deps/highlight.js/lib/cpp.js");
require.alias("chemzqm-highlight.js/lib/cs.js", "livechart/deps/highlight.js/lib/cs.js");
require.alias("chemzqm-highlight.js/lib/css.js", "livechart/deps/highlight.js/lib/css.js");
require.alias("chemzqm-highlight.js/lib/d.js", "livechart/deps/highlight.js/lib/d.js");
require.alias("chemzqm-highlight.js/lib/delphi.js", "livechart/deps/highlight.js/lib/delphi.js");
require.alias("chemzqm-highlight.js/lib/diff.js", "livechart/deps/highlight.js/lib/diff.js");
require.alias("chemzqm-highlight.js/lib/django.js", "livechart/deps/highlight.js/lib/django.js");
require.alias("chemzqm-highlight.js/lib/dos.js", "livechart/deps/highlight.js/lib/dos.js");
require.alias("chemzqm-highlight.js/lib/erlang-repl.js", "livechart/deps/highlight.js/lib/erlang-repl.js");
require.alias("chemzqm-highlight.js/lib/erlang.js", "livechart/deps/highlight.js/lib/erlang.js");
require.alias("chemzqm-highlight.js/lib/glsl.js", "livechart/deps/highlight.js/lib/glsl.js");
require.alias("chemzqm-highlight.js/lib/go.js", "livechart/deps/highlight.js/lib/go.js");
require.alias("chemzqm-highlight.js/lib/haskell.js", "livechart/deps/highlight.js/lib/haskell.js");
require.alias("chemzqm-highlight.js/lib/highlight.js", "livechart/deps/highlight.js/lib/highlight.js");
require.alias("chemzqm-highlight.js/lib/http.js", "livechart/deps/highlight.js/lib/http.js");
require.alias("chemzqm-highlight.js/lib/ini.js", "livechart/deps/highlight.js/lib/ini.js");
require.alias("chemzqm-highlight.js/lib/java.js", "livechart/deps/highlight.js/lib/java.js");
require.alias("chemzqm-highlight.js/lib/javascript.js", "livechart/deps/highlight.js/lib/javascript.js");
require.alias("chemzqm-highlight.js/lib/json.js", "livechart/deps/highlight.js/lib/json.js");
require.alias("chemzqm-highlight.js/lib/lisp.js", "livechart/deps/highlight.js/lib/lisp.js");
require.alias("chemzqm-highlight.js/lib/lua.js", "livechart/deps/highlight.js/lib/lua.js");
require.alias("chemzqm-highlight.js/lib/markdown.js", "livechart/deps/highlight.js/lib/markdown.js");
require.alias("chemzqm-highlight.js/lib/matlab.js", "livechart/deps/highlight.js/lib/matlab.js");
require.alias("chemzqm-highlight.js/lib/mel.js", "livechart/deps/highlight.js/lib/mel.js");
require.alias("chemzqm-highlight.js/lib/nginx.js", "livechart/deps/highlight.js/lib/nginx.js");
require.alias("chemzqm-highlight.js/lib/objectivec.js", "livechart/deps/highlight.js/lib/objectivec.js");
require.alias("chemzqm-highlight.js/lib/parser3.js", "livechart/deps/highlight.js/lib/parser3.js");
require.alias("chemzqm-highlight.js/lib/perl.js", "livechart/deps/highlight.js/lib/perl.js");
require.alias("chemzqm-highlight.js/lib/php.js", "livechart/deps/highlight.js/lib/php.js");
require.alias("chemzqm-highlight.js/lib/profile.js", "livechart/deps/highlight.js/lib/profile.js");
require.alias("chemzqm-highlight.js/lib/python.js", "livechart/deps/highlight.js/lib/python.js");
require.alias("chemzqm-highlight.js/lib/r.js", "livechart/deps/highlight.js/lib/r.js");
require.alias("chemzqm-highlight.js/lib/rib.js", "livechart/deps/highlight.js/lib/rib.js");
require.alias("chemzqm-highlight.js/lib/rsl.js", "livechart/deps/highlight.js/lib/rsl.js");
require.alias("chemzqm-highlight.js/lib/ruby.js", "livechart/deps/highlight.js/lib/ruby.js");
require.alias("chemzqm-highlight.js/lib/rust.js", "livechart/deps/highlight.js/lib/rust.js");
require.alias("chemzqm-highlight.js/lib/scala.js", "livechart/deps/highlight.js/lib/scala.js");
require.alias("chemzqm-highlight.js/lib/smalltalk.js", "livechart/deps/highlight.js/lib/smalltalk.js");
require.alias("chemzqm-highlight.js/lib/sql.js", "livechart/deps/highlight.js/lib/sql.js");
require.alias("chemzqm-highlight.js/lib/tex.js", "livechart/deps/highlight.js/lib/tex.js");
require.alias("chemzqm-highlight.js/lib/vala.js", "livechart/deps/highlight.js/lib/vala.js");
require.alias("chemzqm-highlight.js/lib/vbscript.js", "livechart/deps/highlight.js/lib/vbscript.js");
require.alias("chemzqm-highlight.js/lib/vhdl.js", "livechart/deps/highlight.js/lib/vhdl.js");
require.alias("chemzqm-highlight.js/lib/xml.js", "livechart/deps/highlight.js/lib/xml.js");
require.alias("chemzqm-highlight.js/index.js", "livechart/deps/highlight.js/index.js");
require.alias("chemzqm-highlight.js/index.js", "highlight.js/index.js");
require.alias("chemzqm-highlight.js/index.js", "chemzqm-highlight.js/index.js");
require.alias("ui-component-resizable/index.js", "livechart/deps/resizable/index.js");
require.alias("ui-component-resizable/template.js", "livechart/deps/resizable/template.js");
require.alias("ui-component-resizable/resize.js", "livechart/deps/resizable/resize.js");
require.alias("ui-component-resizable/index.js", "resizable/index.js");
require.alias("ui-component-mouse/index.js", "ui-component-resizable/deps/mouse/index.js");
require.alias("component-emitter/index.js", "ui-component-mouse/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-event/index.js", "ui-component-mouse/deps/event/index.js");

require.alias("visionmedia-configurable.js/index.js", "ui-component-resizable/deps/configurable.js/index.js");

require.alias("component-emitter/index.js", "ui-component-resizable/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-domify/index.js", "ui-component-resizable/deps/domify/index.js");

require.alias("component-classes/index.js", "ui-component-resizable/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-merge/index.js", "ui-component-resizable/deps/merge/index.js");

require.alias("component-scroll-to/index.js", "livechart/deps/scroll-to/index.js");
require.alias("component-scroll-to/index.js", "livechart/deps/scroll-to/index.js");
require.alias("component-scroll-to/index.js", "scroll-to/index.js");
require.alias("component-raf/index.js", "component-scroll-to/deps/raf/index.js");

require.alias("component-tween/index.js", "component-scroll-to/deps/tween/index.js");
require.alias("component-emitter/index.js", "component-tween/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-ease/index.js", "component-tween/deps/ease/index.js");

require.alias("component-scroll-to/index.js", "component-scroll-to/index.js");
require.alias("component-ease/index.js", "livechart/deps/ease/index.js");
require.alias("component-ease/index.js", "ease/index.js");


require.alias("livechart/index.js", "livechart/index.js");