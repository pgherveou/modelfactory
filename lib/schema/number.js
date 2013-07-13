/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = NumberType;

/**
 * extend SchemaType
 */

NumberType.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function NumberType(key, options) {
  SchemaType.call(this, key, options, 'Number');
}

/**
 * min validator
 * @param  {Number} val
 */

NumberType.prototype.min = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v >= val;
  };
  return this.validators.push([check, 'min']);
};

/**
 * max validator
 * @param  {Number} val
 */

NumberType.prototype.max = function(val) {
  var check = function(v) {
    if (!v) return true;
    return v <= val;
  };
  return this.validators.push([check, 'max']);
};