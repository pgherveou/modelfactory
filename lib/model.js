var Emitter = require('emitter'),
    utils = require('./utils'),
    getPath = utils.getPath,
    setPath = utils.setPath;

/**
 * Model constructor, inherit from Emitter
 * @param {[type]} obj [description]
 */

function Model(obj) {
  Object.defineProperty(this, '_doc', {
    value: obj || {},
  });
  this.emit('init', this, obj);
}

/*!
 * Inherit from Emitter
 */

Model.prototype.__proto__ = Emitter.prototype;

/**
 * The documents schema.
 *
 * @property schema
 * @api public
 */

Model.prototype.schema;


/**
 * export
 */

module.exports = Model;

/**
 * get model id using _id property
 *
 * @property id
 * @api public
 */

Object.defineProperty(Model.prototype, 'id', {
  get: function () {
    return this._doc._id;
  }
});

/**
 * Define if model is new or not
 *
 * @property isNew
 * @api public
 */

Object.defineProperty(Model.prototype, 'isNew', {
  get: function () {
    return !!this.id;
  }
});

/**
 * Get property using schema getters
 * @param  {String} key
 * @return {Object} path value
 */

Model.prototype.get = function (path) {
  if (!path) return this;

  var schema = this.schema.path(path) || this.schema.virtualpath(path),
      obj = getPath(this._doc, path);

  if (schema) return schema.applyGetters(obj, this);
  return obj;
};

/**
 * Get raw value
 * @param  {String} key
 * @return {Object} path raw value
 */

Model.prototype.getValue = function (path) {
  return getPath(this._doc, path);
};

/**
 * set property
 *
 * @param  {String|Object}  key
 * @param  {Object}         val
 */

Model.prototype.set = function (key, val, opts) {
  if (key == null) return this;
  var paths = [],
      silent = opts && opts.silent,
      changedPaths = [],
      schema, path, ev, parts;

  // handle model.set(key, val)
  if ('string' === typeof key) {
    schema = this.schema.path(key) || this.schema.virtualpath(key);
    if ('object' === typeof val) {
      paths = this.schema.getKeyVals(val, key);
    } else if (schema) {
      paths.push({key: key, val: val});
    }

  // handle model.set(val)
  } else {
    paths = this.schema.getKeyVals(key);
  }

  paths.forEach(function (keyval) {
    var key = keyval.key,
        val = keyval.val,
        schema;

    // return if value has not changed
    if (getPath(this._doc, key) === val) return;

    // get path's schema
    schema = this.schema.path(key) || this.schema.virtualpath(key);

    // apply setters
    val = schema.applySetters(val, this);

    // apply value
    if (schema.instance !== 'virtual') setPath(this._doc, key, val);

    // trigger events
    if (!silent) {
      this.emit('change:' + key, this.get(key), this);
      parts = key.split('.');

      // prepare subpath events
      while(parts.length) {
        parts.pop();
        path = parts.join('.');
        ev = 'change';
        if (path) ev += ':' + path;
        if (!changedPaths[ev] && this.hasListeners(ev))
          changedPaths[ev] = this.get(path);
      }
    }
  }, this);

  // emit subpath events
  if (!silent) {
    Object
      .keys(changedPaths)
      .forEach(function (ev) {
        this.emit(ev, changedPaths[ev], this);
      }, this);
  }

  return this;
};

/**
 * validate doc
 *
 * opts are:
 *   - path list of path to validate for this model default to all
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
 *
 * @return {Object} JSON representation of this model
 * @api public
 */

Model.prototype.toJSON = function () {
  return this._doc;
};

/**
 * toJSON
 *
 * @return {Object} JSON representation of this model
 * @api public
 */

Model.prototype.isNew = function () {
  return this._doc;
};