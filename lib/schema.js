
/**
 * module dependencies
 */

var Types = require('./schema/index');

/**
 * module exports
 */

module.exports = Schema;

/**
 * Constructor
 * @param {Object} obj
 */

function Schema(obj) {
  this.paths = {};
  this.tree = {};
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

    if (obj[key].type && 'function' === typeof obj[key].type) {
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
    if (this.subpaths[path]) return this.subpaths[path];
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
 * Converts type arguments into Mongoose Types.
 *
 * @param {String} path
 * @param {Object} obj constructor
 * @api private
 */

Schema.interpretAsType = function(path, obj) {
  var name = ('string' === typeof obj.type) ? obj.type : obj.type.name;
  if (!Types[name]) throw new TypeError("Undefined type at " + path);
  return new Types[name](path, obj);
};
