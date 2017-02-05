const conf = require('./app.production')

// run as static web server
// disables browsersync network requests
conf.serve = true

module.exports = conf
