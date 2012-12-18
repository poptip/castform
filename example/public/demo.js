/*global castform */
var signup = castform.options.forms.signup;
var username = signup.fields.username;
username.required = false;
//username.storage.session = false;
//username.storage.force = true;
//username.storage.cache = true;
//username.cache = { foo: [false, 'NOOOOOOOOOOOOOOOO'] };
//username.delay = 3000;
/*
username.load = function($field) {
  $field.css('font-style', 'italic');
};
*/
/*
signup.pass = function($field, options, pageLoad, success) {
  $field.css('color', success ? 'green' : 'red');
};
*/
/*
signup.submit.client.validate = function($submit, options, values, pass) {
  console.log('validate client', values);

  pass(values.username !== values.displayName, 'your values are wrong');
};
*/
