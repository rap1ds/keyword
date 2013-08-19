"use strict";

var key = require('../../lib/keyword');
var assert = require('assert');
var fs = require('fs');

// Define keywords
var suite = {

    /***** Define low-level keywords ******/
    "Go To Page": function(next, driver, url) {
        console.log("Going to", url);
        driver
        .get(url)
        .then(next);
    },

    "Fill Input By Name": function(next, driver, elementName, text) {
        driver
        .findElement(driver.webdriver.By.name(elementName))
        .sendKeys(text)
        .then(next);
    },

    "Click Element By Name": function(next, driver, elementName) {
        driver
        .findElement(driver.webdriver.By.name(elementName))
        .click()
        .then(next);
    },

    "Get Text Content Of First Tag": function(next, driver, elementTagName) {
        driver
        .executeScript(function(tag) {
                // This script is run in browser context
                return document.querySelector(tag).textContent;
            }, elementTagName)
        .then(function(firstHit) {
            console.log("The first Google hit:", firstHit);
            return firstHit;
        })
        .then(next);
    },

    "Should Equal": function(next, a, b) {
        console.log("Should Equal: '" + a + "' and '" + b + "'");
        assert(a === b);
        next();
    },
    "Quit": function(next, driver) {
        driver.quit().then(next);
    }
};

// Load the keywords
key(suite);

// Load text suite
var file = fs.readFileSync('suite.txt', 'utf8');
key(key.formats.text.decode(file));

// Inject webdriver
key.injector(key.webdriver);

console.log();

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n");
});