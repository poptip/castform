/*global $, castform, isArray, has, seq, throttle, delay, extend */

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
      validate.fn(fieldValue, function(pass) {
        callback(pass, validate);
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
 * @param {DOMElement} $submit Submit button.
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
    }

    // Allow regexps for validation.
    if (v.fn instanceof RegExp) {
      v.fn = createRegexpValidator(v.fn);
    }
  }

  var $icon = $('<span>').insertAfter($field);
  var tooltip = options.tooltip ?
    createTooltip($icon, options) : function() {};
  var success = createSuccess($submit, $field, $icon, tooltip,
    options.onSuccess, parentOptions.fields);
  var fail = createFail($submit, $field, $icon, tooltip);
  var check = createCheckFieldValue(name, options, tooltip, success, fail);

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
  check({}, true);
}


/**
 * Creates a tooltip and returns a function that controls
 * showing and hiding a tooltip.
 *
 * @param {Boolean} delay Wether or not to delay showing the tooltip.
 * @returns {Function(msg)}
 */
function createTooltip($element, options) {
  var tooltip = $element.tooltip(options.tooltip).data('tooltip');

  return delay(function(msg) {
    if (msg) {
      tooltip.options.title = msg;
      tooltip.show();
    } else {
      tooltip.hide();
    }
  });
}


/**
 * By default this will be called when a field passes all
 * validation tests successfully
 *
 * @param {Boolean} success
 * @param {String|Object} msg
 */
functon pass(success, msg) {
}


/**
 * Returns a function that when called considers a field to pass validation.
 *
 * @param {DOMElement} $submit
 * @param {DOMElement} $field
 * @param {DOMElement} $icon
 * @param {Function} tooltip
 * @param {Object} fields
 * @returns {Function(Boolean)}
 */
function createSuccess($submit, $field, $icon, tooltip, fields) {
  return function success(dontShowIcon) {
    $field.data('validating', false);
    $field.data('errMsg', null);

    // Display checkmark next to text field.
    if (!dontShowIcon) {
      $icon.html('&#10003;');
    }

    // Hide tooltip.
    tooltip();

    // Check if submit button can be enabled by checking if every field
    // in the form is either not required or not currently validating and
    // its current value did not fail validation.
    for (var key in fields) {
      if (has(fields, key)) {
        var field = fields[key];
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
 * @param {DOMElement} $submit
 * @param {DOMElement} $field
 * @param {DOMElement} $icon
 * @param {Function} tooltip
 * @returns {Function(string)}
 */
function createFail($submit, $field, $icon, tooltip) {
  return function fail(validate, hideTooltip) {
    $field.data('errMsg', validate.msg);

    // Display X next to text field.
    $icon.removeClass('icon-ok');
    $icon.addClass('icon-remove');

    // Show tooltip with error message.
    // `hideTooltip` will be true on page load if field is empty.
    if (!hideTooltip) {
      tooltip(validate.delay, validate.msg);
    }

    // Since there was an error, disable submit button.
    $submit.attr('disabled', 'disabled');
  };
}


/**
 * Returns a function that when called checks value
 * of a field and validates it.
 *
 * @param {String} field
 * @param {Object} options Options that includes the element to watch.
 * @param {DOMElement} tooltip
 * @param {Function} success
 * @param {Function} failure
 * @returns {Function(Event, Boolean)}
 */
function createCheckFieldValue(field, options, tooltip, success, fail) {
  var $field = options.$field;
  var validate = options.validate;
  var lastValue;

  // Called when finish validating.
  var onValidate = createValidationFinished(field, options, success, fail);

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
        onValidate(fieldValue, false, cachedResult[0], cachedResult[1]);
        return;
      }
    }

    if (!fieldValue) {
      if (options.required) {
        fail('This field is required', pageLoad);

      } else {
        success(true);
      }
      return;
    }

    // Store in browser session.
    if (options.storage.session && $.jStorage) {
      $.jStorage.set(field, fieldValue);
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

    // If there is async validation, hide tooltip
    if (asyncInvolved) {
      tooltip();
    }

    // Mark this field as validating.
    $field.data('validating', true);

    // Call validation functions in sequential order.
    seq(funcs, function(pass, msg) {
      onValidate(fieldValue, asyncInvolved, pass, msg);
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

  return function validationFinished(value, async, pass, validate) {
    if (!validate || !validate.msg) validate = { msg: validate };

    if (options.cache) {
      var result = [pass, validate.msg];
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
        success();
      } else {
        fail(validate);
      }
    }
  };
}


/**
 * Validates form fields every time a user changes their value.
 * If any of them fail validation, submit button is disabled.
 * Check marks or X'es are placed to the right of a text field when it is
 * validated. Validation messages are displayed as tooltips to the right of
 * the text fields.
 *
 * @param {DOMElement} $submit The submit button for the form.
 * @param {Object} options Hash containing data with keys as CSS selectors
 *   of the fields and values as their validation objects used with
 *   bindValidation().
 */
castform.validateForm = function validateForm(formID, options) {
  var $form = $(formID);
  if (!$form.length) throw Error('non-existant form id: ' + formID);
  var $submit = $form.find('[type="submit"]');

  // Default options.
  var defaults = {
    tooltip:
    { title: 'hellooooo'
    , placement: 'right'
    , trigger: 'manual'
    , animation: false
    }
  , cache: {}
  , validate: []
  , required: false
  , delay: false
  , storage: { session: false, force: false, cache: false }
  , pass: pass
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

  return $form;
};
