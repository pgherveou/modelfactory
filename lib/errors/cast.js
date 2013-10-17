/**
 * Cast error
 *
 * @param {String} path
 * @param {String} type
 * @param {Object} val
 */

function CastError(path, type, val) {
  var msg;
  msg = type ? '"' + type + '"' : '';
  this.message = 'Cast ' + msg + ' failed for path ' + path;
  if (2 < arguments.length) this.message += ' with value ' + (String(val));

  Error.call(this);
  this.name = 'CastError';
  this.path = path;
  this.type = type;
  this.value = val;
}

/*!
 * extend Error
 */

CastError.prototype.__proto__ = Error.prototype;

/*!
 * module exports
 */

module.exports = CastError;
