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

  return this.cast(v);
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

/**
 * cast value to type default to identity
 *
 * @param  {Object} value to cast
 * @return {Object} casted value
 * @api private
 */

Type.prototype.cast = function (v) {
  return v;
};

/**
 * Sets a default value for this Type.
 *
 * @param {Function|any} val the default value
 * @return {defaultValue}
 * @api public
 */

Type.prototype.default = function (val) {
  if (1 === arguments.length) {
    this.defaultValue = typeof val === 'function'
      ? val
      : this.cast(val);
    return this;
  } else if (arguments.length > 1) {
    this.defaultValue = [].slice.apply(arguments);
  }
};

/**
 * Gets the default value
 *
 * @param {Object} scope the scope which callback are executed
 * @api private
 */

Type.prototype.getDefault = function (scope) {
  var ret = 'function' === typeof this.defaultValue
    ? this.defaultValue.call(scope)
    : this.defaultValue;
  return ret;
};

