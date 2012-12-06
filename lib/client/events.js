/*global $, delay */
/*jshint unused:false */


/**
 * Called when castform is first called on a form field.
 *
 * @param {jQuery} $submit
 * @param {jQuery} $field
 * @param {Object} options
 */
function load($field, options) {
  var $icon;
  // Create an element to display a checkmark or an X on validation.
  if (options.icon !== false) {
    $icon = options.$icon = $('<span>')
      .css('position', 'absolute')
      .insertAfter($field);
  }

  // Create a tooltip to show error messages.
  if (options.tooltip !== false) {
    var tooltip = ($icon || $field).tooltip({
      title: 'hellooooo'
    , placement: 'right'
    , trigger: 'manual'
    , animation: false
    }).data('tooltip');

    options.tooltip = delay(function(msg) {
      if (msg) {
        tooltip.options.title = msg;
        tooltip.show();
      } else {
        tooltip.hide();
      }
    });
  }
}


/**
 * Called before a field's validation functions are called.
 *
 * @param {jQuery} $field
 * @param {Object} options
 * @param {Boolean} pageLoad
 * @param {Boolean} asyncInvolved
 */
function check($field, options, pageLoad, asyncInvolved) {
  // Hide tooltip if a validation function contains async.
  if (asyncInvolved) {
    options.tooltip();
  }

}


/**
 * By default this will be called when a field passes all
 * validation tests successfully
 *
 * @param {jQuery} $field
 * @param {Object} options
 * @param {Boolean} pageLoad
 * @param {Boolean} success
 * @param {Object} validate
 */
function pass($field, options, pageLoad, success, validate) {
  if (pageLoad && !$field.val()) {
    return;
  }

  var $icon = options.$icon;
  var tooltip = options.tooltip;

  if (success) {
    // Display checkmark next to text field.
    if ($icon) {
      $icon.html('&#10003;');
      $icon.css({ color: 'green', 'font-weight': 'bold' });
    }

    // Hide tooltip
    if (tooltip) {
      tooltip();
    }

  } else {
    // Display X next to text field.
    if ($icon) {
      $icon.text('X');
      $icon.css({ color: 'red', 'font-weight': 'bold' });
    }

    // Display tooltip
    if (tooltip) {
      tooltip(validate.delay, validate.msg);
    }
    
  }
}


/**
 * Called when the submit button is pressed.
 *
 * @param {jQuery} $submit
 * @param {Object} options
 */
function submit($submit, options) {
  options.$icon.text('...');
}
