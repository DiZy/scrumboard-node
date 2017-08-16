# Developer Setup

## MongoDB
Download and install MongoDB from [here](https://www.mongodb.com/download-center). The latest version should work.

## Create a fork on Github
Fork the [upstream project](https://github.com/p-somers/scrumboard-node) on Github so you have your own repository to make commits and create pull requests from.

## Clone the fork
Clone your new fork via `git`.

## Install dependencies
NOTE FOR WINDOWS USERS: before doing this, if you plan on running functional tests, you need to run this:
```
npm install --global --production windows-build-tools
```
Install the program's dependencies by running `npm install` in the directory you just cloned.

## Set up IDE

### IntelliJ (written by Kevin)
I've had success working on this project in IntelliJ Ultimate.
 - In IntelliJ, create a new project from existing sources, and select the path to the repository you just cloned.

Set up the run configurations:
 - In the Run Configuration dropdown, click "Edit Configurations".
   - Click the plus button and create a new Gulp.js configuration.
     - Name it "build" and under gulp tasks select `build`.
   - Click the plus button again and create a new Gulp.js configuration.
     - Name it "run" and under gulp tasks select `run`.
     - In the "before launch" section, click the plus and select "Run another configuration". Select the "build" configuration you just created.
     - In the "Environment" setting create a new environment variable called `SCRUM_MONGO` and set it to `mongodb://localhost`.
     - In the top of the window, check the checkbox for "Single instance only".
   - Click the plus button again and create a new npm configuration.
     - Name it something like "start Mongo".
     - Set the command to `whoami` (This is just a no-op because we just really want to take advantage of the "before launch" section to get it to run Mongo).
     - In the "before launch" section, click the plus and select "Run External tool". Click the plus button in the next dialog that pops up.
       - Name the external tool something like "start Mongo" and for "Program" enter the path to your mongod.exe (eg: `C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe`).
   - OK all the dialogs and you should have your run configurations set up.

To run the program all you have to do is run the "start Mongo" run configuration, and then run the "run" run configuration. After that you should be able to hit [http://localhost:5000](http://localhost:5000) in a web browser and see the program running.

## Keeping your fork up to date
Since you want to be working on the latest version of the program, you will have to periodically update your Github fork to reflect what is in the upstream repo.

Whenever you want to start work on a feature, you should follow Github's help article on [syncing a fork](https://help.github.com/articles/syncing-a-fork/). I'll briefly repeat the terminal commands here:

First time setup:
```
git remote add upstream https://github.com/DiZy/scrumboard-node.git
```

Syncing a fork (make sure you have a clean working directory first by stashing or committing changes):
```
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```