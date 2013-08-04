# Keyword.js

A Keyword-driven testing library for node.

The library allows you to write low-level keywords that can be used for integration testing. By combining the low-level keywords, you can create new high-level keywords without any actual coding. Low-level keyword maps to a JavaScript function, where as high-level keyword contains only other high or low-level keywords.

## Hello World example

Let's write the first low-level keywords `Hello World`, which prints "Hello World" and `How are you?` which prints "How are you?", obviously.

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

Pretty simple stuff.

Let's create our first high-level keyword `Greet the World`, which says hello and asks how is it going.

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

The syntax is following: 
* Keywords are defined as a map (plain JavaScript object) of keyword name and a function (for low-level keywords) or an array of keywords to run (for high-level keywords)

Next, we want to run our keywords. Here's the code that runs the keyword `Greet the World`:

```javascript
// basic.js

// Require keyword library
var key = require('keyword');

// Import keyword definitions
key(require('./lowlevel-keywords'));
key(require('./highlevel-keywords'));

key.run("Greet the World").then(function() {
    // All done.
});
```

Now we can run the example by typing

```bash
$ node basic.js
```

Output

```bash
> Hello World
> How are you?
```

[Click here to see the whole example](examples/basic)

## Keywords with params and return values

In the basic example, all the keyword were static. They didn't take any parameter nor did they return anything.

Both, low-level and high-level keywords can take parameters and return values.

Let's define three low-level keyword: 

* `Print` takes `message` as a parameter and prints it to the console log. 
* `Hello` takes `name` and returns a string saying "Hello" and the name of the person.
* `Join` takes two strings and joins them into one string, separated by a newline

```javascript
// lowlevel-keywords.js

var lowlevelKeywords = {
    "Print": function(next, message) {
        console.log(message);
        next();
    },
    "Hello": function(next, name) {
        var returnValue = "Hello " + name;
        next(returnValue);
    },
    "Join": function(next, str1, str2) {
        var returnValue = [str1, str2].join("\n");
        next(returnValue);
    }
};

module.exports = lowlevelKeywords;
```

Alright! Our low-level keywords look a lot more general compared to the keywords in the basic example!

Now let's create some high-level keywords that give parameters to the low-level keywords and return something themselves. `Greet Mikko` generates a greeting message for `Mikko`.

```javascript
// high-level-keywords.js

var highlevelKeywords = {
    "Create a greeting": [
        "Hello", ["$1"], "=> $helloMikko",
        "Join", ["$helloMikko", "How are you?"], "=> $return"
    ],
    "Greet Mikko": [
        "Create a greeting", ["Mikko"], "=> $greeting",
        "Print", "$greeting"
    ]
};

module.exports = highlevelKeywords;
```

The syntax is following: 
* Parameters are in an array
* Parameter value can be either a variable or a primitive, like a number or string
* `$1` stands for the first parameter of the high-level keyword
* The name of the variable where the return value is saved is a string, that starts with a fat arrow `=>` following by a variable name
* Variable names always start with dollar sign `$`

And then the `runner.js` file, which is mostly the same as in the previous example.

```javascript
// keywords-with-parameters.js

// Require keyword library
var key = require('keyword');

// Import keyword definitions
key(require('./lowlevel-keywords'));
key(require('./highlevel-keywords'));

key.run("Greet Mikko").then(function() {
    // All done.
});
```

Now we can run the example by typing

```bash
$ node keywords-with-parameters.js
```

Output

```bash
> Hello Mikko
> How are you?
```

[Click here to see the whole example](examples/keywords-with-parameters)

## How does this relate to testing??

Ok, now you've seen how to define and use keywords, but I bet you're eager to know how does this make integration testing awesome!

Web application integration testing is usually done by treating the application as a black box which you interact through a browser. The test cases contain a lot of repeating tasks, such as clicking an element or filling in a form, etc. Keyword.js lets you define these repeating tasks as a general purpose low-level keywords, such as `Click`, `Fill Input`, `Navigate To URL`, etc.

Imaging you're testing an application which has users and the users are able to send messages to each other. Your task is to test sending message from a user Jane to user David.

First thing you have to do is to login as a Jane. This can be done by navigation to the login page (using `Navigate To URL`). Then you have to fill in user credentials (using `Fill Input`) and click login button (`Click`). You can combine all these and create a new high-level keyword, `Login as`, which takes user name as a parameter.

