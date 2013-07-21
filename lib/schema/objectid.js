/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = ObjectId;

/**
 * extend SchemaType
 */

ObjectId.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function ObjectId(key, options) {
  SchemaType.call(this, key, options, 'ObjectId');
}
