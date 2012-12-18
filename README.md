# castform [![Build Status](https://secure.travis-ci.org/poptip/castform.png)](http://travis-ci.org/poptip/castform)

![castform](http://cdn.bulbagarden.net/upload/thumb/f/f3/351Castform.png/110px-351Castform.png)

Form validation on the client and server.

# usage

### server.js

Castform can work with the a server instance and can also be a middleware for connect, express, and flatiron. See the examples folder for working examples.

```js
var castform = require('castform');

// server with core http module
var server = http.createServer();
castform(options, server);

// middleware using connectx
connect()
  .use(castform(options));
```

The `options` object given to castform will contain the schemas on how your forms are validated. See the example in `example/options.js`.

The top level must contain a `forms` object, which must contain a `fields` object with the names of the fields as they key and an object containing options for it.

The following are the available options:

```js
{
  // An array of objects containing the validating functions for the field.
  // These will be executed in order until one of them fails validation or
  // they all pass. The object can have these keys.
  validate: [
    // Validation function, will be passed the value of the field.
    // This function should return true if the value passes validation.
    { fn: function checkLength(s) { return s.length < 15; }

    // Message to display when validation fails.
    // If function is async and a message is given to the `pass` function,
    // then it will overwrite this message.
      msg: 'Must be between 1 and 15 characters' },

    // Can also be a regular expression.
    { fn: /^[a-zA-Z0-9_]*$/
      msg: 'Must contain only the characters a-zA-Z0-9_' },

    // If this is an async function, then it should have another
    // parameter `done`, which is a function that should be called when
    // it's finished. The `done` function should be called with a
    // boolean true if the validation passed, and an optional message.
    //
    // If the function is async, it will assume that IO is needed to
    // know if validation passes. Therefore, on the client it will
    // make an AJAX call that will call the function on the
    // server with the value.
    { fn: function isAvailable(value, done) {
          db.collection.findOne(value, function(err, doc) {
            if (err) {
              done(false, err.message);
            } else if (doc) {
              done(false);
            } else {
              done(true);
            }
          });
        }
      msg: 'That username is taken' },
  ],

  // Wether this field is required or not.
  // If it is blank it will be considered undefined too.
  // By default the error message displayed is "This field is required".
  // To use your own, make this option a string.
  required: true,

  storage: {
    // If you want to save the value the user types in whenever it changes,
    // this will preserve it in case they navigate away from the page,
    // or reload.
    session: false,

    // Use along with `session`. If the page sets the value of a field,
    // but this is set to true, it will overwrite that value.
    force: false,

    // Set true to cache async validation checks from
    // the same fields with the same values.
    cache: false,
  },

  // Use along with `storage.cache`. Contains the cached value result pairs
  // for asynchronous validation.
  cache: {},

  // How much delay after field value changes until an async validation
  // function is called. This and the cache are designed to lower the
  // amount of requests made to the server via the async functions.
  delay: 500,

  // Sanitizes a field value.
  sanitize: function(value) { return parseInt(value, 10); }

  // Called when the page first loads and castform is told to validate
  // a form.
  load: function($field, options) {
  },

  // Called right before a field's value changes and will be validated.
  check: function($field, options) {
  },

  // When validation either fails or is successful.
  // `pageLoad` is true when this is first called when the page loads.
  // All form fields are validated once when the page loads.
  pass: function($field, options, pageLoad, success, validationOptions) {
  },

  // Called when the form is submitted. The following options can only be
  // used per form, not per field.
  submit: {
    // Only called if form values pass validation. They are checked both
    // client side and server side. The values will also be sanitized for
    // those that were given a `sanitize` function.
    //
    // `pass` function must eventually be called with `true` if
    // the submission with the values was successful. Or with `false` and
    // an error message if not successful.
    //
    // If you don't want the form to be submitted to the server and
    // validated, or you want to handle that yourself, set this to `false`.
    server: function(values, pass) {
      db.users.add(values, function(err) {
        pass(!err, err ? err.message : null);
      });
    },

    // When the form is submitted on the client, these will be called.
    client: {
      // This is called when a user submits a form client side.
      // It can be used to for example display a loading icon next to the
      // submit button. The submit button is also disabled by castform
      // when the form is submitted, and enabled when the `pass` function
      // is called with a failure.
      before: function($submit, options, values) {
      },

      // Can be used to further check something in the values.
      // If this function is given, then the `pass` function must eventually
      // be called with a boolean `success` and a `message` argument.
      //
      // If `submit.server` is set to `false`, then this can be used to
      // manually make a remote call.
      validate: function($submit, options, values, pass) {
      }

      // This is called either after client side `validation` function
      // finishes with an error, if it was provided. Or after the form
      // is submitted to the server and the `pass` function is called.
      pass: function($submit, options, values, success, message) {
      }
    }
  }
}
```

### classes

The following classes are used to style forms.

* `castform-field` - Added to all fields that will be validated by castform.
* `castform-success` - Added to a field when it successfully passes validation.
* `castform-fail` - Added to a field when it fails validation.
* `castform-submit` - Added to the submit button when the form has been submitted.
* `castform-tooltip` - Used on the tooltip that shows validation error messages on each field.


### client side

On the client, you'll need to include the script that castform provides in `/castform/castform.js`.

```html
<script src="/castform/castform.js"></script>
```

Castform should find your forms by looking at their id.

```html
<form id="form-signup">
  <div>
    <label for="username">username</label>
    <input name="username" id="username" />
  </div>
  <div>
    <input type="submit" />
  </div>
<form>
```

Options can also be accessed and set on the client side with `castform.options`.

```html
<script src="/castform/castform.js"></script>
<script type="text/javascript">
  castform.options.forms.signup.myNewField = {
    required: true,
    // etc
  };
</script>
```


# install

```sh
$ npm install castform
```


# tests

Tests are written with [nodeunit](https://github.com/caolan/nodeunit).

```sh
$ npm test
```
