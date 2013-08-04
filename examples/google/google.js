"use strict";

var key = require('../../lib/keyword');
var assert = require('assert');

// Define keywords
var suite = {

    /***** The main test case *****/
    "Test Google Search": [
        "Google Search For", ["keyword driven testing"], "=> $searchResult",
        "Should Equal", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
        "Quit"
    ],

    /***** Define high-level keywords ******/
    "Google Search For": [
        "Go To Page", ["http://google.com"],
        "Fill Input By Name", ["q", "$1"],
        "Click Element By Name", ["btnG"],
        "Pick First Search Result", "=> $return"
    ],

    "Pick First Search Result": [
        "Get Text Content Of First Tag", ["h3"], "=> $return"
    ],

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

    "Should Equal": function(next, driver, a, b) {
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

// Inject webdriver
key.injector(key.webdriver);

console.log();

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n");
});