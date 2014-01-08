
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
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
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
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
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
require.register("pgherveou-modelarray/index.js", Function("exports, require, module",
"/*!\n\
 * dependencies\n\
 */\n\
\n\
var emitter = require('emitter');\n\
\n\
/**\n\
 * ModelArray Constructor\n\
 * @param {Array} values\n\
 * @param {[Object]} model item Model constructor\n\
 * @inherits EventEmitter\n\
 *\n\
 * Examples:\n\
 *     jeremy = new User({id: 1, name: 'jeremy'});\n\
 *     mehdi = new User({id: 2, name: 'mehdi'});\n\
 *     pg = new User({id: 3, name: 'pg'});\n\
 *     thomas = new User({id: 4, name: 'thomas'});\n\
 *\n\
 *     // use Users items...\n\
 *     var users = new modelArray([pg, mehdi, jeremy], User);\n\
 *\n\
 *     // or String, Numbers Object or any pojo\n\
 *     var strs = new ModelArray(['pg', 'mehdi', 'jeremy']);\n\
 *\n\
 *     // listen to add event\n\
 *     users.on('add', function (models) {\n\
 *        // ...\n\
 *     });\n\
 *\n\
 *     // will cast items, remove duplicate, and trigger a add event..\n\
 *     models.push(pg, thomas, {id: 5, name: jareen});\n\
 *\n\
 *     // will remove event..\n\
 *     models.remove(jeremy, mehdi);\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function ModelArray (values, model) {\n\
  var arr = [];\n\
  arr.__proto__ = this;\n\
  Object.defineProperty(this, '_silent', {});\n\
  Object.defineProperty(this, '_callbacks', {value: Object.create(null)});\n\
  Object.defineProperty(this, '_byId', {value: Object.create(null)});\n\
  Object.defineProperty(this, 'model', {value: model});\n\
  if (values && Array.isArray(values)) {\n\
    arr.silent().push.apply(arr, values);\n\
  } else if (values) {\n\
    arr.silent().push.call(arr, values);\n\
  }\n\
  return arr;\n\
}\n\
\n\
/*!\n\
 * Inherit from Array & mixin with emitter\n\
 */\n\
\n\
ModelArray.prototype = emitter([]);\n\
\n\
/*!\n\
 * expose ModelArray\n\
 */\n\
\n\
module.exports = ModelArray;\n\
\n\
/**\n\
 * Item constructor class\n\
 *\n\
 * if your item has a set method, it will be use\n\
 * to update references when calling arrayItem.set()\n\
 *\n\
 * @property model\n\
 */\n\
\n\
ModelArray.prototype.model;\n\
\n\
/**\n\
 * cast arguments and create a unique list of values\n\
 * that are not already in this array\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function _uniq() {\n\
  var list = [], ids = Object.create(null);\n\
\n\
  [].forEach.call(arguments, function (obj) {\n\
    // ignore item already in array\n\
    if (this.get(obj)) return;\n\
\n\
    // cast object\n\
    var model = this._cast(obj),\n\
        id = model.id || model.cid || model;\n\
\n\
    // make sure we don't add it twice\n\
    if (ids[id]) return;\n\
\n\
    list.push(model);\n\
    if ('object' !== typeof id) ids[id] = true;\n\
  }, this);\n\
\n\
  return list;\n\
}\n\
\n\
/**\n\
 * cast obj to this array model\n\
 *\n\
 * @param  {Object} obj\n\
 * @return the casted value\n\
 * @api private\n\
 */\n\
\n\
ModelArray.prototype._cast = function (obj) {\n\
  if (!this.model) return obj;\n\
  if (obj instanceof this.model) return obj;\n\
  return new this.model(obj);\n\
};\n\
\n\
/**\n\
 * silent next operation\n\
 *\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.silent = function (v) {\n\
  if (v === undefined) v = true;\n\
  this._silent = v;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Wraps [`Emitter#emit`](https://github.com/component/emitter#emit)\n\
 * emit event when silent flag is off\n\
 *\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.emit = function () {\n\
  if (this._silent) {\n\
    this._silent = false;\n\
  } else {\n\
    emitter.prototype.emit.apply(this, arguments);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * index models\n\
 *\n\
 * @param {Object} [args...]\n\
 * @api private\n\
 */\n\
\n\
ModelArray.prototype.index = function () {\n\
  var value;\n\
  [].forEach.call(arguments, function (m) {\n\
    if (m.id) this._byId[m.id] = m;\n\
    if (m.cid) this._byId[m.cid] = m;\n\
    if (!m.id && !m.cid && ('object' !== typeof (value = m.valueOf()))) {\n\
      this._byId[value] = m;\n\
    }\n\
  }, this);\n\
};\n\
\n\
/**\n\
 * remove models indexes\n\
 *\n\
 * @param {Object} [args...]\n\
 * @api private\n\
 */\n\
\n\
ModelArray.prototype.unindex = function () {\n\
  [].forEach.call(arguments, function (m) {\n\
    if (m.id) delete this._byId[m.id];\n\
    if (m.cid) delete this._byId[m.cid];\n\
    if (!m.id && !m.cid) delete this._byId[m.valueOf()];\n\
  }, this);\n\
};\n\
\n\
/**\n\
 * Get a model from the array.\n\
 *\n\
 * @param {Object} value an id or model\n\
 * @return {Model}\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.get = function (obj) {\n\
  if (!obj) return;\n\
  var id = obj.id || obj.cid || obj.valueOf();\n\
  if (id && 'object' !== typeof(id)) return this._byId[id];\n\
  return this[this.indexOf(id)];\n\
};\n\
\n\
/**\n\
 * Alias of get\n\
 */\n\
\n\
ModelArray.prototype.id = ModelArray.prototype.get;\n\
\n\
/**\n\
 * remove item from the array\n\
 *\n\
 * @param {Object} [args...]\n\
 * @event remove\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.remove = function () {\n\
  var toRemove = [];\n\
\n\
  [].forEach.call(arguments, function (model) {\n\
    model = this.get(model);\n\
    if (!model) return;\n\
    toRemove.push(model);\n\
    this.unindex(model);\n\
    [].splice.call(this, this.indexOf(model), 1);\n\
  }, this);\n\
\n\
  // trigger events\n\
  if (toRemove.length) {\n\
    this.emit('remove', toRemove, this);\n\
  } else {\n\
    this.silent(false);\n\
  }\n\
\n\
  return toRemove;\n\
};\n\
\n\
/**\n\
 * sync modelArray with specifed models\n\
 *\n\
 * @param {Array} models\n\
 * @event add\n\
 * @event remove\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.set = function (models) {\n\
  var toAdd = [],\n\
      toRemove = [],\n\
      ids = [],\n\
      silent = !!this._silent,\n\
      id;\n\
\n\
  // normalize to array\n\
  if (!Array.isArray(models)) models = [models];\n\
\n\
  // update, flag items to add/remove\n\
  models\n\
    .map(this._cast, this)\n\
    .forEach(function (model) {\n\
      var existing = this.get(model);\n\
      if (existing) {\n\
        ids.push(existing.id || existing.cid || existing.valueOf());\n\
        if (existing.set) {\n\
          existing.set(model);\n\
        } else {\n\
          this.unindex(existing);\n\
          this.index(model);\n\
          this[this.indexOf(existing)] = model;\n\
        }\n\
      } else  {\n\
        toAdd.push(model);\n\
      }\n\
    }, this);\n\
\n\
  // get models to remove\n\
  this.forEach(function (model) {\n\
    id = model.id || model.cid || model.valueOf();\n\
    if (ids.indexOf(id) === -1) toRemove.push(model);\n\
  });\n\
\n\
  // remove & add models\n\
  if (toRemove.length) this.silent(silent).remove.apply(this, toRemove);\n\
  if (toAdd.length) this.silent(silent).push.apply(this, toAdd);\n\
  this.silent(false);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * reset items in array\n\
 *\n\
 * @param {Array} reinitialize the array with the one specified here\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.reset = function (models) {\n\
  [].splice.call(this, 0, this.length);\n\
  this._byId = Object.create(null);\n\
  this.silent().push(models);\n\
  this.emit('reset', models, this);\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push)\n\
 *\n\
 * @event remove\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.push = function () {\n\
  var values,\n\
      ret;\n\
\n\
  values = _uniq.apply(this, arguments);\n\
  ret = [].push.apply(this, values);\n\
  this.index.apply(this, values);\n\
\n\
  // trigger events\n\
  if (values.length) {\n\
    this.emit('add', values, this);\n\
  } else {\n\
    this.silent(false);\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#pop`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop)\n\
 *\n\
 * @event remove\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.pop = function () {\n\
  var model = [].pop.call(this);\n\
  this.unindex(model);\n\
\n\
  // trigger event\n\
  if (model) {\n\
    this.emit('remove', model, this);\n\
  } else {\n\
    this.silent(false);\n\
  }\n\
\n\
  return model;\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#splice`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice)\n\
 *\n\
 * @event remove\n\
 * @event add\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.splice = function () {\n\
  var silent = !!this._silent,\n\
      ret, vals, toRemove, toAdd;\n\
\n\
  if (arguments.length) {\n\
    vals = [].slice.call(arguments, 0, 2);\n\
    toRemove = [].splice.apply(this, vals);\n\
\n\
    toAdd = _uniq.apply(this, [].slice.call(arguments, 2));\n\
    [].splice.apply(this, [arguments[0], 0].concat(toAdd));\n\
\n\
    // update indexes\n\
    this.unindex.apply(this, toRemove);\n\
    this.index.apply(this, toAdd);\n\
  }\n\
  if (toRemove.length) this.silent(silent).emit('remove', toRemove, this);\n\
  if (toAdd.length) this.silent(silent).emit('add', toAdd, this);\n\
  this.silent(false);\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#unshift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift)\n\
 *\n\
 * @event add\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.unshift = function () {\n\
  var values,\n\
      ret;\n\
\n\
  values = _uniq.apply(this, arguments);\n\
  ret = [].unshift.apply(this, values);\n\
  this.index.apply(this, values);\n\
\n\
  // trigger event\n\
  if (values.length) {\n\
    this.emit('add', values, this);\n\
  } else {\n\
    this.silent(false);\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#shit`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift)\n\
 *\n\
 * @event remove\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.shift = function () {\n\
  var model = [].shift.call(this);\n\
  this.unindex(model);\n\
\n\
  // trigger event\n\
  if (model) {\n\
    this.emit('remove', model, this);\n\
  } else {\n\
    this.silent(false);\n\
  }\n\
\n\
  return model;\n\
};\n\
\n\
/**\n\
 * Wraps [`Array#sort`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)\n\
 *\n\
 * @event sort\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.sort = function (fn) {\n\
  var compare = fn || (this.model && this.model.prototype && this.model.prototype.compare),\n\
      ret = [].sort.call(this, compare);\n\
  this.emit('sort', this);\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Create JSON representation of this array\n\
 *\n\
 * @api public\n\
 */\n\
\n\
ModelArray.prototype.toJSON = function () {\n\
  return this.map(function (model) {\n\
    return model.toJSON ? model.toJSON() : model;\n\
  });\n\
};\n\
//@ sourceURL=pgherveou-modelarray/index.js"
));
require.register("chaijs-assertion-error/index.js", Function("exports, require, module",
"/*!\n\
 * assertion-error\n\
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Return a function that will copy properties from\n\
 * one object to another excluding any originally\n\
 * listed. Returned function will create a new `{}`.\n\
 *\n\
 * @param {String} excluded properties ...\n\
 * @return {Function}\n\
 */\n\
\n\
function exclude () {\n\
  var excludes = [].slice.call(arguments);\n\
\n\
  function excludeProps (res, obj) {\n\
    Object.keys(obj).forEach(function (key) {\n\
      if (!~excludes.indexOf(key)) res[key] = obj[key];\n\
    });\n\
  }\n\
\n\
  return function extendExclude () {\n\
    var args = [].slice.call(arguments)\n\
      , i = 0\n\
      , res = {};\n\
\n\
    for (; i < args.length; i++) {\n\
      excludeProps(res, args[i]);\n\
    }\n\
\n\
    return res;\n\
  };\n\
};\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
module.exports = AssertionError;\n\
\n\
/**\n\
 * ### AssertionError\n\
 *\n\
 * An extension of the JavaScript `Error` constructor for\n\
 * assertion and validation scenarios.\n\
 *\n\
 * @param {String} message\n\
 * @param {Object} properties to include (optional)\n\
 * @param {callee} start stack function (optional)\n\
 */\n\
\n\
function AssertionError (message, _props, ssf) {\n\
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')\n\
    , props = extend(_props || {});\n\
\n\
  // default values\n\
  this.message = message || 'Unspecified AssertionError';\n\
  this.showDiff = false;\n\
\n\
  // copy from properties\n\
  for (var key in props) {\n\
    this[key] = props[key];\n\
  }\n\
\n\
  // capture stack trace\n\
  ssf = ssf || arguments.callee;\n\
  if (ssf && Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, ssf);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Inherit from Error.prototype\n\
 */\n\
\n\
AssertionError.prototype = Object.create(Error.prototype);\n\
\n\
/*!\n\
 * Statically set name\n\
 */\n\
\n\
AssertionError.prototype.name = 'AssertionError';\n\
\n\
/*!\n\
 * Ensure correct constructor\n\
 */\n\
\n\
AssertionError.prototype.constructor = AssertionError;\n\
\n\
/**\n\
 * Allow errors to be converted to JSON for static transfer.\n\
 *\n\
 * @param {Boolean} include stack (default: `true`)\n\
 * @return {Object} object that can be `JSON.stringify`\n\
 */\n\
\n\
AssertionError.prototype.toJSON = function (stack) {\n\
  var extend = exclude('constructor', 'toJSON', 'stack')\n\
    , props = extend({ name: this.name }, this);\n\
\n\
  // include stack if exists and not turned off\n\
  if (false !== stack && this.stack) {\n\
    props.stack = this.stack;\n\
  }\n\
\n\
  return props;\n\
};\n\
//@ sourceURL=chaijs-assertion-error/index.js"
));
require.register("chaijs-chai/index.js", Function("exports, require, module",
"module.exports = require('./lib/chai');\n\
//@ sourceURL=chaijs-chai/index.js"
));
require.register("chaijs-chai/lib/chai.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var used = []\n\
  , exports = module.exports = {};\n\
\n\
/*!\n\
 * Chai version\n\
 */\n\
\n\
exports.version = '1.7.2';\n\
\n\
/*!\n\
 * Assertion Error\n\
 */\n\
\n\
exports.AssertionError = require('assertion-error');\n\
\n\
/*!\n\
 * Utils for plugins (not exported)\n\
 */\n\
\n\
var util = require('./chai/utils');\n\
\n\
/**\n\
 * # .use(function)\n\
 *\n\
 * Provides a way to extend the internals of Chai\n\
 *\n\
 * @param {Function}\n\
 * @returns {this} for chaining\n\
 * @api public\n\
 */\n\
\n\
exports.use = function (fn) {\n\
  if (!~used.indexOf(fn)) {\n\
    fn(this, util);\n\
    used.push(fn);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/*!\n\
 * Primary `Assertion` prototype\n\
 */\n\
\n\
var assertion = require('./chai/assertion');\n\
exports.use(assertion);\n\
\n\
/*!\n\
 * Core Assertions\n\
 */\n\
\n\
var core = require('./chai/core/assertions');\n\
exports.use(core);\n\
\n\
/*!\n\
 * Expect interface\n\
 */\n\
\n\
var expect = require('./chai/interface/expect');\n\
exports.use(expect);\n\
\n\
/*!\n\
 * Should interface\n\
 */\n\
\n\
var should = require('./chai/interface/should');\n\
exports.use(should);\n\
\n\
/*!\n\
 * Assert interface\n\
 */\n\
\n\
var assert = require('./chai/interface/assert');\n\
exports.use(assert);\n\
//@ sourceURL=chaijs-chai/lib/chai.js"
));
require.register("chaijs-chai/lib/chai/assertion.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (_chai, util) {\n\
  /*!\n\
   * Module dependencies.\n\
   */\n\
\n\
  var AssertionError = _chai.AssertionError\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  _chai.Assertion = Assertion;\n\
\n\
  /*!\n\
   * Assertion Constructor\n\
   *\n\
   * Creates object for chaining.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  function Assertion (obj, msg, stack) {\n\
    flag(this, 'ssfi', stack || arguments.callee);\n\
    flag(this, 'object', obj);\n\
    flag(this, 'message', msg);\n\
  }\n\
\n\
  /*!\n\
    * ### Assertion.includeStack\n\
    *\n\
    * User configurable property, influences whether stack trace\n\
    * is included in Assertion error message. Default of false\n\
    * suppresses stack trace in the error message\n\
    *\n\
    *     Assertion.includeStack = true;  // enable stack on error\n\
    *\n\
    * @api public\n\
    */\n\
\n\
  Assertion.includeStack = false;\n\
\n\
  /*!\n\
   * ### Assertion.showDiff\n\
   *\n\
   * User configurable property, influences whether or not\n\
   * the `showDiff` flag should be included in the thrown\n\
   * AssertionErrors. `false` will always be `false`; `true`\n\
   * will be true when the assertion has requested a diff\n\
   * be shown.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.showDiff = true;\n\
\n\
  Assertion.addProperty = function (name, fn) {\n\
    util.addProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addMethod = function (name, fn) {\n\
    util.addMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  Assertion.overwriteProperty = function (name, fn) {\n\
    util.overwriteProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteMethod = function (name, fn) {\n\
    util.overwriteMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  /*!\n\
   * ### .assert(expression, message, negateMessage, expected, actual)\n\
   *\n\
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.\n\
   *\n\
   * @name assert\n\
   * @param {Philosophical} expression to be tested\n\
   * @param {String} message to display if fails\n\
   * @param {String} negatedMessage to display if negated expression fails\n\
   * @param {Mixed} expected value (remember to check for negation)\n\
   * @param {Mixed} actual (optional) will default to `this.obj`\n\
   * @api private\n\
   */\n\
\n\
  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {\n\
    var ok = util.test(this, arguments);\n\
    if (true !== showDiff) showDiff = false;\n\
    if (true !== Assertion.showDiff) showDiff = false;\n\
\n\
    if (!ok) {\n\
      var msg = util.getMessage(this, arguments)\n\
        , actual = util.getActual(this, arguments);\n\
      throw new AssertionError(msg, {\n\
          actual: actual\n\
        , expected: expected\n\
        , showDiff: showDiff\n\
      }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));\n\
    }\n\
  };\n\
\n\
  /*!\n\
   * ### ._obj\n\
   *\n\
   * Quick reference to stored `actual` value for plugin developers.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Object.defineProperty(Assertion.prototype, '_obj',\n\
    { get: function () {\n\
        return flag(this, 'object');\n\
      }\n\
    , set: function (val) {\n\
        flag(this, 'object', val);\n\
      }\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/assertion.js"
));
require.register("chaijs-chai/lib/chai/core/assertions.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, _) {\n\
  var Assertion = chai.Assertion\n\
    , toString = Object.prototype.toString\n\
    , flag = _.flag;\n\
\n\
  /**\n\
   * ### Language Chains\n\
   *\n\
   * The following are provide as chainable getters to\n\
   * improve the readability of your assertions. They\n\
   * do not provide an testing capability unless they\n\
   * have been overwritten by a plugin.\n\
   *\n\
   * **Chains**\n\
   *\n\
   * - to\n\
   * - be\n\
   * - been\n\
   * - is\n\
   * - that\n\
   * - and\n\
   * - have\n\
   * - with\n\
   * - at\n\
   * - of\n\
   * - same\n\
   *\n\
   * @name language chains\n\
   * @api public\n\
   */\n\
\n\
  [ 'to', 'be', 'been'\n\
  , 'is', 'and', 'have'\n\
  , 'with', 'that', 'at'\n\
  , 'of', 'same' ].forEach(function (chain) {\n\
    Assertion.addProperty(chain, function () {\n\
      return this;\n\
    });\n\
  });\n\
\n\
  /**\n\
   * ### .not\n\
   *\n\
   * Negates any of assertions following in the chain.\n\
   *\n\
   *     expect(foo).to.not.equal('bar');\n\
   *     expect(goodFn).to.not.throw(Error);\n\
   *     expect({ foo: 'baz' }).to.have.property('foo')\n\
   *       .and.not.equal('bar');\n\
   *\n\
   * @name not\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('not', function () {\n\
    flag(this, 'negate', true);\n\
  });\n\
\n\
  /**\n\
   * ### .deep\n\
   *\n\
   * Sets the `deep` flag, later used by the `equal` and\n\
   * `property` assertions.\n\
   *\n\
   *     expect(foo).to.deep.equal({ bar: 'baz' });\n\
   *     expect({ foo: { bar: { baz: 'quux' } } })\n\
   *       .to.have.deep.property('foo.bar.baz', 'quux');\n\
   *\n\
   * @name deep\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('deep', function () {\n\
    flag(this, 'deep', true);\n\
  });\n\
\n\
  /**\n\
   * ### .a(type)\n\
   *\n\
   * The `a` and `an` assertions are aliases that can be\n\
   * used either as language chains or to assert a value's\n\
   * type.\n\
   *\n\
   *     // typeof\n\
   *     expect('test').to.be.a('string');\n\
   *     expect({ foo: 'bar' }).to.be.an('object');\n\
   *     expect(null).to.be.a('null');\n\
   *     expect(undefined).to.be.an('undefined');\n\
   *\n\
   *     // language chain\n\
   *     expect(foo).to.be.an.instanceof(Foo);\n\
   *\n\
   * @name a\n\
   * @alias an\n\
   * @param {String} type\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function an (type, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    type = type.toLowerCase();\n\
    var obj = flag(this, 'object')\n\
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';\n\
\n\
    this.assert(\n\
        type === _.type(obj)\n\
      , 'expected #{this} to be ' + article + type\n\
      , 'expected #{this} not to be ' + article + type\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('an', an);\n\
  Assertion.addChainableMethod('a', an);\n\
\n\
  /**\n\
   * ### .include(value)\n\
   *\n\
   * The `include` and `contain` assertions can be used as either property\n\
   * based language chains or as methods to assert the inclusion of an object\n\
   * in an array or a substring in a string. When used as language chains,\n\
   * they toggle the `contain` flag for the `keys` assertion.\n\
   *\n\
   *     expect([1,2,3]).to.include(2);\n\
   *     expect('foobar').to.contain('foo');\n\
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');\n\
   *\n\
   * @name include\n\
   * @alias contain\n\
   * @param {Object|String|Number} obj\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function includeChainingBehavior () {\n\
    flag(this, 'contains', true);\n\
  }\n\
\n\
  function include (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
    this.assert(\n\
        ~obj.indexOf(val)\n\
      , 'expected #{this} to include ' + _.inspect(val)\n\
      , 'expected #{this} to not include ' + _.inspect(val));\n\
  }\n\
