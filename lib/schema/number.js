/*!
 * module dependencies
 */

var SchemaType = require('../schemaType'),
    Errors = require('../errors'),
    CastError = Errors.CastError;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function NumberType(key, options) {
  SchemaType.call(this, key, options, 'Number');
}

/*!
 * extend SchemaType
 */

NumberType.prototype.__proto__ = SchemaType.prototype;

/*!
 * module exports
 */

module.exports = NumberType;

/**
 * min validator
 *
 * @param  {Number} val
 * @api public
 */

NumberType.prototype.min = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v >= val;
  };
  return this.validators.push([check, 'min']);
};

/**
 * max validator
 *
 * @param  {Number} val
 * @api public
 */

NumberType.prototype.max = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v <= val;
  };
  return this.validators.push([check, 'max']);
};

/**
 * Casts to number
 *
 * @param {Object} value value to cast
 * @api private
 */

NumberType.prototype.cast = function (value) {
  if ('' === value) return null;
  if (!value) return value;

  if (!isNaN(value)){
    if ('string' === typeof value) value = Number(value);
    if (value instanceof Number) return value;
    if ('number' === typeof value) return value;
  }

  throw new CastError(this.path, 'number', value);
};