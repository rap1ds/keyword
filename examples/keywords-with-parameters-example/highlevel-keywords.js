// highlevel-keywords.js
"use strict";

var highlevelKeywords = {
    "Create a greeting": [
        "Hello", ["$1"], "=> $helloMikko",
        "Join", ["$helloMikko", "How are you?"], "=> $return"
    ],
    "Greet Mikko": [
        "Create a greeting", ["Mikko"], "=> $greeting",
        "Print", ["$greeting"]
    ]
};

module.exports = highlevelKeywords;