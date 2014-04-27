/*!
 * module exports
 */

var types = {
  String: require('./string'),
  Number: require('./number'),
  Boolean: require('./boolean'),
  Date: require('./date'),
  Array: require('./documentarray'),
  ObjectId: require('./objectid'),
  Mixed: require('./mixed'),
  DocumentArray: require('./documentarray'),
  EmbeddedDocument: require('./embedded')
};

module.exports = types;

/**
 * get Schema Type from Schema definition
 *
 * Example:
 *   foo: {type: String} -> String
 *   foo: {type: 'String'} -> String
 *   foo: String -> String
 *
 * @param  {Type} type
 * @return {SchemaType}
 * @api private
 */

module.exports.getSchemaType = function getType (type) {

  // fix resolution after mangling for non standard types
  if (type === types.ObjectId || type === types.Mixed) {
    return type;
  }

  var name = 'string' === typeof type
    ? type
    : type.name;

  return types[name];
};

/*!
 * expose it to DocumentArray
 * to let it create
 */

types.DocumentArray.getSchemaType = module.exports.getSchemaType;

