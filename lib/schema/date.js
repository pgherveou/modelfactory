/**
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

function DateType(key, options) {
  SchemaType.call(this, key, options, 'Date');
}

/**
 * extend SchemaType
 */

DateType.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts to date
 *
 * @param {Object} value to cast
 * @api private
 */

DateType.prototype.cast = function (value) {
  if (value === null || value === '') return null;
  if (value instanceof Date) return value;

  var date;

  // support for timestamps
  if (value instanceof Number
      || 'number' === typeof value
      || String(value) === Number(value)) {
    date = new Date(Number(value));
  }

  // support for date strings
  else if (value.toString) {
    date = new Date(value.toString());
  }

  if (date.toString() !== 'Invalid Date') return date;
  throw new CastError('date', value, this.path);
};

/**
 * module exports
 */

module.exports = DateType;
