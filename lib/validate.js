var async = require('async');


/**
 * Validate an async function submitted through AJAX.
 *
 * @param {Object} context
 * @param {Function} fn
 * @param {Number|String} id
 * @param {String} value
 * @param {Function} pass
 */
exports.async = function(context, fn, value, pass) {
  fn.call(context, value, pass);
};


/**
 * Validate a single form field.
 * Will not be called directly from requests.
 *
 * @param {Object} context
 * @param {String} name
 * @param {Object} options
 * @param {String} value
 * @param {Function} callback
 */
exports.field = function(context, name, options, value, callback) {
  if (options.required && !value) {
    process.nextTick(callback.bind(null, name + ' is required'));
    return;
  }

  if (typeof options.sanitize === 'function') {
    value = options.sanitize(value);
  }

  if (Array.isArray(options.validate) && options.validate.length) {
    var funs = options.validate.map(function(obj) {
      var fn = obj.fn;
      if (typeof fn === 'function') {
        if (fn.length === 1) {
          return function(callback) {
            callback(fn(value) ? null : obj.msg);
          };
        } else {
          return function(callback) {
            fn.call(context, value, function(pass, msg) {
              callback(pass ? null : msg || obj.msg);
            });
          };
        }

      } else if (fn instanceof RegExp) {
        return function(callback) {
          callback(fn.test(value) ? null : obj.msg);
        };

      } else {
        throw Error('not a function or regular expression');
      }
    });

    async.series(funs, function(err) {
      callback(err, value);
    });

  } else {
    process.nextTick(callback.bind(null, null, value));
  }
};


function checkField(context, key, options, value, callback) {
  exports.field(context, key, options, value, function(err, value) {
    callback(null, { pass: !err, msg: err, value: value });
  });
}


/**
 * Validate all fields in a form.
 *
 * @param {Object} context
 * @param {Object} options
 * @param {Object} values
 * @param {Function} pass
 */
exports.all = function(context, options, values, pass) {
  var funs = {};

  for (var key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      funs[key] = checkField.bind(null,
                  context, key, options[key], values[key]);
    }
  }

  async.parallel(funs, function(err, results) {
    var success = true;

    for (var key in results) {
      if (Object.prototype.hasOwnProperty.call(results, key)) {
        if (!results[key].pass) {
          success = false;
          break;
        }
      }
    }

    pass(success, results);
  });
};
