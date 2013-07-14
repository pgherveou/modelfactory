/**
 * module dependencies
 */

var SchemaType = require('../schemaType');

/**
 * module exports
 */

module.exports = StringType;

/**
 * extend SchemaType
 */

StringType.prototype.__proto__ = SchemaType.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 *
 */

function StringType(key, options) {
  SchemaType.call(this, key, options, 'String');
}

/**
 * match validator
 *
 * @param  {Regexp} regExp
 */

StringType.prototype.match = function(regExp) {
  var check = function(v) {
    if (!v) return true;
    return regExp.test(v);
  };
  this.validators.push([check, 'match']);
};

/**
 * enum validator
 *
 * @param  {Array} values
 */

StringType.prototype.enum = function() {
  var values = [].slice.apply(arguments)
    , check = function(v) {
        if (!v) return true;
        return (values.indexOf(v) === -1) ? false: true;
      };
  this.validators.push([check, 'enum']);
};

