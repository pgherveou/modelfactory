var globals = require('./globals');
var noop = function () {};

/**
 * create a new Store
 *
 * examples:
 *     store = new Store()
 *     store.add({id: 1, name: 'pg'})
 *     user = store.get({id: 1})
 *     store.remove(user)
 *     store.clear()
 */

function Store() {
  this.caches = Object.create(null);
  this.indexes = [];
  this.index(globals.idAttribute);
  this.clear();
}

/**
 * add Index
 */

Store.prototype.index = function (name) {
  this.indexes.push(name);
  this.caches[name] = Object.create(null);
};

/**
 * clear store
 */

Store.prototype.clear = function () {
  this.indexes.forEach(function (index) {
    this.caches[index] = Object.create(null);
  }, this);
};

/**
 * get model in store with specified index and value
 *
 * @param  {String} index
 * @param  {String} value
 * @return {Model}
 */

Store.prototype.getBy = function (index, value) {
  return this.caches[index][value];
};

/**
 * get model in store with idAttribute
 *
 * @param  {Object} doc
 * @return {Model}
 */

Store.prototype.get = function (doc) {
  if (!doc) return null;

  var len = this.indexes.length,
      index, value, found;

  for (var i = 0; i < len; i++) {
    index = this.indexes[i];
    value = doc[index];
    found = value && this.getBy(index, value);
    if (found) return found;
  }
};

/**
 * add model to store
 *
 * @param {Model} model
 */

Store.prototype.add = function (model) {
  this.indexes.forEach(function (index) {
    var key = model[index];
    if (key) this.caches[index][key] = model;
  }, this);
};

/**
 * remove model from store
 *
 * @param  {Model} model
 */

Store.prototype.remove = function (model) {
  this.indexes.forEach(function (index) {
    var key = model[index];
    delete this.caches[index][key];
  }, this);
};

Store.prototype.setIndex = function(model, index, key) {
  this.caches[index][key] = model;
};

Store.prototype.unsetIndex = function(index, key) {
  delete this.caches[index][key];
};

Store.prototype.hasIndex = function(key) {
  return this.indexes.indexOf(key) !== -1;
};

/**
 *  noop store used in place of a real store instance
 *  to turn off storing option
 */

Store.noop = {
  clear: noop,
  get: noop,
  getBy: noop,
  add: noop,
  remove: noop,
  setIndex: noop,
  unsetIndex: noop,
  hasIndex: noop
};

/*!
 * module exports
 */

module.exports = Store;

