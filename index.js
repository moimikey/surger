#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
require('./lib').init({
  debug: argv.debug
})
