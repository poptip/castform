/*global $, has */


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
  function onSuccess(data) {
    pass(data.pass, data.msg);
  }

  var data = JSON.stringify({ id: id, values: values });
  $.ajax({
    type: 'POST',
    url: '/castform/' + path,
    data: data,
    success: onSuccess,
    contentType: 'application/json; charset=UTF-8',
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
  for (var key in castform.options) {
    if (has(castform.options, key)) {
      castform.options[key] = castform.validateForm('#form-' + key,
                                castform.options[key]);
    }
  }
});
