/*global $, delay */
/*jshint unused:false */


/**
 * Called when castform is first called on a form field.
 *
 * @param {jQuery} $field
 * @param {Object} options
 */
function load($field, options) {
  // Create a tooltip to show error messages.
  if (options.tooltip !== false) {
    var pos = $field.position();
    var width = $field.outerWidth();
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
      .insertAfter($field);

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

  var tooltip = options.tooltip;

  if (success) {
    // Hide tooltip
    if (tooltip) {
      tooltip();
    }

  } else {
    // Display tooltip
    if (tooltip) {
      tooltip(validate.tooltipDelay, validate.msg);
    }
    
  }
}
