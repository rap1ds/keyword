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
    it('supports background', function() {
      var feature = [
      'Feature: Multiple site support',
      'As a Mephisto site owner',
      'I want to host blogs for different people',
      'In order to make gigantic piles of money',
      '',
      'Background:',
      '  Given a global administrator named "Greg"',
      '  And a blog named "Greg\'s anti-tax rants"',
      '  And a customer named "Dr. Bill"',
      '  And a blog named "Expensive Therapy" owned by "Dr. Bill"',
      '',
      'Scenario: Dr. Bill posts to his own blog',
      '  Given I am logged in as Dr. Bill',
      '  When I try to post to "Expensive Therapy"',
      '  Then I should see "Your article was published."',
      '',
      'Scenario: Dr. Bill tries to post to somebody else\'s blog, and fails',
      '  Given I am logged in as Dr. Bill',
      '  When I try to post to "Greg\'s anti-tax rants"',
      '  Then I should see "Hey! That\'s not your blog!"',
      '',
      'Scenario: Greg posts to a client\'s blog',
      '  Given I am logged in as Greg',
      '  When I try to post to "Expensive Therapy"',
      '  Then I should see "Your article was published."'
      ].join('\n');

      expect(gherkin.decode(feature)).to.be.eql({
        'Feature: Multiple site support': [
          'Scenario: Dr. Bill posts to his own blog',
          'Scenario: Dr. Bill tries to post to somebody else\'s blog, and fails',
          'Scenario: Greg posts to a client\'s blog'
        ],
        'Scenario: Dr. Bill posts to his own blog': [
          'Given a global administrator named "Greg"',
          'And a blog named "Greg\'s anti-tax rants"',
          'And a customer named "Dr. Bill"',
          'And a blog named "Expensive Therapy" owned by "Dr. Bill"',
          'Given I am logged in as Dr. Bill',
          'When I try to post to "Expensive Therapy"',
          'Then I should see "Your article was published."',
        ],
        'Scenario: Dr. Bill tries to post to somebody else\'s blog, and fails': [
          'Given a global administrator named "Greg"',
          'And a blog named "Greg\'s anti-tax rants"',
          'And a customer named "Dr. Bill"',
          'And a blog named "Expensive Therapy" owned by "Dr. Bill"',
          'Given I am logged in as Dr. Bill',
          'When I try to post to "Greg\'s anti-tax rants"',
          'Then I should see "Hey! That\'s not your blog!"',
        ],
        'Scenario: Greg posts to a client\'s blog': [
          'Given a global administrator named "Greg"',
          'And a blog named "Greg\'s anti-tax rants"',
          'And a customer named "Dr. Bill"',
          'And a blog named "Expensive Therapy" owned by "Dr. Bill"',
          'Given I am logged in as Greg',
          'When I try to post to "Expensive Therapy"',
          'Then I should see "Your article was published."'
        ]
      });
    });
    it('supports scenario outlines', function(){
      var feature = [
      "Feature: Scenario Outline",
      "",
      "Scenario Outline: eating",
      "  Given there are <start> cucumbers",
      "  When I eat <eat> cucumbers",
      "  Then I should have <left> cucumbers",
      "",
      "  Examples:",
      "    | start | eat | left |",
      "    |  12   |  5  |  7   |",
      "    |  20   |  5  |  15  |"
      ].join('\n');

      expect(gherkin.decode(feature)).to.be.eql({
        "Scenario Outline: eating": [
          "Given there are 12 cucumbers",
          "When I eat 5 cucumbers",
          "Then I should have 7 cucumbers",
          "Given there are 20 cucumbers",
          "When I eat 5 cucumbers",
          "Then I should have 15 cucumbers",
        ]
      });
    });
  });
});