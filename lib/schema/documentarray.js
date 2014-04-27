/*!
 * module dependencies
 */

var SchemaType = require('../schemaType'),
    Mixed = require('./mixed'),
    ModelArray = require('modelarray');

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function DocumentArray(key, options) {

  var schema, Type, Model;

  // get SubDocument Schema & options
  schema = options.type[0] || Mixed;

  if (schema.type && ('function' === typeof schema.type)) {
    Type = DocumentArray.getSchemaType(schema.type);
    this.arrType = new Type('', schema);
    schema = schema.type;
  }

  // document array class
  this.DocArray = function DocArray(values, scope) {
    this._parent = scope;
    return ModelArray.call(this, values);
  };

  // inherit ModelArray
  this.DocArray.prototype.__proto__ = ModelArray.prototype;

  // if we have a schema generate Array models
  if (schema.name === 'Schema' || schema.constructor.name === 'Object') {
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
    Type = DocumentArray.getSchemaType(schema);
    this.DocArray.prototype._cast = function (value) {
      return Type.prototype.cast.call(this, value);
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

  // validate items
  array.forEach(function (model) {
    var modelErrs;

    if (model.validate) {
      modelErrs = model.validate();
    } else if (this.arrType) {
      modelErrs = this.arrType.doValidate(model);
    }

    if (modelErrs) {
      errs || (errs = []);
      [].push.apply(errs, modelErrs.map(function (err) {
        var path = err.path;
        err.path =  this.path + '.' + array.indexOf(model);
        if (path) err.path += '.' + path;
        return err;
      }, this));
    }

  }, this);

  return errs;
};

/**
 * min validator
 *
 * @param  {Number} val
 * @api public
 */

DocumentArray.prototype.min = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v.length >= val;
  };
  return this.validators.push([check, 'min']);
};

/**
 * max validator
 *
 * @param  {Number} val
 * @api public
 */

DocumentArray.prototype.max = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v.length <= val;
  };
  return this.validators.push([check, 'max']);
};


/*!
 * module exports
 */

module.exports = DocumentArray;
