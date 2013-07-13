/**
 * module deps
 */

var ValidatorError = require('./errors/validator');

/**
 * module exports
 */

module.exports = SchemaType;

/**
 * SchemaType constructor
 *
 * @param {String} path
 * @param {Object} options
 * @param {String} instance
 */

function SchemaType(path, options, instance) {
  var _this = this;
  this.path = path;
  this.instance = instance;
  this.validators = [];
  this.options = options;

  Object.keys(options).forEach(function(name) {
    var fn, opts;
    if ((fn = _this[name]) && "function" === typeof _this[name]) {
      opts = Array.isArray(options[name]) ? options[name] : [options[name]];
      _this[name].apply(_this, opts);
    }
  });
}

/**
 * Add validator
 * @param  {function} fn
 * @param  {String}   error
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
 */

SchemaType.prototype.doValidate = function(value, fn, scope) {
  if (!this.validators.length) return null;

  var errs = null
    , path = this.path
    , validate = function(ok, msg, val) {
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

