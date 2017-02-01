const id = require('makestatic-page-id')
const css = require('makestatic-css-standard')
const html = require('makestatic-html-standard')

module.exports = {
  input: 'src',
  output: 'public',

  server: {
    ghostMode: false
  },

  postcss: () => {
    const conf = css();
    conf.plugins.push(require('postcss-simple-vars')());
    return conf;
  },

  reshape: () => {
    return html({locals: (ctx, options) => {
      return {
        pageId: id(ctx, options)
      }
    }})
  },

  babel: {
    presets: ['babel-preset-latest']
  }
}
