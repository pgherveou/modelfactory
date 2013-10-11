/**
 * Type constructor
 *
 * @api public
 */

function Type (name) {
  this.path = name;
  this.getters = [];
  this.setters = [];
}

/**
 * exports
 */

module.exports = Type;


/**
 * Defines a getter.
 *
 * @param {Function} fn
 * @return {Type} this
 * @api public
 */

Type.prototype.get = function (fn) {
  this.getters.push(fn);
  return this;
};

/**
 * Defines a setter.
 *
 * @param {Function} fn
 * @return {Type} this
 * @api public
 */

Type.prototype.set = function (fn) {
  this.setters.push(fn);
  return this;
};

/**
 * Applies setters to a value
 *
 * @param {Object} value
 * @param {Object} scope
 * @api private
 */

Type.prototype.applySetters = function (value, scope) {
  var v = value,
      self = this;

  this.setters.forEach(function (setter) {
    v = setter.call(scope, v, self);
  });

  return v;
};

/**
 * Applies getters to a value
 *
 * @param {Object} value
 * @param {Object} scope
 * @api private
 */

Type.prototype.applyGetters = function (value, scope) {
  var v = value,
      self = this;

  this.getters.forEach(function (getter) {
    v = getter.call(scope, v, self);
  });

  return v;
};
