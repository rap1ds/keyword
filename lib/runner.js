"use strict";

var _ = require('underscore');
var helpers = require('./helpers');
var logger = require('./logger');

function runKeyword(keywordsToRun, keywordsDefined, localVars, then) {
    var keyword = keywordsToRun.shift();

    if(!keyword) {
        var retVal = localVars.get('return');
        localVars.remove('return');
        return (then || _.identity)(retVal);
    }

    function next(retVal) {
        logger('Returned from ' + keyword.name + ', return value:', retVal);

        if(keyword.returnVar && retVal !== undefined) {
            localVars.set(keyword.returnVar, retVal);
        }

        runKeyword(keywordsToRun, keywordsDefined, localVars, then);
    }

    var def = keywordsDefined[keyword.name];

    if(!def) {
        console.error("Can not find keyword '" + keyword.name + "'");
        throw new Error("Can not find keyword '" + keyword.name + "'");
    }

    logger('Calling def of keyword ' + keyword.name + " with args", JSON.stringify(keyword.args));
    var replacedArgs = helpers.replaceArgPlaceholders(keyword.args, localVars);
    logger('Calling def of keyword ' + keyword.name + " with REPLACED args", JSON.stringify(replacedArgs));

    var defArgs = [next].concat(replacedArgs);
    defArgs.push(keyword);
    defArgs.push(localVars);

    def.apply(null, defArgs);
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
    var vars;

    vars = helpers.createLocalEnv((passedArguments || {}).args || []);
    keywordsToRun = helpers.createKeywords(keywordsToRun);

    return {
        then: function(callback) {
            runKeyword(keywordsToRun, keywordsDefined, vars, callback);
        }
    };
}

module.exports = Object.freeze({
    run: run
});