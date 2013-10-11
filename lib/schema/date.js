/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

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
 * module exports
 */

module.exports = DateType;
