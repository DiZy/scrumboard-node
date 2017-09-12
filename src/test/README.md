## Testing
On windows, you may need to run this (as administrator) before anything else:
```
npm install --global --production windows-build-tools
```
Test configuration file is src/test/config.json

### Functional testing:
  - Running the selenium server standalone from src/test/selenium: java -jar selenium-server-standalone-<VERSION>.jar -Dwebdriver.chrome.driver=chromedriver.exe
  - Configuring WebDriverIO (wdio):
    - node_modules\.bin\wdio config
    - use all defaults except for url, which should be <your pc address>:<app port #> (e.g. http://poweradv-dev46:5000)
    - [read webdriver.io instructions](http://webdriver.io/guide.html)
  - All func tests should have this as their first line:
    ```
    require('../../support/context');
    ```
  - The context sets two things:
    - The "suite" function. **This function must be used to wrap your test suite.** Use it just like "describe".
    - The "browser" variable. This is a [webdriver.io browser object](http://webdriver.io/guide/testrunner/browserobject.html), initialized by the context.js module.