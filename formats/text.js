"use strict";

var _ = require('underscore');
var helpers = require('../lib/helpers');
var validators = require('../lib/validators');

var not = helpers.not;

function trimLines(line) {
    return line.trim();
}

function splitByEmptyLines(a, b) {
    if(b === "") {
        a.push([]);
    } else {
        _.last(a).push(b);
    }
    return a;
}

function parseParams(keys) {
    return _(keys).chain()
        .map(function(key) {
            var parts = key.split(/\s\s+|\t\s?/);
            var head = _.head(parts);
            var tail = _.tail(parts);
            var last = _.last(parts);
            var isReturn = validators.isReturn(last);
            var params = isReturn ? _.initial(tail) : tail;

            var result = [head];

            if(params.length) {
                result.push(params);
            }

            if(isReturn) {
                result.push(last);
            }

            return result;
        })
        .flatten(true)
        .value();
}

function createMap(a, b) {
    var name = _.head(b);
    var keys = _.tail(b);
    a[name] = parseParams(keys);

    return a;
}

function decode(content) {
    var keys = _(content.split('\n'))
        .chain()
        .map(trimLines)
        .reduce(splitByEmptyLines, [[]])
        .filter(not(_.isEmpty))
        .reduce(createMap, {})
        .value();

    return keys;
}

function indent(num, char) {
    return function(text) {
        var indentation = _.range(num).map(function() { return char; }).join('');
        return indentation + text;
    };
}

function groupKeys(keys) {
    var groupped = keys.reduce(function(memo, keywordPart) {
        if(_.isArray(keywordPart) || validators.isReturn(keywordPart)) {
            _.last(memo).push(keywordPart);
        } else {
            memo.push([keywordPart]);
        }

        return memo;
    }, []);

    return groupped;
}

var ind = indent(4, ' ');

function keyToString(keyParts) {
    return ind(_.flatten(keyParts).join('  '));
}

function keysToString(allKeyParts) {
    return groupKeys(allKeyParts)
        .map(keyToString).join('\n');
}

function encode(keys) {

    return _(keys).chain()
        .map(function(keywords, name) {
            return [
                name,
                keysToString(keywords)
            ].join('\n');
        })
        .value()
        .join('\n\n');
}

module.exports = {
    decode: decode,
    encode: encode
};