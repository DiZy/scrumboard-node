const routes = require('express').Router({mergeParams: true});
const assert = require('assert');
const bcrypt = require('bcryptjs');
const uuidV4 = require('uuid/v4');

const logIn = require('./helpers').logIn;
const logOut = require('./helpers').logOut;
const users = require('../modules/collections').users;
const companies = require('../modules/collections').companies;

module.exports = function() {
    routes.get('/logOut', function (req, res) {
        logOut(req);
        res.redirect('/');
    });

    routes.post('/logIn', function (req, res) {
        let username = req.body.username;
        let password = req.body.password;

        username = username.toLowerCase();

        users.find({'username': username}, function (err, results) {
            assert.equal(null, err);
            if (results.length > 0) {
                let foundUser = results[0];
                if (bcrypt.compareSync(password, foundUser.password)) {
                    logIn(req, foundUser._id, foundUser.companyId);
                    return res.json({type: "success"});
                }
                else {
                    return res.json({type: "error", error: "Not a valid username and password combination"});
                }

            }
            else {
                return res.json({type: "error", error: "Not a valid username and password combination"});
            }
        });
    });

    routes.post('/signUp', function (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        let passwordConfirm = req.body.password_confirm;
        let fullName = req.body.full_name;
        let email = req.body.email;

        if (!username || username.length < 3) {
            return res.json({type: "error", error: "Please enter a username of 3 or more chaacters"});
        }
        if (!password || password.length < 3) {
            return res.json({type: "error", error: "Please enter a password of 3 or more chaacters"});
        }
        if (passwordConfirm !== password) {
            return res.json({type: "error", error: "Please make sure your password confirmation is the same as your password"});
        }
        if (!email || email.length === 0) {
            return res.json({type: "error", error: "Please enter a valid email address"});
        }

        username = username.toLowerCase();

        users.find({'username': username}, function (err, results) {
            assert.equal(null, err);
            if (results.length > 0) {
                return res.json({type: "error", error: "That username is already taken"});
            }
            else {
                let salt = bcrypt.genSaltSync(10);
                password = bcrypt.hashSync(password, salt);
                let companyId = uuidV4();

                companies.insert(
                    {"_id": companyId, "name": fullName},
                    function (err, result) {
                        assert.equal(err, null);

                        users.insert(
                            {"_id": uuidV4(), "username": username, "password": password, "name": fullName, 'email': email, 'companyId': companyId},
                            function (err, result) {
                                assert.equal(err, null);
                                return res.json({type: "success"});
                            });

                    });

            }

        });
    });
    return routes;
};