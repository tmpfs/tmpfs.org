const id = require('makestatic-page-id')
const css = require('makestatic-css-standard')
const html = require('makestatic-html-standard')

module.exports = {
  input: 'src',
  output: 'public',

  server: {
    ghostMode: false
  },

  css: () => {
    const conf = css();
    conf.plugins.push(require('postcss-simple-vars')());
    return conf;
  },

  html: () => {
    return html({locals: (ctx, options) => {
      return {
        pageId: id(ctx, options)
      }
    }})
  },

  js: {
    presets: ['latest']
  }
}