After that you'll do the messaging stuff, but then you need to assert that David really got the message. So how would you do that? Well, you can use the `Login as` keyword to login with David's account and see if the message arrived!

I bet you can already see the point of keywords. By defining general purpose low-level keywords, you can easily combine them and create complex high-level keywords that will make your integration testing awesome!

## How to interact with the browser?

The library doesn't care how you interact with the browser and what is the browser you're using. You can use for example [Zombie](http://zombie.labnotes.org/), but my favorite is [PhantomJS](http://phantomjs.org/) via [Selenium Node WebDriver](https://github.com/WaterfallEngineering/selenium-node-webdriver).

If you need to use a 'real' browser (Chrome, Firefox, IE, etc.) [WD.js](https://github.com/admc/wd) might help you. Haven't tried it, though.

See the [Google search without injector](examples/google-without-injector) below for PhantomJS via WebDriver example.

To run the example, you have to have PhantomJS running with WebDriver on port 4444. To do this, install PhantomJS and type

```bash
$ phantomjs --webdriver=4444 &
```

```javascript
var key = require('keyword');
var assert = require('assert');
// This example uses WebDriver and PhantomJS
var webdriver = require('selenium-node-webdriver');
var session = webdriver();

// Define keywords
var suite = {

    /***** The main test case *****/
    "Test Google Search": [
        "Google Search For", ["keyword driven testing"], "=> $searchResult",
        "Should Equal", ["$searchResult", "Keyword-driven testing - Wikipedia, the free encyclopedia"]
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
    "Go To Page": function(next, url) {
        session.then(function(driver) {
            console.log("Going to", url);
            return driver.get(url);
        }).done(next);
    },

    "Fill Input By Name": function(next, elementName, text) {
        session.then(function(driver) {
            return driver.
                findElement(driver.webdriver.By.name(elementName)).
                sendKeys(text);
        }).done(next);
    },

    "Click Element By Name": function(next, elementName) {
        session.then(function(driver) {
            return driver.
                findElement(driver.webdriver.By.name(elementName)).click();
        }).done(next);
    },

    "Get Text Content Of First Tag": function(next, elementTagName) {
        session.then(function(driver) {
            return driver.executeScript(function(tag) {
                // This script is run in browser context
                return document.querySelector(tag).textContent;
            }, elementTagName)
            .then(function(firstHit) {
                console.log("The first Google hit:", firstHit);
                return firstHit;
            });
        }).done(next);
    },

    "Should Equal": function(next, a, b) {
        console.log("Should Equal: '" + a + "' and '" + b + "'");
        assert(a === b);
        next();
    }
};

// Load the keywords
key(suite);

console.log();

// Run the keyword
key.run("Test Google Search").then(function() {
    console.log("\nDone.\n");
    session.then(function(driver) {
        driver.quit();
    });
});
```

## Cleaner code with injector

As you can see from the above example, hooking up a WebDriver session brings in some bloat code to each keyword. To get rid of the bloat, injector comes to help.

An injector is a function, that can execute before and after each keyword execution. Injector is also able to inject new parameters to the low-level keyword function.

Here's the Google example with a WebDriver injector. As you can see, the injector adds a `driver` parameter to each keyword.

```javascript
var key = require('keyword');
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
        driver.executeScript(function(tag) {
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
```

## Examples

[Basic example:](examples/basic)

```bash
cd examples/basic
npm install
node basic.js
```

[Keywords with parameters example:](examples/keywords-with-parameters)

```bash
cd examples/keywords-with-parameters
npm install
node keywords-with-parameters.js
```

[Google example (without injector):](examples/google-without-injector)

```bash
cd examples/google
npm install
phantomjs --webdriver=4444 &
node google.js
```

[Google example:](examples/google)

```bash
cd examples/google
npm install
phantomjs --webdriver=4444 &
node google.js
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Inspiration

* [Robot Framework](https://code.google.com/p/robotframework/)
* [PhantomRobot](https://github.com/datakurre/phantomrobot)
* [RoboZombie](https://github.com/mkorpela/RoboZombie)

## License
Copyright (c) 2013 Mikko Koski  
Licensed under the MIT license.
