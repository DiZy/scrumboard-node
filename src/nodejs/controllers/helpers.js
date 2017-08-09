const assert = require('assert');

const teams = require('../modules/collections').teams;

function checkPostPermissionForTeam(req, res, next) {
    let teamId = req.params.teamId;

    teams.find({'_id': teamId}, function(err, results) {
        assert.equal(err, null);
        if(results.length === 1) {
            let team = results[0];
            if(team.companyId === req.session.companyId) {
                next();
            }
            else {
                return res.json({ type: "error", error: "You do not have permissions to do anything for this team."});
            }
        }
        else {
            return res.json({ type: "error", error: "This team does not exist."});
        }
    });
}

function checkGetPermissionForTeam(req, res, next) {
    let teamId = req.params.teamId;

    teams.find({'_id': teamId}, function(err, results) {
        assert.equal(err, null);
        if(results.length === 1) {
            let team = results[0];
            if(team.companyId === req.session.companyId) {
                next();
            }
            else {
                return res.json({ type: "error", error: "You do not have permissions to do anything for this team."});
            }
        }
        else {
            return res.json({ type: "error", error: "This team does not exist."});
        }
    });
}

function requiresLoginRedirect(req, res, next) {
    if (isLoggedIn(req)) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/');
    }
}

function requiresLogin(req, res, next) {
    if (isLoggedIn(req)) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.json({ type: "error", error: "This requires login."});
    }
}

function loggedInRedirect(req, res, next) {
    if (isLoggedIn(req)) {
        res.redirect('/home');
    } else {
        next();
    }
}

function isLoggedIn(req) {
    //TODO: add actual check against db
    if(req.session.userId && req.session.companyId) {
        return true;
    }
    return false;
}

function logIn(req, userId, companyId) {
    req.session.userId = userId;
    req.session.companyId = companyId;
}

function logOut(req) {
    req.session.destroy(function(){
    });
}

module.exports.checkPostPermissionForTeam = checkPostPermissionForTeam;
module.exports.checkGetPermissionForTeam = checkGetPermissionForTeam;
module.exports.requiresLoginRedirect = requiresLoginRedirect;
module.exports.requiresLogin = requiresLogin;
module.exports.loggedInRedirect = loggedInRedirect;
module.exports.isLoggedIn = isLoggedIn;
module.exports.logIn = logIn;
module.exports.logOut = logOut;