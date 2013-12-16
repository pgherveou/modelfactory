/**
 * module deps
 */

var ValidatorError = require('./errors/validator'),
    Type = require('./type');

/**
 * SchemaType constructor
 *
 * @param {String} path
 * @param {Object} options
 * @param {String} instance
 */

function SchemaType(name, options, instance) {
  Type.call(this, name);
  this.options = options;
  this.instance = instance;
  this.validators = [];

  Object.keys(options).forEach(function(name) {
    var fn = this[name];

    if (fn && 'function' === typeof fn) {
      this[name].call(this, options[name]);
    }
  }, this);
}

/**
 * extend Type
 */

SchemaType.prototype.__proto__ = Type.prototype;


/**
 * module exports
 */

module.exports = SchemaType;

/**
 * Add validator
 * @param  {function} fn
 * @param  {String}   error
 * @api public
 */

SchemaType.prototype.validate = function(obj, error) {
  this.validators.push([obj, error]);
  return this;
};

/**
 * validate value
 *
 * @param  {Object}   value
 * @param  {Object}   scope
 * @return {[Array]}
 * @api private
 */

SchemaType.prototype.doValidate = function(value, scope) {
  if (!this.validators.length) return null;

  var errs = null,
      path = this.path,
      validate = function(ok, msg, val) {
        if (!ok) {
          errs || (errs = []);
          errs.push(new ValidatorError(path, msg, val));
        }
      };

  this.validators.forEach(function(v) {
    var validator = v[0], message = v[1];
    validate(validator.call(scope, value), message, value);
  });

  return errs;
};

/**
 * mark attribute as required
 */

SchemaType.prototype.required = function() {
  var check = function(v) {return v ? true: false;};
  return this.validators.push([check, 'required']);
};

