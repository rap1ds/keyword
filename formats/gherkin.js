"use strict";

function decode(content) {
  var keywords = {};
  var featureName;
  var featureSteps = [];
  var firstScenario = true;
  var scenarioName;
  var scenarioSteps = [];
  var background = false;
  var backgroundSteps = [];

  var Lexer = require('gherkin').Lexer('en');

  var lexer = new Lexer({
    comment: function() {},
    tag: function() {},

    feature: function(keyword, name) {
      featureName = keyword + ': ' + name;
      featureSteps = [];
    },

    background: function() {
      background = true;
    },

    scenario: function(keyword, name) {
      if(!firstScenario) {
        if(scenarioSteps.length) {
          keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
          featureSteps.push(scenarioName);
        }
      }

      scenarioName = keyword + ': ' + name;
      scenarioSteps = [];

      firstScenario = false;
      background = false;
    },
    scenario_outline: function() {},
    examples: function() {},
    step: function(keyword, name) {
      if(background) {
        backgroundSteps.push(keyword + name);
      } else {
        scenarioSteps.push(keyword + name);
      }
    },
    doc_string: function() {},
    row: function() {},
    eof: function() {
      if(scenarioSteps.length) {
        keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
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