\n\
  Assertion.addChainableMethod('include', include, includeChainingBehavior);\n\
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);\n\
\n\
  /**\n\
   * ### .ok\n\
   *\n\
   * Asserts that the target is truthy.\n\
   *\n\
   *     expect('everthing').to.be.ok;\n\
   *     expect(1).to.be.ok;\n\
   *     expect(false).to.not.be.ok;\n\
   *     expect(undefined).to.not.be.ok;\n\
   *     expect(null).to.not.be.ok;\n\
   *\n\
   * @name ok\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('ok', function () {\n\
    this.assert(\n\
        flag(this, 'object')\n\
      , 'expected #{this} to be truthy'\n\
      , 'expected #{this} to be falsy');\n\
  });\n\
\n\
  /**\n\
   * ### .true\n\
   *\n\
   * Asserts that the target is `true`.\n\
   *\n\
   *     expect(true).to.be.true;\n\
   *     expect(1).to.not.be.true;\n\
   *\n\
   * @name true\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('true', function () {\n\
    this.assert(\n\
        true === flag(this, 'object')\n\
      , 'expected #{this} to be true'\n\
      , 'expected #{this} to be false'\n\
      , this.negate ? false : true\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .false\n\
   *\n\
   * Asserts that the target is `false`.\n\
   *\n\
   *     expect(false).to.be.false;\n\
   *     expect(0).to.not.be.false;\n\
   *\n\
   * @name false\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('false', function () {\n\
    this.assert(\n\
        false === flag(this, 'object')\n\
      , 'expected #{this} to be false'\n\
      , 'expected #{this} to be true'\n\
      , this.negate ? true : false\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .null\n\
   *\n\
   * Asserts that the target is `null`.\n\
   *\n\
   *     expect(null).to.be.null;\n\
   *     expect(undefined).not.to.be.null;\n\
   *\n\
   * @name null\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('null', function () {\n\
    this.assert(\n\
        null === flag(this, 'object')\n\
      , 'expected #{this} to be null'\n\
      , 'expected #{this} not to be null'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .undefined\n\
   *\n\
   * Asserts that the target is `undefined`.\n\
   *\n\
   *     expect(undefined).to.be.undefined;\n\
   *     expect(null).to.not.be.undefined;\n\
   *\n\
   * @name undefined\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('undefined', function () {\n\
    this.assert(\n\
        undefined === flag(this, 'object')\n\
      , 'expected #{this} to be undefined'\n\
      , 'expected #{this} not to be undefined'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .exist\n\
   *\n\
   * Asserts that the target is neither `null` nor `undefined`.\n\
   *\n\
   *     var foo = 'hi'\n\
   *       , bar = null\n\
   *       , baz;\n\
   *\n\
   *     expect(foo).to.exist;\n\
   *     expect(bar).to.not.exist;\n\
   *     expect(baz).to.not.exist;\n\
   *\n\
   * @name exist\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('exist', function () {\n\
    this.assert(\n\
        null != flag(this, 'object')\n\
      , 'expected #{this} to exist'\n\
      , 'expected #{this} to not exist'\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .empty\n\
   *\n\
   * Asserts that the target's length is `0`. For arrays, it checks\n\
   * the `length` property. For objects, it gets the count of\n\
   * enumerable keys.\n\
   *\n\
   *     expect([]).to.be.empty;\n\
   *     expect('').to.be.empty;\n\
   *     expect({}).to.be.empty;\n\
   *\n\
   * @name empty\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('empty', function () {\n\
    var obj = flag(this, 'object')\n\
      , expected = obj;\n\
\n\
    if (Array.isArray(obj) || 'string' === typeof object) {\n\
      expected = obj.length;\n\
    } else if (typeof obj === 'object') {\n\
      expected = Object.keys(obj).length;\n\
    }\n\
\n\
    this.assert(\n\
        !expected\n\
      , 'expected #{this} to be empty'\n\
      , 'expected #{this} not to be empty'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .arguments\n\
   *\n\
   * Asserts that the target is an arguments object.\n\
   *\n\
   *     function test () {\n\
   *       expect(arguments).to.be.arguments;\n\
   *     }\n\
   *\n\
   * @name arguments\n\
   * @alias Arguments\n\
   * @api public\n\
   */\n\
\n\
  function checkArguments () {\n\
    var obj = flag(this, 'object')\n\
      , type = Object.prototype.toString.call(obj);\n\
    this.assert(\n\
        '[object Arguments]' === type\n\
      , 'expected #{this} to be arguments but got ' + type\n\
      , 'expected #{this} to not be arguments'\n\
    );\n\
  }\n\
\n\
  Assertion.addProperty('arguments', checkArguments);\n\
  Assertion.addProperty('Arguments', checkArguments);\n\
\n\
  /**\n\
   * ### .equal(value)\n\
   *\n\
   * Asserts that the target is strictly equal (`===`) to `value`.\n\
   * Alternately, if the `deep` flag is set, asserts that\n\
   * the target is deeply equal to `value`.\n\
   *\n\
   *     expect('hello').to.equal('hello');\n\
   *     expect(42).to.equal(42);\n\
   *     expect(1).to.not.equal(true);\n\
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });\n\
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });\n\
   *\n\
   * @name equal\n\
   * @alias equals\n\
   * @alias eq\n\
   * @alias deep.equal\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEqual (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'deep')) {\n\
      return this.eql(val);\n\
    } else {\n\
      this.assert(\n\
          val === obj\n\
        , 'expected #{this} to equal #{exp}'\n\
        , 'expected #{this} to not equal #{exp}'\n\
        , val\n\
        , this._obj\n\
        , true\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('equal', assertEqual);\n\
  Assertion.addMethod('equals', assertEqual);\n\
  Assertion.addMethod('eq', assertEqual);\n\
\n\
  /**\n\
   * ### .eql(value)\n\
   *\n\
   * Asserts that the target is deeply equal to `value`.\n\
   *\n\
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });\n\
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);\n\
   *\n\
   * @name eql\n\
   * @alias eqls\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEql(obj, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    this.assert(\n\
        _.eql(obj, flag(this, 'object'))\n\
      , 'expected #{this} to deeply equal #{exp}'\n\
      , 'expected #{this} to not deeply equal #{exp}'\n\
      , obj\n\
      , this._obj\n\
      , true\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('eql', assertEql);\n\
  Assertion.addMethod('eqls', assertEql);\n\
\n\
  /**\n\
   * ### .above(value)\n\
   *\n\
   * Asserts that the target is greater than `value`.\n\
   *\n\
   *     expect(10).to.be.above(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *\n\
   * @name above\n\
   * @alias gt\n\
   * @alias greaterThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertAbove (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len > n\n\
        , 'expected #{this} to have a length above #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj > n\n\
        , 'expected #{this} to be above ' + n\n\
        , 'expected #{this} to be at most ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('above', assertAbove);\n\
  Assertion.addMethod('gt', assertAbove);\n\
  Assertion.addMethod('greaterThan', assertAbove);\n\
\n\
  /**\n\
   * ### .least(value)\n\
   *\n\
   * Asserts that the target is greater than or equal to `value`.\n\
   *\n\
   *     expect(10).to.be.at.least(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.least(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);\n\
   *\n\
   * @name least\n\
   * @alias gte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLeast (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= n\n\
        , 'expected #{this} to have a length at least #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= n\n\
        , 'expected #{this} to be at least ' + n\n\
        , 'expected #{this} to be below ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('least', assertLeast);\n\
  Assertion.addMethod('gte', assertLeast);\n\
\n\
  /**\n\
   * ### .below(value)\n\
   *\n\
   * Asserts that the target is less than `value`.\n\
   *\n\
   *     expect(5).to.be.below(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *\n\
   * @name below\n\
   * @alias lt\n\
   * @alias lessThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertBelow (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len < n\n\
        , 'expected #{this} to have a length below #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj < n\n\
        , 'expected #{this} to be below ' + n\n\
        , 'expected #{this} to be at least ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('below', assertBelow);\n\
  Assertion.addMethod('lt', assertBelow);\n\
  Assertion.addMethod('lessThan', assertBelow);\n\
\n\
  /**\n\
   * ### .most(value)\n\
   *\n\
   * Asserts that the target is less than or equal to `value`.\n\
   *\n\
   *     expect(5).to.be.at.most(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.most(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);\n\
   *\n\
   * @name most\n\
   * @alias lte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertMost (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len <= n\n\
        , 'expected #{this} to have a length at most #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj <= n\n\
        , 'expected #{this} to be at most ' + n\n\
        , 'expected #{this} to be above ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('most', assertMost);\n\
  Assertion.addMethod('lte', assertMost);\n\
\n\
  /**\n\
   * ### .within(start, finish)\n\
   *\n\
   * Asserts that the target is within a range.\n\
   *\n\
   *     expect(7).to.be.within(5,10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a length range. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name within\n\
   * @param {Number} start lowerbound inclusive\n\
   * @param {Number} finish upperbound inclusive\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('within', function (start, finish, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , range = start + '..' + finish;\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= start && len <= finish\n\
        , 'expected #{this} to have a length within ' + range\n\
        , 'expected #{this} to not have a length within ' + range\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= start && obj <= finish\n\
        , 'expected #{this} to be within ' + range\n\
        , 'expected #{this} to not be within ' + range\n\
      );\n\
    }\n\
  });\n\
\n\
  /**\n\
   * ### .instanceof(constructor)\n\
   *\n\
   * Asserts that the target is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , Chai = new Tea('chai');\n\
   *\n\
   *     expect(Chai).to.be.an.instanceof(Tea);\n\
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);\n\
   *\n\
   * @name instanceof\n\
   * @param {Constructor} constructor\n\
   * @param {String} message _optional_\n\
   * @alias instanceOf\n\
   * @api public\n\
   */\n\
