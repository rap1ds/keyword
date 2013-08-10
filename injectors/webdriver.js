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
function webdriverInjector(name, args, inject) {
    session.done(function(driver) {
        inject({'driver': driver});
    });
}

module.exports = webdriverInjector;