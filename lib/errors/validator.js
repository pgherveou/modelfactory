/**
 * Validator error
 * @param {String} path
 * @param {String} type
 * @param {Object} val
 */

function ValidatorError(path, type, val) {
  var msg;
  msg = type ? '"' + type + '"' : '';
  this.message = 'Validator ' + msg + ' failed for path ' + path;
  if (2 < arguments.length) {
    this.message += ' with value ' + (String(val));
  }
  Error.call(this);
  this.name = 'ValidatorError';
  this.path = path;
  this.type = type;
  this.value = val;
}

/**
 * extend Error
 */

ValidatorError.prototype.__proto__ = Error.prototype;

/**
 * module exports
 */

module.exports = ValidatorError;
