"use strict";

var _ = require('underscore');

function flip(fn) {
    return function(a, b) {
        return fn(b, a);
    };
}

function or(fn1, fn2) {
    return function() {
        return fn1.apply(null, arguments) || fn2.apply(null, arguments);
    };
}

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

function replaceArgPlaceholders(keywordArgs, vars) {
    var argNameRegexp = /^\$(\w+)$/;
    keywordArgs = keywordArgs || [];

    return keywordArgs.map(function(arg) {
        var res = argNameRegexp.exec(arg);
        if(_.isArray(res) && res.length === 2) {
            var argName = res[1];
            
            if(!vars.isDefined(argName)) {
                throw new Error("Variable '" + argName + "' is not defined");
            }

            return vars.get(argName);
        } else {
            return arg;
        }
    });    
}

/**
    Take arguments passed to `key.def` function. Return
    keyword objs.
*/
function createKeywords(args) {
    // TODO Hmm.. Circular dependency... something smells here...
    var validators = require('./validators');

    var keys = [];
    for(var i = 0; i < args.length; i++) {
        var keyword = {name: args[i]};
        
        if(_.isArray(args[i + 1])) {
            i++;
            keyword.args = args[i];
        }

        if(validators.isReturn(args[i + 1])) {
            i++;
            keyword.returnVar = pickReturnVar(args[i]);
        }
        keys.push(keyword);
    }
    return keys;
}

function localVars() {

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
}

/**
    Create a new local variable environment and initialize the env
    by array of values. Set them to $1, $2, etc...
*/
function createLocalEnv(args) {
    var vars = localVars();

    (args || []).forEach(function(val, key) {
        if(val !== undefined) {
            vars.set(parseInt(key, 10) + 1, val);
        }
    });

    return vars;
}

// Expose for testing purposes
var helpers = Object.freeze({
    isPlainObject: isPlainObject,
    splitBy: splitBy,
    pickReturnVar: pickReturnVar,
    replaceArgPlaceholders: replaceArgPlaceholders,
    localVars: localVars,
    createKeywords: createKeywords,
    createLocalEnv: createLocalEnv,
    flip: flip,
    or: or
});

module.exports = helpers;