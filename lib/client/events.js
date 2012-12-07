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
      .css({
        position: 'absolute',
        fontSize: '15px'
      })
      .insertAfter($field);
  }

  // Create a tooltip to show error messages.
  if (options.tooltip !== false) {
    var $el = $icon || $field;
    var pos = $el.position();
    var width = $el.outerWidth();
    var $tooltip = $('<span>')
      .css({
        position: 'absolute',
        left: (pos.left + width + 10) + 'px',
        top: pos.top + 'px',
        fontSize: '10px',
        color: 'white',
        backgroundColor: 'black',
        padding: '5px 8px 4px 8px',
        textAlign: 'center',
        borderRadius: '3px',
        boxShadow: '0 0 5px black',
        display: 'none',
        float: 'right',
        'z-index': 10000,
        'white-space': 'nowrap'
      })
      .addClass('castform-tooltip')
      .insertAfter($el);

    options.tooltip = delay(function(msg) {
      if (msg) {
        $tooltip.text(msg);
        $tooltip.css('display', 'block');
      } else {
        $tooltip.css('display', 'none');
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
    // Change classes.
    if (tooltip) {
      $field.removeClass('castform-fail');
      $field.addClass('castform-success');
    }

    // Display checkmark next to text field.
    if ($icon) {
      $field.css('border-color', 'green');
      $icon.html('&#10003;');
      $icon.css({ color: 'green', 'font-weight': 'bold' });
    }

    // Hide tooltip
    if (tooltip) {
      tooltip();
    }

  } else {
    // Change classes.
    if (tooltip) {
      $field.removeClass('castform-success');
      $field.addClass('castform-fail');
    }

    // Display X next to text field.
    if ($icon) {
      $field.css('border-color', 'red');
      $icon.html('');
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
  if (options.$icon) {
    options.$icon.text('...');
  }
}
