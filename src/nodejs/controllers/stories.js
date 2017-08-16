const routes = require('express').Router({mergeParams: true});
const uuidV4 = require('uuid/v4');
const assert = require('assert');

const requiresLogin = require('./helpers').requiresLogin;
const teams = require('../modules/collections').teams;
const stories = require('../modules/collections').stories;

module.exports = function(socketio) {
    routes.post('/', requiresLogin, function(req, res) {
        let teamId = req.params.teamId;
        let name = req.body.name;
        let points = req.body.points;
        let acceptanceCriteria = req.body.acceptanceCriteria;

        teams.find({'_id': teamId}, function(err, results) {
            assert.equal(err, null);
            if(results.length > 0) {
                let team = results[0];
                if(team.companyId === req.session.companyId) {
                    stories.insert(
                        {"_id": uuidV4(), "name": name, "teamId": teamId, "companyId": team.companyId, "tasks": [], "statusCode": -1, "points": points, "acceptanceCriteria": acceptanceCriteria},
                        function(err, results, story) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('add story', {story: story});
                            return res.json({type: "success", story: story});
                        }
                    );
                }
                else {
                    return res.json({ type: "error", error: "You do not have permissions to add to this team's stories."});
                }
            }
            else {
                return res.json({ type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.put('/:storyId/move', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let newStatusCode = req.body.newStatusCode;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    if (newStatusCode < team.columnNames.length && newStatusCode >= -1) {
                        stories.updateOne(
                            {'_id': storyId, 'teamId': teamId},
                            {
                                $set: {
                                    'statusCode': newStatusCode
                                }
                            },
                            function (err, result) {
                                assert.equal(err, null);
                                socketio.sockets.in(teamId).emit('move story', {storyId: storyId, newStatusCode: newStatusCode});
                                return res.json({type: "success", newStatusCode: newStatusCode, result: result});
                            }
                        );
                    }
                    else {
                        return res.json({type: "error", error: "Cannot move story to a column that does not exist"});
                    }
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });

    });

    routes.put('/:storyId/edit', requiresLogin, function (req, res) {

        let teamId = req.body.teamId;
        let newStoryJson = req.body.newStoryJson;
        let newTeamId = newStoryJson.teamId;

        let transferringTeams = teamId !== newTeamId;

        teams.find({'$or': [{'_id': teamId}, {'_id': newTeamId}]}, function (err, results) {
            assert.equal(err, null);
            if ((transferringTeams && results.length === 2) || (!transferringTeams && results.length === 1)) {
                let team = results[0];
                let newTeam;
                if (transferringTeams) {
                    newTeam = results[1];
                }
                else {
                    newTeam = team;
                }
                if (team.companyId === req.session.companyId && newTeam.companyId === req.session.companyId) {
                    stories.findAndUpdateOne(
                        {'_id': newStoryJson._id, 'teamId': teamId},
                        {
                            $set: {
                                'name': newStoryJson.name,
                                'points': newStoryJson.points,
                                'teamId': newTeamId,
                                'acceptanceCriteria': newStoryJson.acceptanceCriteria
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            let updatedStory = result.value;
                            socketio.sockets.in(teamId).emit('edit story', {story: updatedStory});
                            socketio.sockets.in(newTeamId).emit('edit story', {story: updatedStory});
                            return res.json({type: "success", story: updatedStory });
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story in this way."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.delete('/:storyId', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    stories.removeOne(
                        {'_id': storyId, 'teamId': teamId},
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('remove story', {storyId: storyId});
                            return res.json({type: "success"});
                        }
                    );

                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to remove this team's stories."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.get('/', requiresLogin, function (req, res, next) {
        let teamId = req.params.teamId;
        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    stories.find({"teamId": teamId, "companyId": team.companyId}, function (err, results) {
                        assert.equal(err, null);
                        return res.json({type: "success", stories: results});
                    });
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to load this team's stories."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });

    });

    routes.patch('/:storyId/styling', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;
        let storyId = req.params.storyId;
        let width = req.body.width;
        let height = req.body.height;
        let team = undefined;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                team = results[0];
                if (team.companyId === req.session.companyId) {
                    stories.updateOne(
                        {'_id': storyId, 'teamId': teamId},
                        {
                            $set: {
                                'width': width,
                                'height': height
                            }
                        },
                        function (err, result) {
                            assert.equal(err, null);
                            socketio.sockets.in(teamId).emit('update story style', {storyId: storyId, height: height, width: width});
                            return res.json({type: "success"});
                        }
                    );
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this story."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });
    return routes;
};