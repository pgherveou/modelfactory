var Emitter = require('emitter'),
    utils = require('./utils'),
    globals = require('./globals'),
    getPath = utils.getPath,
    hasPath = utils.hasPath,
    setPath = utils.setPath;

/**
 * Model Class
 */

function Model() {
}

/*!
 * Inherit from Emitter
 */

Model.prototype.__proto__ = Emitter.prototype;

/*!
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
    return this._doc[globals.idAttribute];
  },
  set: function (val) {
    this._doc[globals.idAttribute] = val;
  }
});

/**
 * Has this model been saved to the server yet
 *
 * @property isNew
 * @api public
 */

Object.defineProperty(Model.prototype, 'isNew', {
  get: function () {
    return !this.id;
  }
});

/**
 * Get property using schema getters
 *
 * @param  {String} key
 * @return {Object} path value
 * @api public
 */

Model.prototype.get = function (path) {
  if (!path) return this;

  var schema = this.schema.path(path) || this.schema.virtualpath(path),
      obj = getPath(this._doc, path);

  if (schema) return schema.applyGetters(obj, this);
  return obj;
};

/**
 * get parent document
 */

Model.prototype.parent = function () {
  return this._parent;
};

/**
 * get parent array
 */

Model.prototype.parentArray = function () {
  return this._parentArray;
};

/**
 * Get raw value
 *
 * @param  {String} key
 * @return {Object} path raw value
 * @api public
 */

Model.prototype.getValue = function (path) {
  return getPath(this._doc, path);
};

/**
 * set property
 *
 * @param  {String|Object}  key
 * @param  {Object}         val
 * @api public
 */

Model.prototype.set = function (key, val, opts) {
  if (key == null) return this;
  var paths = [],
      changedPaths = [],
      parent = this._parentArray,
      silent, schema, path, ev, parts;

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
    opts = val;
  }

  // silent opt
  silent = opts && opts.silent;

  // iterate over paths
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

      // key event
      ev = 'change:' + key;
      if (this.hasListeners(ev) || (parent && parent.hasListeners(ev))) {
        changedPaths[ev] = this.get(key);
      }

      // prepare subpath events
      parts = key.split('.');
      while(parts.length) {
        parts.pop();
        path = parts.join('.');
        ev = 'change';
        if (path) ev += ':' + path;

        // don't bother calculate this.get(path) if there are not listeners
        if (this.hasListeners(ev) || (parent && parent.hasListeners(ev))) {
          changedPaths[ev] = this.get(path);
        }
      }
    }
  }, this);

  // emit events
  if (!silent) {
    Object
      .keys(changedPaths)
      .forEach(function (ev) {
        this.emit(ev, changedPaths[ev], this);
        if (parent) parent.emit(ev, changedPaths[ev], this, parent);
      }, this);
  }

  return this;
};

/**
 * build model with specified obj and default values
 *
 * @param  {Object}  obj
 * @api private
 */

Model.prototype._build = function (obj) {
  Object
    .keys(this.schema.paths)
    .forEach(function (key) {
      var schema = this.schema.paths[key],
          exist = hasPath(obj, key),
          val;

      if (exist) {
        val = exist.val;
      } else if (schema.defaultValue) {
        val = schema.getDefault();
      } else {
        return;
      }

      // apply setters
      val = schema.applySetters(val, this);
      setPath(this._doc, key, val);


    }, this);
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
 * @api public
 */

Model.prototype.validate = function (doc, opts) {
  if (!opts) {
    opts = doc || {};
    doc = this._doc;
  }

  var errors = [],
      paths;

  if ('string' === typeof opts) {
    paths = opts.split(' ');
  } else if ('string' === typeof opts.paths) {
    paths = opts.paths.split(' ');
  } else if (Array.isArray(opts)) {
    paths = opts;
  } else if (Array.isArray(opts.paths)) {
    paths = opts.paths;
  }

  // validate all if no path specified
  if (!paths) paths = Object.keys(this.schema.paths);

  paths.forEach(function (path) {
    var p = this.schema.path(path),
        val = getPath(doc, path),
        err = p.doValidate(val, this);
    if (err) errors.push.apply(errors, err);
  }, this);

  if (errors.length) return errors;
};

/**
 * dispose model
 *
 * remove from parentArray
 * remove all listener
 * and remove model from store
 */

Model.prototype.dispose = function () {
  var arr = this.parentArray();
  if (arr) arr.remove(this);
  this.schema.store.remove(this);
  this.off();
};

/**
 * extract specified properties
 *
 * @param {string} ppties space separated list of properties
 * @return {Object}
 * @api public
 */

Model.prototype.pick = function (ppties) {
  var obj = {};
  ppties.split(' ').forEach(function (key) {
    obj[key] = (this._doc[key] && this._doc[key].toJSON)
             ? this._doc[key].toJSON()
             : this._doc[key];
  }, this);
  return obj;
};

/**
 * get JSON representation of this model
 *
 * @return {Object}
 * @api public
 */

Model.prototype.toJSON = function () {
  var obj = {};
  Object.keys(this.schema.tree).forEach(function (key) {
    obj[key] = (this._doc[key] && this._doc[key].toJSON)
             ? this._doc[key].toJSON()
             : this._doc[key];
  }, this);
  return obj;
};

