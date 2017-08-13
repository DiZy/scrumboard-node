const wdio = require('wdio');

// This fixes some issues running tests in Intellij
//     - the need to use the wdio module (and it's wrap function) since Intellij runs tests through mocha rather than through the wdio script
//     - the increased timeout, which solves this issue
function _should(descr, test) {
    it(descr, wdio.wrap(test)).timeout(10000);
}

module.exports = {
    should: _should
};