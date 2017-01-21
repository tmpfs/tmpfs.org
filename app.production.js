const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const pageIdentifier = require('./page-identifier')
const {UglifyJsPlugin, DedupePlugin, OccurrenceOrderPlugin} = 
  require('webpack').optimize
const postCssSimpleVars = require('postcss-simple-vars')

const CssInject = require('./css-inject')

module.exports = {
  // disable source maps
  devtool: false,
  // webpack optimization and minfication plugins
  plugins: [
    new UglifyJsPlugin(),
    new DedupePlugin(),
    new OccurrenceOrderPlugin()
  ],
  // image optimization
  module: {
    loaders: [{ test: /\.(jpe?g|png|gif|svg)$/i, loader: 'image-webpack' }]
  },
  // adds html minification plugin
  reshape: (ctx) => {
    const info = htmlStandards({
      webpack: ctx,
      locals: { pageId: pageIdentifier(ctx) }
    })
    info.plugins.push(new CssInject())
    return info
  },

  // adds css minification plugin
  postcss: (ctx) => {
    const css = cssStandards(
      { 
        webpack: ctx, 
        warnForDuplicates: false, 
        features: {customProperties: false, calc: false, minify: true} })
    css.plugins.push(postCssSimpleVars())
    return css
  }
}
