var expect = require("expect.js");
var key = require("../lib/keyword");

describe('argument validations', function(){
  describe('#suite()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isSuite([{}])).to.be.ok();
      expect(key.validation.isSuite([["invalid"]])).to.not.be.ok();
      expect(key.validation.isSuite([function() { /* invalid */}])).to.not.be.ok();
    })
  });
  describe('#def()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isDef(["name", function() {}])).to.be.ok();
      expect(key.validation.isDef([["invalid"]])).to.not.be.ok();
      expect(key.validation.isDef([function() { /* invalid */}, "name"])).to.not.be.ok();
    })
  });
  describe('#lib()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isLib(["name", function() {}, true])).to.be.ok();
      expect(key.validation.isLib(["invalid"])).to.not.be.ok();
      expect(key.validation.isLib([function() { /* invalid */}, "name"])).to.not.be.ok();
    })
  });
  describe.skip('#run()', function(){
    it('should throw for illegal arguments', function(){
      expect(key.validation.isRun(["Keyword Name Only"])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args"]])).to.be.ok();
      expect(key.validation.isRun(["Keyword Name Only", ["And Args And Return"], "=> $return"])).to.be.ok();
      
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
    })
  });
  describe('#isReturn()', function() {
    expect(key.validation.isReturn("=> $return")).to.be.ok();
    expect(key.validation.isReturn("=> return")).to.not.be.ok();
    expect(key.validation.isReturn("=>")).to.not.be.ok();
    expect(key.validation.isReturn("Something else")).to.not.be.ok();
  });
});

describe('helpers', function() {
  describe('#isPlainObject', function() {
    expect(key.helpers.isPlainObject({})).to.be.ok();
    expect(key.helpers.isPlainObject([])).not.to.be.ok();
    expect(key.helpers.isPlainObject(function() {})).not.to.be.ok();
    expect(key.helpers.isPlainObject(false)).not.to.be.ok();
    expect(key.helpers.isPlainObject("string")).not.to.be.ok();
    expect(key.helpers.isPlainObject(100)).not.to.be.ok();
  });
  describe('#splitBy', function() {
    expect(key.helpers.splitBy([false, false, true, false, false, false, true, false], function(val) {
      return val === true;
    })).to.eql([[false, false], [true, false, false, false], [true, false]]);

    expect(key.helpers.splitBy([1, 2, 3, 4, 5, 6], function(val) {
      return val % 2 === 0;
    })).to.eql([[1], [2, 3], [4, 5], [6]]);
  });
})