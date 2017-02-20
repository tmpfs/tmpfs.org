const optimize = require('makestatic-preset-optimize');

module.exports = {
  // disable source maps
  devtool: false,

  // configure optimization lifecycle
  lifecycle: optimize({
    transform: {
      html: [
        {
          test: /\.(html|sgr)$/,
          plugin: require('makestatic-inline-css'),
          exclude: [
            /about\//
          ]
        }
      ]
    }
  }),

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
