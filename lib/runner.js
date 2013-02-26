"use strict";

var _ = require('underscore');
var helpers = require('./helpers');
var logger = require('./logger');

function afterRun(keyword, keywordsToRun, keywordsDefined, localVars, then, returnValue) {
    logger('Returned from ' + keyword.name + ', return value:', returnValue);

    if(keyword.returnVar && returnValue !== undefined) {
        localVars.set(keyword.returnVar, returnValue);
    }

    runKeyword(keywordsToRun, keywordsDefined, localVars, then);
}

function getKeyword(name, keywordsDefined) {
    var def = keywordsDefined[name];

    if(!def) {
        console.error("Can not find keyword '" + name + "'");
        throw new Error("Can not find keyword '" + name + "'");
    } else {
        return def;
    }
}

function runKeyword(keywordsToRun, keywordsDefined, localVars, then) {
    var keyword = keywordsToRun.shift();

    if(!keyword) {
        var retVal = localVars.get('return');
        localVars.remove('return');
        return (then || _.identity)(retVal);
    }

    var replacedArgs = helpers.replaceArgPlaceholders(keyword.args, localVars);
    var callback = afterRun.bind(null, keyword, keywordsToRun, keywordsDefined, localVars, then);
    var defArgs = [callback].concat(replacedArgs);
    defArgs.push(keyword);
    defArgs.push(localVars);

    logger("Calling keyword '" + keyword.name + "'. Original args " +
        JSON.stringify(keyword.args) + " replaced with " + JSON.stringify(replacedArgs));

    var def = getKeyword(keyword.name, keywordsDefined);
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