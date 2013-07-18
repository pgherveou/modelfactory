/**
 * module dependencies
 */

var Type = require('./type');

/**
 * module exports
 */

module.exports = VirtualType;

/**
 * extend Type
 */

VirtualType.prototype.__proto__ = Type.prototype;

/**
 * Constructor
 *
 * @param {String} key
 * @param {Object} options
 */

function VirtualType(name) {
  Type.call(this, name);
  this.instance = 'virtual';
}
