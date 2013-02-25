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

function replaceArgPlaceholders(keywordArgs, vars) {
    var argNameRegexp = /^\$(\w+)$/;
    keywordArgs = keywordArgs || [];

    return keywordArgs.map(function(arg) {
        var res = argNameRegexp.exec(arg);
        if(_.isArray(res) && res.length === 2) {
            var argName = res[1];
            
            if(!vars.isDefined(argName)) {
                throw new Error("Variable '" + argName + "'' is not defined");
            }

            return vars.get(argName);
        } else {
            return arg;
        }
    });    
}

var localVars = function() {

    var vars = {};

    function isDefined(key) {
        return _.contains(_.keys(vars), key);
    }

    function set(key, val) {
        vars[key] = val;
    }

    function get(key) {
        return vars[key];    
    }

    function remove(key) {
        delete vars[key];
    }

    return {
        set: set,
        get: get,
        remove: remove,
        isDefined: isDefined
    };
};

// Expose for testing purposes
var helpers = Object.freeze({
    isPlainObject: isPlainObject,
    splitBy: splitBy,
    pickReturnVar: pickReturnVar,
    parseKeywordRunArgs: parseKeywordRunArgs,
    replaceArgPlaceholders: replaceArgPlaceholders,
    localVars: localVars
});

module.exports = helpers;