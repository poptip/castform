var through = require('through');


function rain(val, pass) {
  process.nextTick(pass.bind(null, true));
}


var middleware = require('../lib/middleware')({
  settings: {
    username: {
      required: true,
      validate: [
        { fn: /^[a-z]{1,15}$/i, msg: 'Only alphabetic characters' },
        { fn: rain, msg: 'no!' }
      ]
    }
  }
});


exports.tearDown = function(callback) {
  middleware.die();
  callback();
};


exports['server client Javascript file'] = function(test) {
  var req = through();
  req.url = '/castform/castform.js';

  var res = {
    writeHead: function(code, headers) {
      test.equal(code, 200);
      test.deepEqual(headers, { 'Content-Type': 'text/javascript' });
    },
    end: function(data) {
      test.ok(data);
      test.ok(data.length);
      test.done();
    }
  };

  function next() {
    throw Error('should not call next()');
  }

  middleware(req, res, next);
};


exports['dont match any castform routes'] = function(test) {
  var req = through();
  req.url = '/socket.io/socket.io.js';

  var res = {};

  middleware(req, res, test.done);
};


exports['invalid id'] = function(test) {
  var req = through();
  req.url = '/castform/async';
  req.setEncoding = function() {};
  req.headers = {
    'content-type': 'application/json; charset=UTF-8'
  };

  process.nextTick(function() {
    var data = {
      id: 'signout',
    };
    req.write(JSON.stringify(data));
    req.end();
  });

  var res = {
    writeHead: function(code, headers) {
      test.equal(code, 200);
      test.deepEqual(headers, { 'Content-Type': 'application/json' });
    },
    end: function(data) {
      test.equal(data, '{"error":"no such id"}');
      test.done();
    }
  };

  function next() {
    throw Error('should not call next()');
  }

  middleware(req, res, next);
};


exports['validate field asynchronously'] = function(test) {
  var req = through();
  req.url = '/castform/async';
  req.setEncoding = function() {};
  req.headers = {
    'content-type': 'application/json; charset=UTF-8'
  };

  process.nextTick(function() {
    var data = {
      id: '0',
      values: 'bobby hill'
    };
    req.write(JSON.stringify(data));
    req.end();
  });

  var res = {
    writeHead: function(code, headers) {
      test.equal(code, 200);
      test.deepEqual(headers, { 'Content-Type': 'application/json' });
    },
    end: function(data) {
      var result = { pass: true };
      test.equal(data, JSON.stringify(result));
      test.done();
    }
  };

  function next() {
    throw Error('should not call next()');
  }

  middleware(req, res, next);
};


exports['validate submitted form'] = function(test) {
  var req = through();
  req.url = '/castform/submit';
  req.setEncoding = function() {};
  req.headers = {
    'content-type': 'application/json; charset=UTF-8'
  };

  process.nextTick(function() {
    var data = {
      id: 'settings',
      values: {
        username: 'bobby hill'
      }
    };
    req.write(JSON.stringify(data));
    req.end();
  });

  var res = {
    writeHead: function(code, headers) {
      test.equal(code, 200);
      test.deepEqual(headers, { 'Content-Type': 'application/json' });
    },
    end: function(data) {
      var result = {
        pass: false,
        msg: {
          username: {
            pass: false,
            msg: 'Only alphabetic characters',
            value: 'bobby hill'
          }
        }
      };
      test.equal(data, JSON.stringify(result));
      test.done();
    }
  };

  function next() {
    throw Error('should not call next()');
  }

  middleware(req, res, next);
};
