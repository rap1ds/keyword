"use strict";

var webdriver = require('selenium-node-webdriver');
var _ = require('underscore');

var session = webdriver();

/**
    Injected `driver` to the `key` function.

    Usage:

    To define a keyword that uses webdriver:

    ```javascript
    
    key.injector(key.webdriverInjector);

    key("Click", function(next, driver, selector) {
        driver
            .findElement(driver.webdriver.By.name(elementName))
            .click()
            .done(next);
    });
    ```
*/
function webdriverInjector(name, fn, args) {
    var next = _.head(args);
    var keywordArgs = _.rest(args);

    session.then(function(driver) {
        fn.apply(null, [next].concat([driver]).concat(keywordArgs));
    });
}

module.exports = webdriverInjector;