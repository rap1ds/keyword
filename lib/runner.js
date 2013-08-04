'use strict';

var _ = require('underscore');
var helpers = require('./helpers');
var logger = require('./logger');

var afterRun, runKeywords;

function afterRun(keyword, keywordsToRun, keywordsDefined, localVars, then, returnValue) {
    logger('Returned from ' + keyword.name + ', return value:', returnValue);

    if(returnValue !== undefined) {
        localVars.set(keyword.returnVar || 'return', returnValue);
    }

    runKeywords(keywordsToRun, keywordsDefined, localVars, then);
}

function getKeyword(name, keywordsDefined) {
    var def = keywordsDefined[name];

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
    var defArgs = [callback].concat(replacedArgs);

    logger('Calling keyword \'' + keyword.name + '\'. Original args ' +
        JSON.stringify(keyword.args) + ' replaced with ' + JSON.stringify(replacedArgs));

    var def = getKeyword(keyword.name, keywordsDefined);
    def.apply(null, defArgs);
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
    run: run
});