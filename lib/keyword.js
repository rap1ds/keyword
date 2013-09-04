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
var helpers = require('./helpers');
var pat = require('patjs');

var keywords = {};
var defaultInjector = function(name, args, run) {
    run();
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
        var args = arguments;
        injector(name, args, function(injectedParams) {
            helpers.injectParams(fn, args, injectedParams);
        });
    };
}

/**
    Takes keywords to run as arguments. The last arguments may
    optionally be the object of passed args

    Example:
    "Keyword1", "Keyword2", ["args for key2", $1], "=> $returnVariable", {args: ["jee"]}
*/
var keyRun = pat()
    .caseof(pat.all(validators.isRun), function(keywordsToRun) {
        return runner.run(keywordsToRun, keywords);
    })
    .otherwise(function() {
        console.error("Illegal arguments to run(keywordName, [\"arguments\", \"=> $returnVariable\"])");
        console.error("run(keywordName, [\"arguments\", \"=> $returnVariable\"]) takes a serie of " +
            "keyword, arguments, return variable compinations, nothing else.");
        throw new Error("Illegal arguments to run() " + JSON.stringify(_.toArray(arguments)));
    });

var keyLib = pat()
    .caseof(Object, function(keywords) {
        _.forEach(keywords, function(keywordDefinition, name) {
            keyLib(name, keywordDefinition);
        });
    })
    .caseof(validators.isKeywordName, _.isFunction, function(name, fn) {
        libKeyword(fn, name);
    })
    .caseof(validators.isKeywordName, validators.isRun, function(name, keywordDefinition) {
        suiteKeyword(keywordDefinition, name);
    })
    .otherwise(function() {
        console.error("Illegal arguments to lib(keywordName, definitionFn)");
        console.error("lib(keywordName, definitionFn) takes keyword name as the first argument " +
            "and definition function as second argument, nothing else.");
        console.error("Illegal arguments to lib(keywords)");
        console.error("lib(keywords) object of keyword names and function, nothing else.");
        throw new Error("Illegal arguments to lib() " + JSON.stringify(_.toArray(arguments)));
    });

function keyInjector(injectorFn) {
    injector = injectorFn;
}

var key = keyLib;
key.lib = keyLib;
key.run = keyRun;

/**
    # Injector

    Injector function is called before each keyword call.

    It can be used for example to inject webdriver to each keyword

    Three params are passed to the injector:
    - name of the keyword
    - arguments to the keyword (notice, that the first argument is the `next` function)
    - callback, which takes an object of injected params

    ## Usage:

    If you can to pass a `reporter` to each keyword, do this:

    ```javascript
    key.injector(function(name, args, inject)) {
        var reported = require('cool-reports');
        
        reporter.initialize().done(function(reporterInstance) {
            inject({reporter: reporterInstance});
        }
    }
    ```
*/
key.injector = keyInjector;

// Injectors
key.defaultInjector = defaultInjector;
key.webdriver = require('../injectors/webdriver');

// Formats
key.formats = {};
key.formats.text = require('../formats/text');

// Testing only
key.__internal = {keywords: keywords};

module.exports = key;