"use strict";

var expect = require('expect.js');
var text = require('../formats/text');

describe('text format', function() {
  it('parses one simple keyword', function() {
    var content = [
      "Keyword Name",
      "First Key To Run",
      "Second Key To Run"
    ].join('\n');

    expect(text.decode(content)).to.be.eql({
      "Keyword Name": [
        "First Key To Run",
        "Second Key To Run"
      ]
    });
  });

  it('parses multiple simple keywords separated by one or more empty lines', function() {
    var content = [
      "First Keyword Name",
      "First Key To Run",
      "Second Key To Run",
      "",
      "Second Keyword Name",
      "First Key In Second Keyword",
      "Second Key In Second Keyword",
      "",
      "",
      "",
      "Third Keyword Name",
      "First Key In Third Keyword",
      "Second Key In Third Keyword"
    ].join('\n');

    expect(text.decode(content)).to.be.eql({
      "First Keyword Name": [
        "First Key To Run",
        "Second Key To Run"
      ],
      "Second Keyword Name": [
        "First Key In Second Keyword",
        "Second Key In Second Keyword"
      ],
      "Third Keyword Name": [
        "First Key In Third Keyword",
        "Second Key In Third Keyword"
      ]
    });
  });

  it('parses keywords with params, separated by tab or two or more spaces', function() {
    var content = [
      "First Keyword Name",
      "First Key To Run  first1     second1",
      "Second Key To Run\tfirst2\t\t\tsecond2",
    ].join('\n');

    expect(text.decode(content)).to.be.eql({
      "First Keyword Name": [
        "First Key To Run", ["first1", "second1"],
        "Second Key To Run", ["first2", "second2"]
      ]
    });
  });

  it('parses keywords with return value', function() {
    var content = [
      "First Keyword Name",
      "First Key To Run  => $var1",
      "Second Key To Run\t=> $var2",
      "Third Key To Run   \t   \t=> $var3",
    ].join('\n');

    expect(text.decode(content)).to.be.eql({
      "First Keyword Name": [
        "First Key To Run", "=> $var1",
        "Second Key To Run", "=> $var2",
        "Third Key To Run", "=> $var3"
      ]
    });
  });

  it('parses keywords with params and return value', function() {
    var content = [
      "First Keyword Name",
      "No Params No Return",
      "Only Params  param1\t\t  param2",
      "Only Return \t=> $var1",
      "Params And Return \tparam3  param4  => $var2"
    ].join('\n');

    expect(text.decode(content)).to.be.eql({
      "First Keyword Name": [
        "No Params No Return",
        "Only Params", ["param1", "param2"],
        "Only Return", "=> $var1",
        "Params And Return", ["param3", "param4"], "=> $var2"
      ]
    });
  });
});