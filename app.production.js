const optimize = require('makestatic-preset-optimize');

module.exports = {
  // disable source maps
  devtool: false,

  // configure optimization lifecycle
  lifecycle: optimize({
    transform: [
      {
        test: '**/*.{html|sgr}',
        plugin: require('makestatic-inline-css')
      }
    ]
  })
}
