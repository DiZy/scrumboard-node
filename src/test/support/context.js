const wdio = require('wdio');
const config = require('../config.json');

// This fixes some issues running tests in Intellij
//     - the need to use the wdio module (and it's wrap function) since Intellij runs tests through mocha rather than through the wdio script
//     - the increased timeout, which solves this issue
let _it = it; // just like life
let mocha = this;

let browser = wdio.getBrowser({
    desiredCapabilities: {
        browserName: config.browser || 'chrome',
        baseUrl: config.baseUrl || 'http://localhost'
    }
});

mocha.timeout(10000);

it = function(description, func) {
    _it.call(mocha, description, wdio.wrap(func));
};