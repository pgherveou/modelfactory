var Emitter = require('emitter'),
    utils = require('./utils'),
    getPath = utils.getPath,
    setPath = utils.setPath;

/**
 * constructor
 * @param {[type]} obj [description]
 */

function Model(obj) {
  Object.defineProperty(this, '_doc', {
    value: obj || {}
  });
}

/**
 * Inherit from Emitter
 */

Model.prototype.__proto__ = Emitter.prototype;

/**
 * The documents schema.
 *
 * @api public
 * @property schema
 */

Model.prototype.schema;


/**
 * export
 */

module.exports = Model;

/**
 * Get property
 * @param  {String} key
 */

Model.prototype.get = function (path) {
  var schema = this.schema.path(path) || this.schema.virtualpath(path),
      obj = getPath(this._doc, path);

  if (schema) return schema.applyGetters(obj, this);
  return obj;
};

/**
 * Get raw value
 * @param  {String} key
 */

Model.prototype.getValue = function (path) {
  return getPath(this._doc, path);
};

/**
 * set property
 * only apply setter for key / value format...
 *
 * @param  {String|Object}  key
 * @param  {Object}         val
 * @param  {[Object]}       options
 */

Model.prototype.set = function (key, val) {
  if ('object' === typeof key || key.indexOf('.') === -1) {
    this._doc[key] = val;
    this.emit('change:' + key, this, val);
    this.emit('change', this);
  } else {
    var schema = this.schema.path(key) || this.schema.virtualpath(key),
        prev = getPath(this._doc, key);

    if (prev === val) return this;
    if (schema) val = schema.applySetters(val, this);
    if (schema && schema.instance === 'virtual') {
      this.emit('change:' + key, this, val);
    } else {
      setPath(this._doc, key, val);
      this.emit('change:' + key, this, val);
      this.emit('change', this);
    }
  }
  return this;
};

/**
 * validate doc
 *
 * @param  {Object} doc to validate
 * @param  {Object} opts
 * @return {Array}  error array if any
 */

Model.prototype.validate = function (doc, opts) {
  if (!opts) {
    opts = doc || {};
    doc = this._doc;
  }

  var errors = [],
      _this = this,
      paths;

  if (opts.paths) {
    paths = opts.paths;
    if ('string' === typeof paths) paths = paths.split(' ');
  } else {
    paths = Object.keys(this.schema.paths);
  }

  paths.forEach(function (path) {
    var p = _this.schema.path(path),
        val = getPath(doc, path),
        err = p.doValidate(val, _this);
    if (err) errors.push.apply(errors, err);
  });

  if (errors.length) return errors;
};

/**
 * toJSON
 */

Model.prototype.toJSON = function () {
  return this._doc;
};