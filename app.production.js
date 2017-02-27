const parse = require('makestatic-preset-parse')
const optimize = require('makestatic-preset-optimize')

module.exports = {
  // disable source maps
  devtool: false,

  // configure optimization lifecycle
  lifecycle: {
    parse: parse({css: false, js: false}),
    transform: [
      require('makestatic-inline-css')
    ],
    optimize: optimize()
  },

  deploy: {
    production: {
      s3: {
        domain: 'tmpfs.org',
        credentials: {
          profile: 'tmpfs'
        },
        prefix: 'production',
        region: 'ap-southeast-1',
        error: 'production/404.html',
        redirects: [
          'www.tmpfs.org'
        ],
        publish: true,
        cloudfront: {
          key: 'cloudfront_distribution_production',
          invalidate: true
        }
      }
    }
  }
}
