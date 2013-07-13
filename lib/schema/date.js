/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = DateType;

/**
 * extend SchemaType
 */

DateType.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function DateType(key, options) {
  SchemaType.call(this, key, options, 'Date');
}
