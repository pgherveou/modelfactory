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

function ObjectId(key, options) {
  SchemaType.call(this, key, options, 'ObjectId');
}

/**
 * extend SchemaType
 */

ObjectId.prototype.__proto__ = SchemaType.prototype;

/**
 * module exports
 */

module.exports = ObjectId;

