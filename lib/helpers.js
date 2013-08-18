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

function apply(fn) {
    return function() {
        return fn.apply(null, arguments[0]);
    };
}

function not(fn) {
    return function() {
        return !fn.apply(null, arguments);
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

/**
    Does the same this as `range(1, 5)` but instead
    of taking start and stop values, this function keeps
    calling `fn` with the index of the array until `cond`
    return false;
*/
function rangeWhile(cond, fn) {
    var i = 0, res = [];

    while(cond(i)) {
        res[i] = fn(i);
        i++;
    }
    return res;
}

/**
    Take `array` and `mergeItems` and merge them together.

    ## Params: 
    - `array` just a regular array
    - `mergeItems` an object of `index` and `value` pairs

    ## Example

    mergeArray([], {1: true, 3: false})
    => [undefined, true, undefined, false]

    mergeArray([1, 2, 3], {1: true, 3: false})
    => [1, true, 2, false, 3]
*/
function mergeArray(arr, mergeItems) {
    var mergeKeys = _.chain(mergeItems)
        .keys(mergeItems)
        .map(Number)
        .value();

    var maxId = _.max(mergeKeys);

    return rangeWhile(function(i) { 
        return i < (maxId + 1) || arr.length;
    }, function(i) {
        return _.contains(mergeKeys, i) ? mergeItems[i] : arr.shift();
    });
}

function injectParams(fn, args, injectedParams) {
    var argNames = /function\s?\((.*)\)/.exec(fn.toString());
    var argNamesList = argNames[1].replace(/\s/g, '').split(',');

    var injectedPositions = _.chain(injectedParams)
        .map(function(val, key) {
            return [argNamesList.indexOf(key), val];
        })
        .object()
        .value();

    var merged = mergeArray(_.toArray(args), injectedPositions);
    fn.apply(null, merged);
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
    or: or,
    apply: apply,
    not: not,
    injectParams: injectParams,
    mergeArray: mergeArray,
    rangeWhile: rangeWhile
});

module.exports = helpers;