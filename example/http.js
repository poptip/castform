var http = require('http');
var castform = require('..');
var options = require('./options');


var fs = require('fs');
var path = require('path');
var index = fs.readFileSync(path.join(__dirname, '/public/index.html'));

var server = http.createServer(function(req, res) {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end(index);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain'});
    res.end('not found');
  }
});

castform(options, server);
server.listen(3000);
