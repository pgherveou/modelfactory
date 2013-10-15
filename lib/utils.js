/**
 * get nested property
 * @param  {Object} obj
 * @param  {String} path
 */

module.exports.getPath = function getPath(obj, path) {
  return path.split('.').reduce(function(prev, current){
    if (prev) return prev[current];
  }, obj);
};

/**
 * check if obj has specified path
 *
 * @param  {Object}  obj
 * @param  {String}  path
 * @return {Boolean}
 */

module.exports.hasPath = function hasPath(obj, path) {
  var paths = path.split('.'),
      ref = obj,
      i;

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (!ref.hasOwnProperty(path)) return false;
    ref = ref[path];
  }
  return true;
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
    if (prev) return prev[current];
  }, obj);

  if (obj) obj[last] = val;
};
