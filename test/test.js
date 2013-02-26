"use strict";

var expect = require("expect.js");
var key = require("../lib/keyword");

describe('argument validations', function(){
  var validators = require("../lib/validators");
  describe('#suite()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isSuite([{}])).to.be.ok();
      expect(validators.isSuite([["invalid"]])).to.not.be.ok();
      expect(validators.isSuite([function() { /* invalid */}])).to.not.be.ok();
    });
  });
  describe('#lib()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isLib(["name", function() {}])).to.be.ok();
      expect(validators.isLib(["name", function() {}])).to.be.ok();
      expect(validators.isLib(["invalid"])).to.not.be.ok();
      expect(validators.isLib([function() { /* invalid */}, "name"])).to.not.be.ok();
    });
  });
  describe('#run()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isRun(["Keyword Name Only"])).to.be.ok();
      expect(validators.isRun(["Keyword Name Only", ["And Args"]])).to.be.ok();
      expect(validators.isRun(["Keyword Name Only", ["And Args And Return"], "=> $return"])).to.be.ok();

      expect(validators.isRun(["Keyword Name Only", {}])).to.be.ok();
      expect(validators.isRun(["Keyword Name Only", ["And Args"], {}])).to.be.ok();
      expect(validators.isRun(["Keyword Name Only", ["And Args And Return"], "=> $return", {}])).to.be.ok();
      
      expect(validators.isRun(["One Key", "Two Keys"])).to.be.ok();
      expect(validators.isRun(["One Key", "=> $oneReturn", "Two Keys", "=> $twoReturn"])).to.be.ok();
      expect(validators.isRun(["One Key", ["One Args"], "Two Keys", ["Two Args"]])).to.be.ok();
      expect(validators.isRun([
        "One Key", ["One Args"], "=> $oneReturn", 
        "Two Keys", ["Two Args"], "=> $twoReturns"
        ])).to.be.ok();

      expect(validators.isRun(["Keyword Name Only", ["Args"], ["No args should be here"]])).to.not.be.ok();
      expect(validators.isRun(["Keyword Name Only", "=> $oneReturn", "=> $noReturnHere"])).to.not.be.ok();
      expect(validators.isRun([["No Args Here"], "Keyword Name"])).to.not.be.ok();
      expect(validators.isRun(["=> $noReturnHere", "Keyword Name"])).to.not.be.ok();
    });
  });
  describe('#isReturn()', function() {
      it("returns true if argument is return statement", function() {
        expect(validators.isReturn("=> $return")).to.be.ok();
        expect(validators.isReturn("=> return")).to.not.be.ok();
        expect(validators.isReturn("=>")).to.not.be.ok();
        expect(validators.isReturn("Something else")).to.not.be.ok();
    });
  });
});

describe('helpers', function() {
  var helpers = require("../lib/helpers");

  describe('#isPlainObject', function() {
    it("returns true, if argument is plain object", function() {
      expect(helpers.isPlainObject({})).to.be.ok();
      expect(helpers.isPlainObject([])).not.to.be.ok();
      expect(helpers.isPlainObject(function() {})).not.to.be.ok();
      expect(helpers.isPlainObject(false)).not.to.be.ok();
      expect(helpers.isPlainObject("string")).not.to.be.ok();
      expect(helpers.isPlainObject(100)).not.to.be.ok();
    });
  });
  describe('#splitBy', function() {
    it("splits array, if condition is true", function() {
      expect(helpers.splitBy([false, false, true, false, false, false, true, false], function(val) {
        return val === true;
      })).to.eql([[false, false], [true, false, false, false], [true, false]]);

      expect(helpers.splitBy([1, 2, 3, 4, 5, 6], function(val) {
        return val % 2 === 0;
      })).to.eql([[1], [2, 3], [4, 5], [6]]);
    });
  });
  describe("#pickReturnVar", function() {
    it("return variable name", function() {
      expect(helpers.pickReturnVar("=> $returnMe")).to.be("returnMe");
    });
  });
  describe("#replaceArgPlaceholders", function() {
    it("returns array where variable names have been replaced with values", function() {
      var vars = helpers.localVars();
      vars.set("var1", "foo");
      vars.set("var2", "bar");
      vars.set("var3", undefined);


      expect(helpers.replaceArgPlaceholders([])).to.eql([]);
      expect(helpers.replaceArgPlaceholders([1])).to.eql([1]);
      expect(helpers.replaceArgPlaceholders([1, 2, "$var1", "$var2"], vars)).to.eql([1, 2, "foo", "bar"]);
      expect(helpers.replaceArgPlaceholders([1, 2, "$var1", "$var2", "$var3"], vars)).to.eql([1, 2, "foo", "bar", undefined]);
      expect(helpers.replaceArgPlaceholders.bind(null, [1, 2, "$var1", "$var2", "$var3", "$var4"], vars)).to.throwError();
    });
  });
  describe("#createKeywords", function() {
    it("takes arguments passed to `key.def` and return keyword objects", function() {
      var defArgs = [
        "Keyword1",
        "Keyword2", ["some arguments 1"],
        "Keyword3", ["some arguments 2"], "=> $returnVariable",
        "Keyword4", ["some arguments 3"],
        "Keyword5"
      ];

      expect(helpers.createKeywords(defArgs)).to.eql([
        {"name": "Keyword1"},
        {"name": "Keyword2", "args": ["some arguments 1"]},
        {"name": "Keyword3", "args": ["some arguments 2"], "returnVar": "returnVariable"},
        {"name": "Keyword4", "args": ["some arguments 3"]},
        {"name": "Keyword5"}
      ]);
    });
  });
  describe("#createLocalEnv", function() {
    it("creates new local value and sets the passed arguments to $1, $2, etc", function() {
      var localVars = helpers.createLocalEnv(["value1", "another", 50, true]);
      expect(localVars.get("1")).to.eql("value1");
      expect(localVars.get("2")).to.eql("another");
      expect(localVars.get("3")).to.eql(50);
      expect(localVars.get("4")).to.eql(true);
    });
  });
});