"use strict";

var logger = function(doLog) {
    return function() {
        if(doLog) {
            console.log.apply(null, arguments);
        }
    };
};

module.exports = logger(false);