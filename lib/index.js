
/*!
 * deps
 */

var ModelArray = require('modelarray'),
    Schema = require('./schema'),
    Model = require('./model'),
    globals = require('./globals'),
    Errors = require('./errors'),
    idCounter = 0;

/*!
 * module globals
 */

var modelfactory = {},
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
 * model factory
 *
 * example:
 *   User = modelfactory.model({
 *     firstname: String,
 *     lastnae: String,
 *   })
 *
 * @param  {Schema} schema
 * @return {Model} the model class constructor
 * @api public
 */

modelfactory.model = function (schema) {

  // cast to Schema instance?
  if (!(schema instanceof Schema)) {
    schema = new Schema(schema);
  }

  // return model already generated
  if (schema.model) return schema.model;

  // apply plugins
  plugins.forEach(function (plugin) {
    schema.plugin.apply(schema, plugin);
  });

  // create model class
  function model (obj) {
    if (!obj) obj = {};

    var id = obj[globals.idAttribute],
        existing = schema.store.get(id);

    // return existing model
    if (existing) {
      existing.set(obj);
      return existing;
    }

    Object.defineProperty(this, '_doc', {value: Object.create(null)});
    Object.defineProperty(this, 'schema', {value: schema});
    Object.defineProperty(this, '_callbacks', {
        value: Object.create(null),
        writable: true
      });

    this.cid = uniqueId();
    this.id = id;
    this._build(obj);
    this.emit('init', this);

    // add to store
    schema.store.add(this);
  }

  // store generated model
  schema.model = model;

  // inherit from Model
  model.prototype.__proto__ = Model.prototype;

  // compile schema
  compile(schema.tree, model.prototype);

  // apply methods & statics
  for (var i in schema.methods) model.prototype[i] = schema.methods[i];
  for (i in schema.statics) model[i] = schema.statics[i];

  // attach schema
  model.schema = schema;

  return model;
};

/*!
 * expose model factory
 * to DocumentArray to let them create EmbeddedDocument
 */

require('./schema/documentarray').model = module.exports.model;
