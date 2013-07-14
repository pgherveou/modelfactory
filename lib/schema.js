
/**
 * module dependencies
 */

var Types = require('./schema/index')
  , VirtualType = require('./virtualType');

/**
 * module exports
 */

module.exports = Schema;

/**
 * expose Types
 */

Schema.Types = Types;

/**
 * Constructor
 * @param {Object} obj
 */

function Schema(obj) {
  this.paths = {};
  this.tree = {};
  this.virtuals = {};
  this.methods = {};
  this.statics = {};

  if (obj) this.add(obj);
}

/**
 * add key path / schema type pairs to this schema
 *
 * @param {Object} obj
 * @param {String} prefix
 * @api public
 */

Schema.prototype.add = function(obj, prefix) {
  var _this = this;
  prefix || (prefix = '');

  Object.keys(obj).forEach(function(key) {
    if (!obj[key]) {
      throw new TypeError("Invalid value for schema path `" + (prefix + key) + "`");
    }

    if (Array.isArray(obj[key]) || Array.isArray(obj[key].type)) {
      _this.path(prefix + key, obj[key]);
    } else if (obj[key].type && 'function' === typeof obj[key].type) {
      _this.path(prefix + key, obj[key]);
    } else {
      _this.add(obj[key], prefix + key + '.');
    }

  });
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
          "Cannot set nested path `" + path + "`.\n"
        + "Parent path `" + (subpaths.slice(0, i).concat([sub]).join('.')) + "\n"
        + "already set to type " + branch[sub].name + "."
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
 * Converts type arguments into Mongoose Types.
 *
 * @param {String} path
 * @param {Object} obj constructor
 * @api private
 */

Schema.interpretAsType = function(path, obj) {
  var type = obj.type && !obj.type.type
    ? obj.type
    : {};

  if (Array.isArray(obj) || Array.isArray(obj.type))
    return new Types.DocumentArray(path,  obj);

  var name = 'string' == typeof type
    ? type
    : type.name;

  if (!Types[name]) throw new TypeError("Undefined type at " + path);

  return new Types[name](path, obj);
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

  return virtuals[name] = parts.reduce(function (mem, part, i) {
    mem[part] || (mem[part] = (i === parts.length-1)
                            ? new VirtualType(name)
                            : {});
    return mem[part];
  }, this.tree);
};

/**
 * Adds an instance method
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

Schema.prototype.method = function (name, fn) {
  if ('string' != typeof name)
    for (var i in name) this.methods[i] = name[i];
  else
    this.methods[name] = fn;
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
  if ('string' != typeof name)
    for (var i in name)
      this.statics[i] = name[i];
  else
    this.statics[name] = fn;
  return this;
};