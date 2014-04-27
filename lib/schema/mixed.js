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

function MixedType(key, options) {
  SchemaType.call(this, key, options, 'Mixed');
}

/*!
 * extend SchemaType
 */

MixedType.prototype.__proto__ = SchemaType.prototype;

/*!
 * module exports
 */

module.exports = MixedType;

