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
  this.clear();
}

/**
 * clear store
 */

Store.prototype.clear = function () {
  this.cache = Object.create(null);
};

/**
 * get model in store with specified id
 *
 * @param  {String} id
 * @return {Model}
 */

Store.prototype.get = function (id) {
  return this.cache[id];
};

/**
 * add model to store
 *
 * @param {Model} model
 */

Store.prototype.add = function (model) {
  if (model.id) this.cache[model.id] = model;
};

/**
 * remove model from store
 *
 * @param  {Model} model
 */

Store.prototype.remove = function (model) {
  delete this.cache[model.id];
};

/**
 *  noop store used in place of a real store instance
 *  to turn off storing option
 */

Store.noop = {
  clear: noop,
  get: noop,
  add: noop,
  remove: noop
};

/*!
 * module exports
 */

module.exports = Store;

