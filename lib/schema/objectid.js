/*!
 * module dependencies
 */

var SchemaType = require('../schemaType'),
    EmbeddedDocument = require('./embedded');

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function ObjectId(key, options) {
  SchemaType.call(this, key, options, 'ObjectId');
}

/*!
 * extend SchemaType
 */

ObjectId.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts contents
 *
 * @param {Object} value
 * @param {doc} doc document that triggers the casting
 * @api private
 */

ObjectId.prototype.cast = function (value, doc) {
  if (!value) return value;
  if ('string' === typeof value) return value;

  // load ref model lazyly and use EmbbedDocument cast
  if (this.options.ref && !this.schema) {
    this.schema = module.exports.models[this.options.ref].schema;
  }

  return EmbeddedDocument.prototype.cast.call(this, value, doc);
};

/*!
 * module exports
 */

module.exports = ObjectId;

