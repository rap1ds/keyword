/*
 * keyword
 * https://github.com/rap1ds/keyword
 *
 * Copyright (c) 2013 Mikko Koski
 * Licensed under the MIT license.
 */

"use strict";

var _ = require('underscore');
var validators = require('./validators');
var runner = require('./runner');

var keywords = {};
var defaultInjector = function(name, fn, args) {
    fn.apply(null, args);
};
var injector = defaultInjector;

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
        var args = _.rest(arguments);
        runner.run(keywordsToRun, keywords, args).then(next);
    };
    return wrapper;
}

function suiteKeyword(keywordsToRun, name) {

    if(!validators.isRun(keywordsToRun)) {
        console.error("Illegal arguments to run(keywordName, [\"arguments\", \"=> $returnVariable\"])");
        console.error("run(keywordName, [\"arguments\", \"=> $returnVariable\"]) takes a serie of " +
            "keyword, arguments, return variable compinations, nothing else.");
        throw new Error("Illegal arguments to run() " + JSON.stringify(_.toArray(arguments)));
    }

    keywords[name] = createKeywordWrapper(keywordsToRun);
}

function suite(args) {
    var suiteDefinition = args[0];
    _.forEach(suiteDefinition, suiteKeyword);
}

function libKeyword(fn, name) {
    keywords[name] = function() {
        injector(name, fn, arguments);
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

    return runner.run(keywordsToRun, keywords);
}

function keySuite() {
    var args = _.toArray(arguments);
    if(!validators.isValidSuiteArgs(args)) {
        console.error("Illegal arguments passed to suite({object})");
        console.error("suite({object}) takes an object as an argument, nothing else");
        throw new Error("Illegal arguments to suite() " + JSON.stringify(_.toArray(arguments)));
    }

    if(!validators.isValidKeywordSyntax(args[0])) {
        console.error("Illegal keyword syntax");
        throw new Error("Illegal keyword syntax " + JSON.stringify(_.toArray(args[0])));
    }

    return suite(args);
}

function keyLib() {
    var args = _.toArray(arguments);

    if(validators.isLib(args)) {
        return libKeyword(args[1], args[0]);
    }
    else if(args.length === 1 && validators.isSetOfKeywords(args[0])) {
        var keywords = args[0];
        _.forEach(keywords, function(keywordDefinition, name) {
            if(validators.isLibKeyword(keywordDefinition, name)) {
                return libKeyword(keywordDefinition, name);
            } else if (validators.isSuiteKeyword(keywordDefinition, name)) {
                return suiteKeyword(keywordDefinition, name);
            } else {
                throw new Error("The keyword was not lib nor suite keyword. Btw... check the validator, you should never be here.");
            }
        });
    }
    else {
        console.error("Illegal arguments to lib(keywordName, definitionFn)");
        console.error("lib(keywordName, definitionFn) takes keyword name as the first argument " +
            "and definition function as second argument, nothing else.");
        console.error("Illegal arguments to lib(keywords)");
        console.error("lib(keywords) object of keyword names and function, nothing else.");
        throw new Error("Illegal arguments to lib() " + JSON.stringify(_.toArray(arguments)));
    }
}

function keyInjector(injectorFn) {
    injector = injectorFn;
}

var key = keyLib;
key.lib = keyLib;
key.run = keyRun;
key.suite = keySuite;

/**
    # Injector

    Injector function is called before each keyword call.

    It can be used for example to inject webdriver to each keyword

    Three params are passed to the injector:
    - name of the keyword
    - keyword function to run
    - arguments to the keyword (notice, that the first argument is the `next` function)

    ## Usage:

    If you want for example console.log before and after each keyword run, you 
    can do following:

    ```javascript
    key.injector(function(name, fn, args)) {
        var next = _.head(args);
        var keywordArgs = _.rest(args);

        console.log("Start keyword " + name);

        var afterEach = function(retVal) {
            console.log("End keyword " + name);
            next(retVal);
        }

    }
    ```
*/
key.injector = keyInjector;

// Injectors
key.webdriver = require('../injectors/webdriver');

// Testing only
key.__internal = {keywords: keywords};

module.exports = key;