var stringify = require('./stringify');
var generate = require('./generate');
var validate = require('./validate');
var bodyParser = require('connect').json();


/**
 * Parses a POST request's body. Checks if anything was submitted.
 * If so, calls a validation function, tells client of the result.
 *
 * @param {Object} context
 *   {http.ServerRequest} req
 *   {http.ServerResponse} res
 * @param {Function} next
 * @param {Object|Array.Function} options
 * @param {Function} validate
 */
function handleRequest(context, next, options, validate) {
  var req = context.req;
  var res = context.res;

  function parsed(err) {
    if (err) {
      res.end('{"success":false,"msg":"' +
        err.message.replace(/"/g, '\\"') + '"}');
      return;
    }
    if (Object.keys(req.body).length) {
      res.writeHead(200, { 'Content-Type': 'application/json'});

      var opts = options[req.body.id];
      if (!opts) {
        res.end('{"success":false,"msg":"no such id ' + req.body.id + '"}');
        return;
      }

      validate(context, opts, req.body.values, function(success, msg) {
        try {
          res.end(JSON.stringify({ success: success, msg: msg }));
        } catch (err) {
          res.end('{"success":false,"msg":"Error stringifying result"}');
        }
      });

    } else {
      res.end('{"success":false,"msg":"No form values given"}');
    }
  }

  if (req.body) {
    parsed();
  } else {
    bodyParser(req, res, parsed);
  }
}


/**
 * Generates the middleware function for castform.
 *
 * @param {Object} options
 */
module.exports = function createMiddleware(options) {
  var parts = stringify(options);
  var asyncfuns = parts[0];
  var source = generate(parts[1]);

  /**
   * @param {http.ServerRequest} req
   * @param {http.ServerResponse} res
   * @return {Function} next
   */
  function castformMiddleware(req, res, next) {
    // Check if this is a flatiron union middleware.
    var context;
    if (this.req && this.res) {
      req = this.req;
      res = this.res;
      next = arguments[arguments.length - 1];
      context = this;
    } else {
      context = { req: req, res: res };
    }

    switch (req.url) {
      case '/castform/castform.js':
        res.writeHead(200, { 'Content-Type': 'text/javascript'});
        res.end(source.buffer);
        break;

      case '/castform/async':
        handleRequest(context, next, asyncfuns, validate.async);
        break;

      case '/castform/submit':
        handleRequest(context, next, options.forms, validate.all);
        break;

      default:
        next();
    }
  }

  castformMiddleware.die = source.die;
  return castformMiddleware;
};
