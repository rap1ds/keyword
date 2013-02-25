var _ = require('underscore');

function isPlainObject(obj) {
    return typeof obj === "object" && !Array.isArray(obj);
}


function splitBy(arr, iterator) {
    var group = [], groups = [];
    arr.forEach(function(val) {
        if(iterator(val) && group.length) {
            groups.push(group);
            group = [];
        }
        group.push(val);
    });
    if(group.length) {
        groups.push(group);
    }
    return groups;
}

function pickReturnVar(str) {
    var regexp = /^\s*\=>\s+\$(\w+)\s*$/; // equal sign, greater than sign, whitespace, dollar, var name
    var result = regexp.exec(str);
    return _.isObject(result) && result[1];
}

/**
    Parses the arguments the passed to keyword

    Arguments:
    next (function), ... , args , ... , keywordInfo (object), vars (object)
*/
function parseKeywordRunArgs(args) {
    var args = _.toArray(args);
    var ret = {
        next: args.shift(),
        vars: args.pop(),
        keywordInfo: args.pop(),
        args: args
    };

    return ret;
}

// Expose for testing purposes
var helpers = Object.freeze({
    isPlainObject: isPlainObject,
    splitBy: splitBy,
    pickReturnVar: pickReturnVar,
    parseKeywordRunArgs: parseKeywordRunArgs
});

module.exports = helpers;