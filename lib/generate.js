var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');


/**
 * Generates client side Javascript file that will be served
 * to the path `/castform/castform.js`
 *
 * @param {String} stringifiedOptions
 * @return {String}
 */
module.exports = function generate(stringifiedOptions) {
  var watchers = [];
  var obj = {};
  obj.die = function() {
    watchers.forEach(function(watcher) {
      fs.unwatchFile(watcher.file, watcher.listener);
    });
  };

  // Read the client side file and compress it.
  var files = ['util', 'castform', 'validate'];
  var sources = files.map(function(file, i) {
    var filepath = path.join(__dirname, '/client/' + file + '.js');

    // Watch the file for any changes
    function fileChanged(curr, prev) {
      if (curr.mtime.toString !== prev.mtime.toString()) {
        fs.readFile(filepath, 'utf8', function(err, data) {
          if (err) throw err;

          sources[i] = data;
          compile();
        });
      }
    }

    fs.watchFile(filepath, fileChanged);
    watchers.push({ file: filepath, listener: fileChanged });

    return fs.readFileSync(filepath, 'utf8');
  });


  // Compile all files together and compresses.
  function compile() {
    var compiledSource = sources.join('\n') +
      '\ncastform.options = ' + stringifiedOptions;

    if (!process.env.DEBUG) {
      // Parse.
      var ast = uglify.parse(compiledSource);

      // Compress.
      ast.figure_out_scope();
      ast.transform(uglify.Compressor());

      // Mangle.
      ast.compute_char_frequency();
      ast.figure_out_scope();
      ast.mangle_names();

      // Output.
      var stream = uglify.OutputStream({ source_map: null });
      ast.print(stream);

      var source = '(function(window,document){' +
        stream + '})(window,document);';
      obj.buffer = new Buffer(source, 'utf8');

    } else {
      obj.buffer = new Buffer(compiledSource, 'utf8');
    }
  }

  // Compile when first called.
  compile();

  return obj;
};
