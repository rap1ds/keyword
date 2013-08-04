"use strict";

var expect = require("expect.js");
var key = require("../lib/keyword");
var _ = require("underscore");

describe('argument validations', function(){
  var validators = require("../lib/validators");
  describe('#isValidSuiteArgs()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isValidSuiteArgs([{}])).to.be.ok();
      expect(validators.isValidSuiteArgs([["invalid"]])).to.not.be.ok();
      expect(validators.isValidSuiteArgs([function() { /* invalid */}])).to.not.be.ok();
    });
  });
  describe.skip('#isValidKeywordSyntax()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isValidSuiteArgs([{}])).to.be.ok();
      expect(validators.isValidSuiteArgs([["invalid"]])).to.not.be.ok();
      expect(validators.isValidSuiteArgs([function() { /* invalid */}])).to.not.be.ok();
    });
  });
  describe('#isLib()', function(){
    it('should throw for illegal arguments', function(){
      expect(validators.isLib(["name", function() {}])).to.be.ok();
      expect(validators.isLib(["name", function() {}])).to.be.ok();
      expect(validators.isLib(["invalid"])).to.not.be.ok();
      expect(validators.isLib([function() { /* invalid */}, "name"])).to.not.be.ok();
    });
  });
  describe('#isSetOfLibs()', function(){
    it('should throw for illegal arguments', function() {
      expect(validators.isSetOfLibs(["name", function() {}])).to.not.be.ok();
      expect(validators.isSetOfLibs(["invalid"])).to.not.be.ok();
      expect(validators.isSetOfLibs([function() { /* invalid */}, "name"])).to.not.be.ok();
      expect(validators.isSetOfLibs([{}])).to.not.be.ok();
      expect(validators.isSetOfLibs([{"this is not": "valid set of libs"}])).to.not.be.ok();
      expect(validators.isSetOfLibs([{"Keyword": function() {}}])).to.be.ok();
    });
  });
  describe('#isRun()', function(){
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

  describe('#isSetOfKeywords()', function() {
      it("returns true if argument is a set of keywords, either high or low-level", function() {
        expect(validators.isSetOfKeywords({})).to.not.be.ok();
        expect(validators.isSetOfKeywords({"This is keywords name": "This is string in a wrong place"})).to.not.be.ok();
        
        expect(validators.isSetOfKeywords({"This is keyword": ["And this is sub key to run"]})).to.be.ok();
        expect(validators.isSetOfKeywords({"This is keyword": function keywordFn() {}})).to.be.ok();
        expect(validators.isSetOfKeywords({
          "This is high-level keyword": [
            "And this is sub key to run"
          ],
          "This is low-level keyword": function() {
            console.log("This is low-level");
          }
        })).to.be.ok();
    });
  });
});

describe('helpers', function() {
  var helpers = require("../lib/helpers");

  describe('#flip', function() {
    it('takes function and returns function where params are flipped', function() {
      function minus(a, b) {
        return a - b;
      }
      var flippedMinus = helpers.flip(minus);
      expect(flippedMinus(5, 2)).to.eql(-3);
    });
  });

  describe('#or', function() {
    it('takes two function and returns true if either or both returns true', function() {
      var stringOrArray = helpers.or(_.isString, _.isArray);

      expect(stringOrArray(1)).to.not.be.ok();
      expect(stringOrArray({})).to.not.be.ok();
      expect(stringOrArray(false)).to.not.be.ok();
      expect(stringOrArray("string")).to.be.ok();
      expect(stringOrArray(["array"])).to.be.ok();
    });
  });

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

describe.only('keyword', function() {
  describe('#lib', function() {
    it('takes name and function as parameters', function() {
      var fn = function() { return "This is return value"; };
      var name = "This is keyword";
      
      key(name, fn);

      expect(key.__internal.keywords[name]).to.be.a("function");
    });

    it('takes set of low-level keyword', function() {
      var firstFn = function() { return "first"; };
      var secondFn = function() { return "second"; };

      key({
        "First1": firstFn,
        "Second1": secondFn
      });

      expect(key.__internal.keywords["First1"]).to.be.a("function");
      expect(key.__internal.keywords["Second1"]).to.be.a("function");
    });

    it('takes set of high-level keyword', function() {

      key({
        "First2": ["First Sub Keyword", "Second Sub Keyword"],
        "Second2": ["First Second Sub Keyword", "Second Second Sub Keyword"]
      });

      expect(key.__internal.keywords["First2"]).to.be.a("function");
      expect(key.__internal.keywords["Second2"]).to.be.a("function");
    });

    it('takes a mix of low and high-level keywords', function() {
      key({
        "First3": function() {},
        "Second3": ["Sub keyword", "Another Sub keyword"],
        "Third3": function() {}
      });

      expect(key.__internal.keywords["First3"]).to.be.a("function");
      expect(key.__internal.keywords["Second3"]).to.be.a("function");
      expect(key.__internal.keywords["Third3"]).to.be.a("function");
    });
  });
  describe('#injector', function() {
    it('is called before low-level keyword run', function() {

      key("Injected key", function(next, injected) {
        expect(injected).to.eql("This was injected");
        next("This is the return value");
      });

      key.injector(function(name, fn, args) {
        var next = _.head(args);
        var rest = _.tail(args);
        var injected = "This was injected";
        var after = function(retVal) {
          expect(retVal).to.eql("This is the return value");
          next(retVal + " from the next");
        };

        fn.apply(null, [after].concat([injected]).concat(rest));
      });

      key.run("Injected key").then(function(retVal) {
        expect(retVal).to.eql("This is the return value from the next");
      });
    });
    it('works also with high-level keywords', function() {
      key({
        "Highlevel Injected key": [
          "Injected key", "=> $return"
        ]
      });

      key.run("Highlevel Injected key").then(function(retVal) {
        expect(retVal).to.eql("This is the return value from the next");
      });
    });
    it('does NOT inject anything on high-level keywords', function() {
      key({
        "Highlevel keyword With Param": [
          "Params Should Equal", ["$1", "$2"], "=> $return"
        ]
      });

      key("Params Should Equal", function(next, injected, firstParam, secondParam) {
        expect(injected).to.eql("This was injected");
        expect(firstParam).to.eql("Foo");
        expect(secondParam).to.eql("Bar");
      });

      key.run("Highlevel keyword With Param", ["Foo", "Bar"]).then(function(retVal) {
        expect(retVal).to.eql("This is the return value from the next joojoo");
      });
    });
  });
});