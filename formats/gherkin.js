"use strict";

function decode(content) {
  var keywords = {};
  var featureName;
  var featureSteps = [];
  var firstScenario = true;
  var scenarioName;
  var scenarioSteps = [];

  var Lexer = require('gherkin').Lexer('en');

  var lexer = new Lexer({
    comment: function() {},
    tag: function() {},

    feature: function(keyword, name) {
      featureName = keyword + ': ' + name;
      featureSteps = [];
    },

    background: function() {},

    scenario: function(keyword, name) {
      if(!firstScenario) {
        if(scenarioSteps.length) {
          keywords[scenarioName] = scenarioSteps;
          featureSteps.push(scenarioName);
        }
      }

      scenarioName = keyword + ': ' + name;
      scenarioSteps = [];

      firstScenario = false;
    },
    scenario_outline: function() {},
    examples: function() {},
    step: function(keyword, name) {
      scenarioSteps.push(keyword + name);
    },
    doc_string: function() {},
    row: function() {},
    eof: function() {
      if(scenarioSteps.length) {
        keywords[scenarioName] = scenarioSteps;
      }
      featureSteps.push(scenarioName);

      keywords[featureName] = featureSteps;
    }
  });

  lexer.scan(content);

  return keywords;
}

module.exports = {
  decode: decode
};