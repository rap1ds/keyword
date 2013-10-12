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
  var scenarioOutline = false;
  var scenarioOutlineSteps = [];
  var examples = [];

  var Lexer = require('gherkin').Lexer('en');

  var lexer = new Lexer({
    comment: function() {},
    tag: function() {},

    feature: function(keyword, name) {
      featureName = keyword + ': ' + name;
      featureSteps = [];
      backgroundSteps = [];
    },

    background: function() {
      background = true;
    },

    scenario: function(keyword, name) {
      if(!firstScenario) {
        if(scenarioOutline && scenarioSteps.length) {
          // TODO !!!
          keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
          featureSteps.push(scenarioName);
        } else {
          keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
          featureSteps.push(scenarioName);
        }
      }

      scenarioName = keyword + ': ' + name;
      scenarioSteps = [];

      firstScenario = false;
      background = false;
      scenarioOutline = false;
    },
    scenario_outline: function(keyword, name) {
      if(!firstScenario) {
        if(scenarioOutline && scenarioSteps.length) {
          // TODO!!!
          keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
          featureSteps.push(scenarioName);
        } else {
          keywords[scenarioName] = backgroundSteps.concat(scenarioSteps);
          featureSteps.push(scenarioName);
        }
      }

      scenarioName = keyword + ': ' + name;
      scenarioSteps = [];

      firstScenario = false;
      background = false;
      scenarioOutline = true;
    },
    examples: function(keyword, name) {
      examples = [];
    },
    step: function(keyword, name) {
      if(background) {
        backgroundSteps.push(keyword + name);
      } else {
        scenarioSteps.push(keyword + name);
      }
    },
    doc_string: function() {},
    row: function(row) {
      examples.push(row);
    },
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