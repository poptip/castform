var stringify = require('./stringify');
var generate = require('./generate');
var validate = require('./validate');
var bodyParser = require('connect').json();


/**
 * Parses a POST request's body. Checks if anything was submitted.
 * If so, calls a validation function, tells client of the result.
 *
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 * @param {Function} next
 * @param {Object|Array.Function} options
 * @param {Function} validate
 */
function handleRequest(req, res, next, options, validate) {
  if (bodyParser(req, res, function() {
    if (Object.keys(req.body).length) {
      res.writeHead(200, { 'Content-Type': 'application/json'});

      var opts = options[req.body.id];
      if (!opts) {
        res.end('{"error":"no such id ' + req.body.id + '"}');
        return;
      }

      validate({ req: req }, opts, req.body.values, function(pass, msg) {
        try {
          res.end(JSON.stringify({ pass: pass, msg: msg }));
        } catch (err) {
          res.end('{"error":"Error stringifying result"}');
        }
      });

    } else {
      next();
    }
  }));
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
    switch (req.url) {
      case '/castform/castform.js':
        res.writeHead(200, { 'Content-Type': 'text/javascript'});
        res.end(source.buffer);
        break;

      case '/castform/async':
        handleRequest(req, res, next, asyncfuns, validate.async);
        break;

      case '/castform/submit':
        handleRequest(req, res, next, options, validate.all);
        break;

      default:
        next();
    }
  }

  castformMiddleware.die = source.die;
  return castformMiddleware;
};
