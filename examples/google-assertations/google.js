"use strict";

var key = require('../../lib/keyword');

// Define keywords
var suite = {

    /***** The main test case *****/
    "Test Google Search": [
        "Google Search For", ["keyword driven testing"], "=> $searchResult",
        "Equal (Node assert)", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
        "Equal (expect.js)", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
        "Equal (should.js)", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
        "Equal (chai assert)", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
        "Equal (chai expect)", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"],
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

    "Equal (Node assert)": function(next, driver, a, b) {
        console.log("Equal (Node assert): '" + a + "' and '" + b + "'");
        var assert = require('assert');
        assert(a === b);
        next();
    },
    "Equal (expect.js)": function(next, driver, a, b) {
        console.log("Equal (expect.js): '" + a + "' and '" + b + "'");
        var expect = require('expect.js');
        expect(a).to.be.eql(b);
        next();
    },
    "Equal (should.js)": function(next, driver, a, b) {
        console.log("Equal (should.js): '" + a + "' and '" + b + "'");
        var should = require('should');
        a.should.eql(b);
        next();
    },
    "Equal (chai assert)": function(next, driver, a, b) {
        console.log("Equal (chai assert): '" + a + "' and '" + b + "'");
        var assert = require('chai').assert;
        assert.equal(a, b);
        next();
    },
    "Equal (chai expect)": function(next, driver, a, b) {
        console.log("Equal (chai expect): '" + a + "' and '" + b + "'");
        var expect = require('chai').expect;
        expect(a).to.equal(b);
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

console.log("Running google example");

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n");
});