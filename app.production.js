const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const pageId = require('spike-page-id')
const {UglifyJsPlugin, DedupePlugin, OccurrenceOrderPlugin} = 
  require('webpack').optimize
const postCssSimpleVars = require('postcss-simple-vars')

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
    return htmlStandards({
      webpack: ctx,
      locals: { pageId: pageId(ctx), avatarSize: 266 },
      minify: true
    })
  },

  // adds css minification plugin
  postcss: (ctx) => {
    const css = cssStandards(
      { 
        webpack: ctx, 
        minify: true, 
        warnForDuplicates: false, 
        features: {customProperties: false, calc: false} })
    css.plugins.push(postCssSimpleVars())
    return css
  }
}
