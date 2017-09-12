require('../../support/context');

const wdio = require('wdio');
const assert = require('chai').assert;

suite('User Creation', function () {
    it('should load Scrumboard', function () {
        browser.url('/');
        assert.equal('Scrumboard', browser.getTitle());
    });
});