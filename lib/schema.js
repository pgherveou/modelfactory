
/**
 * module dependencies
 */

var Types = require('./schema/index'),
    VirtualType = require('./virtualType'),
    utils = require('./utils'),
    Store = require('./store'),
    globals = require('./globals'),
    hasPath = utils.hasPath;

/**
 * create a new Schema
 *
 * examples
 *   schema = new Schema({
 *     firstname: String,
 *     lastname: String
 *   }, {store: true})
 *
 * Options are:
 * store: use internal storage to store models
 *
 * @param {Object} obj
 * @param {Object} opts
 */

function Schema(obj, opts) {
  if (!obj) obj = {};
  this.paths = {};
  this.tree = {};
  this.virtuals = {};
  this.methods = {};
  this.statics = {};
  this.options = opts || { store: true };

  if (this.options.store) {
    this.store = new Store();
  } else {
    this.store = Store.noop;
  }

  // add id key if not present
  if (!obj.hasOwnProperty(globals.idAttribute)) {
    obj[globals.idAttribute] = {type: String};
  }

  this.add(obj);
}

/*!
 * name property
 */

Schema.prototype.name = 'Schema';

/**
 * module exports
 */

module.exports = Schema;

/**
 * expose Types
 */

Schema.Types = Types;

/**
 * add key path / schema type pairs to this schema
 *
 * @param {Object} obj
 * @param {String} prefix
 * @api public
 */

Schema.prototype.add = function(obj, prefix) {
  prefix || (prefix = '');

  Object.keys(obj).forEach(function(key) {

    if (!obj[key]) {
      throw new TypeError('Invalid value for schema path `' + (prefix + key) + '`');
    }

    if (obj[key].constructor && obj[key].constructor.name !== 'Object') {
      obj[key] = {type: obj[key]};
    }

    if (Array.isArray(obj[key]) || Array.isArray(obj[key].type)) {
      this.path(prefix + key, obj[key]);
    } else if (obj[key].type instanceof Schema) {
      this.path(prefix + key, obj[key]);
    } else if (obj[key].type && 'function' === typeof obj[key].type) {
      this.path(prefix + key, obj[key]);
    } else {
      this.add(obj[key], prefix + key + '.');
    }
  }, this);
};

/**
 * Gets/Sets schema paths
 *
 * @param {String} path
 * @param {Object} constructor
 * @api public
 */

Schema.prototype.path = function(path, obj) {
  var branch, last, subpaths;

  if (!obj) {
    if (this.paths[path]) return this.paths[path];
    return undefined;
  }

  subpaths = path.split(/\./);
  last = subpaths.pop();
  branch = this.tree;

  subpaths.forEach(function(sub, i) {
    if (!branch[sub]) branch[sub] = {};
    if ('object' !== typeof branch[sub]) {
      throw new Error(
          'Cannot set nested path `' + path + '`.\n'
        + 'Parent path `' + (subpaths.slice(0, i).concat([sub]).join('.')) + '\n'
        + 'already set to type ' + branch[sub].name + '.'
      );
    }
    branch = branch[sub];
  });

  branch[last] = obj;
  this.paths[path] = Schema.interpretAsType(path, obj);
  return this;
};

/**
 * Returns the virtual type with the given `name`.
 *
 * @param {String} name
 * @return {VirtualType}
 */

Schema.prototype.virtualpath = function (name) {
  return this.virtuals[name];
};

/**
 * Converts type arguments into Types.
 *
 * @param {String} path
 * @param {Object} obj constructor
 * @api private
 */

Schema.interpretAsType = function(path, obj) {
  var type = obj.type && !obj.type.type
    ? obj.type
    : {};

  if (obj.type instanceof Schema) {
    return new Types.EmbeddedDocument(path,  obj);
  }

  if (Array.isArray(obj) || Array.isArray(obj.type)) {
    return new Types.DocumentArray(path,  obj);
  }

  var SchemaType = Types.getSchemaType(type);
  if (!SchemaType) throw new TypeError('Undefined type at ' + path);

  return new SchemaType(path, obj);
};

/**
 * Creates a virtual type with the given name.
 *
 * @param {String} name
 * @return {VirtualType}
 * @api public
 */

Schema.prototype.virtual = function (name) {
  var virtuals = this.virtuals;
  var parts = name.split('.');

  virtuals[name] = parts.reduce(function (mem, part, i) {
    mem[part] || (mem[part] = (i === parts.length-1)
                            ? new VirtualType(name)
                            : {});
    return mem[part];
  }, this.tree);
  return virtuals[name];
};

/**
 * extract path/value from object
 *
 * @param  {Object} obj
 * @return {Object}
 *
 * @api public
 */

Schema.prototype.getKeyVals = function (obj, prefix) {
  var ret = [],
      o;

  if (prefix) {
    o = {};
    o[prefix] = obj;
  } else {
    o = obj;
  }

  Object
    .keys(this.paths)
    .forEach(function (key) {
      var exist = hasPath(o, key);
      if (exist) {
        ret.push({
          key: key,
          val: exist.val
        });
      }
    });

  Object
    .keys(this.virtuals)
    .forEach(function (key) {
    var exist = hasPath(o, key);
    if (exist) {
      ret.push({
        key: key,
        val: exist.val
      });
    }
  });

  return ret;
};

/**
 * Registers a plugin for this schema.
 *
 * @param {Function} plugin callback
 * @param {Object} opts
 * @see plugins
 * @api public
 */

Schema.prototype.plugin = function (fn, opts) {
  fn(this, opts);
  return this;
};

/**
 * Adds an instance method
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

Schema.prototype.method = function (name, fn) {
  if ('string' !== typeof name) {
    for (var i in name) this.methods[i] = name[i];
  } else {
    this.methods[name] = fn;
  }
  return this;
};

/**
 * Adds a static method
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

Schema.prototype.static = function(name, fn) {
  if ('string' !== typeof name) {
    for (var i in name) this.statics[i] = name[i];
  } else {
    this.statics[name] = fn;
  }
  return this;
};