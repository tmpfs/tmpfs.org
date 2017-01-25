const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const pageIdentifier = require('./page-identifier')
const {UglifyJsPlugin, DedupePlugin, OccurrenceOrderPlugin} =
  require('webpack').optimize
const postCssSimpleVars = require('postcss-simple-vars')

module.exports = {
  // disable source maps
  devtool: false,
  module: {
    loaders: [
      // image optimization
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'image-webpack'
      }
    ]
  },
  // webpack optimization and minfication plugins
  plugins: [
    new UglifyJsPlugin(),
    new DedupePlugin(),
    new OccurrenceOrderPlugin()
  ],
  // adds html minification plugin
  reshape: (ctx) => {
    const info = htmlStandards({
      webpack: ctx,
      locals: { pageId: pageIdentifier(ctx) }
    })
    return info
  },
  // adds css minification plugin
  postcss: (ctx) => {
    const css = cssStandards(
      {
        webpack: ctx,
        warnForDuplicates: false,
        features: {customProperties: false, calc: false, minify: false}
    })
    css.plugins.push(postCssSimpleVars())
    return css
  }
}
