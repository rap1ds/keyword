'use strict';

var _ = require('underscore');
var helpers = require('./helpers');
var logger = require('./logger');
var validators = require('./validators');

var afterRun, runKeywords;

function findKeyword(name, keywordsDefined) {
    // Simple case
    var fn = keywordsDefined[name];
    if(fn) { return fn; }

    // Regexp
    var apply = helpers.apply;

    return _.chain(keywordsDefined)
        .pairs()
        .map(apply(function(name, fn) {
            return [validators.isRegexpKeywordName(name), fn];
        }))
        .filter(apply(function(regexpResult) {
            return regexpResult && (new RegExp(regexpResult[1])).exec(name);
        }))
        .map(apply(function(regexpResult, fn) {
            return {regexp: regexpResult[1], fn: fn};
        }))
        .first()
        .value();
}

function afterRun(keyword, keywordsToRun, keywordsDefined, localVars, then, returnValue) {
    logger('Returned from ' + keyword.name + ', return value:', returnValue);

    if(returnValue !== undefined) {
        localVars.set(keyword.returnVar || 'return', returnValue);
    }

    runKeywords(keywordsToRun, keywordsDefined, localVars, then);
}

function getKeyword(name, keywordsDefined) {
    var def = findKeyword(name, keywordsDefined);

    if(!def) {
        console.error('Can not find keyword \'' + name + '\'');
        throw new Error('Can not find keyword \'' + name + '\'');
    } else {
        return def;
    }
}

function runKeyword(keyword, keywordsToRun, keywordsDefined, localVars, then) {
    var replacedArgs = helpers.replaceArgPlaceholders(keyword.args, localVars);
    var callback = afterRun.bind(null, keyword, keywordsToRun, keywordsDefined, localVars, then);

    logger('Calling keyword \'' + keyword.name + '\'. Original args ' +
        JSON.stringify(keyword.args) + ' replaced with ' + JSON.stringify(replacedArgs));

    var key = getKeyword(keyword.name, keywordsDefined);
    
    var args, fn;
    if(_.isFunction(key)) {
        fn = key;
        args = [callback].concat(replacedArgs);
    } else {
        fn = key.fn;
        var regexpResult = new RegExp(key.regexp).exec(keyword.name);
        args = [callback, regexpResult].concat(replacedArgs);
    }
    fn.apply(null, args);
}

function runKeywords(keywordsToRun, keywordsDefined, localVars, then) {
    var keyword = keywordsToRun.shift();

    if(!keyword) {
        var retVal = localVars.get('return');
        localVars.remove('return');
        return (then || _.identity)(retVal);
    } else {
        runKeyword(keyword, keywordsToRun, keywordsDefined, localVars, then);
    }
}

/**
    Take the following ARRAY as an argument:
    [n]: keywords to run
    [last]["next"]: next()
    [last]["args"]: args
    [last]["keywordInfo"]: keywordInfo
    [last]["vars"]: vars
    */
    function run(keywordsToRun, keywordsDefined, passedArguments) {
        var vars = helpers.createLocalEnv(passedArguments);
        keywordsToRun = helpers.createKeywords(keywordsToRun);

        return {
            then: function(callback) {
                runKeywords(keywordsToRun, keywordsDefined, vars, callback);
            }
        };
    }

    module.exports = Object.freeze({
        run: run,
        findKeyword: findKeyword
    });