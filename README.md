# Keyword

A Keyword-driven testing library for node.

The library allows you to write low-level keywords that can be used for integration testing. By combining the low-level keywords, you can create new high-level keywords without writing any code. Low-level keyword maps to a JavaScript function, where as high-level keyword contains only other high or low-level keywords.

Let's write the first low-level keywords `Hello World`, which prints, "Hello World" and `How are you?` which prints "How are you?", obviously.

```javascript
// lowlevel-keywords.js

var lowlevelKeywords = {
    "Hello World": function(next) {
        console.log("Hello World");
        next();
    },
    "How are you?": function(next) {
        console.log("How are you?");
        next();
    }
};

module.exports = lowlevelKeywords;
```

Pretty simple stuff. Now, we can create a suite of high-level keywords.

Let's create our first high-level keyword `Greet the World`, which says hello and asks how it is going. High-level keywords can be are defined as plain JavaScript object.

```javascript
// highlevel-keywords.js

var highlevelKeywords = {
    "Greet the World": [
        "Hello World",
        "How are you?"
    ]
};

module.exports = highlevelKeywords;
```

Next, we want to run our keywords. Here's the code that runs the keyword `Greet the World`:

```javascript
// basic-example.js

// Require keyword library
var key = require('keyword');
var _ = require('underscore');

// Import keyword definitions
_.forEach(require('./lowlevel-keywords'), function(fn, name) {
    key(name, fn);
});
key.suite(require('./highlevel-keywords'));

key.run("Greet the World").then(function() {
    // All done.
});
```

Now we can run the example by typing

```bash
$ node basic-example.js
```

Output

```bash
> Hello World
> How are you?
```

[Click here to see the whole example](examples/basic-example)

## Getting Started

```javascript
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

var key = requre('keyword');
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
key.suite(suite);

console.log();

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n")
    session.then(function(driver) {
        driver.quit();
    })
});
```

## Documentation
_(Coming soon)_

## Examples

To run the example:

```shell
cd examples
npm install
node google.js
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Mikko Koski  
Licensed under the MIT license.
