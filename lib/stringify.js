/**
 * Escapes quotes in a string.
 *
 * @param {String} str
 * @return {String}
 */
function escape(str) {
  return str.replace(/"/g, '\\"');
}


/**
 * Turns an object into JSON, including functions.
 * For functions, if they have one argument, copies the whole function source,
 * otherwise they must be asynchronous. In that case, it creates a
 * wrapper for it that references it on the server.
 *
 * @param {Object} obj
 * @return {Array} An array is returned with a list of asynchronous
 *   functions and the stringified object.
 */
module.exports = function stringifyObj(obj) {
  var asyncfuns = [];

  function stringify(obj, path) {
    path = path || '';
    var type = typeof obj, values, i, len;

    if (type === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        values = [];
        for (i = 0, len = obj.length; i < len; i++) {
          values[i] = stringify(obj[i], path);
        }
        return '[' + values.join(',') + ']';

      } else if (obj instanceof RegExp) {
        return  obj.toString();

      } else {
        values = [];
        i = 0;
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            values[i++] = '"' + escape(key) + '":' +
              stringify(obj[key], path + '.' + key);
          }
        }
        return '{' + values.join(',') + '}';
      }

    } else if (type === 'string') {
      return '"' + escape(obj) + '"';

    } else if (type === 'function') {
      if (obj.length === 1 || /submit\.client/.test(path)) {
        return escape(obj.toString());
      } else if (/submit\.server/.test(path)) {
        return null;
      } else {
        var id = asyncfuns.length;
        asyncfuns[id] = obj;
        return 'castform.async(' + id + ')';
      }

    } else {
      return obj;
    }
  }

  return [asyncfuns, stringify(obj)];
};
