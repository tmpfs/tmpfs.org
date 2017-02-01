const optimize = require('makestatic-preset-optimize');

module.exports = {
  // disable source maps
  devtool: false,

  // configure optimization lifecycle
  lifecycle: optimize()
}
