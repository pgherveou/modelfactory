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

  // get SubDocument Schema
  var schema = Array.isArray(options)
             ? options[0]
             : options.type[0],
      type, Model;


  // document array class
  this.DocArray = function DocArray(values, scope) {
    this._parent = scope;
    return ModelArray.call(this, values);
  };

  // inherit ModelArray
  this.DocArray.prototype.__proto__ = ModelArray.prototype;

  // if we have a schema generate Array models
  if (schema.constructor.name === 'Schema' ||
      schema.constructor.name === 'Object') {
    Model = DocumentArray.model(schema);
    this.DocArray.prototype._cast = function (value) {
      var val = value;
      if (!(value instanceof Model)) val = new Model(value);
      if (!val._parent) val._parent = this._parent;
      if (!val._parentArray) val._parentArray = this;
      return val;
    };

  // else override modelArray_cast with type#cast
  } else {
    type = DocumentArray.getSchemaType(schema);
    this.DocArray.prototype._cast = function (value) {
      return type.prototype.cast.call(this, value);
    };
  }

  SchemaType.call(this, key, options, 'DocumentArray');
}

/*!
 * extend SchemaType
 */

DocumentArray.prototype.__proto__ = SchemaType.prototype;

/**
 * Casts contents
 *
 * @param {Object} value
 * @param {doc} doc document that triggers the casting
 * @api private
 */

DocumentArray.prototype.cast = function (value, doc) {
  if (value instanceof this.DocArray) return value;
  if (value && !Array.isArray(value)) value = [value];
  return new this.DocArray(value, doc);
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
