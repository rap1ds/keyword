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
var runner = require('./runner');
var logger = require('./logger');

var keywords = {};

/**
    Take `keywordsToRun` and wrap the run command
    into a function, which can used as a new keyword

    Usage:

    ```
    keywords["Login"] = createKeywordWrapper(
        "Go To Page", ["http://mysite.com/login"],
        "Fill In Credentials", ["user", "pa55w0rd"]
        "Click Element", ["#login-button"]
    );
    ```

    Now you can use the new `Login` keywords like this:

    key.run("Login").then( ... )
*/
function createKeywordWrapper(keywordsToRun) {
    var wrapper = function(next) {
        var parsedArgs = helpers.parseKeywordRunArgs(arguments);
        runner.run(keywordsToRun, keywords, parsedArgs).then(next);
    };
    return wrapper;
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

        definition.apply(null, [callback].concat(parsedArgs.args));
    };
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

        keywords[name] = createKeywordWrapper(keywordsToRun);
    });
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

    return runner.run(keywordsToRun, keywords, passedArguments);
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