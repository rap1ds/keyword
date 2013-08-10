"use strict";

var expect = require("expect.js");
var key = require("../lib/keyword");
var _ = require("underscore");

describe('webdriver injector', function() {
  beforeEach(function() {
    key.injector(key.webdriver);
  });

  it('injects the driver', function(done) {
    key('Keyword with driver', function(next, driver) {
      next(driver);
    });

    key.run('Keyword with driver').then(function(driver) {
      expect(driver).to.not.be(undefined);
      // expect(driver.webdriver).to.not.be(undefined);
      done();
    });
  });
});