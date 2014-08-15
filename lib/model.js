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

/*!
 * get model id using idAttribute property
 *
 * @property id
 * @api public
 */

Object.defineProperty(Model.prototype, 'id', {
  get: function () {
    return this[globals.idAttribute];
  },
  set: function (val) {
    this.set(globals.idAttribute, val);
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
 * compare to models
 *
 * @param  {Model} doc
 * @return {Boolean}
 */

Model.prototype.equals = function (doc) {
  if (doc === this) return true;
  var id = doc[globals.idAttribute];
  if (!id) return false;
  return id === this.id;
};

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
 *
 * @return {Model}
 * @api public
 */

Model.prototype.parent = function () {
  return this._parent;
};

/**
 * mark path as modified
 * @param {key} String
 */

Model.prototype.markModified = function(key) {
  if (this._modified.indexOf(key) === -1) {
    this._modified.push(key);
    if (this._parent && this._parentPath) {
      this.parent().markModified(this._parentPath);
    }
  }
};

/**
 * get modified paths
 *
 * @return {Array}
 * @api public
 */

Model.prototype.modifiedPaths = function() {
  return this._modified;
};

/**
 * clear modified paths
 *
 * @api public
 */

Model.prototype.clearModifiedPaths = function() {
  var instance, path, val;

  function clear(m) { m && m.clearModifiedPaths(); }

  while (this._modified.length > 0) {
    path = this._modified.pop();
    instance = this.schema.path(path).instance;

    if (instance === 'EmbeddedDocument') {
      clear(this.get(path));
    } else if (instance === 'DocumentArray') {
      val = this.get(path);
      val && val.forEach(clear);
    }
  }
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
      store = this.schema.store,
      silent, schema, ev, parts;

  // handle model.set(key, val)
  if ('string' === typeof key) {
    schema = this.schema.path(key) || this.schema.virtualpath(key);
    if (val && ('object' === typeof val)) {
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
        old,
        path;

    path = this.schema.path(key) || this.schema.virtualpath(key);

    if (path.instance !== 'virtual') {

      // get old
      old = getPath(this._doc, key);

      // return if value has not changed
      if (old === val) return;

      // apply setters
      val = path.applySetters(val, this);

      // apply value
      setPath(this._doc, key, val);

      // update index if necessary
      if (store.hasIndex(key)) {
        if (old) store.unsetIndex(key, old);
        if (val) store.setIndex(this, key, val);
      }

      // mark path as modified
      this.markModified(key);

    } else {
      // apply setters
      return path.applySetters(val, this);
    }

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
  var store = this.schema.store;

  Object
    .keys(this.schema.paths)
    .forEach(function (key) {
      var path = this.schema.paths[key],
          exist = hasPath(obj, key),
          val;


      if (exist) {
        val = exist.val;
      } else if (path.defaultValue) {
        val = path.getDefault();
      } else {
        return;
      }

      // apply setters
      val = path.applySetters(val, this);
      setPath(this._doc, key, val);

      // add index
      if (val && store.hasIndex(key)) {
        store.setIndex(this, key, val);
      }

    }, this);

  Object
    .keys(this.schema.virtuals)
    .forEach(function (key) {
      var exist = hasPath(obj, key),
          path = this.schema.virtuals[key];
      if (!exist || !path.setters.length) return;
      path.applySetters(exist.val, this);
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
 * @param {string|Array} ppties space separated list of properties
 * @return {Object}
 * @api public
 */

Model.prototype.pick = function (ppties) {
  var obj = {};
  if ('string' === typeof ppties) ppties = ppties.split(' ');

  ppties.forEach(function (key) {
    obj[key] = (this[key] && this[key].toJSON)
             ? this[key].toJSON()
             : this.get(key);
  }, this);
  return obj;
};

/**
 * get JSON representation of this model
 *
 * @param {Object} opts
 * @return {Object}
 * @api public
 */

Model.prototype.toJSON = function (opts) {
  var obj = {},
      transformed;

  // default schema options
  if (!opts) opts = this.schema.get('toJSON');

  Object.keys(this.schema.tree).forEach(function (key) {
    if (this._doc[key] && this._doc[key].toJSON) {
      obj[key] = this._doc[key].toJSON();
    } else if (this._doc[key] !== undefined) {
      obj[key] = this._doc[key];
    }
  }, this);

  // apply transform
  if (opts && opts.transform) transformed = opts.transform(this, obj, opts);
  return transformed || obj;
};

