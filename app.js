module.exports = {
  input: 'src',
  output: 'public',

  server: {
    ghostMode: false
  },

  styles: () => {
    const std = require('makestatic-css-standard')
    const conf = std();
    conf.plugins.push(require('postcss-simple-vars')());
    return conf;
  },

  markup: () => {
    const id = require('makestatic-page-id')
    const std = require('makestatic-html-standard')
    return std({locals: (ctx, options) => {
      return {
        pageId: id(ctx, options)
      }
    }})
  },

  script: {
    presets: ['latest']
  }
}
