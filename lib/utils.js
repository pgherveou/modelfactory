function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * get nested property
 * @param  {Object} obj
 * @param  {String} path
 */

module.exports.getPath = function getPath(obj, path) {
  var paths = path.split('.'),
      ref = obj,
      i;

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (!hOP(ref, path)) return undefined;
    ref = ref[path];
  }
  return ref;
};

/**
 * check if obj has specified path
 *
 * @param  {Object}  obj
 * @param  {String}  path
 * @return {Object} false if path does not exist or truthy {val: 'xxx'} if value exist
 */

module.exports.hasPath = function hasPath(obj, path) {
  if (hOP(obj, path)) return { val: obj[path] };

  var paths = path.split('.'),
      ref = obj,
      i;

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (!hOP(ref, path)) return false;
    ref = ref[path];
  }
  return {val: ref};
};

/**
 * set nested property
 *
 * @param  {Object} obj
 * @param  {String} path
 * @param  {Object} val
 */

module.exports.setPath = function setPath(obj, path, val) {
  var subpaths = path.split('.'),
      last = subpaths.pop();

  obj = subpaths.reduce(function(prev, current){
    if (!hOP(prev, current)) prev[current] = Object.create(null);
    return prev[current];
  }, obj);

  if (obj) obj[last] = val;
};
