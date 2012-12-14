var stringify = require('../lib/stringify');


exports['strings with quotes work'] = function(test) {
  var obj = {
    'wt"f': 'two',
    hey: 'the cow goes "moooo!"'
  };

  var parts = stringify(obj);
  test.ok(Array.isArray(parts));
  test.ok(Array.isArray(parts[0]));
  test.equal(parts[0].length, 0);
  test.equal(parts[1], '{"wt\\"f":"two","hey":"the cow goes \\"moooo!\\""}');
  test.done();
};


exports['stringifies regular rexpressions'] = function(test) {
  var obj = {
    test: /^[a-z]{1,15}/i
  };

  var parts = stringify(obj);
  test.equal(parts[1], '{"test":/^[a-z]{1,15}/i}');
  test.done();
};


exports['stringifies an object with all types'] = function(test) {
  function one(b) { return b + b + b; }
  function asyncfun(a, callback) { callback(a); }
  function night(x, callback) {
    process.nextTick(callback.bind(null, null));
  }

  var obj = {
    name: {
      arr: [1, { hello: 'foo' }, [one, 2, 4]],
      recursion: { hi: { no: false, fn0: asyncfun } },
      fn1: function(x) { return x * 2; },
      fn2: night
    },
    dos: 'zap'
  };

  var parts = stringify(obj);
  test.ok(Array.isArray(parts));
  test.ok(Array.isArray(parts[0]));
  test.equal(parts[0][0], asyncfun);
  test.equal(parts[0][1], night);
  test.equal(parts[1], '{"name":{"arr":[1,{"hello":"foo"},[function one(b) { return b + b + b; },2,4]],"recursion":{"hi":{"no":false,"fn0":castform.async(0)}},"fn1":function (x) { return x * 2; },"fn2":castform.async(1)},"dos":"zap"}');
  test.done();
};


exports['make submit.server null'] = function(test) {
  var obj = {
    whatevs: {
      submit: {
        server: function(a, b) { return a + b; },
      }
    }
  };

  var parts = stringify(obj);
  test.equal(parts[1], '{"whatevs":{"submit":{"server":true}}}');
  test.done();
};


exports['make submit.client a string and not async'] = function(test) {
  var obj = {
    whativs: {
      submit: {
        client: function(a, b) { return a + b; },
      }
    }
  };

  var parts = stringify(obj);
  test.equal(parts[1], '{"whativs":{"submit":{"client":function (a, b) { return a + b; }}}}');
  test.done();
};
