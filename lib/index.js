
/**
 * deps
 */

var Schema = require('./schema')
  , utils = require('./utils')
  , getPath = utils.getPath
  , setPath = utils.setPath;

/**
 * exports schema
 */

module.exports.Schema = Schema;

/**
 * compile schema
 */

function compile(tree, proto, prefix) {
  var keys = Object.keys(tree);
  keys.forEach(function(key) {
    var limb = tree[key];

    define(key
        , (('Object' === limb.constructor.name
               && Object.keys(limb).length)
               && (!limb.type || limb.type.type)
               ? limb
               : null)
        , proto
        , prefix
        , keys);

  });
}

/**
 * define accessors on the incoming prototype
 */

function define(prop, subprops, prototype, prefix, keys) {
  prefix || (prefix = "");
  var path = (prefix ? prefix + "." : "") + prop;

  if (subprops) {
    return Object.defineProperty(prototype, prop, {
      enumerable: true,

      get: function() {
        if (!this.$__getters) this.$__getters = {};

        if (!this.$__getters[path]) {
          var nested = {};
          if (!prefix) nested.$__scope = this;
          compile(subprops, nested, path);
          this.$__getters[path] = nested;
        }
        return this.$__getters[path];
      },

      set: function(v) {
        (this.$__scope || this).set(path, v);
      }
    });
  } else {
    Object.defineProperty(prototype, prop, {
      enumerable: true,

      get: function() {
        return (this.$__scope || this).get(path);
      },

      set: function(v) {
        (this.$__scope || this).set(path, v);
      }
    });
  }
}

/**
 * exports model factory
 */

module.exports.model = function(Backbone) {

  var BaseModel = Backbone.Model.extend({

    /**
     * Get property
     * @param  {String} key
     */

    get: function (path) {
      var schema = this.schema.path(path) || this.schema.virtualpath(path)
        , obj = getPath(this.attributes, path);

      if (schema) return schema.applyGetters(obj, this);
      return obj;
    },

    /**
     * set property
     * not using setter for now...
     *
     * @param  {String|Object}  key
     * @param  {Object}         val
     * @param  {[Object]}       options
     */

    set: function(key, val, options) {
      var prev;
      if ('object' === typeof key || key.indexOf('.') === -1) {
        Backbone.Model.prototype.set.apply(this, arguments);
      } else {
        prev = getPath(this.attributes, key);
        if (prev !== val) {
          setPath(this.attributes, key, val);
          this.trigger("change:" + key, this, val);
          this.trigger("change", this);
        }
      }
    },

    /**
     * validate doc
     *
     * @param  {Object} attrs attributes to validate
     * @param  {Object} opts
     * @return {Array}  error array if any
     */

    validate: function(attrs, opts) {
      if (!arguments.length) return;

      if (!opts) {
        opts = attrs;
        attrs = this.attributes;
      }

      if (!opts.validate) return;

      var errors = []
        , _this = this
        , paths;

      if (opts.paths) {
        paths = paths.split(' ');
      } else {
        paths = Object.keys(this.schema.paths);
      }

      paths.forEach(function(path) {
        var p = _this.schema.path(path)
          , val = getPath(attrs, path)
          , err = p.doValidate(val, _this);
        if (err) errors.push.apply(errors, err);
      });

      if (errors.length) return errors;
    }
  });

  /**
   * create a named constructor
   *
   * @param  {String} name
   * @param  {Function} constructor
   * @api private
   */

  var createNamedConstructor = function(name, constructor) {
    name = name.replace(/[^a-z]/ig, '');
    name = name[0].toUpperCase() + name.slice(1);
    var fn = new Function('constructor',
      "return function " + name + "() {constructor.apply(this, arguments);};"
    );
    return fn(constructor);
  };

  /**
   * model factory
   * @param  {String} name
   * @param  {Scheme} schema
   */

  return function(name, schema) {

    if (!(schema instanceof Schema)) {
      schema = new Schema(schema);
    }

    var Model = BaseModel.extend({
      constructor: createNamedConstructor(name, Backbone.Model),
      schema: schema
    });

    // compile schema
    compile(schema.tree, Model.prototype);

    // apply methods
    for (var i in schema.methods)
      Model.prototype[i] = schema.methods[i];

    // apply statics
    for (var i in schema.statics)
      Model[i] = schema.statics[i];


    return Model;
  };
};
