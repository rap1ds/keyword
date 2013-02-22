// Define your keywords and test cases in JSON format

var suite = {

    /***** The main test case *****/
    "Test Google Search": [
        "Google Search For", ["keyword driven testing"], "=> $searchResult",
        "Should Equal", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"]
    ],

    /***** Define keywords ******/
    "Google Search For": [
        "Go To Page", ["http://google.com"],
        "Fill Input By Name", ["q", "$1"],
        "Click Element By Name", ["btnG"],
        "Pick First Search Result", "=> $return"
    ],

    "Pick First Search Result": [
        "Get Text Content Of First Tag", ["h3"], "=> $return"
    ]
}

// Implement your low-level keywords

// This example uses WebDriver and PhantomJS
var webdriver = require('selenium-node-webdriver');

// You should use this:
// var key = requre('keyword');
var key = require('../lib/keyword');
var assert = require('assert');

var session = webdriver();

key("Go To Page", function(next, url) {
    session.then(function(driver) {
        console.log("Going to", url);
        return driver.get(url);
    }).done(next);
});

key("Fill Input By Name", function(next, elementName, text) {
    session.then(function(driver) {
        return driver.
            findElement(driver.webdriver.By.name(elementName)).
            sendKeys(text);
    }).done(next);
});

key("Click Element By Name", function(next, elementName) {
    session.then(function(driver) {
        return driver.
            findElement(driver.webdriver.By.name(elementName)).click();
    }).done(next);
});

key("Get Text Content Of First Tag", function(next, elementTagName) {
    session.then(function(driver) {
        return driver.executeScript(function(tag) {
            // This script is run in browser context
            return document.querySelector('h3.r').textContent;
        }, elementTagName)
        .then(function(firstHit) {
            console.log("The first Google hit:", firstHit);
            return firstHit;
        });
    }).done(next);
});

key("Should Equal", function(next, a, b) {
    console.log("Should Equal: '" + a + "' and '" + b + "'");
    assert(a === b);
    next();
});

// Load the keywords
debugger;
key.suite(suite);

console.log();

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n")
    session.then(function(driver) {
        driver.quit();
    })
});