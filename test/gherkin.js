"use strict";

var expect = require('expect.js');
var gherkin = require('../formats/gherkin');

describe('gherkin format', function() {
  describe('#decode', function() {
    it('decode simple gherkin example', function() {
      var feature = [
          "Feature: Logging in",
          "  So that I can be myself",
          "  # Comment",
          "  Scenario: Anonymous user can get a login form.",
          "    Given this and that",
          "",
          "  @tag",
          "  Scenario: Another one",
          "    Given this and also the other thing",
          "",
          "  Scenario: No steps here (assume scenario is defined elsewhere)"
        ].join('\n');

      expect(gherkin.decode(feature)).to.be.eql({
        "Feature: Logging in": [
          "Scenario: Anonymous user can get a login form.",
          "Scenario: Another one",
          "Scenario: No steps here (assume scenario is defined elsewhere)"
        ],
        "Scenario: Anonymous user can get a login form.": [
          "Given this and that"
        ],
        "Scenario: Another one": [
          "Given this and also the other thing"
        ]
      });
    });
  });
});