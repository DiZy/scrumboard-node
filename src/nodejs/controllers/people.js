const routes = require('express').Router({mergeParams: true});
const assert = require('assert');
const uuidV4 = require('uuid/v4');

const requiresLogin = require('./helpers').requiresLogin;
const checkPostPermissionForTeam = require('./helpers').checkPostPermissionForTeam;
const teams = require('../modules/collections').teams;

module.exports = function(socketio) {
    routes.post('/', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let personName = req.body.personName;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    let newPersonId = uuidV4();
                    teams.updateOne(
                        {'_id': teamId},
                        {
                            $push: {
                                "people": {"_id": newPersonId, "name": personName, "taskId": "", "storyId": ""}
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            let newPersonData = {_id: newPersonId, name: personName, taskId: null};
                            socketio.sockets.in(teamId).emit('add person', {person: newPersonData});
                            return res.json({type: "success", person: newPersonData});
                        }
                    );
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this teams's people."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    //From PUT /assignPerson
    routes.put('/:personId', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let personId = req.params.personId;
        let newTaskId = req.body.taskId;
        let storyId = req.body.storyId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    teams.updateOne(
                        {'_id': teamId, 'people._id': personId},
                        {
                            $set: {
                                'people.$.taskId': newTaskId,
                                'people.$.storyId': storyId
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('assign person', {personId: personId, storyId: storyId, taskId: newTaskId});
                            return res.json({type: "success", newTaskId: newTaskId, result: result});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to assign this team's people."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.delete('/:personId', requiresLogin, checkPostPermissionForTeam, function (req, res) {
        let teamId = req.params.teamId;
        let personId = req.params.personId;
        teams.updateOne(
            {'_id': teamId},
            {
                $pull: {
                    "people": {"_id": personId}
                }
            },
            function (err, result) {
                assert.equal(err, null);
                socketio.sockets.in(teamId).emit('remove person', {personId: personId});
                return res.json({type: "success"});
            }
        );
    });

    return routes;
};