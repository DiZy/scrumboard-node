//Requirements
var express = require('express');
var app = express();
var path = require('path');
var assert = require('assert');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var uuidV4 = require('uuid/v4');

//Mongo Modules
var usersCollection = require('./mongoModules/UsersCollection');
var companiesCollection = require('./mongoModules/CompaniesCollection');

//App Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/assets/', express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.post('/signIn', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	res.json({type: "error"});
});

app.post('/signUp', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var passwordConfirm = req.body.password_confirm;
	var fullName = req.body.full_name;
	var email = req.body.email;

	if(!username || username.length < 3) {
		return res.json({ type: "error", error: "Please enter a username of 3 or more chaacters"});
	}
	if(!password || password.length < 3) {
		return res.json({ type: "error", error: "Please enter a password of 3 or more chaacters"});
	}
	if(passwordConfirm != password) {
		return res.json({ type: "error", error: "Please make sure your password confirmation is the same as your password"});
	}
	if(!email || email.length == 0) {
		return res.json({ type: "error", error: "Please enter a valid email address"});
	}

	usersCollection.find({'username' : username}, function(err, results){
		assert.equal(null, err);
		if(results.length > 0) {
			return res.json({ type: "error", error: "That username is already taken"});
		}
		else {
			var salt = bcrypt.genSaltSync(10);
			password = bcrypt.hashSync(password, salt);
			var companyId = uuidV4();
			usersCollection.insert(
			{"_id": uuidV4(), "username": username,"password": password,"name":fullName,'email':email, 'companyId': companyId},
			function(err, result) {
				assert.equal(err, null);
			});
			companiesCollection.insert(
			{"_id": companyId, "name": fullName},
			function(err, result) {
				assert.equal(err, null);
				res.json({type: "success"});
			});

		}

	});
});


app.listen(5000);
console.log("RUNNING ON PORT 5000");