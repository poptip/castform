/*global $, castform, clone, isArray, has, seq, throttle, extend, load, check, pass, submit */

/**
 * Easy to validate form fields on change with synchronous and asyncrhonous
 * validation functions.
 *
 * Requirements
 * * jQuery
 * * twitter bootstrap
 *
 * Optional
 * * jStorage - optional
 */


/**
 * Creates a function that validates a string from a given RegExp.
 *
 * @param {RegExp} regexp
 * @return {Function(String)}
 */
function createRegexpValidator(regexp) {
  return function regexpValidator(a) {
    return regexp.test(a);
  };
}


/**
 * Creates a function that will be used for sequential execution.
 *
 * @param {Object} validate Options for validating a field.
 * @param {String} fieldValue
 * @return {Function(Function)}
 */
function createSeqFn(validate, fieldValue) {
  if (validate.async) {
    return function(callback) {
      validate.fn(fieldValue, function(pass, msg) {
        var v = clone(validate);
        v.msg = msg || v.msg;
        callback(pass, v);
      });
    };

  } else {
    return function(callback) {
      callback(validate.fn(fieldValue), validate);
    };
  }
}


/**
 * Give continuous validity feedback on a single-item text input form
 *
 * @param {jQuery} $submit Submit button.
 * @param {String} name
 * @param {Object} options Options that includes the element to watch.
 * @param {Object} parentOptions
 */
function bindValidation($submit, name, options, parentOptions) {
  var $field = options.$field;

  extend(options, parentOptions);

  if (!isArray(options.validate)) {
    options.validate = [options.validate];
  }

  // Check validation settings.
  for (var i = 0, len = options.validate.length; i < len; i++) {
    var v = options.validate[i];
    if (v instanceof RegExp || typeof v === 'function') {
      v = options.validate[i] = { fn: v };
    }

    // Throttle async functions to half a second by default.
    if (v.fn.length > 1) {
      v.fn = throttle(v.fn, v.delay || 500);
      v.async = true;
      /*
    } else if (v.delay) {
      v.fn = throttle(v.fn, v.delay);
      v.async = true;
      */
    }

    // Allow regexps for validation.
    if (v.fn instanceof RegExp) {
      v.fn = createRegexpValidator(v.fn);
    }

    // Add a default error message.
    if (!v.msg) {
      v.msg = 'Validation failed';
    }
  }

  var success = createSuccess($submit, $field, options);
  var fail = createFail($submit, $field, options);
  var check = createCheckFieldValue($field, name, options,
    success, fail);

  // Listen for the field changing value.
  $field.on('keypress input paste', check);

  // Use session storage if available and enabled.
  if ($.jStorage) {
    if (options.storage.session) {
      var storedValue = $.jStorage.get(name);
      if (storedValue && (options.storage.force || !$field.val())) {
        $field.val(storedValue);
      }
    }

    // Restore stored results if available.
    if (options.cache && options.storage.cache) {
      options.storage.keys = $.jStorage.get(name + '::keys', []);
      for (i = 0, len = options.storage.length; i < len; i++) {
        var key = options.storage.keys[i];
        var storageKey = name + '::result::' + key;
        options.cache[key] = $.jStorage.get(storageKey);
      }
      console.log('local cache');
      console.log(options.cache);
    }
  }

  // Call check function once when the page loads.
  if (options.load) {
    options.load($field, options);
  }
  check(null, true);
}


/**
 * Returns a function that when called considers a field to pass validation.
 *
 * @param {jQuery} $submit
 * @param {jQuery} $field
 * @param {Object} options
 * @returns {Function(Boolean)}
 */
function createSuccess($submit, $field, options) {
  return function success(pageLoad) {
    $field.data('validating', false);
    $field.data('errMsg', null);

    // Call given pass function.
    options.pass($field, options, pageLoad, true);

    // Check if submit button can be enabled by checking if every field
    // in the form is either not required or not currently validating and
    // its current value did not fail validation.
    for (var key in options.fields) {
      if (has(options.fields, key)) {
        var field = options.fields[key];
        var $element = field.$field;
        if (field.required &&
            (!$element.val() || $element.data('validating') ||
             $element.data('errMsg'))) return;
      }
    }

    $submit.removeAttr('disabled');
  };
}


/**
 * Returns a function that when called considers a field to have failed
 * validation.
 *
 * @param {jQuery} $submit
 * @param {jQuery} $field
 * @param {Object} options
 * @returns {Function(string)}
 */
