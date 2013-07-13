/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = BooleanType;

/**
 * extend SchemaType
 */

BooleanType.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function BooleanType(key, options) {
  SchemaType.call(this, key, options, 'Boolean');
}
