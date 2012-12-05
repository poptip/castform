var validate = require('../lib/validate');


exports.async = function(test) {
  function one(value, callback) {
    test.equal(this, context);
    test.equal(value, 'duck');
    process.nextTick(callback.bind(null, true));
  }

  var context = { req: { hi: 'you' } };
  var value = 'duck';

  validate.async(context, one, value, function(pass) {
    test.ok(pass);
    test.done();
  });
};


exports.field = {
  required: function(test) {
    var name = 'username';
    var options = { required: true };

    validate.field({}, name, options, 'g6', function(err) {
      test.ok(!err);
    });

    validate.field({}, name, options, undefined, function(err) {
      test.equal(err, name + ' is required');
    });

    test.expect(2);
    process.nextTick(test.done);
  },

  'not required': function(test) {
    var name = 'username';
    var options = { required: false };

    validate.field({}, name, options, 'teacher', function(err) {
      test.ok(!err);
    });

    validate.field({}, name, options, undefined, function(err) {
      test.ok(!err);
    });

    test.expect(2);
    process.nextTick(test.done);
  },

  'synchronous validation': function(test) {
    var options = {
      validate: [{
        fn: function(value) { return value.length < 10; },
        msg: 'Too long!'
      }]
    };

    validate.field({}, 'foo', options, 'yes!', function(err) {
      test.ok(!err);
    });

    validate.field({}, 'foo', options, 'looooooongcat', function(err) {
      test.equal(err, 'Too long!');
    });

    test.expect(2);
    process.nextTick(test.done);
  },

  'with a regular expression': function(test) {
    var options = {
      validate: [{
        fn: /^.{1,10}$/,
        msg: 'Too long!'
      }]
    };

    validate.field({}, 'foo', options, 'yes!', function(err) {
      test.ok(!err);
    });

    validate.field({}, 'foo', options, 'looooooongcat', function(err) {
      test.equal(err, 'Too long!');
    });

    test.expect(2);
    process.nextTick(test.done);
  },

  'asynchronous validation': {
    pass: function(test) {
      var context = {};
      var options = {
        validate: [{
          fn: function(value, callback) {
            test.equal(this, context);
            process.nextTick(function() {
              callback((parseInt(value, 10) & 1) === 0);
            });
          },
          msg: 'Must be divisible by 2'
        }]
      };

      validate.field(context, 'foo', options, '42', function(err) {
        test.ok(!err);
        test.done();
      });
    },

    'not pass': function(test) {
      var context = {};
      var options = {
        validate: [{
          fn: function(value, callback) {
            test.equal(this, context);
            process.nextTick(function() {
              callback((parseInt(value, 10) & 1) === 0);
            });
          },
          msg: 'Must be divisible by 2'
        }]
      };

      validate.field(context, 'foo', options, '7', function(err) {
        test.equal(err, 'Must be divisible by 2');
        test.done();
      });
    },

    'not pass with custom message': function(test) {
      var context = {};
      var options = {
        validate: [{
          fn: function(value, callback) {
            test.equal(this, context);
            process.nextTick(function() {
              callback((parseInt(value, 10) & 1) === 0, 'oh oh');
            });
          },
          msg: 'Must be divisible by 2'
        }]
      };

      validate.field(context, 'foo', options, '7', function(err) {
        test.equal(err, 'oh oh');
        test.done();
      });
    }
  },

  sanitize: function(test) {
    var options = {
      sanitize: function(value) { return value.slice(0, 5); }
    };

    validate.field({}, 'baby', options, 'hello world', function(err, value) {
      test.ok(!err);
      test.equal(value, 'hello');
      test.done();
    });
  },

  'sanitize with validation': function(test) {
    var options = {
      sanitize: function(value) { return value.slice(0, 5); },
      validate: [{
        fn: /^.{1,5}$/, msg: 'Must be between 1 and 5 characters'
      }]
    };

    validate.field({}, 'baby', options, 'hello world', function(err, value) {
      test.ok(!err);
      test.equal(value, 'hello');
      test.done();
    });
  }
};


exports.all = function(test) {
  var context = { req: { hi: 'you' } };
  var options = {
    username: {
      validate: [
        { fn: /^[a-zA-Z0-9_]*$/
        , msg: 'Must contain only the characters a-zA-Z0-9_'
        }
      , { fn: /^.{1,15}$/, msg: 'Must be between 1 and 15 characters' }
      , { fn: function(username, pass) {
            test.equal(this, context);
            process.nextTick(pass.bind(null, username !== 'gum'));
          }
        , msg: 'Username is taken' }
      ]
    , required: true
    , storage: { session: true }
    }

  , displayName: {
      sanitize: function(name) { return name.slice(0, 3); },
      validate: {
        fn: /^[^\n]{1,30}$/
      , msg: 'Must be between 1 and 30 characters'
      }
    , storage: { session: true }
    }
  };
  var values;


  values = {
    username: '@_@',
    displayName: 'daddy'
  };
  validate.all(context, options, values, function(pass, results) {
    test.ok(!pass);
    test.deepEqual(results, {
      username: {
        value: '@_@',
        pass: false,
        msg: 'Must contain only the characters a-zA-Z0-9_'
      },
      displayName: { value: 'dad', pass: true, msg: null }
    });
  });


  values = {
    username: 'bobby',
    displayName: 'daddy'
  };
  validate.all(context, options, values, function(pass, results) {
    test.ok(pass);
    test.deepEqual(results, {
      username: { value: 'bobby', pass: true, msg: null },
      displayName: { value: 'dad', pass: true, msg: null }
    });
  });

  test.expect(5);
  process.nextTick(test.done);
};
