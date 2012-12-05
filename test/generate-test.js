var muk = require('muk');


exports['compiled and compressed code from options'] = function(test) {
  var generate = muk('../lib/generate', {
    fs: {
      readFileSync: function(file) {
        if (/castform\.js$/.test(file)) {
          return 'var castform = {};';
        } else if (/util\.js$/.test(file)) {
          return 'function has() {}';
        } else if (/validate\.js$/.test(file)) {
          return 'console.log(\'hello world\');';
        }
      },
      watchFile: function() {}
    }
  });

  var src = generate('{"foo":42,"bar":24}');
  test.equal(typeof src.die, 'function');
  test.equal(src.buffer.toString('utf8'), '(function(window,document){function has(){}var castform={};console.log(\"hello world\"),castform.options={foo:42,bar:24};})(window,document);');

  muk.restore();
  test.done();
};
