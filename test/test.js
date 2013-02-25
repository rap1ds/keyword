"use strict";

var expect = require("expect.js");
var key = require("../lib/keyword");

describe('argument validations', function(){
  describe('#suite()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isSuite([{}])).to.be.ok();
      expect(key.validation.isSuite([["invalid"]])).to.not.be.ok();
      expect(key.validation.isSuite([function() { /* invalid */}])).to.not.be.ok();
    });
  });
  describe('#def()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isDef(["name", function() {}])).to.be.ok();
      expect(key.validation.isDef([["invalid"]])).to.not.be.ok();
      expect(key.validation.isDef([function() { /* invalid */}, "name"])).to.not.be.ok();
    });
  });
  describe('#lib()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isLib(["name", function() {}])).to.be.ok();
      expect(key.validation.isLib(["name", function() {}])).to.be.ok();
      expect(key.validation.isLib(["invalid"])).to.not.be.ok();
      expect(key.validation.isLib([function() { /* invalid */}, "name"])).to.not.be.ok();
    });
  });
  describe('#run()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isRun(["Keyword Name Only"])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args"]])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args And Return"], "=> $return"])).to.be.ok();

      expect(key.validation.isRun(["Keyword Name Only", {}])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args"], {}])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args And Return"], "=> $return", {}])).to.be.ok();
      
      expect(key.validation.isRun(["One Key", "Two Keys"])).to.be.ok();
      expect(key.validation.isRun(["One Key", "=> $oneReturn", "Two Keys", "=> $twoReturn"])).to.be.ok();
      expect(key.validation.isRun(["One Key", ["One Args"], "Two Keys", ["Two Args"]])).to.be.ok();
      expect(key.validation.isRun([
        "One Key", ["One Args"], "=> $oneReturn", 
        "Two Keys", ["Two Args"], "=> $twoReturns"
        ])).to.be.ok();

      expect(key.validation.isRun(["Keyword Name Only", ["Args"], ["No args should be here"]])).to.not.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", "=> $oneReturn", "=> $noReturnHere"])).to.not.be.ok();
      expect(key.validation.isRun([["No Args Here"], "Keyword Name"])).to.not.be.ok();
      expect(key.validation.isRun(["=> $noReturnHere", "Keyword Name"])).to.not.be.ok();
    });
  });
  describe('#isReturn()', function() {
      it("returns true if argument is return statement", function() {
        expect(key.validation.isReturn("=> $return")).to.be.ok();
        expect(key.validation.isReturn("=> return")).to.not.be.ok();
        expect(key.validation.isReturn("=>")).to.not.be.ok();
        expect(key.validation.isReturn("Something else")).to.not.be.ok();
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
});