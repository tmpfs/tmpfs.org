const path = require('path')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('babel-preset-latest')
const postCssSimpleVars = require('postcss-simple-vars')
const pageIdentifier = require('./page-identifier')

module.exports = {
  server: {
    ghostMode: false 
  },
  devtool: 'source-map',
  cleanUrls: false,
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.sss'
  },
  ignore: [
    '**/layout.sgr',
    '**/_*',
    '**/.*',
    '**/*.bak',
    '_cache/**',
    'ref/**',
    'doc/**',
    'sbin/**',
    'README.md'],
  reshape: (ctx) => {
    return htmlStandards({
      webpack: ctx,
      locals: { pageId: pageIdentifier(ctx), avatarSize: 280 }
    })
  },
  postcss: (ctx) => {
    const css = cssStandards(
      { webpack: ctx, features: {customProperties: false, calc: false} })
    css.plugins.push(postCssSimpleVars())
    return css
  },
  babel: { presets: [jsStandards] },
  plugins: [
    new HardSourcePlugin({
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json'),
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache')
    })
  ]
}
