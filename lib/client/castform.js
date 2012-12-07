/*global $, has, extend, load, check, pass, submit */


// Exported namespace.
var castform = window.castform = {};


/**
 * Make a remote call to the server.
 *
 * @param {String} path
 * @param {String} id Id of the form or async function.
 * @param {Object|String} values
 * @param {Function(Boolean, Object|String)} pass
 */
castform.remoteCall = function remoteCall(path, id, values, pass) {
  var data = JSON.stringify({ id: id, values: values });
  $.ajax({
    type: 'POST',
    url: '/castform/' + path,
    data: data,
    success: function onSuccess(data) {
      pass(data.success, data.msg);
    },
    error: function onError(jqXHR, textStatus) {
      pass(false, textStatus);
    },
    contentType: 'application/json',
    dataType: 'json'
  });
};


/**
 * Remotely calls a validation function on the server.
 */
castform.async = function async(id) {
  return function asyncCall(value, pass) {
    castform.remoteCall('async', id, value, pass);
  };
};


/**
 * Activate forms validation on the site.
 */
$(function() {
  // Default options.
  var defaults = {
    cache: {}
  , validate: []
  , required: false
  , delay: false
  , storage: { session: false, force: false, cache: false }
  , load: load
  , check: check
  , pass: pass
  , submit: submit
  };

  var options = castform.options;
  extend(options, defaults);
  for (var key in options.forms) {
    if (has(options.forms, key)) {
      extend(options.forms[key], options);
      options.forms[key].$form = castform.validateForm(key, options.forms[key]);
    }
  }
});
