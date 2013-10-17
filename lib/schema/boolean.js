/*!
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function BooleanType(key, options) {
  SchemaType.call(this, key, options, 'Boolean');
}

/*!
 * extend SchemaType
 */

BooleanType.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts to boolean
 *
 * @param {Object} value
 * @api private
 */

BooleanType.prototype.cast = function (value) {
  if (null === value) return value;
  if ('0' === value) return false;
  if ('true' === value) return true;
  if ('false' === value) return false;
  return !! value;
};

/*!
 * module exports
 */

module.exports = BooleanType;
