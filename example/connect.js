var connect = require('connect');
var castform = require('..');
var options = require('./options');


var path = require('path');


connect()
  .use(connect.static(path.join(__dirname + '/public')))
  .use(castform(options))
  .listen(3000);
