/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = DocumentArray;

/**
 * extend SchemaType
 */

DocumentArray.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function DocumentArray(key, options) {
  SchemaType.call(this, key, options, 'Date');
}
