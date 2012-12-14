# castform

![castform](http://cdn.bulbagarden.net/upload/thumb/f/f3/351Castform.png/110px-351Castform.png)

Form validation on the client and server.

# usage

### server.js using connect

Castform can work with the a server instance and can also be a middleware for connect, express, and flatiron. See the examples folder for working examples.

```js
var castform = require('castform');

// server
var server = http.createServer();
castform(options, server);

// middleware
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
            } else if (!doc) {
              done(false);
            } else {
              done(true);
            }
          });
        }
      msg: 'That username is taken' },
  ],

  // Wether this field is required or not. If it is blank it will be considered undefined too.
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

  // If this is `true`, the default `load` funciton attaches an
  // element to each field which displays either a green checkmark
  // or a red x when the default `pass` function is called.
  icon: true,

  // if true, when `pass` is called and valiation has failed, by default,
  // a message is displayed specifying what the error was.
  tooltip: true,

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
    server: function(values, pass) {
      db.users.add(values, function(err) {
        pass(!err, err ? err.message : null);
      });
    },

    // When the form is submitted on the client, these will be called.
    // They can be used to for example display a loading icon next to the
    // submit button. The submit button is also disabled by castform
    // when the form is submitted, and enabled when the server calls
    // the `pass` function with a failure..
    client: {
      before: function($submit, options, values) {
      },
      pass: function($submit, options, values, success, message) {
      }
    }
  }
}
```

Furthermore, the classes `castform-success` and `castform-fail` are added to a field when they pass or fail validation respectively. And the class `castform-submit` is added to the form when it has been submitted.


# install

```sh
$ npm install castform
```


# tests

Tests are written with [nodeunit](https://github.com/caolan/nodeunit).

```sh
$ npm test
```
