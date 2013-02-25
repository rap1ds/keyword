/*
 * keyword
 * https://github.com/rap1ds/keyword
 *
 * Copyright (c) 2013 Mikko Koski
 * Licensed under the MIT license.
 */

"use strict";

var _ = require('underscore');
var helpers = require('./helpers');
var validators = require('./validators');

var keywords = {};

var logger = (function(doLog) {
    return function() {
        if(doLog) {
            console.log.apply(null, arguments);
        }
    };
})(false);

/**
    `def` is called when defining a keyword by
    combining other keywords.

    

*/
function def(args) {
    var name = _.first(args);
    var definition = _.first(_.rest(args));

    keywords[name] = function() {
        var args = _.toArray(arguments);
        var next = _.first(args);
        args = _.rest(args);

        definition.apply(null, [next].concat(args));
    };
}

function lib(args) {
    var name = _.first(args);
    var definition = _.first(_.rest(args));

    keywords[name] = function() {
        var parsedArgs = helpers.parseKeywordRunArgs(arguments);

        logger('Lib variables for key ', name);
        logger('keywordInfo', parsedArgs.keywordInfo);
        logger('vars', parsedArgs.vars);

        var callback = function(returnVal) {
            logger('Keyword "' + name + '", callback info: ', JSON.stringify(parsedArgs.args));
            parsedArgs.next(returnVal);
        };

        logger('Calling def of keyword ' + name + " with args", JSON.stringify(parsedArgs.args));
        var replacedArgs = helpers.replaceArgPlaceholders(parsedArgs.args, parsedArgs.vars);
        logger('Calling def of keyword ' + name + " with REPLACED args", JSON.stringify(replacedArgs));

        definition.apply(null, [callback].concat(replacedArgs));
    };
}

/**
    Take the following ARRAY as an argument:
    [n]: keywords to run
    [last]["next"]: next()
    [last]["args"]: args
    [last]["keywordInfo"]: keywordInfo
    [last]["vars"]: vars
*/
function run(keywordsToRun) {
    var vars, initialLocalVars;

    var passedArguments = _.last(keywordsToRun);
    if(_.isObject(passedArguments)) {
        initialLocalVars = passedArguments.args;
        keywordsToRun = _.initial(keywordsToRun);
    }

    vars = helpers.createLocalEnv(initialLocalVars || []);

    keywordsToRun = helpers.createKeywords(keywordsToRun);
    var thenCallback;

    function takeFirst() {
        var first = _.first(keywordsToRun);
        keywordsToRun = _.rest(keywordsToRun);
        return first;
    }

    function runKeyword(keyword) {
        if(!keyword) {
            var retVal = vars.get('return');
            vars.remove('return');
            return (thenCallback || _.identity)(retVal);
        }

        var def = keywords[keyword.name];

        function next(retVal) {
            logger('Returned from ' + keyword.name + ', return value:', retVal);

            if(keyword.returnVar && retVal !== undefined) {
                vars.set(keyword.returnVar, retVal);
            }

            runKeyword(takeFirst());
        }

        if(!def) {
            console.error("Can not find keyword '" + keyword.name + "'");
            throw new Error("Can not find keyword '" + keyword.name + "'");
        }

        logger('Calling def of keyword ' + keyword.name + " with args", JSON.stringify(keyword.args));
        var replacedArgs = helpers.replaceArgPlaceholders(keyword.args, vars);
        logger('Calling def of keyword ' + keyword.name + " with REPLACED args", JSON.stringify(replacedArgs));

        var defArgs = [next].concat(replacedArgs);
        // var defArgs = [next].concat(keyword.args);
        defArgs.push(keyword);
        defArgs.push(vars);

        var defReturnVal = def.apply(null, defArgs);
    }

    return {
        then: function(callback) {
            thenCallback = callback;
            runKeyword(takeFirst());
        }
    };
}

function keyRun() {
    var args = _.toArray(arguments);
    if(!validators.isRun(args)) {
        console.error("Illegal arguments to run(keywordName, [\"arguments\", \"=> $returnVariable\"])");
        console.error("run(keywordName, [\"arguments\", \"=> $returnVariable\"]) takes a serie of " +
            "keyword, arguments, return variable compinations, nothing else.");
        throw new Error("Illegal arguments to run() " + JSON.stringify(_.toArray(arguments)));
    }

    return run(args);
}

function suite(args) {
    var suiteObj = args[0];
    _.forEach(suiteObj, function(keys, name) {
        var definitionFn = function(done) {
            logger('Called keyword ' + name + ' definition with args', JSON.stringify(arguments));
            logger('Calling following keys ', JSON.stringify(keys));

            var parsedArgs = helpers.parseKeywordRunArgs(arguments);
            keys.push(parsedArgs);

            keyRun.apply(null, keys).then(done);
        };
        def([name, definitionFn]);
    });
}

function keySuite() {
    var args = _.toArray(arguments);
    if(!validators.isSuite(args)) {
        console.error("Illegal arguments passed to suite({object})");
        console.error("suite({object}) takes an object as an argument, nothing else");
        throw new Error("Illegal arguments to suite() " + JSON.stringify(_.toArray(arguments)));
    }

    return suite(args);
}

function keyDef() {
    var args = _.toArray(arguments);
    if(!validators.isDef(args)) {
        console.error("Illegal arguments to def(keywordName, definitionFn)");
        console.error("def(keywordName, definitionFn) takes keyword name as the first argument " + 
            "and definition function as second argument, nothing else.");
        throw new Error("Illegal arguments to def() " + JSON.stringify(_.toArray(arguments)));
    }

    return def(args);
}

function keyLib() {
    var args = _.toArray(arguments);
    if(!validators.isLib(args)) {
        console.error("Illegal arguments to lib(keywordName, definitionFn)");
        console.error("lib(keywordName, definitionFn) takes keyword name as the first argument " + 
            "and definition function as second argument, nothing else.");
        throw new Error("Illegal arguments to lib() " + JSON.stringify(_.toArray(arguments)));
    }

    return lib(args);
}

var key = keyLib;
key.lib = keyLib;
key.def = keyDef;
key.run = keyRun;
key.suite = keySuite;

module.exports = key;