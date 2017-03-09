//Requirements
var express = require('express');
var app = express();
var path = require('path');
var assert = require('assert');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var uuidV4 = require('uuid/v4');
var session = require('express-session');

//Mongo
var MongoCollection = require('./modules/MongoCollection');
var usersCollection = new MongoCollection('users');
var companiesCollection = new MongoCollection('companies');

//App Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/assets/', express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'everything is secret'
}));

app.get('/logout', function(req, res) {
	logOut(req);
    res.redirect('/');
});

app.get('/', loggedInRedirect, function(req, res) {
    res.render('pages/index');
});

app.get('/teamhome', requiresLoginRedirect, function(req, res) {
    res.render('pages/teamhome');
});

app.post('/signIn', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	usersCollection.find({'username' : username}, function(err, results){
		assert.equal(null, err);
		if(results.length > 0) {
			var foundUser = results[0];
			if(bcrypt.compareSync(password, foundUser.password)){
				console.log("Succesful login");
				logIn(req, foundUser._id);
				return res.json({type: "success"});
			}
			else {
				return res.json({ type: "error", error: "Not a valid username and password combination"});
			}
			
		}
		else {
			return res.json({ type: "error", error: "Not a valid username and password combination"});
		}
	});
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

			companiesCollection.insert(
			{"_id": companyId, "name": fullName},
			function(err, result) {
				assert.equal(err, null);

				usersCollection.insert(
				{"_id": uuidV4(), "username": username,"password": password,"name":fullName,'email':email, 'companyId': companyId},
				function(err, result) {
					assert.equal(err, null);
					res.json({type: "success"});
				});
				
			});

		}

	});
});


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
	  res.redirect('/teamhome');
	} else {
	  next();
	}
}

function isLoggedIn(req) {
	//TODO: add actual check against db
	if(req.session.userId) {
		return true;
	}
	return false;

}

function logIn(req, userId) {
	req.session.userId = userId;
}

function logOut(req) {
	req.session.destroy(function(){
    	console.log("logged out");
  	});
}

app.listen(5000);
console.log("RUNNING ON PORT 5000");