const routes = require('express').Router({mergeParams: true});
const assert = require('assert');
const uuidV4 = require('uuid/v4');

const requiresLogin = require('./helpers').requiresLogin;
const checkGetPermissionForTeam = require('./helpers').checkGetPermissionForTeam;
const checkPostPermissionForTeam = require('./helpers').checkPostPermissionForTeam;
const burndowns = require('../modules/collections').burndowns;
const teams = require('../modules/collections').teams;
const stories = require('../modules/collections').stories;

function createBurndown(req, res) {
    let teamId = req.params.teamId;
    burndowns.insert(
        {"_id": uuidV4(), "teamId": teamId, "hoursData": [], "pointsData": []},
        function(err, results, burndown) {
            assert.equal(err, null);
            return res.json({type: "success", chartLabels: [], hoursData: [], pointsData: []});
        }
    );
}


module.exports = function(socketio) {
    routes.get('/', requiresLogin, checkGetPermissionForTeam, function (req, res, next) {
        let teamId = req.params.teamId;
        burndowns.find(
            {'teamId': teamId},
            function (err, results) {
                assert.equal(err, null);
                if (results.length === 0) {
                    next();
                }
                else {
                    let result = results[0];
                    let labels = [];
                    for (let i = 0; i < result.hoursData.length; i++) {
                        labels.push(i + 1);
                    }
                    return res.json({type: "success", chartLabels: labels, hoursData: result.hoursData, pointsData: result.pointsData});
                }
            }
        );
    }, createBurndown);

    routes.post('/start', requiresLogin, checkPostPermissionForTeam, function (req, res) {
        let teamId = req.params.teamId;

        burndowns.updateOne(
            {'teamId': teamId},
            {
                $set: {
                    "hoursData": [],
                    "pointsData": []
                }
            },
            function (err, result) {
                assert.equal(err, null);
                socketio.sockets.in(teamId).emit('start burndown', {});
                return res.json({type: "success"});
            }
        );
    });

    routes.post('/mark', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length === 1) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    let lastColIndex = team.columnNames.length - 1;
                    stories.find(
                        {'teamId': teamId, 'statusCode': {'$ne': lastColIndex.toString()}},
                        function (err, results) {
                            let totalHours = 0;
                            let totalStoryPoints = 0;
                            for (let i = 0; i < results.length; i++) {
                                let curStory = results[i];
                                if (!isNaN(parseFloat(curStory.points))) {
                                    totalStoryPoints += parseFloat(curStory.points);
                                }
                                let curTasks = curStory.tasks;
                                for (let j = 0; j < curTasks.length; j++) {
                                    let hoursToAdd = curTasks[j].points;
                                    let isNotDone = curTasks[j].statusCode !== lastColIndex;
                                    if (!isNaN(parseFloat(hoursToAdd)) && isNotDone) {
                                        totalHours += parseFloat(hoursToAdd);
                                    }
                                }
                            }

                            burndowns.updateOne(
                                {'teamId': teamId},
                                {
                                    $push: {
                                        "hoursData": totalHours,
                                        "pointsData": totalStoryPoints
                                    }
                                },
                                function (err, result) {
                                    assert.equal(err, null);
                                    socketio.sockets.in(teamId).emit('mark burndown', {newHours: totalHours, newPoints: totalStoryPoints});
                                    return res.json({type: "success", newHours: totalHours, newPoints: totalStoryPoints});
                                }
                            );

                        }
                    );
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to do anything for this team."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.post('/undo', requiresLogin, checkPostPermissionForTeam, function (req, res) {
        let teamId = req.params.teamId;

        burndowns.updateOne(
            {'teamId': teamId},
            {
                $pop: {
                    "hoursData": 1,
                    "pointsData": 1
                }
            },
            function (err, result) {
                assert.equal(err, null);
                socketio.sockets.in(teamId).emit('undo burndown', {});
                return res.json({type: "success"});
            }
        );
    });

    return routes;
};