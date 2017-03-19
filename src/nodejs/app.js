//Requirements
const express = require('express');
const app = express();
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const uuidV4 = require('uuid/v4');
const session = require('express-session');

//Mongo
const MongoCollection = require('./modules/MongoCollection');
const usersCollection = new MongoCollection('users');
const companiesCollection = new MongoCollection('companies');
const teamsCollection = new MongoCollection('teams');
const storiesCollection = new MongoCollection('stories');

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
				logIn(req, foundUser._id, foundUser.companyId);
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
					return res.json({type: "success"});
				});
				
			});

		}

	});
});

//TODO: update to not allow duplicate names within same company probably
app.post('/addTeam', requiresLogin, function(req, res) {
	var name = req.body.name;
	teamsCollection.insert({"_id": uuidV4(), "name": name, "companyId": req.session.companyId}, function(err, results, team) {
		assert.equal(err, null);
		return res.json({type: "success", team: team});
	});

});

//TODO: update to only return names and id's
app.get('/getTeams', requiresLogin, function(req, res) {
	teamsCollection.find({'companyId': req.session.companyId}, function(err, results) {
		assert.equal(err, null);
		return res.json({type: "success", teams: results});
	});

});

app.get('/getTeamDetails', requiresLogin, function(req, res) {
	var teamId = req.query.teamId;
	// assert(teamId);

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				return res.json({type: "success", teamJson: team});
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

app.post('/addStory', requiresLogin, function(req, res) {
	var name = req.body.name;
	var teamId = req.body.teamId;
	// assert(teamId);

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.insert({"_id": uuidV4(), "name": name, "teamId": teamId, "companyId": team.companyId, "tasks": []}, function(err, results, story) {
					assert.equal(err, null);
					return res.json({type: "success", story: story});
				});
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

app.get('/getStories', requiresLogin, function(req, res, next) {
	var teamId = req.query.teamId;
	// assert(teamId);

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.find({"teamId": teamId, "companyId": team.companyId}, function(err, results) {
					assert.equal(err, null);
					return res.json({ type: "success", stories: results});
				});
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to load this team's stories."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});

});

//to create: moveTask, updateStory, updateTask

app.post('/addTask', requiresLogin, function(req, res, next) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var name = req.body.name;
	var people = req.body.people;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				var newTaskId = uuidV4();
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId},
					{$push: { 
						"tasks": {"_id": newTaskId, "name": name, "people": people, "statusCode": 0} 
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", task: {_id: newTaskId, name: name, people: people, statusCode: 0} });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this team's stories."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
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
    	console.log("logged out");
  	});
}

app.listen(process.env.PORT || 5000)
console.log("RUNNING ON PORT 5000");