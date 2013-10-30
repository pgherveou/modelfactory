
/*!
 * deps
 */

var Schema = require('./schema'),
    Model = require('./model'),
    Errors = require('./errors');

/*!
 * module globals
 */

var define, compile;

/*!
 * exports stuffs
 */

module.exports.Schema = Schema;
module.exports.Error = Errors;

/**
 * compile schema
 *
 * @param  {Object} tree
 * @param  {Object} proto
 * @param  {String} prefix
 * @api private
 */

compile = function compile(tree, proto, prefix) {
  var keys = Object.keys(tree);
  keys.forEach(function (key) {
    var limb = tree[key];

    define(key,
           (('Object' === limb.constructor.name
               && Object.keys(limb).length)
               && (!limb.type || limb.type.type)
               ? limb
               : null),
           proto,
           prefix,
           keys);
  });
};

/**
 * define accessors on the incoming prototype
 *
 * @param  {[type]} prop
 * @param  {[type]} subprops
 * @param  {[type]} prototype
 * @param  {[type]} prefix
 * @api private
 */

define = function define(prop, subprops, prototype, prefix) {
  prefix || (prefix = '');
  var path = (prefix ? prefix + '.' : '') + prop;

  if (subprops) {
    return Object.defineProperty(prototype, prop, {
      enumerable: true,

      get: function () {
        if (!this.__getters) this.__getters = {};

        if (!this.__getters[path]) {
          var nested = {};

          if (!prefix) {
            nested.__scope = this;
          } else {
            nested.__scope = this.__scope;
          }

          compile(subprops, nested, path);
          this.__getters[path] = nested;
        }
        return this.__getters[path];
      },

      set: function (v) {
        (this.__scope || this).set(path, v);
      }
    });
  } else {
    Object.defineProperty(prototype, prop, {
      enumerable: true,

      get: function () {
        if (this.__scope) return this.__scope.get(path);
        if (this.get) return this.get(path);
        return this[path];
      },

      set: function (v) {
        (this.__scope || this).set(path, v);
      }
    });
  }
};

/**
 * model factory
 *
 * @param  {Schema} schema
 * @return {Model} the model class constructor
 * @api public
 */

module.exports.model = function (schema) {

  // cast to Schema instance?
  if (!(schema instanceof Schema)) {
    schema = new Schema(schema);
  }

  var i;

  // return model already generated
  if (schema.model) return schema.model;

  // create model class
  function model () {
    Object.defineProperty(this, 'schema', {value: schema})
    Model.apply(this, arguments);
  }

  // store generated model
  schema.model = model;

  // inherit from Model
  model.prototype.__proto__ = Model.prototype;

  // compile schema
  compile(schema.tree, model.prototype);

  // apply methods
  for (i in schema.methods)
    model.prototype[i] = schema.methods[i];

  // apply statics
  for (i in schema.statics)
    model[i] = schema.statics[i];

  // attach schema
  model.schema = schema;

  return model;
};

/*!
 * expose model factory
 * to DocumentArray to let them create EmbeddedDocument
 */

require('./schema/documentarray').model = module.exports.model;
