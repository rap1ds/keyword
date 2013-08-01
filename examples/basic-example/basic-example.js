// basic-example.js
"use strict";

// Require keyword library
var key = require('keyword');
var _ = require('underscore');

// Import keyword definitions
_.forEach(require('./lowlevel-keywords'), function(fn, name) {
    key(name, fn);
});
key.suite(require('./highlevel-keywords'));

key.run("Greet the World").then(function() {
    // All done.
});