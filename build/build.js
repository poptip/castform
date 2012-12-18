var fs = require('fs');
var path = require('path');


var stringify = require('../lib/stringify');
var generate = require('../lib/generate');


var obj = generate(stringify({})[1]);
obj.die();
var output = path.join(__dirname, 'castform.min.js');
fs.writeFileSync(output, obj.buffer);
