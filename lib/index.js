/*!
 * deps
 */

var Schema = require('./schema'),
    model = require('./model'),
    globals = require('./globals'),
    Errors = require('./errors'),
    idCounter = 0;

/*!
 * module globals
 */

var modelfactory = {},
    models = {},
    plugins = [],
    define, compile;

/**
 * create unique id
 * @return {String}
 */

function uniqueId() {
  return  'm_' + (++idCounter);
}

/*!
 * exports stuffs
 */

module.exports = modelfactory;
modelfactory.Schema = Schema;
modelfactory.Error = Errors;

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
    var limb = tree[key],
        subprops = !(limb.constructor && limb.instance)
                && (!limb.type || limb.type.type)
                  ? limb
                  : null;

    define(key, subprops, proto, prefix, keys);
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
        if (!this.__getters) this.__getters = Object.create(null);

        if (!this.__getters[path]) {
          var nested = Object.create(null);

          // set scope
          Object.defineProperty(nested, '__scope__', {
            value: prefix ? this.__scope__ : this
          });

          compile(subprops, nested, path);
          this.__getters[path] = nested;
        }
        return this.__getters[path];
      },

      set: function (v) {
        (this.__scope__ || this).set(path, v);
      }
    });
  } else {
    Object.defineProperty(prototype, prop, {
      enumerable: true,

      get: function () {
        if (this.__scope__) return this.__scope__.get(path);
        if (this.get) return this.get(path);
        return this[path];
      },

      set: function (v) {
        (this.__scope__ || this).set(path, v);
      }
    });
  }
};

/**
 * Declares a global plugin executed on all Schemas.
 *
 * Equivalent to calling `.plugin(fn)` on each Schema you create.
 *
 * @param {Function} fn plugin callback
 * @param {Object} [opts] optional options
 * @return {Modelfactory} this
 * @api public
 */

modelfactory.plugin = function (fn, opts) {
  plugins.push([fn, opts]);
  return modelfactory;
};

/**
 * model factory. create or get a model
 *
 * example:
 *
 *   // define a model
 *   User = modelfactory.model({
 *     firstname: String,
 *     lastname: String,
 *   })
 *
 *   // define a named model
 *   User = modelfactory.model('User', {
 *     firstname: String,
 *     lastname: String,
 *   })

 *   // get a named model
 *   User = modelfactory.model('User')
 *
 * @return {Model} the model class constructor
 * @api public
 */

modelfactory.model = function (name, schema) {

  // call with a string - modelfactory.model('foo')
  if (typeof(name) === 'string' && !schema) return models[name];

  // call without name - modelfactory.model(myschema)
  if (!schema) {
    schema = name;
    name = null;
  }

  // cast to Schema instance?
  if (!(schema instanceof Schema)) {
    schema = new Schema(schema);
  }

  // return model already generated
  if (schema.model && name) models[name] = schema.model;
  if (schema.model) return schema.model;

  // apply plugins
  plugins.forEach(function (plugin) {
    schema.plugin.apply(schema, plugin);
  });

  // create model class
  function Model(obj) {
    if (!obj) obj = {};

    var existing = schema.store.get(obj);

    // return existing model
    if (existing) {
      existing.set(obj);
      return existing;
    }

    if (!(this instanceof Model)) return new Model(obj);

    Object.defineProperty(this, 'schema', {value: schema});
    Object.defineProperty(this, '_doc', {value: Object.create(null)});

    Object.defineProperty(this, '_modified', {
      value: [],
      writable: true
    });

    Object.defineProperty(this, '_callbacks', {
        value: Object.create(null),
        writable: true
      });

    this.cid = uniqueId();
    this.id = obj[globals.idAttribute];
    this._build(obj);
    this.emit('init', this);
  }

  // store generated model
  schema.model = Model;

  // reference named model
  if (name) models[name] = Model;

  // inherit from Model
  Model.prototype.__proto__ = model.prototype;

  // compile schema
  compile(schema.tree, Model.prototype);

  // apply methods & statics
  for (var i in schema.methods) Model.prototype[i] = schema.methods[i];
  for (i in schema.statics) Model[i] = schema.statics[i];

  // attach schema
  Model.schema = schema;

  return Model;
};

// hack to expose stuffs
require('./schema/documentarray').model = module.exports.model;
require('./schema/objectid').models = models;
