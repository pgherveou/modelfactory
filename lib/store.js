var noop = function () {};

/**
 * create a new Store
 *
 * examples:
 *     store = new Store()
 *     store.add({id: 1, name: 'pg'})
 *     user = store.get(1)
 *     store.remove(user)
 *     store.clear()
 */

function Store() {
  this.caches = Object.create(null);
  this.indexes = [];
  this.index('id');
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
 * get model in store with specified id
 *
 * @param  {String} id
 * @return {Model}
 */

Store.prototype.get = function (id) {
  return this.caches.id[id];
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
    delete this.caches[index][model.id];
  }, this);
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
  remove: noop
};

/*!
 * module exports
 */

module.exports = Store;

