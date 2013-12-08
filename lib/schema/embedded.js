/*!
 * module dependencies
 */

var SchemaType = require('../schemaType'),
    globals = require('../globals');

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function EmbeddedDocument(key, options) {
  this.schema = options.type
             ? options.type
             : options;

  SchemaType.call(this, key, options, 'EmbeddedDocument');
}

/*!
 * extend SchemaType
 */

EmbeddedDocument.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts contents
 *
 * @param {Object} value
 * @param {doc} doc document that triggers the casting
 * @api private
 */

EmbeddedDocument.prototype.cast = function (value, doc) {
  if (!value) return value;

  var model;
  if (value instanceof this.schema.model) {
    model = value;
  } else if (typeof value === 'string') {
    var obj = {};
    obj[globals.idAttribute] = value;
    model = new this.schema.model(obj);
  } else {
    model = new this.schema.model(value);
  }
  model.parent || (model.parent = doc);
  return model;
};

/**
 * Validate Schema
 *
 * @override SchemaType#doValidate
 * @api public
 */

EmbeddedDocument.prototype.doValidate = function (model) {

  // validate self first
  var errs = SchemaType.prototype.doValidate.apply(this, arguments);

  if (errs) return errs;
  if (!model) return;

  errs = model.validate();

  if (errs) {
    errs.map(function (err) {
      err.path = this.path + '.' + err.path;
      return err;
    }, this);
  }

  return errs;
};

/*!
 * module exports
 */

module.exports = EmbeddedDocument;
