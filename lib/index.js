var createMiddleware = require('./middleware');


/**
 * Intersects a server request to check if it's meant for castform.
 *
 * Can be used with both a server object or with middleware-like
 * frameworks.
 *
 * @param {Object} options
 * @param {http.Server} server
 */
module.exports = function castform(options, server) {
  if (server) {
    var middleware = createMiddleware(options);

    // Remove `request` listeners from server, save them for later.
    var oldListeners = server.listeners('request').splice(0);

    server.on('request', function onRequest(req, res) {
      middleware(req, res, function next() {
        // If the castform middleware does not handle this request,
        // then one of the old listeners should.
        for (var i = 0, len = oldListeners.length; i < len; i++) {
          oldListeners[i].call(server, req, res);
        }
      });
    });
  } else {
    // Without a server given, castform is used as a middleware.
    return createMiddleware(options);
  }
};
