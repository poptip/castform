/**
 * Checks if value is a valid email address.
 *
 * @param {String} value
 * @returns {Boolean}
 */
function isEmail(value) {
  return (/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$/).test(value);
}


/**
 * "Asynchronously checks" if a username is available to use.
 *
 * @param {String} username
 * @returns {Boolean}
 */
function isAvailable(username, callback) {
  // what's up
  // this.req
  process.nextTick(function() {
    callback(Math.random() < 0.5);
  });
}


module.exports = {
  signup: {
    fields: {
      username: {
        validate: [
          { fn: /^[a-zA-Z0-9_]*$/
          , msg: 'Must contain only the characters a-zA-Z0-9_'
          }
        , { fn: /^.{1,15}$/, msg: 'Must be between 1 and 15 characters' }
        , { fn: isAvailable, msg: 'That username is taken' }
        ]
      , required: true
      , storage: { session: true }
      }

    , displayName: {
        validate: {
          fn: /^[^\n]{1,30}$/
        , msg: 'Must be between 1 and 30 characters'
        }
      , storage: { session: true }
      }

    , email: {
        validate: [
          { fn: isEmail, msg: 'Must be a valid email', delay: 1000 }
        , { fn: isAvailable
          , msg: 'That email is already associated with an account'
          }
        ]
      , required: true
      , storage: { session: true }
      }
    }
  , formPass: {
      server: function(req, values) {
      }
    , client: function(success, msg) {
      }
    }
  }
};
