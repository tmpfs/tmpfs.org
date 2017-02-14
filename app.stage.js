const conf = require('./app.production')

// run as static web server
// disables browsersync network requests
conf.static = true

conf.deploy = {
  stage: {
    s3: {
      domain: 'tmpfs.org',
      credentials: {
        profile: 'tmpfs'
      },
      prefix: 'stage',
      params: {
        CacheControl: 'no-store, no-cache, must-revalidate'
      },
      region: 'ap-southeast-1',
      error: 'stage/404.html',
      redirects: [
        'www.tmpfs.org'
      ],
      publish: true
    }
  }
}

module.exports = conf
