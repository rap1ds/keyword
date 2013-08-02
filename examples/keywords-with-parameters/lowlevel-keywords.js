// lowlevel-keywords.js
"use strict";

var lowlevelKeywords = {
    "Print": function(next, message) {
        console.log(message);
        next();
    },
    "Hello": function(next, name) {
        var returnValue = "Hello " + name;
        next(returnValue);
    },
    "Join": function(next, str1, str2) {
        var returnValue = [str1, str2].join("\n");
        next(returnValue);
    }
};

module.exports = lowlevelKeywords;