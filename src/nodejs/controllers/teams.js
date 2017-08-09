const routes = require('express').Router();
const assert = require('assert');
const uuidV4 = require('uuid/v4');

const requiresLogin = require('./helpers').requiresLogin;
const checkPostPermissionForTeam = require('./helpers').checkPostPermissionForTeam;
const teams = require('../modules/collections').teams;

const updatableProperties = ['columnNames', 'name'];

module.exports = function(socketio) {
//TODO: update to not allow duplicate names within same company probably
    routes.post('/', requiresLogin, function (req, res) {
        let name = req.body.name;
        let defaultColumns = ['Not Started', 'In Progress', 'To Be Verified', 'Done'];
        teams.insert({
            "_id": uuidV4(),
            "name": name,
            "companyId": req.session.companyId,
            "people": [],
            "columnNames": defaultColumns
        }, function (err, results, team) {
            assert.equal(err, null);
            return res.json({type: "success", team: team});
        });

    });

//TODO: update to only return names and id's
    routes.get('/', requiresLogin, function (req, res) {
        teams.find({'companyId': req.session.companyId}, function (err, results) {
            assert.equal(err, null);
            return res.json({type: "success", teams: results});
        });
    });

    routes.get('/:teamId', requiresLogin, function (req, res) {
        let teamId = req.params.teamId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    return res.json({type: "success", team: team});
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to load to this team's info."});
                }
            }
            else {
                return res.json({type: "error", error: "This team does not exist."});
            }
        });
    });

    routes.patch('/:teamId', requiresLogin, checkPostPermissionForTeam, function (req, res) {
        let teamId = req.params.teamId;
        let newValues = {};

        for (let prop in req.body) {
            if (updatableProperties.includes(prop)) {
                //TODO: validation, xss checking, etc
                newValues[prop] = req.body[prop];
            }
        }

        teams.updateOne(
            {'_id': teamId},
            {
                $set: newValues
            },
            function (err, result) {
                assert.equal(err, null);

                if (newValues.columnNames) {
                    socketio.sockets.in(teamId).emit('edit columns', {newColumnNames: newValues.columnNames});
                }
                return res.json({type: "success"});
            }
        );
    });

    routes.delete('/:teamId', requiresLogin, function (req, res, next) {
        let teamId = req.params.teamId;

        teams.find({'_id': teamId}, function (err, results) {
            assert.equal(err, null);
            if (results.length > 0) {
                let team = results[0];
                if (team.companyId === req.session.companyId) {
                    teams.removeOne(
                        {'_id': teamId},
                        function (err, result) {
                            assert.equal(err, null);
                            return res.json({type: "success"});
                        }
                    );
                }
                else {
                    return res.json({type: "error", error: "You do not have permissions to edit this team."});
                }
            }
        });
    });

    return routes;
};