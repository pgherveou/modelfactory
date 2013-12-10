/*!
 * module exports
 */

var types = {
  String: require('./string'),
  ObjectId: require('./objectid'),
  Number: require('./number'),
  Boolean: require('./boolean'),
  Date: require('./date'),
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

