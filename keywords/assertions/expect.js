"use strict";
var _ = require('underscore');
var expect = require('expect.js');

function lowerCaseFirstLetter(string)
{
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function functionFromStr(root, str) {
    var xs = str.split(' ').map(lowerCaseFirstLetter);
    var context = _.initial(xs)
        .reduce(function(fn, fnName) {
            return fn[fnName]
        }, root);

    return {
        context: context || root, 
        fn: _.last(xs)
    }
}

var expectKeywords = {
    "/Expect (To .*)/": function(next) {
        var regexp = arguments[1];
        var regexpCapture = regexp[1];
        var expectArg = arguments[2];
        var restArgs = _.tail(arguments, 3);

        var assertation = expect(expectArg);
        var runnable = functionFromStr(assertation, regexpCapture);
        runnable.context[runnable.fn].apply(runnable.context, restArgs);
        next();
    },
    "/Expect (Not To .*)/": function(next) {
        var regexp = arguments[1];
        var regexpCapture = regexp[1];
        var expectArg = arguments[2];
        var restArgs = _.tail(arguments, 3);

        var assertation = expect(expectArg);
        var runnable = functionFromStr(assertation, regexpCapture);
        runnable.context[runnable.fn].apply(runnable.context, restArgs);
        next();
    },

    /*  With args is not in the newest NPM release */
    // "/Expect With Args (.*)/": function(next) {
    //     var regexp = arguments[1];
    //     var regexpCapture = regexp[1];
    //     var expectArg = arguments[2];
    //     var restArgs = _.tail(arguments, 3);
    //     var assertation = expect(expectArg);
    //     var withArgs = assertation.withArgs.apply(assertation, restArgs);
    //     var runnable = functionFromStr(withArgs, regexpCapture);
    //     runnable.context[runnable.fn].apply(runnable.context, restArgs);
    //     next();
    // },
    
    "/Expect Fail/": function(next) {
        var regexp = arguments[1];
        var regexpCapture = regexp[1];
        var restArgs = _.tail(arguments, 3);
        
        var assertation = expect();
        assertation.fail.apply(assertation, restArgs);
        next();
    },
};

module.exports = expectKeywords;