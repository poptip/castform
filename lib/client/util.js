/*jshint unused:false */


/**
 * Checks if an object is an array.
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}


/**
 * Checks if an object contains a key
 *
 * @param {Object} obj
 * @param {String} key
 */
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}


/**
 * Sequential function execution for async.
 *
 * @param {Array} funcs List of functions to execute one after the other.
 *   Functions are passed a `callback` which must be called with boolean
 *   true `passed` to continue execution, and a `msg` if `pass` is false.
 * @param {Function} callback Optional callback called at end or error.
 */
function seq(funcs, callback) {
  function next() {
    var fn = funcs.shift();
    if (fn) {
      fn(function(pass, msg) {
        if (!pass) { return callback(pass, msg); }
        next();
      });
    } else {
      callback(true);
    }
  }

  next();
}


/**
 * Throttles a function to given ms. Function will be called after
 * ms and any call to the same function within that ms timestapn will
 * reset the timeout.
 *
 * @param {Function} fn
 * @param {Number} ms
 */
function throttle(fn, ms) {
  var tid;

  // Note using direct arguments is much faster than turning `arguments`
  // into an array for every call and using apply.
  return function(a, b, c) {
    clearTimeout(tid);
    tid = setTimeout(function() {
      fn(a, b, c);
    }, ms);
  };
}


/**
 * Delay function execution if by ms the new function is called with.
 *
 * @param {Function} fn
 * @returns {Function(ms, args...)}
 */
function delay(fn) {
  var tid;

  return function(ms, a, b, c) {
    clearTimeout(tid);
    if (ms) {
      tid = setTimeout(function() {
        fn(a, b, c);
      }, ms);
    } else {
      fn(a, b, c);
    }
  };
}


/**
 * Any fields hash does not have, are taken from default, recursively.
 *
 * @param {Object} hash
 * @param {Object} defaults
 */
function extend(hash, defaults) {
  for (var key in defaults) {
    if (has(defaults, key)) {
      var type = typeof hash[key];
      if (type === 'undefined') hash[key] = defaults[key];
      else if (type === 'object') extend(hash[key], defaults[key]);
    }
  }
}
