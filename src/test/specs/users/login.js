const wdio = require('wdio');
const assert = require('chai').assert;
const textCtx = require('../../support/testcontext');
const should = textCtx.should;

let browser = wdio.getBrowser({
    desiredCapabilities: {
        browserName: 'chrome'
    }
});
let $ = browser.$;

describe('User Creation', () => {
    // Initialize selenium standalone server if it is not started yet
    before(wdio.initSelenium);

    // Every code using the 'browser' object has to be wrapped by wdio.wrap
    before(wdio.wrap(function() {
        browser.init();
    }));

    after(wdio.wrap(function() {
        browser.end();
    }));

    should('should show login fields', function () {
        browser.url('/');
        console.log(browser.getTitle());
    });
});