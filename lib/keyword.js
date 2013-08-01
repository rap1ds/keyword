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
        var args = _.rest(arguments);
        runner.run(keywordsToRun, keywords, args).then(next);
    };
    return wrapper;
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

function lib(name, fn) {
    keywords[name] = fn;
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
        return lib(args[0], args[1]);
    }

    else if(validators.isSetOfLibs(args)) {
        _.forEach(args[0], helpers.flip(lib));
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

var key = keyLib;
key.lib = keyLib;
key.run = keyRun;
key.suite = keySuite;

// Testing only
key.__internal = {keywords: keywords};

module.exports = key;