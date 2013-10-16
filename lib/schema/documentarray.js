/*!
 * module dependencies
 */

var SchemaType = require('../schemaType'),
    ModelArray = require('modelarray');

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function DocumentArray(key, options) {
  SchemaType.call(this, key, options, 'DocumentArray');

  // get SubDocument Schema
  var schema = Array.isArray(options)
     ? options[0]
     : options.type[0];

  if (schema.constructor.name === 'Schema' ||
      schema.constructor.name === 'Object') {
    this.SubDocument = DocumentArray.model(schema);
  }
}

/*!
 * extend SchemaType
 */

DocumentArray.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts contents
 *
 * @param {Object} value
 * @param {Document} doc document that triggers the casting
 * @param {Boolean} init whether this is an initialization cast
 * @api private
 */

DocumentArray.prototype.cast = function (value) {
  if (!(value instanceof ModelArray)) {
    value = new ModelArray(value, this.SubDocument);
  }
  return value;
};

/**
 * Validate Schema
 *
 * @override SchemaType#doValidate
 * @api public
 */

DocumentArray.prototype.doValidate = function (array) {

  // validate self first
  var errs = SchemaType.prototype.doValidate.apply(this, arguments);

  if (errs) return errs;
  if (!array) return;
  if (!this.SubDocument) return;

  // validate items
  array.forEach(function (model) {
    var modelErrs = model.validate();
    if (modelErrs) {
      errs || (errs = []);
      errs.concat(modelErrs);
    }
  });

  return errs;
};

/*!
 * module exports
 */

module.exports = DocumentArray;