\n\
  function assertInstanceOf (constructor, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var name = _.getName(constructor);\n\
    this.assert(\n\
        flag(this, 'object') instanceof constructor\n\
      , 'expected #{this} to be an instance of ' + name\n\
      , 'expected #{this} to not be an instance of ' + name\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('instanceof', assertInstanceOf);\n\
  Assertion.addMethod('instanceOf', assertInstanceOf);\n\
\n\
  /**\n\
   * ### .property(name, [value])\n\
   *\n\
   * Asserts that the target has a property `name`, optionally asserting that\n\
   * the value of that property is strictly equal to  `value`.\n\
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep\n\
   * references into objects and arrays.\n\
   *\n\
   *     // simple referencing\n\
   *     var obj = { foo: 'bar' };\n\
   *     expect(obj).to.have.property('foo');\n\
   *     expect(obj).to.have.property('foo', 'bar');\n\
   *\n\
   *     // deep referencing\n\
   *     var deepObj = {\n\
   *         green: { tea: 'matcha' }\n\
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]\n\
   *     };\n\
\n\
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');\n\
   *\n\
   * You can also use an array as the starting point of a `deep.property`\n\
   * assertion, or traverse nested arrays.\n\
   *\n\
   *     var arr = [\n\
   *         [ 'chai', 'matcha', 'konacha' ]\n\
   *       , [ { tea: 'chai' }\n\
   *         , { tea: 'matcha' }\n\
   *         , { tea: 'konacha' } ]\n\
   *     ];\n\
   *\n\
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');\n\
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');\n\
   *\n\
   * Furthermore, `property` changes the subject of the assertion\n\
   * to be the value of that property from the original object. This\n\
   * permits for further chainable assertions on that property.\n\
   *\n\
   *     expect(obj).to.have.property('foo')\n\
   *       .that.is.a('string');\n\
   *     expect(deepObj).to.have.property('green')\n\
   *       .that.is.an('object')\n\
   *       .that.deep.equals({ tea: 'matcha' });\n\
   *     expect(deepObj).to.have.property('teas')\n\
   *       .that.is.an('array')\n\
   *       .with.deep.property('[2]')\n\
   *         .that.deep.equals({ tea: 'konacha' });\n\
   *\n\
   * @name property\n\
   * @alias deep.property\n\
   * @param {String} name\n\
   * @param {Mixed} value (optional)\n\
   * @param {String} message _optional_\n\
   * @returns value of property for chaining\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('property', function (name, val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
\n\
    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '\n\
      , negate = flag(this, 'negate')\n\
      , obj = flag(this, 'object')\n\
      , value = flag(this, 'deep')\n\
        ? _.getPathValue(name, obj)\n\
        : obj[name];\n\
\n\
    if (negate && undefined !== val) {\n\
      if (undefined === value) {\n\
        msg = (msg != null) ? msg + ': ' : '';\n\
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));\n\
      }\n\
    } else {\n\
      this.assert(\n\
          undefined !== value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)\n\
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));\n\
    }\n\
\n\
    if (undefined !== val) {\n\
      this.assert(\n\
          val === value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'\n\
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'\n\
        , val\n\
        , value\n\
      );\n\
    }\n\
\n\
    flag(this, 'object', value);\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .ownProperty(name)\n\
   *\n\
   * Asserts that the target has an own property `name`.\n\
   *\n\
   *     expect('test').to.have.ownProperty('length');\n\
   *\n\
   * @name ownProperty\n\
   * @alias haveOwnProperty\n\
   * @param {String} name\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertOwnProperty (name, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        obj.hasOwnProperty(name)\n\
      , 'expected #{this} to have own property ' + _.inspect(name)\n\
      , 'expected #{this} to not have own property ' + _.inspect(name)\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('ownProperty', assertOwnProperty);\n\
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);\n\
\n\
  /**\n\
   * ### .length(value)\n\
   *\n\
   * Asserts that the target's `length` property has\n\
   * the expected value.\n\
   *\n\
   *     expect([ 1, 2, 3]).to.have.length(3);\n\
   *     expect('foobar').to.have.length(6);\n\
   *\n\
   * Can also be used as a chain precursor to a value\n\
   * comparison for the length property.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name length\n\
   * @alias lengthOf\n\
   * @param {Number} length\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLengthChain () {\n\
    flag(this, 'doLength', true);\n\
  }\n\
\n\
  function assertLength (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).to.have.property('length');\n\
    var len = obj.length;\n\
\n\
    this.assert(\n\
        len == n\n\
      , 'expected #{this} to have a length of #{exp} but got #{act}'\n\
      , 'expected #{this} to not have a length of #{act}'\n\
      , n\n\
      , len\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('length', assertLength, assertLengthChain);\n\
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);\n\
\n\
  /**\n\
   * ### .match(regexp)\n\
   *\n\
   * Asserts that the target matches a regular expression.\n\
   *\n\
   *     expect('foobar').to.match(/^foo/);\n\
   *\n\
   * @name match\n\
   * @param {RegExp} RegularExpression\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('match', function (re, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        re.exec(obj)\n\
      , 'expected #{this} to match ' + re\n\
      , 'expected #{this} not to match ' + re\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .string(string)\n\
   *\n\
   * Asserts that the string target contains another string.\n\
   *\n\
   *     expect('foobar').to.have.string('bar');\n\
   *\n\
   * @name string\n\
   * @param {String} string\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('string', function (str, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('string');\n\
\n\
    this.assert(\n\
        ~obj.indexOf(str)\n\
      , 'expected #{this} to contain ' + _.inspect(str)\n\
      , 'expected #{this} to not contain ' + _.inspect(str)\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .keys(key1, [key2], [...])\n\
   *\n\
   * Asserts that the target has exactly the given keys, or\n\
   * asserts the inclusion of some keys when using the\n\
   * `include` or `contain` modifiers.\n\
   *\n\
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);\n\
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');\n\
   *\n\
   * @name keys\n\
   * @alias key\n\
   * @param {String...|Array} keys\n\
   * @api public\n\
   */\n\
\n\
  function assertKeys (keys) {\n\
    var obj = flag(this, 'object')\n\
      , str\n\
      , ok = true;\n\
\n\
    keys = keys instanceof Array\n\
      ? keys\n\
      : Array.prototype.slice.call(arguments);\n\
\n\
    if (!keys.length) throw new Error('keys required');\n\
\n\
    var actual = Object.keys(obj)\n\
      , len = keys.length;\n\
\n\
    // Inclusion\n\
    ok = keys.every(function(key){\n\
      return ~actual.indexOf(key);\n\
    });\n\
\n\
    // Strict\n\
    if (!flag(this, 'negate') && !flag(this, 'contains')) {\n\
      ok = ok && keys.length == actual.length;\n\
    }\n\
\n\
    // Key string\n\
    if (len > 1) {\n\
      keys = keys.map(function(key){\n\
        return _.inspect(key);\n\
      });\n\
      var last = keys.pop();\n\
      str = keys.join(', ') + ', and ' + last;\n\
    } else {\n\
      str = _.inspect(keys[0]);\n\
    }\n\
\n\
    // Form\n\
    str = (len > 1 ? 'keys ' : 'key ') + str;\n\
\n\
    // Have / include\n\
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;\n\
\n\
    // Assertion\n\
    this.assert(\n\
        ok\n\
      , 'expected #{this} to ' + str\n\
      , 'expected #{this} to not ' + str\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('keys', assertKeys);\n\
  Assertion.addMethod('key', assertKeys);\n\
\n\
  /**\n\
   * ### .throw(constructor)\n\
   *\n\
   * Asserts that the function target will throw a specific error, or specific type of error\n\
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test\n\
   * for the error's message.\n\
   *\n\
   *     var err = new ReferenceError('This is a bad function.');\n\
   *     var fn = function () { throw err; }\n\
   *     expect(fn).to.throw(ReferenceError);\n\
   *     expect(fn).to.throw(Error);\n\
   *     expect(fn).to.throw(/bad function/);\n\
   *     expect(fn).to.not.throw('good function');\n\
   *     expect(fn).to.throw(ReferenceError, /bad function/);\n\
   *     expect(fn).to.throw(err);\n\
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));\n\
   *\n\
   * Please note that when a throw expectation is negated, it will check each\n\
   * parameter independently, starting with error constructor type. The appropriate way\n\
   * to check for the existence of a type of error but for a message that does not match\n\
   * is to use `and`.\n\
   *\n\
   *     expect(fn).to.throw(ReferenceError)\n\
   *        .and.not.throw(/good function/);\n\
   *\n\
   * @name throw\n\
   * @alias throws\n\
   * @alias Throw\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {String|RegExp} expected error message\n\
   * @param {String} message _optional_\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  function assertThrows (constructor, errMsg, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('function');\n\
\n\
    var thrown = false\n\
      , desiredError = null\n\
      , name = null\n\
      , thrownError = null;\n\
\n\
    if (arguments.length === 0) {\n\
      errMsg = null;\n\
      constructor = null;\n\
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {\n\
      errMsg = constructor;\n\
      constructor = null;\n\
    } else if (constructor && constructor instanceof Error) {\n\
      desiredError = constructor;\n\
      constructor = null;\n\
      errMsg = null;\n\
    } else if (typeof constructor === 'function') {\n\
      name = (new constructor()).name;\n\
    } else {\n\
      constructor = null;\n\
    }\n\
\n\
    try {\n\
      obj();\n\
    } catch (err) {\n\
      // first, check desired error\n\
      if (desiredError) {\n\
        this.assert(\n\
            err === desiredError\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp}'\n\
          , desiredError\n\
          , err\n\
        );\n\
\n\
        return this;\n\
      }\n\
      // next, check constructor\n\
      if (constructor) {\n\
        this.assert(\n\
            err instanceof constructor\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'\n\
          , name\n\
          , err\n\
        );\n\
\n\
        if (!errMsg) return this;\n\
      }\n\
      // next, check message\n\
      var message = 'object' === _.type(err) && \"message\" in err\n\
        ? err.message\n\
        : '' + err;\n\
\n\
      if ((message != null) && errMsg && errMsg instanceof RegExp) {\n\
        this.assert(\n\
            errMsg.exec(message)\n\
          , 'expected #{this} to throw error matching #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not matching #{exp}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        return this;\n\
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {\n\
        this.assert(\n\
            ~message.indexOf(errMsg)\n\
          , 'expected #{this} to throw error including #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not including #{act}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        return this;\n\
      } else {\n\
        thrown = true;\n\
        thrownError = err;\n\
      }\n\
    }\n\
\n\
    var actuallyGot = ''\n\
      , expectedThrown = name !== null\n\
        ? name\n\
        : desiredError\n\
          ? '#{exp}' //_.inspect(desiredError)\n\
          : 'an error';\n\
\n\
    if (thrown) {\n\
      actuallyGot = ' but #{act} was thrown'\n\
    }\n\
\n\
    this.assert(\n\
        thrown === true\n\
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot\n\
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot\n\
      , desiredError\n\
      , thrownError\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('throw', assertThrows);\n\
  Assertion.addMethod('throws', assertThrows);\n\
  Assertion.addMethod('Throw', assertThrows);\n\
\n\
  /**\n\
   * ### .respondTo(method)\n\
   *\n\
   * Asserts that the object or class target will respond to a method.\n\
   *\n\
   *     Klass.prototype.bar = function(){};\n\
   *     expect(Klass).to.respondTo('bar');\n\
   *     expect(obj).to.respondTo('bar');\n\
   *\n\
   * To check if a constructor will respond to a static function,\n\
   * set the `itself` flag.\n\
   *\n\
   *     Klass.baz = function(){};\n\
   *     expect(Klass).itself.to.respondTo('baz');\n\
   *\n\
   * @name respondTo\n\
   * @param {String} method\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('respondTo', function (method, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , itself = flag(this, 'itself')\n\
      , context = ('function' === _.type(obj) && !itself)\n\
        ? obj.prototype[method]\n\
        : obj[method];\n\
\n\
    this.assert(\n\
        'function' === typeof context\n\
      , 'expected #{this} to respond to ' + _.inspect(method)\n\
      , 'expected #{this} to not respond to ' + _.inspect(method)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .itself\n\
   *\n\
   * Sets the `itself` flag, later used by the `respondTo` assertion.\n\
   *\n\
   *     function Foo() {}\n\
   *     Foo.bar = function() {}\n\
   *     Foo.prototype.baz = function() {}\n\
   *\n\
   *     expect(Foo).itself.to.respondTo('bar');\n\
   *     expect(Foo).itself.not.to.respondTo('baz');\n\
   *\n\
   * @name itself\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('itself', function () {\n\
    flag(this, 'itself', true);\n\
  });\n\
\n\
  /**\n\
   * ### .satisfy(method)\n\
   *\n\
   * Asserts that the target passes a given truth test.\n\
   *\n\
   *     expect(1).to.satisfy(function(num) { return num > 0; });\n\
   *\n\
   * @name satisfy\n\
   * @param {Function} matcher\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('satisfy', function (matcher, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        matcher(obj)\n\
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)\n\
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)\n\
      , this.negate ? false : true\n\
      , matcher(obj)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .closeTo(expected, delta)\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     expect(1.5).to.be.closeTo(1, 0.5);\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('closeTo', function (expected, delta, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        Math.abs(obj - expected) <= delta\n\
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta\n\
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta\n\
    );\n\
  });\n\
\n\
  function isSubsetOf(subset, superset) {\n\
    return subset.every(function(elem) {\n\
      return superset.indexOf(elem) !== -1;\n\
    })\n\
  }\n\
\n\
  /**\n\
   * ### .members(set)\n\
   *\n\
   * Asserts that the target is a superset of `set`,\n\
   * or that the target and `set` have the same members.\n\
   *\n\
   *     expect([1, 2, 3]).to.include.members([3, 2]);\n\
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);\n\
   *\n\
   *     expect([4, 2]).to.have.members([2, 4]);\n\
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);\n\
   *\n\
   * @name members\n\
   * @param {Array} set\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('members', function (subset, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
\n\
    new Assertion(obj).to.be.an('array');\n\
    new Assertion(subset).to.be.an('array');\n\
\n\
    if (flag(this, 'contains')) {\n\
      return this.assert(\n\
          isSubsetOf(subset, obj)\n\
        , 'expected #{this} to be a superset of #{act}'\n\
        , 'expected #{this} to not be a superset of #{act}'\n\
        , obj\n\
        , subset\n\
      );\n\
    }\n\
\n\
    this.assert(\n\
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)\n\
        , 'expected #{this} to have the same members as #{act}'\n\
        , 'expected #{this} to not have the same members as #{act}'\n\
        , obj\n\
        , subset\n\
    );\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/core/assertions.js"
));
require.register("chaijs-chai/lib/chai/interface/assert.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
\n\
module.exports = function (chai, util) {\n\
\n\
  /*!\n\
   * Chai dependencies.\n\
   */\n\
\n\
  var Assertion = chai.Assertion\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  /**\n\
   * ### assert(expression, message)\n\
   *\n\
   * Write your own test expressions.\n\
   *\n\
   *     assert('foo' !== 'bar', 'foo is not bar');\n\
   *     assert(Array.isArray([]), 'empty arrays are arrays');\n\
   *\n\
   * @param {Mixed} expression to test for truthiness\n\
   * @param {String} message to display on error\n\
   * @name assert\n\
   * @api public\n\
   */\n\
\n\
  var assert = chai.assert = function (express, errmsg) {\n\
    var test = new Assertion(null);\n\
    test.assert(\n\
        express\n\
      , errmsg\n\
      , '[ negation message unavailable ]'\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .fail(actual, expected, [message], [operator])\n\
   *\n\
   * Throw a failure. Node.js `assert` module-compatible.\n\
   *\n\
   * @name fail\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @param {String} operator\n\
   * @api public\n\
   */\n\
\n\
  assert.fail = function (actual, expected, message, operator) {\n\
    throw new chai.AssertionError({\n\
        actual: actual\n\
      , expected: expected\n\
      , message: message\n\
      , operator: operator\n\
      , stackStartFunction: assert.fail\n\
    });\n\
  };\n\
\n\
  /**\n\
   * ### .ok(object, [message])\n\
   *\n\
   * Asserts that `object` is truthy.\n\
   *\n\
   *     assert.ok('everything', 'everything is ok');\n\
   *     assert.ok(false, 'this will fail');\n\
   *\n\
   * @name ok\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.ok = function (val, msg) {\n\
    new Assertion(val, msg).is.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .notOk(object, [message])\n\
   *\n\
   * Asserts that `object` is falsy.\n\
   *\n\
   *     assert.notOk('everything', 'this will fail');\n\
   *     assert.notOk(false, 'this will pass');\n\
   *\n\
   * @name notOk\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notOk = function (val, msg) {\n\
    new Assertion(val, msg).is.not.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .equal(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict equality (`==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.equal(3, '3', '== coerces values to strings');\n\
   *\n\
   * @name equal\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.equal = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp == flag(test, 'object')\n\
      , 'expected #{this} to equal #{exp}'\n\
      , 'expected #{this} to not equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .notEqual(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notEqual(3, 4, 'these numbers are not equal');\n\
   *\n\
   * @name notEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notEqual = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp != flag(test, 'object')\n\
      , 'expected #{this} to not equal #{exp}'\n\
      , 'expected #{this} to equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .strictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict equality (`===`) of `actual` and `expected`.\n\
   *\n\
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');\n\
   *\n\
   * @name strictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.strictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notStrictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict inequality (`!==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');\n\
   *\n\
   * @name notStrictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notStrictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .deepEqual(actual, expected, [message])\n\
   *\n\
   * Asserts that `actual` is deeply equal to `expected`.\n\
   *\n\
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });\n\
   *\n\
   * @name deepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepEqual(actual, expected, [message])\n\
   *\n\
   * Assert that `actual` is not deeply equal to `expected`.\n\
   *\n\
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });\n\
   *\n\
   * @name notDeepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .isTrue(value, [message])\n\
   *\n\
   * Asserts that `value` is true.\n\
   *\n\
   *     var teaServed = true;\n\
   *     assert.isTrue(teaServed, 'the tea has been served');\n\
   *\n\
   * @name isTrue\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isTrue = function (val, msg) {\n\
    new Assertion(val, msg).is['true'];\n\
  };\n\
\n\
  /**\n\
   * ### .isFalse(value, [message])\n\
   *\n\
   * Asserts that `value` is false.\n\
   *\n\
   *     var teaServed = false;\n\
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');\n\
   *\n\
   * @name isFalse\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFalse = function (val, msg) {\n\
    new Assertion(val, msg).is['false'];\n\
  };\n\
\n\
  /**\n\
   * ### .isNull(value, [message])\n\
   *\n\
   * Asserts that `value` is null.\n\
   *\n\
   *     assert.isNull(err, 'there was no error');\n\
   *\n\
   * @name isNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNull = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNull(value, [message])\n\
   *\n\
   * Asserts that `value` is not null.\n\
   *\n\
   *     var tea = 'tasty chai';\n\
   *     assert.isNotNull(tea, 'great, time for tea!');\n\
   *\n\
   * @name isNotNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNull = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isUndefined(value, [message])\n\
   *\n\
   * Asserts that `value` is `undefined`.\n\
   *\n\
   *     var tea;\n\
   *     assert.isUndefined(tea, 'no tea defined');\n\
   *\n\
   * @name isUndefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isUndefined = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isDefined(value, [message])\n\
   *\n\
   * Asserts that `value` is not `undefined`.\n\
   *\n\
   *     var tea = 'cup of chai';\n\
   *     assert.isDefined(tea, 'tea has been defined');\n\
   *\n\
   * @name isDefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isDefined = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is a function.\n\
   *\n\
   *     function serveTea() { return 'cup of tea'; };\n\
   *     assert.isFunction(serveTea, 'great, we can have tea now');\n\
   *\n\
   * @name isFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a function.\n\
   *\n\
   *     var serveTea = [ 'heat', 'pour', 'sip' ];\n\
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');\n\
   *\n\
   * @name isNotFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isObject(value, [message])\n\
   *\n\
   * Asserts that `value` is an object (as revealed by\n\
   * `Object.prototype.toString`).\n\
   *\n\
   *     var selection = { name: 'Chai', serve: 'with spices' };\n\
   *     assert.isObject(selection, 'tea selection is an object');\n\
   *\n\
   * @name isObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isObject = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotObject(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an object.\n\
   *\n\
   *     var selection = 'chai'\n\
   *     assert.isObject(selection, 'tea selection is not an object');\n\
   *     assert.isObject(null, 'null is not an object');\n\
   *\n\
   * @name isNotObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotObject = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isArray(value, [message])\n\
   *\n\
   * Asserts that `value` is an array.\n\
   *\n\
   *     var menu = [ 'green', 'chai', 'oolong' ];\n\
   *     assert.isArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isArray = function (val, msg) {\n\
    new Assertion(val, msg).to.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotArray(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an array.\n\
   *\n\
   *     var menu = 'green|chai|oolong';\n\
   *     assert.isNotArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isNotArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotArray = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isString(value, [message])\n\
   *\n\
   * Asserts that `value` is a string.\n\
   *\n\
   *     var teaOrder = 'chai';\n\
   *     assert.isString(teaOrder, 'order placed');\n\
   *\n\
   * @name isString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isString = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotString(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a string.\n\
   *\n\
   *     var teaOrder = 4;\n\
   *     assert.isNotString(teaOrder, 'order placed');\n\
   *\n\
   * @name isNotString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotString = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is a number.\n\
   *\n\
   *     var cups = 2;\n\
   *     assert.isNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNumber\n\
   * @param {Number} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a number.\n\
   *\n\
   *     var cups = '2 cups please';\n\
   *     assert.isNotNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNotNumber\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is a boolean.\n\
   *\n\
   *     var teaReady = true\n\
   *       , teaServed = false;\n\
   *\n\
   *     assert.isBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a boolean.\n\
   *\n\
   *     var teaReady = 'yep'\n\
   *       , teaServed = 'nope';\n\
   *\n\
   *     assert.isNotBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isNotBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isNotBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .typeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');\n\
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');\n\
   *     assert.typeOf('tea', 'string', 'we have a string');\n\
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');\n\
   *     assert.typeOf(null, 'null', 'we have a null');\n\
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');\n\
   *\n\
   * @name typeOf\n\
   * @param {Mixed} value\n\
   * @param {String} name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.typeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notTypeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is _not_ `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');\n\
   *\n\
   * @name notTypeOf\n\
   * @param {Mixed} value\n\
   * @param {String} typeof name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notTypeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .instanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts that `value` is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new Tea('chai');\n\
   *\n\
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');\n\
   *\n\
   * @name instanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.instanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notInstanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts `value` is not an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new String('chai');\n\
   *\n\
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');\n\
   *\n\
   * @name notInstanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInstanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .include(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` includes `needle`. Works\n\
   * for strings and arrays.\n\
   *\n\
   *     assert.include('foobar', 'bar', 'foobar contains string \"bar\"');\n\
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');\n\
   *\n\
   * @name include\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.include = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.include\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .notInclude(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` does not include `needle`. Works\n\
   * for strings and arrays.\n\
   *i\n\
   *     assert.notInclude('foobar', 'baz', 'string not include substring');\n\
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');\n\
   *\n\
   * @name notInclude\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInclude = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.not.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.not.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.notInclude\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .match(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` matches the regular expression `regexp`.\n\
   *\n\
   *     assert.match('foobar', /^foo/, 'regexp matches');\n\
   *\n\
   * @name match\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.match = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .notMatch(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` does not match the regular expression `regexp`.\n\
   *\n\
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');\n\
   *\n\
   * @name notMatch\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notMatch = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.not.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .property(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`.\n\
   *\n\
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');\n\
   *\n\
   * @name property\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.property = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`.\n\
   *\n\
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');\n\
   *\n\
   * @name notProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .deepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, which can be a\n\
   * string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');\n\
   *\n\
   * @name deepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`, which\n\
   * can be a string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');\n\
   *\n\
   * @name notDeepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`.\n\
   *\n\
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');\n\
   *\n\
   * @name propertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`.\n\
   *\n\
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');\n\
   *\n\
   * @name propertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`. `property` can use dot- and bracket-notation for deep\n\
   * reference.\n\
   *\n\
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');\n\
   *\n\
   * @name deepPropertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`. `property` can use dot- and\n\
   * bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');\n\
   *\n\
   * @name deepPropertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .lengthOf(object, length, [message])\n\
   *\n\
   * Asserts that `object` has a `length` property with the expected value.\n\
   *\n\
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');\n\
   *     assert.lengthOf('foobar', 5, 'string has length of 6');\n\
   *\n\
   * @name lengthOf\n\
   * @param {Mixed} object\n\
   * @param {Number} length\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.lengthOf = function (exp, len, msg) {\n\
    new Assertion(exp, msg).to.have.length(len);\n\
  };\n\
\n\
  /**\n\
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])\n\
   *\n\
   * Asserts that `function` will throw an error that is an instance of\n\
   * `constructor`, or alternately that it will throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.throw(fn, 'function throws a reference error');\n\
   *     assert.throw(fn, /function throws a reference error/);\n\
   *     assert.throw(fn, ReferenceError);\n\
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');\n\
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);\n\
   *\n\
   * @name throws\n\
   * @alias throw\n\
   * @alias Throw\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.Throw = function (fn, errt, errs, msg) {\n\
    if ('string' === typeof errt || errt instanceof RegExp) {\n\
      errs = errt;\n\
      errt = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.Throw(errt, errs);\n\
  };\n\
\n\
  /**\n\
   * ### .doesNotThrow(function, [constructor/regexp], [message])\n\
   *\n\
   * Asserts that `function` will _not_ throw an error that is an instance of\n\
   * `constructor`, or alternately that it will not throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.doesNotThrow(fn, Error, 'function does not throw');\n\
   *\n\
   * @name doesNotThrow\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.doesNotThrow = function (fn, type, msg) {\n\
    if ('string' === typeof type) {\n\
      msg = type;\n\
      type = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.not.Throw(type);\n\
  };\n\
\n\
  /**\n\
   * ### .operator(val1, operator, val2, [message])\n\
   *\n\
   * Compares two values using `operator`.\n\
   *\n\
   *     assert.operator(1, '<', 2, 'everything is ok');\n\
   *     assert.operator(1, '>', 2, 'this will fail');\n\
   *\n\
   * @name operator\n\
   * @param {Mixed} val1\n\
   * @param {String} operator\n\
   * @param {Mixed} val2\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.operator = function (val, operator, val2, msg) {\n\
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {\n\
      throw new Error('Invalid operator \"' + operator + '\"');\n\
    }\n\
    var test = new Assertion(eval(val + operator + val2), msg);\n\
    test.assert(\n\
        true === flag(test, 'object')\n\
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)\n\
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );\n\
  };\n\
\n\
  /**\n\
   * ### .closeTo(actual, expected, delta, [message])\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} actual\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.closeTo = function (act, exp, delta, msg) {\n\
    new Assertion(act, msg).to.be.closeTo(exp, delta);\n\
  };\n\
\n\
  /**\n\
   * ### .sameMembers(set1, set2, [message])\n\
   *\n\
   * Asserts that `set1` and `set2` have the same members.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');\n\
   *\n\
   * @name sameMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.sameMembers = function (set1, set2, msg) {\n\
    new Assertion(set1, msg).to.have.same.members(set2);\n\
  }\n\
\n\
  /**\n\
   * ### .includeMembers(superset, subset, [message])\n\
   *\n\
   * Asserts that `subset` is included in `superset`.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');\n\
   *\n\
   * @name includeMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.includeMembers = function (superset, subset, msg) {\n\
    new Assertion(superset, msg).to.include.members(subset);\n\
  }\n\
\n\
  /*!\n\
   * Undocumented / untested\n\
   */\n\
\n\
  assert.ifError = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.ok;\n\
  };\n\
\n\
  /*!\n\
   * Aliases.\n\
   */\n\
\n\
  (function alias(name, as){\n\
    assert[as] = assert[name];\n\
    return alias;\n\
  })\n\
  ('Throw', 'throw')\n\
  ('Throw', 'throws');\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/assert.js"
));
require.register("chaijs-chai/lib/chai/interface/expect.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  chai.expect = function (val, message) {\n\
    return new chai.Assertion(val, message);\n\
  };\n\
};\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/expect.js"
));
require.register("chaijs-chai/lib/chai/interface/should.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  var Assertion = chai.Assertion;\n\
\n\
  function loadShould () {\n\
    // modify Object.prototype to have `should`\n\
    Object.defineProperty(Object.prototype, 'should',\n\
      {\n\
        set: function (value) {\n\
          // See https://github.com/chaijs/chai/issues/86: this makes\n\
          // `whatever.should = someValue` actually set `someValue`, which is\n\
          // especially useful for `global.should = require('chai').should()`.\n\
          //\n\
          // Note that we have to use [[DefineProperty]] instead of [[Put]]\n\
          // since otherwise we would trigger this very setter!\n\
          Object.defineProperty(this, 'should', {\n\
            value: value,\n\
            enumerable: true,\n\
            configurable: true,\n\
            writable: true\n\
          });\n\
        }\n\
      , get: function(){\n\
          if (this instanceof String || this instanceof Number) {\n\
            return new Assertion(this.constructor(this));\n\
          } else if (this instanceof Boolean) {\n\
            return new Assertion(this == true);\n\
          }\n\
          return new Assertion(this);\n\
        }\n\
      , configurable: true\n\
    });\n\
\n\
    var should = {};\n\
\n\
    should.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.equal(val2);\n\
    };\n\
\n\
    should.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.Throw(errt, errs);\n\
    };\n\
\n\
    should.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.exist;\n\
    }\n\
\n\
    // negation\n\
    should.not = {}\n\
\n\
    should.not.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.not.equal(val2);\n\
    };\n\
\n\
    should.not.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.not.Throw(errt, errs);\n\
    };\n\
\n\
    should.not.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.not.exist;\n\
    }\n\
\n\
    should['throw'] = should['Throw'];\n\
    should.not['throw'] = should.not['Throw'];\n\
\n\
    return should;\n\
  };\n\
\n\
  chai.should = loadShould;\n\
  chai.Should = loadShould;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/should.js"
));
require.register("chaijs-chai/lib/chai/utils/addChainableMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addChainingMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Module variables\n\
 */\n\
\n\
// Check whether `__proto__` is supported\n\
var hasProtoSupport = '__proto__' in Object;\n\
\n\
// Without `__proto__` support, this module will need to add properties to a function.\n\
// However, some Function.prototype methods cannot be overwritten,\n\
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).\n\
var excludeNames = /^(?:length|name|arguments|caller)$/;\n\
\n\
// Cache `Function` properties\n\
var call  = Function.prototype.call,\n\
    apply = Function.prototype.apply;\n\
\n\
/**\n\
 * ### addChainableMethod (ctx, name, method, chainingBehavior)\n\
 *\n\
 * Adds a method to an object, such that the method can also be chained.\n\
 *\n\
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);\n\
 *\n\
 * The result can then be used as both a method assertion, executing both `method` and\n\
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *     expect(fooStr).to.be.foo.equal('foo');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for `name`, when called\n\
 * @param {Function} chainingBehavior function to be called every time the property is accessed\n\
 * @name addChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  if (typeof chainingBehavior !== 'function')\n\
    chainingBehavior = function () { };\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        chainingBehavior.call(this);\n\
\n\
        var assert = function () {\n\
          var result = method.apply(this, arguments);\n\
          return result === undefined ? this : result;\n\
        };\n\
\n\
        // Use `__proto__` if available\n\
        if (hasProtoSupport) {\n\
          // Inherit all properties from the object by replacing the `Function` prototype\n\
          var prototype = assert.__proto__ = Object.create(this);\n\
          // Restore the `call` and `apply` methods from `Function`\n\
          prototype.call = call;\n\
          prototype.apply = apply;\n\
        }\n\
        // Otherwise, redefine all properties (slow!)\n\
        else {\n\
          var asserterNames = Object.getOwnPropertyNames(ctx);\n\
          asserterNames.forEach(function (asserterName) {\n\
            if (!excludeNames.test(asserterName)) {\n\
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);\n\
              Object.defineProperty(assert, asserterName, pd);\n\
            }\n\
          });\n\
        }\n\
\n\
        transferFlags(this, assert);\n\
        return assert;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addChainableMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .addMethod (ctx, name, method)\n\
 *\n\
 * Adds a method to the prototype of an object.\n\
 *\n\
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for name\n\
 * @name addMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  ctx[name] = function () {\n\
    var result = method.apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - addProperty utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### addProperty (ctx, name, getter)\n\
 *\n\
 * Adds a property to the prototype of an object.\n\
 *\n\
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.instanceof(Foo);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.foo;\n\
 *\n\
 * @param {Object} ctx object to which the property is added\n\
 * @param {String} name of property to add\n\
 * @param {Function} getter function to be used for name\n\
 * @name addProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter.call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/eql.js", Function("exports, require, module",
"// This is (almost) directly from Node.js assert\n\
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/assert.js\n\
\n\
module.exports = _deepEqual;\n\
\n\
var getEnumerableProperties = require('./getEnumerableProperties');\n\
\n\
// for the browser\n\
var Buffer;\n\
try {\n\
  Buffer = require('buffer').Buffer;\n\
} catch (ex) {\n\
  Buffer = {\n\
    isBuffer: function () { return false; }\n\
  };\n\
}\n\
\n\
function _deepEqual(actual, expected, memos) {\n\
\n\
  // 7.1. All identical values are equivalent, as determined by ===.\n\
  if (actual === expected) {\n\
    return true;\n\
\n\
  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {\n\
    if (actual.length != expected.length) return false;\n\
\n\
    for (var i = 0; i < actual.length; i++) {\n\
      if (actual[i] !== expected[i]) return false;\n\
    }\n\
\n\
    return true;\n\
\n\
  // 7.2. If the expected value is a Date object, the actual value is\n\
  // equivalent if it is also a Date object that refers to the same time.\n\
  } else if (expected instanceof Date) {\n\
    if (!(actual instanceof Date)) return false;\n\
    return actual.getTime() === expected.getTime();\n\
\n\
  // 7.3. Other pairs that do not both pass typeof value == 'object',\n\
  // equivalence is determined by ==.\n\
  } else if (typeof actual != 'object' && typeof expected != 'object') {\n\
    return actual === expected;\n\
\n\
  } else if (expected instanceof RegExp) {\n\
    if (!(actual instanceof RegExp)) return false;\n\
    return actual.toString() === expected.toString();\n\
\n\
  // 7.4. For all other Object pairs, including Array objects, equivalence is\n\
  // determined by having the same number of owned properties (as verified\n\
  // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
  // (although not necessarily the same order), equivalent values for every\n\
  // corresponding key, and an identical 'prototype' property. Note: this\n\
  // accounts for both named and indexed properties on Arrays.\n\
  } else {\n\
    return objEquiv(actual, expected, memos);\n\
  }\n\
}\n\
\n\
function isUndefinedOrNull(value) {\n\
  return value === null || value === undefined;\n\
}\n\
\n\
function isArguments(object) {\n\
  return Object.prototype.toString.call(object) == '[object Arguments]';\n\
}\n\
\n\
function objEquiv(a, b, memos) {\n\
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n\
    return false;\n\
\n\
  // an identical 'prototype' property.\n\
  if (a.prototype !== b.prototype) return false;\n\
\n\
  // check if we have already compared a and b\n\
  var i;\n\
  if (memos) {\n\
    for(i = 0; i < memos.length; i++) {\n\
      if ((memos[i][0] === a && memos[i][1] === b) ||\n\
          (memos[i][0] === b && memos[i][1] === a))\n\
        return true;\n\
    }\n\
  } else {\n\
    memos = [];\n\
  }\n\
\n\
  //~~~I've managed to break Object.keys through screwy arguments passing.\n\
  //   Converting to array solves the problem.\n\
  if (isArguments(a)) {\n\
    if (!isArguments(b)) {\n\
      return false;\n\
    }\n\
    a = pSlice.call(a);\n\
    b = pSlice.call(b);\n\
    return _deepEqual(a, b, memos);\n\
  }\n\
  try {\n\
    var ka = getEnumerableProperties(a),\n\
        kb = getEnumerableProperties(b),\n\
        key;\n\
  } catch (e) {//happens when one is a string literal and the other isn't\n\
    return false;\n\
  }\n\
\n\
  // having the same number of owned properties (keys incorporates\n\
  // hasOwnProperty)\n\
  if (ka.length != kb.length)\n\
    return false;\n\
\n\
  //the same set of keys (although not necessarily the same order),\n\
  ka.sort();\n\
  kb.sort();\n\
  //~~~cheap key test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    if (ka[i] != kb[i])\n\
      return false;\n\
  }\n\
\n\
  // remember objects we have compared to guard against circular references\n\
  memos.push([ a, b ]);\n\
\n\
  //equivalent values for every corresponding key, and\n\
  //~~~possibly expensive deep test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!_deepEqual(a[key], b[key], memos)) return false;\n\
  }\n\
