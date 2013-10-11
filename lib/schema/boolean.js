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

function BooleanType(key, options) {
  SchemaType.call(this, key, options, 'Boolean');
}

/**
 * extend SchemaType
 */

BooleanType.prototype.__proto__ = SchemaType.prototype;

/**
 * module exports
 */

module.exports = BooleanType;
