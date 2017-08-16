const wdio = require('wdio');
const config = require('../config.json');
const TEST_TIMEOUT = 10 * 1000;

// This fixes some issues running tests in Intellij
//     - the need to use the wdio module (and it's wrap function) since Intellij runs tests through mocha rather than through the wdio script
//     - the increased timeout, which solves this issue
let mocha = this;
let _it = it; // just like life
let _before = before;
let _beforeEach = beforeEach;
let _after = after;
let _afterEach = afterEach;

browser = wdio.getBrowser({
    baseUrl: config.baseUrl || 'http://localhost',
    desiredCapabilities: {
        browserName: config.browser || 'chrome',
    },
    logLevel: config.logLevel || 'silent',
});

it = function(description, func) {
    _it.call(mocha, description, wdio.wrap(func));
};
before = function(func) {
    _before.call(mocha, wdio.wrap(func));
};
beforeEach = function(func) {
    _beforeEach.call(mocha, wdio.wrap(func));
};
after = function(func) {
    _after.call(mocha, wdio.wrap(func));
};
afterEach = function(func) {
    _afterEach.call(mocha, wdio.wrap(func));
};

suite = function(description, func) {
    describe(description, function() {
        this.timeout(TEST_TIMEOUT);

        // Initialize selenium standalone server if it is not started yet
        before(wdio.initSelenium);

        before(function() {
            browser.init();
        });

        after(function() {
            browser.end();
        });

        func();
    });
};