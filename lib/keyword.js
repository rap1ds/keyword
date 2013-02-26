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

function runKeyword(keywordsToRun, localVars, then) {
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

        runKeyword(keywordsToRun, localVars, then);
    }

    var def = keywords[keyword.name];

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
function run(keywordsToRun, passedArguments) {
    var vars, keywordsToRun;

    vars = helpers.createLocalEnv((passedArguments || {}).args || []);
    keywordsToRun = helpers.createKeywords(keywordsToRun);

    return {
        then: function(callback) {
            runKeyword(keywordsToRun, vars, callback);
        }
    };
}

/**
    Takes keywords to run as arguments. The last arguments may
    optionally be the object of passed args

    Example:
    "Keyword1", "Keyword2", ["args for key2", $1], "=> $returnVariable", {args: ["jee"]}
*/
function keyRun() {
    var keywordsToRun = _.toArray(arguments);

    if(!validators.isRun(keywordsToRun)) {
        console.error("Illegal arguments to run(keywordName, [\"arguments\", \"=> $returnVariable\"])");
        console.error("run(keywordName, [\"arguments\", \"=> $returnVariable\"]) takes a serie of " +
            "keyword, arguments, return variable compinations, nothing else.");
        throw new Error("Illegal arguments to run() " + JSON.stringify(_.toArray(arguments)));
    }

    var passedArguments = _.last(keywordsToRun);
    if(_.isObject(passedArguments)) {
        keywordsToRun = _.initial(keywordsToRun);
    } else {
        passedArguments = undefined;
    }

    return run(keywordsToRun, passedArguments);
}

function suite(args) {
    var suiteDefinition = args[0];
    _.forEach(suiteDefinition, function(keywordsToRun, name) {

        if(!validators.isRun(keywordsToRun)) {
            console.error("Illegal arguments to run(keywordName, [\"arguments\", \"=> $returnVariable\"])");
            console.error("run(keywordName, [\"arguments\", \"=> $returnVariable\"]) takes a serie of " +
                "keyword, arguments, return variable compinations, nothing else.");
            throw new Error("Illegal arguments to run() " + JSON.stringify(_.toArray(arguments)));
        }

        var definitionFn = function(done) {
            logger('Called keyword ' + name + ' definition with args', JSON.stringify(arguments));
            logger('Calling following keys ', JSON.stringify(keywordsToRun));

            var parsedArgs = helpers.parseKeywordRunArgs(arguments);
            run(keywordsToRun, parsedArgs).then(done);
        };

        keywords[name] = definitionFn;
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
key.run = keyRun;
key.suite = keySuite;

module.exports = key;