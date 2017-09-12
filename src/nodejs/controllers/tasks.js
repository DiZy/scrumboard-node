const routes = require('express').Router({mergeParams: true});
const assert = require('assert');
const uuidV4 = require('uuid/v4');

const requiresLogin = require('./helpers').requiresLogin;
const teams = require('../modules/collections').teams;
const stories = require('../modules/collections').stories;

module.exports = function(socketio) {
    routes.post('/', requiresLogin, function (req, res, next) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let name = req.body.name;
        let points = req.body.points;
        let notes = req.body.notes;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    let newTaskId = uuidV4();
                    stories.updateOne(
                        {'_id': storyId, 'teamId': teamId},
                        {
                            $push: {
                                "tasks": {"_id": newTaskId, "name": name, "statusCode": 0, "points": points, "notes": notes}
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            let newTaskCreated = {_id: newTaskId, name: name, statusCode: 0, points: points, notes: notes};
                            socketio.sockets.in(teamId).emit('add task', {storyId: storyId, task: newTaskCreated});
                            return res.json({type: "success", storyId: storyId, task: newTaskCreated});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this team's stories."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

// Changed from DELETE /deleteTask
    routes.delete('/:taskId', requiresLogin, function (req, res, next) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    storiesCollection.updateOne(
                        {'_id': storyId, 'teamId': teamId},
                        {
                            $pull: {
                                "tasks": {"_id": taskId}
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('remove task', {storyId: storyId, taskId: taskId});
                            return res.json({type: "success"});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this team's stories."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

//TODO: combine with /edit
    routes.patch('/:taskId/move', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;
        let newStatusCode = req.body.newStatusCode;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    if (newStatusCode < team.columnNames.length && newStatusCode >= 0) {
                        stories.updateOne(
                            {'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
                            {
                                $set: {
                                    'tasks.$.statusCode': newStatusCode
                                }
                            },
                            function (err, result) {
                                assert.equal(err, null);
                                socketio.sockets.in(teamId).emit('move task', {storyId: storyId, taskId: taskId, newStatusCode: newStatusCode});
                                return res.json({type: "success", newStatusCode: newStatusCode, result: result});
                            }
                        );
                    }
                    else {
                        return res.json({type: "error", error: "Cannot move task to a column that does not exist"});
                    }

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story's tasks."});
                }
            }
        });

    });

//changed from PUT /editTask
    routes.patch('/:taskId', requiresLogin, function (req, res) {

        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;
        let newTaskJson = req.body.newTaskJson;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    stories.updateOne(
                        {'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
                        {
                            $set: {
                                'tasks.$.statusCode': newTaskJson.statusCode,
                                'tasks.$.name': newTaskJson.name,
                                'tasks.$.points': newTaskJson.points,
                                'tasks.$.notes': newTaskJson.notes
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('edit task', {storyId: storyId, task: newTaskJson});
                            return res.json({type: "success", task: newTaskJson});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story's tasks."});
                }
            }
        });
    });

//changed from PUT /updateTaskStyling
    routes.put('/:taskId/styling', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let taskId = req.params.taskId;
        let width = req.body.width;
        let height = req.body.height;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    stories.updateOne(
                        {'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
                        {
                            $set: {
                                'tasks.$.width': width,
                                'tasks.$.height': height
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('update task style', {storyId: storyId, taskId: taskId, height: height, width: width});
                            return res.json({type: "success"});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story's tasks."});
                }
            }
        });
    });

    return routes;
};