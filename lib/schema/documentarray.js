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

function DocumentArray(key, options) {
  SchemaType.call(this, key, options, 'Date');
}

/**
 * extend SchemaType
 */

DocumentArray.prototype.__proto__ = SchemaType.prototype;

/**
 * module exports
 */

module.exports = DocumentArray;
