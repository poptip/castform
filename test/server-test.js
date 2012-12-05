var http = require('http');
var connect = require('connect');
var muk = require('muk');
var request = require('request');


var castform = muk('..', {
  './middleware': function createMiddleware() {
    return function middleware(req, res, next) {
      if (req.url === '/castform') {
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.end('castform');
      } else {
        next();
      }
    };
  }
});


function onRequest(req, res, next) {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain'});
    res.end('this is index');
  } else if (next) {
    next();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain'});
    res.end('not found');
  }
}


function httpServer(test, path, expect) {
  var server = http.createServer(onRequest);
  castform({}, server);
  server.listen(function() {
    var port = server.address().port;
    var url = 'http://localhost:' + port + path;

    request(url, function(err, res, body) {
      if (err) throw err;

      test.equal(body, expect);
      server.close(test.done);
    });
  });
}


function connectServer(test, path, expect) {
  var app = connect();
  app.use(connect.static('public'));
  app.use(castform({}));
  app.use(onRequest);
  var server = app.listen(function() {
    var port = server.address().port;
    var url = 'http://localhost:' + port + path;

    request(url, function(err, res, body) {
      if (err) throw err;

      test.equal(body, expect);
      server.close(test.done);
    });
  });
}


exports['http server request /'] = function(test) {
  httpServer(test, '/', 'this is index');
};


exports['http server request /castform'] = function(test) {
  httpServer(test, '/castform', 'castform');
};


exports['connect server request /'] = function(test) {
  connectServer(test, '/', 'this is index');
};


exports['connect server request /castform'] = function(test) {
  connectServer(test, '/castform', 'castform');
};
