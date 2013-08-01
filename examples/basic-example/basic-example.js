// basic-example.js
"use strict";

// Require keyword library
var key = require('keyword');

// Import keyword definitions
key(require('./lowlevel-keywords'));
key.suite(require('./highlevel-keywords'));

key.run("Greet the World").then(function() {
    // All done.
});