\n\
  return true;\n\
}\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/eql.js"
));
require.register("chaijs-chai/lib/chai/utils/flag.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### flag(object ,key, [value])\n\
 *\n\
 * Get or set a flag value on an object. If a\n\
 * value is provided it will be set, else it will\n\
 * return the currently set value or `undefined` if\n\
 * the value is not set.\n\
 *\n\
 *     utils.flag(this, 'foo', 'bar'); // setter\n\
 *     utils.flag(this, 'foo'); // getter, returns `bar`\n\
 *\n\
 * @param {Object} object (constructed Assertion\n\
 * @param {String} key\n\
 * @param {Mixed} value (optional)\n\
 * @name flag\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj, key, value) {\n\
  var flags = obj.__flags || (obj.__flags = Object.create(null));\n\
  if (arguments.length === 3) {\n\
    flags[key] = value;\n\
  } else {\n\
    return flags[key];\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/flag.js"
));
require.register("chaijs-chai/lib/chai/utils/getActual.js", Function("exports, require, module",
"/*!\n\
 * Chai - getActual utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getActual(object, [actual])\n\
 *\n\
 * Returns the `actual` value for an Assertion\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var actual = args[4];\n\
  return 'undefined' !== typeof actual ? actual : obj._obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getActual.js"
));
require.register("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getEnumerableProperties utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getEnumerableProperties(object)\n\
 *\n\
 * This allows the retrieval of enumerable property names of an object,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getEnumerableProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getEnumerableProperties(object) {\n\
  var result = [];\n\
  for (var name in object) {\n\
    result.push(name);\n\
  }\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getEnumerableProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/getMessage.js", Function("exports, require, module",
"/*!\n\
 * Chai - message composition utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag')\n\
  , getActual = require('./getActual')\n\
  , inspect = require('./inspect')\n\
  , objDisplay = require('./objDisplay');\n\
\n\
/**\n\
 * ### .getMessage(object, message, negateMessage)\n\
 *\n\
 * Construct the error message based on flags\n\
 * and template tags. Template tags will return\n\
 * a stringified inspection of the object referenced.\n\
 *\n\
 * Message template tags:\n\
 * - `#{this}` current asserted object\n\
 * - `#{act}` actual value\n\
 * - `#{exp}` expected value\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 * @name getMessage\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , val = flag(obj, 'object')\n\
    , expected = args[3]\n\
    , actual = getActual(obj, args)\n\
    , msg = negate ? args[2] : args[1]\n\
    , flagMsg = flag(obj, 'message');\n\
\n\
  msg = msg || '';\n\
  msg = msg\n\
    .replace(/#{this}/g, objDisplay(val))\n\
    .replace(/#{act}/g, objDisplay(actual))\n\
    .replace(/#{exp}/g, objDisplay(expected));\n\
\n\
  return flagMsg ? flagMsg + ': ' + msg : msg;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getMessage.js"
));
require.register("chaijs-chai/lib/chai/utils/getName.js", Function("exports, require, module",
"/*!\n\
 * Chai - getName utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getName(func)\n\
 *\n\
 * Gets the name of a function, in a cross-browser way.\n\
 *\n\
 * @param {Function} a function (usually a constructor)\n\
 */\n\
\n\
module.exports = function (func) {\n\
  if (func.name) return func.name;\n\
\n\
  var match = /^\\s?function ([^(]*)\\(/.exec(func);\n\
  return match && match[1] ? match[1] : \"\";\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getName.js"
));
require.register("chaijs-chai/lib/chai/utils/getPathValue.js", Function("exports, require, module",
"/*!\n\
 * Chai - getPathValue utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * @see https://github.com/logicalparadox/filtr\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getPathValue(path, object)\n\
 *\n\
 * This allows the retrieval of values in an\n\
 * object given a string path.\n\
 *\n\
 *     var obj = {\n\
 *         prop1: {\n\
 *             arr: ['a', 'b', 'c']\n\
 *           , str: 'Hello'\n\
 *         }\n\
 *       , prop2: {\n\
 *             arr: [ { nested: 'Universe' } ]\n\
 *           , str: 'Hello again!'\n\
 *         }\n\
 *     }\n\
 *\n\
 * The following would be the results.\n\
 *\n\
 *     getPathValue('prop1.str', obj); // Hello\n\
 *     getPathValue('prop1.att[2]', obj); // b\n\
 *     getPathValue('prop2.arr[0].nested', obj); // Universe\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} object\n\
 * @returns {Object} value or `undefined`\n\
 * @name getPathValue\n\
 * @api public\n\
 */\n\
\n\
var getPathValue = module.exports = function (path, obj) {\n\
  var parsed = parsePath(path);\n\
  return _getPathValue(parsed, obj);\n\
};\n\
\n\
/*!\n\
 * ## parsePath(path)\n\
 *\n\
 * Helper function used to parse string object\n\
 * paths. Use in conjunction with `_getPathValue`.\n\
 *\n\
 *      var parsed = parsePath('myobject.property.subprop');\n\
 *\n\
 * ### Paths:\n\
 *\n\
 * * Can be as near infinitely deep and nested\n\
 * * Arrays are also valid using the formal `myobject.document[3].property`.\n\
 *\n\
 * @param {String} path\n\
 * @returns {Object} parsed\n\
 * @api private\n\
 */\n\
\n\
function parsePath (path) {\n\
  var str = path.replace(/\\[/g, '.[')\n\
    , parts = str.match(/(\\\\\\.|[^.]+?)+/g);\n\
  return parts.map(function (value) {\n\
    var re = /\\[(\\d+)\\]$/\n\
      , mArr = re.exec(value)\n\
    if (mArr) return { i: parseFloat(mArr[1]) };\n\
    else return { p: value };\n\
  });\n\
};\n\
\n\
/*!\n\
 * ## _getPathValue(parsed, obj)\n\
 *\n\
 * Helper companion function for `.parsePath` that returns\n\
 * the value located at the parsed address.\n\
 *\n\
 *      var value = getPathValue(parsed, obj);\n\
 *\n\
 * @param {Object} parsed definition from `parsePath`.\n\
 * @param {Object} object to search against\n\
 * @returns {Object|Undefined} value\n\
 * @api private\n\
 */\n\
\n\
function _getPathValue (parsed, obj) {\n\
  var tmp = obj\n\
    , res;\n\
  for (var i = 0, l = parsed.length; i < l; i++) {\n\
    var part = parsed[i];\n\
    if (tmp) {\n\
      if ('undefined' !== typeof part.p)\n\
        tmp = tmp[part.p];\n\
      else if ('undefined' !== typeof part.i)\n\
        tmp = tmp[part.i];\n\
      if (i == (l - 1)) res = tmp;\n\
    } else {\n\
      res = undefined;\n\
    }\n\
  }\n\
  return res;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getPathValue.js"
));
require.register("chaijs-chai/lib/chai/utils/getProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getProperties utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getProperties(object)\n\
 *\n\
 * This allows the retrieval of property names of an object, enumerable or not,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getProperties(object) {\n\
  var result = Object.getOwnPropertyNames(subject);\n\
\n\
  function addProperty(property) {\n\
    if (result.indexOf(property) === -1) {\n\
      result.push(property);\n\
    }\n\
  }\n\
\n\
  var proto = Object.getPrototypeOf(subject);\n\
  while (proto !== null) {\n\
    Object.getOwnPropertyNames(proto).forEach(addProperty);\n\
    proto = Object.getPrototypeOf(proto);\n\
  }\n\
\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/index.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Main exports\n\
 */\n\
\n\
var exports = module.exports = {};\n\
\n\
/*!\n\
 * test utility\n\
 */\n\
\n\
exports.test = require('./test');\n\
\n\
/*!\n\
 * type utility\n\
 */\n\
\n\
exports.type = require('./type');\n\
\n\
/*!\n\
 * message utility\n\
 */\n\
\n\
exports.getMessage = require('./getMessage');\n\
\n\
/*!\n\
 * actual utility\n\
 */\n\
\n\
exports.getActual = require('./getActual');\n\
\n\
/*!\n\
 * Inspect util\n\
 */\n\
\n\
exports.inspect = require('./inspect');\n\
\n\
/*!\n\
 * Object Display util\n\
 */\n\
\n\
exports.objDisplay = require('./objDisplay');\n\
\n\
/*!\n\
 * Flag utility\n\
 */\n\
\n\
exports.flag = require('./flag');\n\
\n\
/*!\n\
 * Flag transferring utility\n\
 */\n\
\n\
exports.transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Deep equal utility\n\
 */\n\
\n\
exports.eql = require('./eql');\n\
\n\
/*!\n\
 * Deep path value\n\
 */\n\
\n\
exports.getPathValue = require('./getPathValue');\n\
\n\
/*!\n\
 * Function name\n\
 */\n\
\n\
exports.getName = require('./getName');\n\
\n\
/*!\n\
 * add Property\n\
 */\n\
\n\
exports.addProperty = require('./addProperty');\n\
\n\
/*!\n\
 * add Method\n\
 */\n\
\n\
exports.addMethod = require('./addMethod');\n\
\n\
/*!\n\
 * overwrite Property\n\
 */\n\
\n\
exports.overwriteProperty = require('./overwriteProperty');\n\
\n\
/*!\n\
 * overwrite Method\n\
 */\n\
\n\
exports.overwriteMethod = require('./overwriteMethod');\n\
\n\
/*!\n\
 * Add a chainable method\n\
 */\n\
\n\
exports.addChainableMethod = require('./addChainableMethod');\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/index.js"
));
require.register("chaijs-chai/lib/chai/utils/inspect.js", Function("exports, require, module",
"// This is (almost) directly from Node.js utils\n\
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js\n\
\n\
var getName = require('./getName');\n\
var getProperties = require('./getProperties');\n\
var getEnumerableProperties = require('./getEnumerableProperties');\n\
\n\
module.exports = inspect;\n\
\n\
/**\n\
 * Echos the value of a value. Trys to print the value out\n\
 * in the best way possible given the different types.\n\
 *\n\
 * @param {Object} obj The object to print out.\n\
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)\n\
 *    properties of objects.\n\
 * @param {Number} depth Depth in which to descend in object. Default is 2.\n\
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the\n\
 *    output. Default is false (no coloring).\n\
 */\n\
function inspect(obj, showHidden, depth, colors) {\n\
  var ctx = {\n\
    showHidden: showHidden,\n\
    seen: [],\n\
    stylize: function (str) { return str; }\n\
  };\n\
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));\n\
}\n\
\n\
// https://gist.github.com/1044128/\n\
var getOuterHTML = function(element) {\n\
  if ('outerHTML' in element) return element.outerHTML;\n\
  var ns = \"http://www.w3.org/1999/xhtml\";\n\
  var container = document.createElementNS(ns, '_');\n\
  var elemProto = (window.HTMLElement || window.Element).prototype;\n\
  var xmlSerializer = new XMLSerializer();\n\
  var html;\n\
  if (document.xmlVersion) {\n\
    return xmlSerializer.serializeToString(element);\n\
  } else {\n\
    container.appendChild(element.cloneNode(false));\n\
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');\n\
    container.innerHTML = '';\n\
    return html;\n\
  }\n\
};\n\
\n\
// Returns true if object is a DOM element.\n\
var isDOMElement = function (object) {\n\
  if (typeof HTMLElement === 'object') {\n\
    return object instanceof HTMLElement;\n\
  } else {\n\
    return object &&\n\
      typeof object === 'object' &&\n\
      object.nodeType === 1 &&\n\
      typeof object.nodeName === 'string';\n\
  }\n\
};\n\
\n\
function formatValue(ctx, value, recurseTimes) {\n\
  // Provide a hook for user-specified inspect functions.\n\
  // Check that value is an object with an inspect function on it\n\
  if (value && typeof value.inspect === 'function' &&\n\
      // Filter out the util module, it's inspect function is special\n\
      value.inspect !== exports.inspect &&\n\
      // Also filter out any prototype objects using the circular check.\n\
      !(value.constructor && value.constructor.prototype === value)) {\n\
    var ret = value.inspect(recurseTimes);\n\
    if (typeof ret !== 'string') {\n\
      ret = formatValue(ctx, ret, recurseTimes);\n\
    }\n\
    return ret;\n\
  }\n\
\n\
  // Primitive types cannot have properties\n\
  var primitive = formatPrimitive(ctx, value);\n\
  if (primitive) {\n\
    return primitive;\n\
  }\n\
\n\
  // If it's DOM elem, get outer HTML.\n\
  if (isDOMElement(value)) {\n\
    return getOuterHTML(value);\n\
  }\n\
\n\
  // Look up the keys of the object.\n\
  var visibleKeys = getEnumerableProperties(value);\n\
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;\n\
\n\
  // Some type of object without properties can be shortcutted.\n\
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,\n\
  // a `stack` plus `description` property; ignore those for consistency.\n\
  if (keys.length === 0 || (isError(value) && (\n\
      (keys.length === 1 && keys[0] === 'stack') ||\n\
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')\n\
     ))) {\n\
    if (typeof value === 'function') {\n\
      var name = getName(value);\n\
      var nameSuffix = name ? ': ' + name : '';\n\
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');\n\
    }\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    }\n\
    if (isDate(value)) {\n\
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');\n\
    }\n\
    if (isError(value)) {\n\
      return formatError(value);\n\
    }\n\
  }\n\
\n\
  var base = '', array = false, braces = ['{', '}'];\n\
\n\
  // Make Array say that they are Array\n\
  if (isArray(value)) {\n\
    array = true;\n\
    braces = ['[', ']'];\n\
  }\n\
\n\
  // Make functions say that they are functions\n\
  if (typeof value === 'function') {\n\
    var name = getName(value);\n\
    var nameSuffix = name ? ': ' + name : '';\n\
    base = ' [Function' + nameSuffix + ']';\n\
  }\n\
\n\
  // Make RegExps say that they are RegExps\n\
  if (isRegExp(value)) {\n\
    base = ' ' + RegExp.prototype.toString.call(value);\n\
  }\n\
\n\
  // Make dates with properties first say the date\n\
  if (isDate(value)) {\n\
    base = ' ' + Date.prototype.toUTCString.call(value);\n\
  }\n\
\n\
  // Make error with message first say the error\n\
  if (isError(value)) {\n\
    return formatError(value);\n\
  }\n\
\n\
  if (keys.length === 0 && (!array || value.length == 0)) {\n\
    return braces[0] + base + braces[1];\n\
  }\n\
\n\
  if (recurseTimes < 0) {\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    } else {\n\
      return ctx.stylize('[Object]', 'special');\n\
    }\n\
  }\n\
\n\
  ctx.seen.push(value);\n\
\n\
  var output;\n\
  if (array) {\n\
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n\
  } else {\n\
    output = keys.map(function(key) {\n\
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n\
    });\n\
  }\n\
\n\
  ctx.seen.pop();\n\
\n\
  return reduceToSingleString(output, base, braces);\n\
}\n\
\n\
\n\
function formatPrimitive(ctx, value) {\n\
  switch (typeof value) {\n\
    case 'undefined':\n\
      return ctx.stylize('undefined', 'undefined');\n\
\n\
    case 'string':\n\
      var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                               .replace(/'/g, \"\\\\'\")\n\
                                               .replace(/\\\\\"/g, '\"') + '\\'';\n\
      return ctx.stylize(simple, 'string');\n\
\n\
    case 'number':\n\
      return ctx.stylize('' + value, 'number');\n\
\n\
    case 'boolean':\n\
      return ctx.stylize('' + value, 'boolean');\n\
  }\n\
  // For some reason typeof null is \"object\", so special case here.\n\
  if (value === null) {\n\
    return ctx.stylize('null', 'null');\n\
  }\n\
}\n\
\n\
\n\
function formatError(value) {\n\
  return '[' + Error.prototype.toString.call(value) + ']';\n\
}\n\
\n\
\n\
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n\
  var output = [];\n\
  for (var i = 0, l = value.length; i < l; ++i) {\n\
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          String(i), true));\n\
    } else {\n\
      output.push('');\n\
    }\n\
  }\n\
  keys.forEach(function(key) {\n\
    if (!key.match(/^\\d+$/)) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          key, true));\n\
    }\n\
  });\n\
  return output;\n\
}\n\
\n\
\n\
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n\
  var name, str;\n\
  if (value.__lookupGetter__) {\n\
    if (value.__lookupGetter__(key)) {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Getter/Setter]', 'special');\n\
      } else {\n\
        str = ctx.stylize('[Getter]', 'special');\n\
      }\n\
    } else {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Setter]', 'special');\n\
      }\n\
    }\n\
  }\n\
  if (visibleKeys.indexOf(key) < 0) {\n\
    name = '[' + key + ']';\n\
  }\n\
  if (!str) {\n\
    if (ctx.seen.indexOf(value[key]) < 0) {\n\
      if (recurseTimes === null) {\n\
        str = formatValue(ctx, value[key], null);\n\
      } else {\n\
        str = formatValue(ctx, value[key], recurseTimes - 1);\n\
      }\n\
      if (str.indexOf('\\n\
') > -1) {\n\
        if (array) {\n\
          str = str.split('\\n\
').map(function(line) {\n\
            return '  ' + line;\n\
          }).join('\\n\
').substr(2);\n\
        } else {\n\
          str = '\\n\
' + str.split('\\n\
').map(function(line) {\n\
            return '   ' + line;\n\
          }).join('\\n\
');\n\
        }\n\
      }\n\
    } else {\n\
      str = ctx.stylize('[Circular]', 'special');\n\
    }\n\
  }\n\
  if (typeof name === 'undefined') {\n\
    if (array && key.match(/^\\d+$/)) {\n\
      return str;\n\
    }\n\
    name = JSON.stringify('' + key);\n\
    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
      name = name.substr(1, name.length - 2);\n\
      name = ctx.stylize(name, 'name');\n\
    } else {\n\
      name = name.replace(/'/g, \"\\\\'\")\n\
                 .replace(/\\\\\"/g, '\"')\n\
                 .replace(/(^\"|\"$)/g, \"'\");\n\
      name = ctx.stylize(name, 'string');\n\
    }\n\
  }\n\
\n\
  return name + ': ' + str;\n\
}\n\
\n\
\n\
function reduceToSingleString(output, base, braces) {\n\
  var numLinesEst = 0;\n\
  var length = output.reduce(function(prev, cur) {\n\
    numLinesEst++;\n\
    if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
    return prev + cur.length + 1;\n\
  }, 0);\n\
\n\
  if (length > 60) {\n\
    return braces[0] +\n\
           (base === '' ? '' : base + '\\n\
 ') +\n\
           ' ' +\n\
           output.join(',\\n\
  ') +\n\
           ' ' +\n\
           braces[1];\n\
  }\n\
\n\
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
}\n\
\n\
function isArray(ar) {\n\
  return Array.isArray(ar) ||\n\
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');\n\
}\n\
\n\
function isRegExp(re) {\n\
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';\n\
}\n\
\n\
function isDate(d) {\n\
  return typeof d === 'object' && objectToString(d) === '[object Date]';\n\
}\n\
\n\
function isError(e) {\n\
  return typeof e === 'object' && objectToString(e) === '[object Error]';\n\
}\n\
\n\
function objectToString(o) {\n\
  return Object.prototype.toString.call(o);\n\
}\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/inspect.js"
));
require.register("chaijs-chai/lib/chai/utils/objDisplay.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var inspect = require('./inspect');\n\
\n\
/**\n\
 * ### .objDisplay (object)\n\
 *\n\
 * Determines if an object or an array matches\n\
 * criteria to be inspected in-line for error\n\
 * messages or should be truncated.\n\
 *\n\
 * @param {Mixed} javascript object to inspect\n\
 * @name objDisplay\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = inspect(obj)\n\
    , type = Object.prototype.toString.call(obj);\n\
\n\
  if (str.length >= 40) {\n\
    if (type === '[object Function]') {\n\
      return !obj.name || obj.name === ''\n\
        ? '[Function]'\n\
        : '[Function: ' + obj.name + ']';\n\
    } else if (type === '[object Array]') {\n\
      return '[ Array(' + obj.length + ') ]';\n\
    } else if (type === '[object Object]') {\n\
      var keys = Object.keys(obj)\n\
        , kstr = keys.length > 2\n\
          ? keys.splice(0, 2).join(', ') + ', ...'\n\
          : keys.join(', ');\n\
      return '{ Object (' + kstr + ') }';\n\
    } else {\n\
      return str;\n\
    }\n\
  } else {\n\
    return str;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/objDisplay.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing method and provides\n\
 * access to previous function. Must return function\n\
 * to be used for name.\n\
 *\n\
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {\n\
 *       return function (str) {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.value).to.equal(str);\n\
 *         } else {\n\
 *           _super.apply(this, arguments);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.equal('bar');\n\
 *\n\
 * @param {Object} ctx object whose method is to be overwritten\n\
 * @param {String} name of method to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @name overwriteMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  var _method = ctx[name]\n\
    , _super = function () { return this; };\n\
\n\
  if (_method && 'function' === typeof _method)\n\
    _super = _method;\n\
\n\
  ctx[name] = function () {\n\
    var result = method(_super).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteProperty utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteProperty (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing property getter and provides\n\
 * access to previous value. Must return function to use as getter.\n\
 *\n\
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {\n\
 *       return function () {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.name).to.equal('bar');\n\
 *         } else {\n\
 *           _super.call(this);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.ok;\n\
 *\n\
 * @param {Object} ctx object whose property is to be overwritten\n\
 * @param {String} name of property to overwrite\n\
 * @param {Function} getter function that returns a getter function to be used for name\n\
 * @name overwriteProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  var _get = Object.getOwnPropertyDescriptor(ctx, name)\n\
    , _super = function () {};\n\
\n\
  if (_get && 'function' === typeof _get.get)\n\
    _super = _get.get\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter(_super).call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/test.js", Function("exports, require, module",
"/*!\n\
 * Chai - test utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag');\n\
\n\
/**\n\
 * # test(object, expression)\n\
 *\n\
 * Test and object for expression.\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , expr = args[0];\n\
  return negate ? !expr : expr;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/test.js"
));
require.register("chaijs-chai/lib/chai/utils/transferFlags.js", Function("exports, require, module",
"/*!\n\
 * Chai - transferFlags utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### transferFlags(assertion, object, includeAll = true)\n\
 *\n\
 * Transfer all the flags for `assertion` to `object`. If\n\
 * `includeAll` is set to `false`, then the base Chai\n\
 * assertion flags (namely `object`, `ssfi`, and `message`)\n\
 * will not be transferred.\n\
 *\n\
 *\n\
 *     var newAssertion = new Assertion();\n\
 *     utils.transferFlags(assertion, newAssertion);\n\
 *\n\
 *     var anotherAsseriton = new Assertion(myObj);\n\
 *     utils.transferFlags(assertion, anotherAssertion, false);\n\
 *\n\
 * @param {Assertion} assertion the assertion to transfer the flags from\n\
 * @param {Object} object the object to transfer the flags too; usually a new assertion\n\
 * @param {Boolean} includeAll\n\
 * @name getAllFlags\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (assertion, object, includeAll) {\n\
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));\n\
\n\
  if (!object.__flags) {\n\
    object.__flags = Object.create(null);\n\
  }\n\
\n\
  includeAll = arguments.length === 3 ? includeAll : true;\n\
\n\
  for (var flag in flags) {\n\
    if (includeAll ||\n\
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {\n\
      object.__flags[flag] = flags[flag];\n\
    }\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/transferFlags.js"
));
require.register("chaijs-chai/lib/chai/utils/type.js", Function("exports, require, module",
"/*!\n\
 * Chai - type utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Arguments]': 'arguments'\n\
  , '[object Array]': 'array'\n\
  , '[object Date]': 'date'\n\
  , '[object Function]': 'function'\n\
  , '[object Number]': 'number'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object String]': 'string'\n\
};\n\
\n\
/**\n\
 * ### type(object)\n\
 *\n\
 * Better implementation of `typeof` detection that can\n\
 * be used cross-browser. Handles the inconsistencies of\n\
 * Array, `null`, and `undefined` detection.\n\
 *\n\
 *     utils.type({}) // 'object'\n\
 *     utils.type(null) // `null'\n\
 *     utils.type(undefined) // `undefined`\n\
 *     utils.type([]) // `array`\n\
 *\n\
 * @param {Mixed} object to detect type of\n\
 * @name type\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/type.js"
));
require.register("visionmedia-mocha-cloud/client.js", Function("exports, require, module",
"\n\
/**\n\
 * Listen to `runner` events to populate a global\n\
 * `.mochaResults` var which may be used by selenium\n\
 * to report on results.\n\
 *\n\
 *    cloud(mocha.run());\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(runner){\n\
  var failed = [];\n\
\n\
  runner.on('fail', function(test, err){\n\
    failed.push({\n\
      title: test.title,\n\
      fullTitle: test.fullTitle(),\n\
      error: {\n\
        message: err.message,\n\
        stack: err.stack\n\
      }\n\
    });\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    runner.stats.failed = failed;\n\
    global.mochaResults = runner.stats;\n\
  });\n\
};//@ sourceURL=visionmedia-mocha-cloud/client.js"
));
require.register("modelfactory/lib/index.js", Function("exports, require, module",
"\n\
/*!\n\
 * deps\n\
 */\n\
\n\
var Schema = require('./schema'),\n\
    Model = require('./model'),\n\
    globals = require('./globals'),\n\
    Errors = require('./errors'),\n\
    idCounter = 0;\n\
\n\
/*!\n\
 * module globals\n\
 */\n\
\n\
var modelfactory = {},\n\
    plugins = [],\n\
    define, compile;\n\
\n\
\n\
/**\n\
 * create unique id\n\
 * @return {String}\n\
 */\n\
\n\
function uniqueId() {\n\
  return  'm_' + (++idCounter);\n\
}\n\
\n\
/*!\n\
 * exports stuffs\n\
 */\n\
\n\
module.exports = modelfactory;\n\
modelfactory.Schema = Schema;\n\
modelfactory.Error = Errors;\n\
\n\
/**\n\
 * compile schema\n\
 *\n\
 * @param  {Object} tree\n\
 * @param  {Object} proto\n\
 * @param  {String} prefix\n\
 * @api private\n\
 */\n\
\n\
compile = function compile(tree, proto, prefix) {\n\
  var keys = Object.keys(tree);\n\
  keys.forEach(function (key) {\n\
    var limb = tree[key];\n\
\n\
    define(key,\n\
           (('Object' === limb.constructor.name\n\
               && Object.keys(limb).length)\n\
               && (!limb.type || limb.type.type)\n\
               ? limb\n\
               : null),\n\
           proto,\n\
           prefix,\n\
           keys);\n\
  });\n\
};\n\
\n\
/**\n\
 * define accessors on the incoming prototype\n\
 *\n\
 * @param  {[type]} prop\n\
 * @param  {[type]} subprops\n\
 * @param  {[type]} prototype\n\
 * @param  {[type]} prefix\n\
 * @api private\n\
 */\n\
\n\
define = function define(prop, subprops, prototype, prefix) {\n\
  prefix || (prefix = '');\n\
  var path = (prefix ? prefix + '.' : '') + prop;\n\
\n\
  if (subprops) {\n\
    return Object.defineProperty(prototype, prop, {\n\
      enumerable: true,\n\
\n\
      get: function () {\n\
        if (!this.__getters) this.__getters = {};\n\
\n\
        if (!this.__getters[path]) {\n\
          var nested = {};\n\
\n\
          // set scope\n\
          Object.defineProperty(nested, '__scope__', {\n\
            value: prefix ? this.__scope__ : this\n\
          });\n\
\n\
          compile(subprops, nested, path);\n\
          this.__getters[path] = nested;\n\
        }\n\
        return this.__getters[path];\n\
      },\n\
\n\
      set: function (v) {\n\
        (this.__scope__ || this).set(path, v);\n\
      }\n\
    });\n\
  } else {\n\
    Object.defineProperty(prototype, prop, {\n\
      enumerable: true,\n\
\n\
      get: function () {\n\
        if (this.__scope__) return this.__scope__.get(path);\n\
        if (this.get) return this.get(path);\n\
        return this[path];\n\
      },\n\
\n\
      set: function (v) {\n\
        (this.__scope__ || this).set(path, v);\n\
      }\n\
    });\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Declares a global plugin executed on all Schemas.\n\
 *\n\
 * Equivalent to calling `.plugin(fn)` on each Schema you create.\n\
 *\n\
 * @param {Function} fn plugin callback\n\
 * @param {Object} [opts] optional options\n\
 * @return {Modelfactory} this\n\
 * @api public\n\
 */\n\
\n\
modelfactory.plugin = function (fn, opts) {\n\
  plugins.push([fn, opts]);\n\
  return modelfactory;\n\
};\n\
\n\
/**\n\
 * model factory\n\
 *\n\
 * example:\n\
 *   User = modelfactory.model({\n\
 *     firstname: String,\n\
 *     lastname: String,\n\
 *   })\n\
 *\n\
 * @param  {Schema} schema\n\
 * @return {Model} the model class constructor\n\
 * @api public\n\
 */\n\
\n\
modelfactory.model = function (schema) {\n\
\n\
  // cast to Schema instance?\n\
  if (!(schema instanceof Schema)) {\n\
    schema = new Schema(schema);\n\
  }\n\
\n\
  // return model already generated\n\
  if (schema.model) return schema.model;\n\
\n\
  // apply plugins\n\
  plugins.forEach(function (plugin) {\n\
    schema.plugin.apply(schema, plugin);\n\
  });\n\
\n\
  // create model class\n\
  function model (obj) {\n\
    if (!obj) obj = {};\n\
\n\
    var id = obj[globals.idAttribute],\n\
        existing = schema.store.get(id);\n\
\n\
    // return existing model\n\
    if (existing) {\n\
      existing.set(obj);\n\
      return existing;\n\
    }\n\
\n\
    Object.defineProperty(this, '_doc', {value: Object.create(null)});\n\
    Object.defineProperty(this, 'schema', {value: schema});\n\
    Object.defineProperty(this, '_callbacks', {\n\
        value: Object.create(null),\n\
        writable: true\n\
      });\n\
\n\
    this.cid = uniqueId();\n\
    this.id = id;\n\
    this._build(obj);\n\
    this.emit('init', this);\n\
\n\
    // add to store\n\
    schema.store.add(this);\n\
  }\n\
\n\
  // store generated model\n\
  schema.model = model;\n\
\n\
  // inherit from Model\n\
  model.prototype.__proto__ = Model.prototype;\n\
\n\
  // compile schema\n\
  compile(schema.tree, model.prototype);\n\
\n\
  // apply methods & statics\n\
  for (var i in schema.methods) model.prototype[i] = schema.methods[i];\n\
  for (i in schema.statics) model[i] = schema.statics[i];\n\
\n\
  // attach schema\n\
  model.schema = schema;\n\
\n\
  return model;\n\
};\n\
\n\
/*!\n\
 * expose model factory\n\
 * to DocumentArray to let them create EmbeddedDocument\n\
 */\n\
\n\
require('./schema/documentarray').model = module.exports.model;\n\
//@ sourceURL=modelfactory/lib/index.js"
));
require.register("modelfactory/lib/model.js", Function("exports, require, module",
"var Emitter = require('emitter'),\n\
    utils = require('./utils'),\n\
    globals = require('./globals'),\n\
    getPath = utils.getPath,\n\
    hasPath = utils.hasPath,\n\
    setPath = utils.setPath;\n\
\n\
/**\n\
 * Model Class\n\
 */\n\
\n\
function Model() {\n\
}\n\
\n\
/*!\n\
 * Inherit from Emitter\n\
 */\n\
\n\
Model.prototype.__proto__ = Emitter.prototype;\n\
\n\
/*!\n\
 * export\n\
 */\n\
\n\
module.exports = Model;\n\
\n\
/*!\n\
 * get model id using idAttribute property\n\
 *\n\
 * @property id\n\
 * @api public\n\
 */\n\
\n\
Object.defineProperty(Model.prototype, 'id', {\n\
  get: function () {\n\
    return this[globals.idAttribute];\n\
  },\n\
  set: function (val) {\n\
    this.set(globals.idAttribute, val);\n\
  }\n\
});\n\
\n\
/**\n\
 * Has this model been saved to the server yet\n\
 *\n\
 * @property isNew\n\
 * @api public\n\
 */\n\
\n\
Object.defineProperty(Model.prototype, 'isNew', {\n\
  get: function () {\n\
    return !this.id;\n\
  }\n\
});\n\
\n\
\n\
/**\n\
 * compare to models\n\
 *\n\
 * @param  {Model} doc\n\
 * @return {Boolean}\n\
 */\n\
\n\
Model.prototype.equals = function (doc) {\n\
  if (doc === this) return true;\n\
  var id = doc[globals.idAttribute];\n\
  if (!id) return false;\n\
  return id === this.id;\n\
};\n\
\n\
/**\n\
 * Get property using schema getters\n\
 *\n\
 * @param  {String} key\n\
 * @return {Object} path value\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.get = function (path) {\n\
  if (!path) return this;\n\
\n\
  var schema = this.schema.path(path) || this.schema.virtualpath(path),\n\
      obj = getPath(this._doc, path);\n\
\n\
  if (schema) return schema.applyGetters(obj, this);\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * get parent document\n\
 */\n\
\n\
Model.prototype.parent = function () {\n\
  return this._parent;\n\
};\n\
\n\
/**\n\
 * get parent array\n\
 */\n\
\n\
Model.prototype.parentArray = function () {\n\
  return this._parentArray;\n\
};\n\
\n\
/**\n\
 * Get raw value\n\
 *\n\
 * @param  {String} key\n\
 * @return {Object} path raw value\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.getValue = function (path) {\n\
  return getPath(this._doc, path);\n\
};\n\
\n\
/**\n\
 * set property\n\
 *\n\
 * @param  {String|Object}  key\n\
 * @param  {Object}         val\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.set = function (key, val, opts) {\n\
  if (key == null) return this;\n\
  var paths = [],\n\
      changedPaths = [],\n\
      parent = this._parentArray,\n\
      silent, schema, path, ev, parts;\n\
\n\
  // handle model.set(key, val)\n\
  if ('string' === typeof key) {\n\
    schema = this.schema.path(key) || this.schema.virtualpath(key);\n\
    if (val && ('object' === typeof val)) {\n\
      paths = this.schema.getKeyVals(val, key);\n\
    } else if (schema) {\n\
      paths.push({key: key, val: val});\n\
    }\n\
\n\
  // handle model.set(val)\n\
  } else {\n\
    paths = this.schema.getKeyVals(key);\n\
    opts = val;\n\
  }\n\
\n\
  // silent opt\n\
  silent = opts && opts.silent;\n\
\n\
  // iterate over paths\n\
  paths.forEach(function (keyval) {\n\
    var key = keyval.key,\n\
        val = keyval.val,\n\
        schema;\n\
\n\
    // return if value has not changed\n\
    if (getPath(this._doc, key) === val) return;\n\
\n\
    // get path's schema\n\
    schema = this.schema.path(key) || this.schema.virtualpath(key);\n\
\n\
    // apply setters\n\
    val = schema.applySetters(val, this);\n\
\n\
    // apply value\n\
    if (schema.instance !== 'virtual') setPath(this._doc, key, val);\n\
\n\
    // trigger events\n\
    if (!silent) {\n\
\n\
      // key event\n\
      ev = 'change:' + key;\n\
      if (this.hasListeners(ev) || (parent && parent.hasListeners(ev))) {\n\
        changedPaths[ev] = this.get(key);\n\
      }\n\
\n\
      // prepare subpath events\n\
      parts = key.split('.');\n\
      while(parts.length) {\n\
        parts.pop();\n\
        path = parts.join('.');\n\
        ev = 'change';\n\
        if (path) ev += ':' + path;\n\
\n\
        // don't bother calculate this.get(path) if there are not listeners\n\
        if (this.hasListeners(ev) || (parent && parent.hasListeners(ev))) {\n\
          changedPaths[ev] = this.get(path);\n\
        }\n\
      }\n\
    }\n\
  }, this);\n\
\n\
  // emit events\n\
  if (!silent) {\n\
    Object\n\
      .keys(changedPaths)\n\
      .forEach(function (ev) {\n\
        this.emit(ev, changedPaths[ev], this);\n\
        if (parent) parent.emit(ev, changedPaths[ev], this, parent);\n\
      }, this);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * build model with specified obj and default values\n\
 *\n\
 * @param  {Object}  obj\n\
 * @api private\n\
 */\n\
\n\
Model.prototype._build = function (obj) {\n\
\n\
  Object\n\
    .keys(this.schema.paths)\n\
    .forEach(function (key) {\n\
      var schema = this.schema.paths[key],\n\
          exist = hasPath(obj, key),\n\
          val;\n\
\n\
      if (exist) {\n\
        val = exist.val;\n\
      } else if (schema.defaultValue) {\n\
        val = schema.getDefault();\n\
      } else {\n\
        return;\n\
      }\n\
\n\
      // apply setters\n\
      val = schema.applySetters(val, this);\n\
      setPath(this._doc, key, val);\n\
\n\
    }, this);\n\
\n\
  Object\n\
    .keys(this.schema.virtuals)\n\
    .forEach(function (key) {\n\
      var exist = hasPath(obj, key),\n\
          path = this.schema.virtuals[key];\n\
      if (!exist || !path.setters.length) return;\n\
      path.applySetters(exist.val, this);\n\
    }, this);\n\
};\n\
\n\
/**\n\
 * validate doc\n\
 *\n\
 * opts are:\n\
 *   - path list of path to validate for this model default to all\n\
 *\n\
 * @param  {Object} doc to validate\n\
 * @param  {Object} opts\n\
 * @return {Array}  error array if any\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.validate = function (doc, opts) {\n\
  if (!opts) {\n\
    opts = doc || {};\n\
    doc = this._doc;\n\
  }\n\
\n\
  var errors = [],\n\
      paths;\n\
\n\
  if ('string' === typeof opts) {\n\
    paths = opts.split(' ');\n\
  } else if ('string' === typeof opts.paths) {\n\
    paths = opts.paths.split(' ');\n\
  } else if (Array.isArray(opts)) {\n\
    paths = opts;\n\
  } else if (Array.isArray(opts.paths)) {\n\
    paths = opts.paths;\n\
  }\n\
\n\
  // validate all if no path specified\n\
  if (!paths) paths = Object.keys(this.schema.paths);\n\
\n\
  paths.forEach(function (path) {\n\
    var p = this.schema.path(path),\n\
        val = getPath(doc, path),\n\
        err = p.doValidate(val, this);\n\
    if (err) errors.push.apply(errors, err);\n\
  }, this);\n\
\n\
  if (errors.length) return errors;\n\
};\n\
\n\
/**\n\
 * dispose model\n\
 *\n\
 * remove from parentArray\n\
 * remove all listener\n\
 * and remove model from store\n\
 */\n\
\n\
Model.prototype.dispose = function () {\n\
  var arr = this.parentArray();\n\
  if (arr) arr.remove(this);\n\
  this.schema.store.remove(this);\n\
  this.off();\n\
};\n\
\n\
/**\n\
 * extract specified properties\n\
 *\n\
 * @param {string} ppties space separated list of properties\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.pick = function (ppties) {\n\
  var obj = {};\n\
  ppties.split(' ').forEach(function (key) {\n\
    obj[key] = (this._doc[key] && this._doc[key].toJSON)\n\
             ? this._doc[key].toJSON()\n\
             : this._doc[key];\n\
  }, this);\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * get JSON representation of this model\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
Model.prototype.toJSON = function () {\n\
  var obj = {};\n\
  Object.keys(this.schema.tree).forEach(function (key) {\n\
    obj[key] = (this._doc[key] && this._doc[key].toJSON)\n\
             ? this._doc[key].toJSON()\n\
             : this._doc[key];\n\
  }, this);\n\
  return obj;\n\
};\n\
\n\
//@ sourceURL=modelfactory/lib/model.js"
));
require.register("modelfactory/lib/utils.js", Function("exports, require, module",
"/**\n\
 * get nested property\n\
 * @param  {Object} obj\n\
 * @param  {String} path\n\
 */\n\
\n\
module.exports.getPath = function getPath(obj, path) {\n\
  var paths = path.split('.'),\n\
      ref = obj,\n\
      i;\n\
\n\
  for (i = 0; i < paths.length; i++) {\n\
    path = paths[i];\n\
    if (!ref[path]) return ref[path];\n\
    ref = ref[path];\n\
  }\n\
  return ref;\n\
};\n\
\n\
/**\n\
 * check if obj has specified path\n\
 *\n\
 * @param  {Object}  obj\n\
 * @param  {String}  path\n\
 * @return {Object} false if path does not exist or truthy {val: 'xxx'} if value exist\n\
 */\n\
\n\
module.exports.hasPath = function hasPath(obj, path) {\n\
  var paths = path.split('.'),\n\
      ref = obj,\n\
      i;\n\
\n\
  for (i = 0; i < paths.length; i++) {\n\
    path = paths[i];\n\
    if (!ref.hasOwnProperty(path)) return false;\n\
    ref = ref[path];\n\
  }\n\
  return {val: ref};\n\
};\n\
\n\
/**\n\
 * set nested property\n\
 *\n\
 * @param  {Object} obj\n\
 * @param  {String} path\n\
 * @param  {Object} val\n\
 */\n\
\n\
module.exports.setPath = function setPath(obj, path, val) {\n\
  var subpaths = path.split('.'),\n\
      last = subpaths.pop();\n\
\n\
  obj = subpaths.reduce(function(prev, current){\n\
    if (!prev[current]) prev[current] = Object.create(null);\n\
    return prev[current];\n\
\n\
  }, obj);\n\
\n\
  if (obj) obj[last] = val;\n\
};\n\
//@ sourceURL=modelfactory/lib/utils.js"
));
require.register("modelfactory/lib/globals.js", Function("exports, require, module",
"module.exports.idAttribute = '_id';//@ sourceURL=modelfactory/lib/globals.js"
));
require.register("modelfactory/lib/schema.js", Function("exports, require, module",
"\n\
/**\n\
 * module dependencies\n\
 */\n\
\n\
var Types = require('./schema/index'),\n\
    VirtualType = require('./virtualType'),\n\
    utils = require('./utils'),\n\
    Store = require('./store'),\n\
    globals = require('./globals'),\n\
    hasPath = utils.hasPath;\n\
\n\
/**\n\
 * create a new Schema\n\
 *\n\
 * examples\n\
 *   schema = new Schema({\n\
 *     firstname: String,\n\
 *     lastname: String\n\
 *   }, {store: true})\n\
 *\n\
 * Options are:\n\
 * store: use internal storage to store models\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Object} opts\n\
 */\n\
\n\
function Schema(obj, opts) {\n\
  if (!obj) obj = {};\n\
  this.paths = {};\n\
  this.tree = {};\n\
  this.virtuals = {};\n\
  this.methods = {};\n\
  this.statics = {};\n\
  this.options = opts || {store: true};\n\
\n\
  if (this.options.store) {\n\
    this.store = new Store();\n\
  } else {\n\
    this.store = Store.noop;\n\
  }\n\
\n\
  // add id key if not present\n\
  if (!obj.hasOwnProperty(globals.idAttribute)) {\n\
    obj[globals.idAttribute] = {type: String};\n\
  }\n\
\n\
  this.add(obj);\n\
}\n\
\n\
/*!\n\
 * name property\n\
 */\n\
\n\
Schema.prototype.name = 'Schema';\n\
\n\
/**\n\
 * module exports\n\
 */\n\
\n\
module.exports = Schema;\n\
\n\
/**\n\
 * expose Types\n\
 */\n\
\n\
Schema.Types = Types;\n\
\n\
/**\n\
 * add key path / schema type pairs to this schema\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prefix\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.add = function(obj, prefix) {\n\
  prefix || (prefix = '');\n\
\n\
  Object.keys(obj).forEach(function(key) {\n\
\n\
    if (!obj[key]) {\n\
      throw new TypeError('Invalid value for schema path `' + (prefix + key) + '`');\n\
    }\n\
\n\
    if (obj[key].constructor && obj[key].constructor.name !== 'Object') {\n\
      obj[key] = {type: obj[key]};\n\
    }\n\
\n\
    if (Array.isArray(obj[key]) || Array.isArray(obj[key].type)) {\n\
      this.path(prefix + key, obj[key]);\n\
    } else if (obj[key].type instanceof Schema) {\n\
      this.path(prefix + key, obj[key]);\n\
    } else if (obj[key].type && 'function' === typeof obj[key].type) {\n\
      this.path(prefix + key, obj[key]);\n\
    } else {\n\
      this.add(obj[key], prefix + key + '.');\n\
    }\n\
  }, this);\n\
};\n\
\n\
/**\n\
 * Gets/Sets schema paths\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} constructor\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.path = function(path, obj) {\n\
  var branch, last, subpaths;\n\
\n\
  if (!obj) {\n\
    if (this.paths[path]) return this.paths[path];\n\
    return undefined;\n\
  }\n\
\n\
  subpaths = path.split(/\\./);\n\
  last = subpaths.pop();\n\
  branch = this.tree;\n\
\n\
  subpaths.forEach(function(sub, i) {\n\
    if (!branch[sub]) branch[sub] = {};\n\
    if ('object' !== typeof branch[sub]) {\n\
      throw new Error(\n\
          'Cannot set nested path `' + path + '`.\\n\
'\n\
        + 'Parent path `' + (subpaths.slice(0, i).concat([sub]).join('.')) + '\\n\
'\n\
        + 'already set to type ' + branch[sub].name + '.'\n\
      );\n\
    }\n\
    branch = branch[sub];\n\
  });\n\
\n\
  branch[last] = obj;\n\
  this.paths[path] = Schema.interpretAsType(path, obj);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Returns the virtual type with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {VirtualType}\n\
 */\n\
\n\
Schema.prototype.virtualpath = function (name) {\n\
  return this.virtuals[name];\n\
};\n\
\n\
/**\n\
 * Converts type arguments into Types.\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} obj constructor\n\
 * @api private\n\
 */\n\
\n\
Schema.interpretAsType = function(path, obj) {\n\
  var type = obj.type && !obj.type.type\n\
    ? obj.type\n\
    : {};\n\
\n\
  if (obj.type instanceof Schema) {\n\
    return new Types.EmbeddedDocument(path,  obj);\n\
  }\n\
\n\
  if (Array.isArray(obj) || Array.isArray(obj.type)) {\n\
    return new Types.DocumentArray(path,  obj);\n\
  }\n\
\n\
  var SchemaType = Types.getSchemaType(type);\n\
  if (!SchemaType) throw new TypeError('Undefined type at ' + path);\n\
\n\
  return new SchemaType(path, obj);\n\
};\n\
\n\
/**\n\
 * Creates a virtual type with the given name.\n\
 *\n\
 * @param {String} name\n\
 * @return {VirtualType}\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.virtual = function (name) {\n\
  var virtuals = this.virtuals;\n\
  var parts = name.split('.');\n\
\n\
  virtuals[name] = parts.reduce(function (mem, part, i) {\n\
    mem[part] || (mem[part] = (i === parts.length-1)\n\
                            ? new VirtualType(name)\n\
                            : {});\n\
    return mem[part];\n\
  }, this.tree);\n\
  return virtuals[name];\n\
};\n\
\n\
/**\n\
 * extract path/value from object\n\
 *\n\
 * @param  {Object} obj\n\
 * @return {Object}\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.getKeyVals = function (obj, prefix) {\n\
  var ret = [],\n\
      o;\n\
\n\
  if (prefix) {\n\
    o = {};\n\
    o[prefix] = obj;\n\
  } else {\n\
    o = obj;\n\
  }\n\
\n\
  Object\n\
    .keys(this.paths)\n\
    .forEach(function (key) {\n\
      var exist = hasPath(o, key);\n\
      if (exist) {\n\
        ret.push({\n\
          key: key,\n\
          val: exist.val\n\
        });\n\
      }\n\
    });\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Registers a plugin for this schema.\n\
 *\n\
 * @param {Function} plugin callback\n\
 * @param {Object} opts\n\
 * @see plugins\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.plugin = function (fn, opts) {\n\
  fn(this, opts);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an instance method\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.method = function (name, fn) {\n\
  if ('string' !== typeof name) {\n\
    for (var i in name) this.methods[i] = name[i];\n\
  } else {\n\
    this.methods[name] = fn;\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds a static method\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Schema.prototype.static = function(name, fn) {\n\
  if ('string' !== typeof name) {\n\
    for (var i in name) this.statics[i] = name[i];\n\
  } else {\n\
    this.statics[name] = fn;\n\
  }\n\
  return this;\n\
};//@ sourceURL=modelfactory/lib/schema.js"
));
require.register("modelfactory/lib/store.js", Function("exports, require, module",
"var noop = function () {};\n\
\n\
/**\n\
 * create a new Store\n\
 *\n\
 * examples:\n\
 *     store = new Store()\n\
 *     store.add({id: 1, name: 'pg'})\n\
 *     user = store.get(1)\n\
 *     store.remove(user)\n\
 *     store.clear()\n\
 */\n\
\n\
function Store() {\n\
  this.caches = Object.create(null);\n\
  this.indexes = [];\n\
  this.index('id');\n\
  this.clear();\n\
}\n\
\n\
/**\n\
 * add Index\n\
 */\n\
\n\
Store.prototype.index = function (name) {\n\
  this.indexes.push(name);\n\
  this.caches[name] = Object.create(null);\n\
};\n\
\n\
/**\n\
 * clear store\n\
 */\n\
\n\
Store.prototype.clear = function () {\n\
  this.indexes.forEach(function (index) {\n\
    this.caches[index] = Object.create(null);\n\
  }, this);\n\
};\n\
\n\
/**\n\
 * get model in store with specified index and value\n\
 *\n\
 * @param  {String} index\n\
 * @param  {String} value\n\
 * @return {Model}\n\
 */\n\
\n\
Store.prototype.getBy = function (index, value) {\n\
  return this.caches[index][value];\n\
};\n\
\n\
/**\n\
 * get model in store with specified id\n\
 *\n\
 * @param  {String} id\n\
 * @return {Model}\n\
 */\n\
\n\
Store.prototype.get = function (id) {\n\
  return this.caches.id[id];\n\
};\n\
\n\
/**\n\
 * add model to store\n\
 *\n\
 * @param {Model} model\n\
 */\n\
\n\
Store.prototype.add = function (model) {\n\
  this.indexes.forEach(function (index) {\n\
    var key = model[index];\n\
    if (key) this.caches[index][key] = model;\n\
  }, this);\n\
};\n\
\n\
/**\n\
 * remove model from store\n\
 *\n\
 * @param  {Model} model\n\
 */\n\
\n\
Store.prototype.remove = function (model) {\n\
  this.indexes.forEach(function (index) {\n\
    delete this.caches[index][model.id];\n\
  }, this);\n\
};\n\
\n\
/**\n\
 *  noop store used in place of a real store instance\n\
 *  to turn off storing option\n\
 */\n\
\n\
Store.noop = {\n\
  clear: noop,\n\
  get: noop,\n\
  getBy: noop,\n\
  add: noop,\n\
  remove: noop\n\
};\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = Store;\n\
\n\
//@ sourceURL=modelfactory/lib/store.js"
));
require.register("modelfactory/lib/type.js", Function("exports, require, module",
"/**\n\
 * Type constructor\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Type (name) {\n\
  this.path = name;\n\
  this.getters = [];\n\
  this.setters = [];\n\
}\n\
\n\
/**\n\
 * exports\n\
 */\n\
\n\
module.exports = Type;\n\
\n\
\n\
/**\n\
 * Defines a getter.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Type} this\n\
 * @api public\n\
 */\n\
\n\
Type.prototype.get = function (fn) {\n\
  this.getters.push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Defines a setter.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Type} this\n\
 * @api public\n\
 */\n\
\n\
Type.prototype.set = function (fn) {\n\
  this.setters.push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Applies setters to a value\n\
 *\n\
 * @param {Object} value\n\
 * @param {Object} scope\n\
 * @api private\n\
 */\n\
\n\
Type.prototype.applySetters = function (value, scope) {\n\
  var v = value,\n\
      self = this;\n\
\n\
  this.setters.forEach(function (setter) {\n\
    v = setter.call(scope, v, self);\n\
  });\n\
\n\
  return this.cast(v, scope);\n\
};\n\
\n\
/**\n\
 * Applies getters to a value\n\
 *\n\
 * @param {Object} value\n\
 * @param {Object} scope\n\
 * @api private\n\
 */\n\
\n\
Type.prototype.applyGetters = function (value, scope) {\n\
  var v = value,\n\
      self = this;\n\
\n\
  this.getters.forEach(function (getter) {\n\
    v = getter.call(scope, v, self);\n\
  });\n\
\n\
  return v;\n\
};\n\
\n\
/**\n\
 * cast value to type default to identity\n\
 *\n\
 * @param  {Object} value to cast\n\
 * @return {Object} casted value\n\
 * @api private\n\
 */\n\
\n\
Type.prototype.cast = function (v) {\n\
  return v;\n\
};\n\
\n\
/**\n\
 * Sets a default value for this Type.\n\
 *\n\
 * @param {Function|any} val the default value\n\
 * @return {defaultValue}\n\
 * @api public\n\
 */\n\
\n\
Type.prototype.default = function (val) {\n\
  this.defaultValue = typeof val === 'function'\n\
    ? val\n\
    : this.cast(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Gets the default value\n\
 *\n\
 * @param {Object} scope the scope which callback are executed\n\
 * @api private\n\
 */\n\
\n\
Type.prototype.getDefault = function (scope) {\n\
  var ret = 'function' === typeof this.defaultValue\n\
    ? this.defaultValue.call(scope)\n\
    : this.defaultValue;\n\
  return ret;\n\
};\n\
\n\
//@ sourceURL=modelfactory/lib/type.js"
));
require.register("modelfactory/lib/schemaType.js", Function("exports, require, module",
"/**\n\
 * module deps\n\
 */\n\
\n\
var ValidatorError = require('./errors/validator'),\n\
    Type = require('./type');\n\
\n\
/**\n\
 * SchemaType constructor\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} options\n\
 * @param {String} instance\n\
 */\n\
\n\
function SchemaType(name, options, instance) {\n\
  Type.call(this, name);\n\
  this.options = options;\n\
  this.instance = instance;\n\
  this.validators = [];\n\
\n\
  Object.keys(options).forEach(function(name) {\n\
    var fn = this[name];\n\
\n\
    if (fn && 'function' === typeof fn) {\n\
      this[name].call(this, options[name]);\n\
    }\n\
  }, this);\n\
}\n\
\n\
/**\n\
 * extend Type\n\
 */\n\
\n\
SchemaType.prototype.__proto__ = Type.prototype;\n\
\n\
\n\
/**\n\
 * module exports\n\
 */\n\
\n\
module.exports = SchemaType;\n\
\n\
/**\n\
 * Add validator\n\
 * @param  {function} fn\n\
 * @param  {String}   error\n\
 * @api public\n\
 */\n\
\n\
SchemaType.prototype.validate = function(obj, error) {\n\
  this.validators.push([obj, error]);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * validate value\n\
 *\n\
 * @param  {Object}   value\n\
 * @param  {Object}   scope\n\
 * @return {[Array]}\n\
 * @api private\n\
 */\n\
\n\
SchemaType.prototype.doValidate = function(value, scope) {\n\
  if (!this.validators.length) return null;\n\
\n\
  var errs = null,\n\
      path = this.path,\n\
      validate = function(ok, msg, val) {\n\
        if (!ok) {\n\
          errs || (errs = []);\n\
          errs.push(new ValidatorError(path, msg, val));\n\
        }\n\
      };\n\
\n\
  this.validators.forEach(function(v) {\n\
    var validator = v[0], message = v[1];\n\
    validate(validator.call(scope, value), message, value);\n\
  });\n\
\n\
  return errs;\n\
};\n\
\n\
/**\n\
 * mark attribute as required\n\
 */\n\
\n\
SchemaType.prototype.required = function() {\n\
  var check = function(v) {return v ? true: false;};\n\
  return this.validators.push([check, 'required']);\n\
};\n\
\n\
//@ sourceURL=modelfactory/lib/schemaType.js"
));
require.register("modelfactory/lib/virtualType.js", Function("exports, require, module",
"/**\n\
 * module dependencies\n\
 */\n\
\n\
var Type = require('./type');\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function VirtualType(name) {\n\
  Type.call(this, name);\n\
  this.instance = 'virtual';\n\
}\n\
\n\
/**\n\
 * module exports\n\
 */\n\
\n\
module.exports = VirtualType;\n\
\n\
/**\n\
 * extend Type\n\
 */\n\
\n\
VirtualType.prototype.__proto__ = Type.prototype;\n\
//@ sourceURL=modelfactory/lib/virtualType.js"
));
require.register("modelfactory/lib/errors/index.js", Function("exports, require, module",
"module.exports.ValidatorError = require('./validator');\n\
module.exports.CastError = require('./cast');//@ sourceURL=modelfactory/lib/errors/index.js"
));
require.register("modelfactory/lib/errors/validator.js", Function("exports, require, module",
"/**\n\
 * Validator error\n\
 * @param {String} path\n\
 * @param {String} type\n\
 * @param {Object} val\n\
 */\n\
\n\
function ValidatorError(path, type, val) {\n\
  var msg;\n\
  msg = type ? '\"' + type + '\"' : '';\n\
  this.message = 'Validator ' + msg + ' failed for path ' + path;\n\
  if (2 < arguments.length) {\n\
    this.message += ' with value ' + (String(val));\n\
  }\n\
  Error.call(this);\n\
  this.name = 'ValidatorError';\n\
  this.path = path;\n\
  this.type = type;\n\
  this.value = val;\n\
}\n\
\n\
/*!\n\
 * extend Error\n\
 */\n\
\n\
ValidatorError.prototype.__proto__ = Error.prototype;\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = ValidatorError;\n\
//@ sourceURL=modelfactory/lib/errors/validator.js"
));
require.register("modelfactory/lib/errors/cast.js", Function("exports, require, module",
"/**\n\
 * Cast error\n\
 *\n\
 * @param {String} path\n\
 * @param {String} type\n\
 * @param {Object} val\n\
 */\n\
\n\
function CastError(path, type, val) {\n\
  var msg;\n\
  msg = type ? '\"' + type + '\"' : '';\n\
  this.message = 'Cast ' + msg + ' failed for path ' + path;\n\
  if (2 < arguments.length) this.message += ' with value ' + (String(val));\n\
\n\
  Error.call(this);\n\
  this.name = 'CastError';\n\
  this.path = path;\n\
  this.type = type;\n\
  this.value = val;\n\
}\n\
\n\
/*!\n\
 * extend Error\n\
 */\n\
\n\
CastError.prototype.__proto__ = Error.prototype;\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = CastError;\n\
//@ sourceURL=modelfactory/lib/errors/cast.js"
));
require.register("modelfactory/lib/schema/index.js", Function("exports, require, module",
"/*!\n\
 * module exports\n\
 */\n\
\n\
var types = {\n\
  String: require('./string'),\n\
  ObjectId: require('./objectid'),\n\
  Number: require('./number'),\n\
  Boolean: require('./boolean'),\n\
  Date: require('./date'),\n\
  DocumentArray: require('./documentarray'),\n\
  EmbeddedDocument: require('./embedded')\n\
};\n\
\n\
module.exports = types;\n\
\n\
/**\n\
 * get Schema Type from Schema definition\n\
 *\n\
 * Example:\n\
 *   foo: {type: String} -> String\n\
 *   foo: {type: 'String'} -> String\n\
 *   foo: String -> String\n\
 *\n\
 * @param  {Type} type\n\
 * @return {SchemaType}\n\
 * @api private\n\
 */\n\
\n\
module.exports.getSchemaType = function getType (type) {\n\
\n\
  // fix resolution after mangling for non standard types\n\
  if (type === types.ObjectId) return types.ObjectId;\n\
\n\
  var name = 'string' === typeof type\n\
    ? type\n\
    : type.name;\n\
\n\
  return types[name];\n\
};\n\
\n\
/*!\n\
 * expose it to DocumentArray\n\
 * to let it create\n\
 */\n\
\n\
types.DocumentArray.getSchemaType = module.exports.getSchemaType;\n\
\n\
//@ sourceURL=modelfactory/lib/schema/index.js"
));
require.register("modelfactory/lib/schema/date.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType'),\n\
    Errors = require('../errors'),\n\
    CastError = Errors.CastError;\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function DateType(key, options) {\n\
  SchemaType.call(this, key, options, 'Date');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
DateType.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/**\n\
 * Casts to date\n\
 *\n\
 * @param {Object} value to cast\n\
 * @api private\n\
 */\n\
\n\
DateType.prototype.cast = function (value) {\n\
  if (value === null || value === '') return null;\n\
  if (value instanceof Date) return value;\n\
\n\
  var date;\n\
\n\
  // support for timestamps\n\
  if (value instanceof Number\n\
      || 'number' === typeof value\n\
      || String(value) === Number(value)) {\n\
    date = new Date(Number(value));\n\
  }\n\
\n\
  // support for date strings\n\
  else if (value.toString) {\n\
    date = new Date(value.toString());\n\
  }\n\
\n\
  if (date.toString() !== 'Invalid Date') return date;\n\
  throw new CastError(this.path, 'date', value);\n\
};\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = DateType;\n\
//@ sourceURL=modelfactory/lib/schema/date.js"
));
require.register("modelfactory/lib/schema/boolean.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType');\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function BooleanType(key, options) {\n\
  SchemaType.call(this, key, options, 'Boolean');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
BooleanType.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/**\n\
 * Casts to boolean\n\
 *\n\
 * @param {Object} value\n\
 * @api private\n\
 */\n\
\n\
BooleanType.prototype.cast = function (value) {\n\
  if (null === value) return value;\n\
  if ('0' === value) return false;\n\
  if ('true' === value) return true;\n\
  if ('false' === value) return false;\n\
  return !! value;\n\
};\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = BooleanType;\n\
//@ sourceURL=modelfactory/lib/schema/boolean.js"
));
require.register("modelfactory/lib/schema/number.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType'),\n\
    Errors = require('../errors'),\n\
    CastError = Errors.CastError;\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function NumberType(key, options) {\n\
  SchemaType.call(this, key, options, 'Number');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
NumberType.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = NumberType;\n\
\n\
/**\n\
 * min validator\n\
 *\n\
 * @param  {Number} val\n\
 * @api public\n\
 */\n\
\n\
NumberType.prototype.min = function(val) {\n\
  var check = function(v) {\n\
    if (!v) return true;\n\
    return v >= val;\n\
  };\n\
  return this.validators.push([check, 'min']);\n\
};\n\
\n\
/**\n\
 * max validator\n\
 *\n\
 * @param  {Number} val\n\
 * @api public\n\
 */\n\
\n\
NumberType.prototype.max = function(val) {\n\
  var check = function(v) {\n\
    if (!v) return true;\n\
    return v <= val;\n\
  };\n\
  return this.validators.push([check, 'max']);\n\
};\n\
\n\
/**\n\
 * Casts to number\n\
 *\n\
 * @param {Object} value value to cast\n\
 * @api private\n\
 */\n\
\n\
NumberType.prototype.cast = function (value) {\n\
  if (!isNaN(value)){\n\
    if (null === value) return value;\n\
    if ('' === value) return null;\n\
    if ('string' === typeof value) value = Number(value);\n\
    if (value instanceof Number) return value;\n\
    if ('number' === typeof value) return value;\n\
  }\n\
\n\
  throw new CastError(this.path, 'number', value);\n\
};//@ sourceURL=modelfactory/lib/schema/number.js"
));
require.register("modelfactory/lib/schema/string.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType'),\n\
    Errors = require('../errors'),\n\
    CastError = Errors.CastError;\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 *\n\
 */\n\
\n\
function StringType(key, options) {\n\
  SchemaType.call(this, key, options, 'String');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
StringType.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = StringType;\n\
\n\
/**\n\
 * match validator\n\
 *\n\
 * @param  {Regexp} regExp\n\
 * @api public\n\
 */\n\
\n\
StringType.prototype.match = function(regExp) {\n\
  var check = function(v) {\n\
    if (!v) return true;\n\
    return regExp.test(v);\n\
  };\n\
  this.validators.push([check, 'match']);\n\
};\n\
\n\
/**\n\
 * enum validator\n\
 *\n\
 * @param  {Array} values\n\
 * @api public\n\
 */\n\
\n\
StringType.prototype.enum = function(values) {\n\
  var check = function(v) {\n\
        if (!v) return true;\n\
        return (values.indexOf(v) === -1) ? false: true;\n\
      };\n\
  this.validators.push([check, 'enum']);\n\
};\n\
\n\
/**\n\
 * Casts to String\n\
 *\n\
 * @param {Object} value value to cast\n\
 * @api private\n\
 */\n\
\n\
StringType.prototype.cast = function (value) {\n\
  if (!value) return value;\n\
  if (value.toString) return value.toString();\n\
  throw new CastError(this.path, 'string', value);\n\
};//@ sourceURL=modelfactory/lib/schema/string.js"
));
require.register("modelfactory/lib/schema/objectid.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType');\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function ObjectId(key, options) {\n\
  SchemaType.call(this, key, options, 'ObjectId');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
ObjectId.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = ObjectId;\n\
\n\
//@ sourceURL=modelfactory/lib/schema/objectid.js"
));
require.register("modelfactory/lib/schema/documentarray.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType'),\n\
    ModelArray = require('modelarray');\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function DocumentArray(key, options) {\n\
\n\
  var schema, Type, Model;\n\
\n\
  // get SubDocument Schema & options\n\
  schema = options.type[0];\n\
\n\
  if (schema.type && ('function' === typeof schema.type)) {\n\
    Type = DocumentArray.getSchemaType(schema.type);\n\
    this.arrType = new Type('', schema);\n\
    schema = schema.type;\n\
  }\n\
\n\
  // document array class\n\
  this.DocArray = function DocArray(values, scope) {\n\
    this._parent = scope;\n\
    return ModelArray.call(this, values);\n\
  };\n\
\n\
  // inherit ModelArray\n\
  this.DocArray.prototype.__proto__ = ModelArray.prototype;\n\
\n\
  // if we have a schema generate Array models\n\
  if (schema.name === 'Schema' || schema.constructor.name === 'Object') {\n\
    Model = DocumentArray.model(schema);\n\
    this.DocArray.prototype._cast = function (value) {\n\
      var val = value;\n\
      if (!(value instanceof Model)) val = new Model(value);\n\
      if (!val._parent) val._parent = this._parent;\n\
      if (!val._parentArray) val._parentArray = this;\n\
      return val;\n\
    };\n\
\n\
  // else override modelArray_cast with type#cast\n\
  } else {\n\
    Type = DocumentArray.getSchemaType(schema);\n\
    this.DocArray.prototype._cast = function (value) {\n\
      return Type.prototype.cast.call(this, value);\n\
    };\n\
  }\n\
\n\
  SchemaType.call(this, key, options, 'DocumentArray');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
DocumentArray.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/**\n\
 * Casts contents\n\
 *\n\
 * @param {Object} value\n\
 * @param {doc} doc document that triggers the casting\n\
 * @api private\n\
 */\n\
\n\
DocumentArray.prototype.cast = function (value, doc) {\n\
  if (value instanceof this.DocArray) return value;\n\
  if (value && !Array.isArray(value)) value = [value];\n\
  return new this.DocArray(value, doc);\n\
};\n\
\n\
/**\n\
 * Validate Schema\n\
 *\n\
 * @override SchemaType#doValidate\n\
 * @api public\n\
 */\n\
\n\
DocumentArray.prototype.doValidate = function (array) {\n\
\n\
  // validate self first\n\
  var errs = SchemaType.prototype.doValidate.apply(this, arguments);\n\
\n\
  if (errs) return errs;\n\
  if (!array) return;\n\
\n\
  // validate items\n\
  array.forEach(function (model) {\n\
    var modelErrs;\n\
\n\
    if (model.validate) {\n\
      modelErrs = model.validate();\n\
    } else if (this.arrType) {\n\
      modelErrs = this.arrType.doValidate(model);\n\
    }\n\
\n\
    if (modelErrs) {\n\
      errs || (errs = []);\n\
      [].push.apply(errs, modelErrs.map(function (err) {\n\
        var path = err.path;\n\
        err.path =  this.path + '.' + array.indexOf(model);\n\
        if (path) err.path += '.' + path;\n\
        return err;\n\
      }, this));\n\
    }\n\
\n\
  }, this);\n\
\n\
  return errs;\n\
};\n\
\n\
/**\n\
 * min validator\n\
 *\n\
 * @param  {Number} val\n\
 * @api public\n\
 */\n\
\n\
DocumentArray.prototype.min = function(val) {\n\
  var check = function(v) {\n\
    if (!v) return true;\n\
    return v.length >= val;\n\
  };\n\
  return this.validators.push([check, 'min']);\n\
};\n\
\n\
/**\n\
 * max validator\n\
 *\n\
 * @param  {Number} val\n\
 * @api public\n\
 */\n\
\n\
DocumentArray.prototype.max = function(val) {\n\
  var check = function(v) {\n\
    if (!v) return true;\n\
    return v.length <= val;\n\
  };\n\
  return this.validators.push([check, 'max']);\n\
};\n\
\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = DocumentArray;\n\
//@ sourceURL=modelfactory/lib/schema/documentarray.js"
));
require.register("modelfactory/lib/schema/embedded.js", Function("exports, require, module",
"/*!\n\
 * module dependencies\n\
 */\n\
\n\
var SchemaType = require('../schemaType'),\n\
    globals = require('../globals');\n\
\n\
/**\n\
 * Constructor\n\
 *\n\
 * @param {String} key\n\
 * @param {Object} options\n\
 */\n\
\n\
function EmbeddedDocument(key, options) {\n\
  this.schema = options.type\n\
             ? options.type\n\
             : options;\n\
\n\
  SchemaType.call(this, key, options, 'EmbeddedDocument');\n\
}\n\
\n\
/*!\n\
 * extend SchemaType\n\
 */\n\
\n\
EmbeddedDocument.prototype.__proto__ = SchemaType.prototype;\n\
\n\
/**\n\
 * Casts contents\n\
 *\n\
 * @param {Object} value\n\
 * @param {doc} doc document that triggers the casting\n\
 * @api private\n\
 */\n\
\n\
EmbeddedDocument.prototype.cast = function (value, doc) {\n\
  if (!value) return value;\n\
\n\
  var model;\n\
  if (value instanceof this.schema.model) {\n\
    model = value;\n\
  } else if (typeof value === 'string') {\n\
    var obj = {};\n\
    obj[globals.idAttribute] = value;\n\
    model = new this.schema.model(obj);\n\
  } else {\n\
    model = new this.schema.model(value);\n\
  }\n\
  model.parent || (model.parent = doc);\n\
  return model;\n\
};\n\
\n\
/**\n\
 * Validate Schema\n\
 *\n\
 * @override SchemaType#doValidate\n\
 * @api public\n\
 */\n\
\n\
EmbeddedDocument.prototype.doValidate = function (model) {\n\
\n\
  // validate self first\n\
  var errs = SchemaType.prototype.doValidate.apply(this, arguments);\n\
\n\
  if (errs) return errs;\n\
  if (!model) return;\n\
\n\
  errs = model.validate();\n\
\n\
  if (errs) {\n\
    errs.map(function (err) {\n\
      err.path = this.path + '.' + err.path;\n\
      return err;\n\
    }, this);\n\
  }\n\
\n\
  return errs;\n\
};\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = EmbeddedDocument;\n\
//@ sourceURL=modelfactory/lib/schema/embedded.js"
));








