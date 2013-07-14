/**
 * get nested property
 * @param  {Object} obj
 * @param  {String} path
 */

module.exports.getPath = function(obj, path) {
  return path.split('.').reduce(function(prev, current){
    if (prev) return prev[current];
  }, obj);
};

/**
 * set nested property
 *
 * @param  {Object} obj
 * @param  {String} path
 * @param  {Object} val
 */

module.exports.setPath = function(obj, path, val) {
  var subpaths = path.split('.')
    , last = subpaths.pop();

  obj = subpaths.reduce(function(prev, current){
    if (prev) return prev[current];
  }, obj);

  if (obj) obj[last] = val;
};
