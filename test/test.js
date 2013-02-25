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
  describe('#def()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isDef(["name", function() {}])).to.be.ok();
      expect(validators.isDef([["invalid"]])).to.not.be.ok();
      expect(validators.isDef([function() { /* invalid */}, "name"])).to.not.be.ok();
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
    })
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
    })
  });
  describe("#parseKeywordRunArgs", function() {
    it("returns object with parsed args", function() {
      var next = function() {};
      var arg1 = "arg1";
      var arg2 = "$var2";
      var keywordInfo = {name: "keyword"};
      var vars = {var2: 2};

      expect(helpers.parseKeywordRunArgs([next, keywordInfo, vars]))
        .to.eql({next: next, args: [], keywordInfo: keywordInfo, vars: vars});

      expect(helpers.parseKeywordRunArgs([next, arg1, arg2, keywordInfo, vars]))
        .to.eql({next: next, args: [arg1, arg2], keywordInfo: keywordInfo, vars: vars});
    });
  });
});