function createFail($submit, $field, options) {
  return function fail(pageLoad, validate) {
    $field.data('errMsg', validate.msg);

    // Call the pass function.
    options.pass($field, options, pageLoad, false, validate);

    // Since there was an error, disable submit button.
    $submit.attr('disabled', 'disabled');
  };
}


/**
 * Returns a function that when called checks value
 * of a field and validates it.
 *
 * @param {jQuery} $field
 * @param {String} name
 * @param {Object} options Options that includes the element to watch.
 * @param {Function} success
 * @param {Function} failure
 * @returns {Function(Event, Boolean)}
 */
function createCheckFieldValue($field, name, options, success, fail) {
  var validate = options.validate;
  var lastValue;

  // Called when finish validating.
  var onValidate = createValidationFinished(name, options, success, fail);

  return function check(event, pageLoad) {
    var fieldValue = $field.val();

    // Check value does not equal last value.
    if (fieldValue === lastValue) return;
    lastValue = fieldValue;

    // Check cache.
    if (options.cache) {
      var cachedResult = options.cache[fieldValue];
      if (cachedResult) {
        // Use last cached result if available.
        onValidate(fieldValue, false, pageLoad,
          cachedResult[0], { msg: cachedResult[1] });
        return;
      }
    }

    // Store in browser session.
    if (options.storage.session && $.jStorage) {
      $.jStorage.set(name, fieldValue);
    }

    if (!fieldValue) {
      if (options.required) {
        fail(pageLoad, { msg: 'This field is required' });

      } else {
        success(pageLoad);
      }
      return;
    }

    var asyncInvolved = false;
    var funcs = [];
    for (var i = 0, len = validate.length; i < len; i++) {
      var v = validate[i];
      funcs[i] = createSeqFn(v, fieldValue);
      if (v.async) {
        asyncInvolved = true;
      }
    }

    // Mark this field as validating.
    $field.data('validating', true);

    // Let the `check` option know that this field is being checked.
    if (options.check) {
      options.check($field, options, pageLoad, asyncInvolved);
    }

    // Call validation functions in sequential order.
    seq(funcs, function(pass, msg) {
      onValidate(fieldValue, asyncInvolved, pageLoad, pass, msg);
    });
  };
}


/**
 * Returns a function that is called when all of a field's
 * validating functions have finished.
 *
 * @param {String} field
 * @param {Object} options
 * @param {Function} success
 * @param {Function} fail
 * @returns {Function(string, boolean, boolean, string)}
 */
function createValidationFinished(field, options, success, fail) {
  var $field = options.$field;

  return function validationFinished(value, async, pageLoad, pass, validate) {
    if (options.cache) {
      var result = [pass, validate ? validate.msg : null];
      options.cache[value] = result;

      if (options.storage.cache) {
        options.storage.keys.push(value);
        if ($.jStorage) {
          $.jStorage.set(field + '::keys', options.storage.keys);
          $.jStorage.set(field + '::result::' + value, result);
        }
      }
    }

    // Check if field value is still the same.
    if (!async || value === $field.val()) {
      if (pass) {
        success(false);
      } else {
        fail(pageLoad, validate);
      }
    }
  };
}


/**
 * Validates form fields every time a user changes their value.
 * If any of them fail validation, submit button is disabled.
 * Check marks or X'es are placed to the right of a text field when it is
 * validated.
 *
 * @param {String} formID
 * @param {Object} options Hash containing data with keys as CSS selectors
 *   of the fields and values as their validation objects used with
 *   bindValidation().
 */
castform.validateForm = function validateForm(formID, options) {
  var $form = $(formID);
  if (!$form.length) {
    console.warn('non-existant form id: ' + formID);
    return;
  }

  var $submit = $form.find('[type="submit"]');

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

  extend(options, defaults);

  for (var key in options.fields) {
    if (has(options.fields, key)) {
      var field = options.fields[key];
      field.$field = $form.find('[name="' + key + '"]');
      if (!field.$field.length) {
        throw Error('Form field `' + key + '` not found');
      }

      bindValidation($submit, key, field, options);
    }
  }

  options.load($submit, options);
  $form.submit(function(e) {
    $submit.attr('disabled', 'disabled');
    e.preventDefault();
    options.submit($submit, options);

    // Gather up all field values.
    var values = {};
    for (var key in options.fields) {
      if (has(options.fields, key)) {
        values[key] = options.fields[key].$field.val();
      }
    }

    // Remote call to let the server know the form has been submitted.
    castform.remoteCall('submit', formID, values, function(success, msg) {
      if (!success) {
        $submit.removeAttr('disabled');
      }
      options.formPass.client(window, success, msg);
    });
  });

  return $form;
};
