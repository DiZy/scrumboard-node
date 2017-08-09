const routes = require('express').Router();

module.exports = function() {
    const stories = require('./stories').apply(this, arguments);
    const tasks = require('./tasks').apply(this, arguments);
    const teams = require('./teams').apply(this, arguments);
    const burndown = require('./burndown').apply(this, arguments);
    const people = require('./people').apply(this, arguments);
    const auth = require('./auth').apply(this, arguments);

    stories.use('/:storyId/tasks', tasks);
    teams.use('/:teamId/stories', stories);
    teams.use('/:teamId/burndown', burndown);
    teams.use('/:teamId/people', people);
    routes.use('/teams', teams);
    routes.use(auth);

    return routes;
};