require.alias("component-emitter/index.js", "modelfactory/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("pgherveou-modelarray/index.js", "modelfactory/deps/modelarray/index.js");
require.alias("pgherveou-modelarray/index.js", "modelfactory/deps/modelarray/index.js");
require.alias("pgherveou-modelarray/index.js", "modelarray/index.js");
require.alias("component-emitter/index.js", "pgherveou-modelarray/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("pgherveou-modelarray/index.js", "pgherveou-modelarray/index.js");
require.alias("chaijs-chai/index.js", "modelfactory/deps/chai/index.js");
require.alias("chaijs-chai/lib/chai.js", "modelfactory/deps/chai/lib/chai.js");
require.alias("chaijs-chai/lib/chai/assertion.js", "modelfactory/deps/chai/lib/chai/assertion.js");
require.alias("chaijs-chai/lib/chai/core/assertions.js", "modelfactory/deps/chai/lib/chai/core/assertions.js");
require.alias("chaijs-chai/lib/chai/interface/assert.js", "modelfactory/deps/chai/lib/chai/interface/assert.js");
require.alias("chaijs-chai/lib/chai/interface/expect.js", "modelfactory/deps/chai/lib/chai/interface/expect.js");
require.alias("chaijs-chai/lib/chai/interface/should.js", "modelfactory/deps/chai/lib/chai/interface/should.js");
require.alias("chaijs-chai/lib/chai/utils/addChainableMethod.js", "modelfactory/deps/chai/lib/chai/utils/addChainableMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addMethod.js", "modelfactory/deps/chai/lib/chai/utils/addMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addProperty.js", "modelfactory/deps/chai/lib/chai/utils/addProperty.js");
require.alias("chaijs-chai/lib/chai/utils/eql.js", "modelfactory/deps/chai/lib/chai/utils/eql.js");
require.alias("chaijs-chai/lib/chai/utils/flag.js", "modelfactory/deps/chai/lib/chai/utils/flag.js");
require.alias("chaijs-chai/lib/chai/utils/getActual.js", "modelfactory/deps/chai/lib/chai/utils/getActual.js");
require.alias("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", "modelfactory/deps/chai/lib/chai/utils/getEnumerableProperties.js");
require.alias("chaijs-chai/lib/chai/utils/getMessage.js", "modelfactory/deps/chai/lib/chai/utils/getMessage.js");
require.alias("chaijs-chai/lib/chai/utils/getName.js", "modelfactory/deps/chai/lib/chai/utils/getName.js");
require.alias("chaijs-chai/lib/chai/utils/getPathValue.js", "modelfactory/deps/chai/lib/chai/utils/getPathValue.js");
require.alias("chaijs-chai/lib/chai/utils/getProperties.js", "modelfactory/deps/chai/lib/chai/utils/getProperties.js");
require.alias("chaijs-chai/lib/chai/utils/index.js", "modelfactory/deps/chai/lib/chai/utils/index.js");
require.alias("chaijs-chai/lib/chai/utils/inspect.js", "modelfactory/deps/chai/lib/chai/utils/inspect.js");
require.alias("chaijs-chai/lib/chai/utils/objDisplay.js", "modelfactory/deps/chai/lib/chai/utils/objDisplay.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteMethod.js", "modelfactory/deps/chai/lib/chai/utils/overwriteMethod.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteProperty.js", "modelfactory/deps/chai/lib/chai/utils/overwriteProperty.js");
require.alias("chaijs-chai/lib/chai/utils/test.js", "modelfactory/deps/chai/lib/chai/utils/test.js");
require.alias("chaijs-chai/lib/chai/utils/transferFlags.js", "modelfactory/deps/chai/lib/chai/utils/transferFlags.js");
require.alias("chaijs-chai/lib/chai/utils/type.js", "modelfactory/deps/chai/lib/chai/utils/type.js");
require.alias("chaijs-chai/index.js", "modelfactory/deps/chai/index.js");
require.alias("chaijs-chai/index.js", "chai/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-assertion-error/index.js");
require.alias("chaijs-chai/index.js", "chaijs-chai/index.js");
require.alias("visionmedia-mocha-cloud/client.js", "modelfactory/deps/mocha-cloud/client.js");
require.alias("visionmedia-mocha-cloud/client.js", "modelfactory/deps/mocha-cloud/index.js");
require.alias("visionmedia-mocha-cloud/client.js", "mocha-cloud/index.js");
require.alias("visionmedia-mocha-cloud/client.js", "visionmedia-mocha-cloud/index.js");
require.alias("modelfactory/lib/index.js", "modelfactory/index.js");