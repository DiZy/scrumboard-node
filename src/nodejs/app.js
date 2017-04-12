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
const burndownsCollection = new MongoCollection('burndowns');

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
	teamsCollection.insert({"_id": uuidV4(), "name": name, "companyId": req.session.companyId, "people": []}, function(err, results, team) {
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

app.delete('/deleteTeam', requiresLogin, function(req, res, next) {
	var teamId = req.body.teamId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				teamsCollection.removeOne(
					{'_id': teamId},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success"});
					}
				);
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this team."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.post('/addStory', requiresLogin, function(req, res) {
	var name = req.body.name;
	var points = req.body.points;
	var teamId = req.body.teamId;
	// assert(teamId);

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.insert(
					{"_id": uuidV4(), "name": name, "teamId": teamId, "companyId": team.companyId, "tasks": [], "statusCode": -1, "points": points}, 
					function(err, results, story) {
						assert.equal(err, null);
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

app.put('/moveStory', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var newStatusCode = req.body.newStatusCode;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId},
					{
						$set : {
							'statusCode': newStatusCode
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", newStatusCode: newStatusCode, result: result });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});

});

app.put('/editStory', requiresLogin, function(req, res) {

	var teamId = req.body.teamId;
	var newStoryJson = req.body.newStoryJson;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': newStoryJson._id, 'teamId': teamId},
					{
						$set : {
							'name': newStoryJson.name,
							'points': newStoryJson.points
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", story: newStoryJson });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.delete('/deleteStory', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.removeOne(
					{'_id': storyId, 'teamId': teamId},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success"});
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to remove this team's stories."});
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

app.post('/addTask', requiresLogin, function(req, res, next) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var name = req.body.name;
	var points = req.body.points;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				var newTaskId = uuidV4();
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId},
					{$push: { 
						"tasks": {"_id": newTaskId, "name": name, "statusCode": 0, "points": points} 
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", task: {_id: newTaskId, name: name, statusCode: 0, points: points} });
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

app.delete('/deleteTask', requiresLogin, function(req, res, next) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var taskId = req.body.taskId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId},
					{$pull: { 
						"tasks": {"_id": taskId} 
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success"});
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

app.put('/moveTask', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var taskId = req.body.taskId;
	var newStatusCode = req.body.newStatusCode;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
					{
						$set : {
							'tasks.$.statusCode': newStatusCode
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", newStatusCode: newStatusCode, result: result });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story's tasks."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});

});

app.put('/editTask', requiresLogin, function(req, res) {

	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var taskId = req.body.taskId;
	var newTaskJson = req.body.newTaskJson;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
					{
						$set : {
							'tasks.$.statusCode': newTaskJson.statusCode,
							'tasks.$.name': newTaskJson.name,
							'tasks.$.points': newTaskJson.points
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", task: newTaskJson });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story's tasks."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.put('/updateTaskStyling', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var taskId = req.body.taskId;
	var width = req.body.width;
	var height = req.body.height;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
					{
						$set : {
							'tasks.$.width': width,
							'tasks.$.height': height
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success"});
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story's tasks."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.post('/addPersonToTeam', requiresLogin, function(req, res) {
    var teamId = req.body.teamId;
    var personName = req.body.personName;

    teamsCollection.find({'_id': teamId}, function(err, results) {
    	assert.equal(err, null);
    	if(results.length > 0) {
    		var team = results[0];
    		if(team.companyId == req.session.companyId) {
    			var newPersonId = uuidV4();
    			teamsCollection.updateOne(
    				{'_id': teamId},
    				{$push: { 
    					"people": {"_id": newPersonId, "name": personName, "taskId": ""} 
    					}
    				},
    				function(err, result) {
    					assert.equal(err, null);
    					return res.json({type: "success", person: {_id: newPersonId, name: personName, taskId: null}  });
    				}
    			);
    		}
    		else {
    			return res.json({ type: "error", error: "You do not have permissions to edit this teams's people."});
    		}
    	}
    	else {
    		return res.json({ type: "error", error: "This team does not exist."});
    	}
    });
});

app.put('/assignPerson', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var personId = req.body.personId;
	var newTaskId = req.body.newTaskId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				teamsCollection.updateOne(
					{'_id': teamId, 'people._id': personId},
					{
						$set : {
							'people.$.taskId': newTaskId
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success", newTaskId: newTaskId, result: result });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to assign this team's people."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.delete('/removePersonFromTeam', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var personId = req.body.personId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				teamsCollection.updateOne(
					{'_id': teamId},
					{$pull: { 
						"people": {"_id": personId} 
						}
					},
					function(err, result) {
						assert.equal(err, null);
						return res.json({type: "success"});
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

app.get('/getBurndown', requiresLogin, checkGetPermissionForTeam, function(req, res, next) {
	var teamId = req.query.teamId;
	burndownsCollection.find(
		{'teamId': teamId},
		function(err, results) {
			assert.equal(err, null);
			if(results.length == 0) {
				next();
			}
			else {
				var result = results[0];
				var labels = [];
				for(var i = 0; i < result.hoursData.length; i++) {
					labels.push(i + 1);
				}
				return res.json({type: "success", chartLabels: labels, chartData: result.hoursData});
			}
		}
	);
}, createBurndown);

function createBurndown(req, res) {
	var teamId = req.query.teamId;
	burndownsCollection.insert(
		{"_id": uuidV4(), "teamId": teamId, "hoursData": []}, 
		function(err, results, burndown) {
			assert.equal(err, null);
			return res.json({type: "success", chartLabels: [], chartData: []});
		}
	);
}

app.post('/startBurndown', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;

	burndownsCollection.updateOne(
		{'teamId': teamId},
		{$set: { 
			"hoursData": []
		}},
		function(err, result) {
			assert.equal(err, null);
			return res.json({type: "success"});
		}
	);
});

app.post('/markBurndown', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;

	storiesCollection.aggregate([
		{ '$match': {'teamId' : teamId}},
		{ '$unwind': '$tasks' },
		{ '$group': {
	        '_id': '$_id',
	        'taskhours': {"$push": "$tasks.points"}
	    }}
		], 
		function(err, results) {
			var totalHours = 0;
			for(var i = 0; i < results.length; i++) {
				var taskhours = results[i].taskhours;
				for(var j = 0; j < taskhours.length; j++) {
					totalHours += parseFloat(taskhours[j]);
				}
			}

			burndownsCollection.updateOne(
				{'teamId': teamId},
				{$push: { 
					"hoursData": totalHours
				}},
				function(err, result) {
					assert.equal(err, null);
					return res.json({type: "success", newPoint: totalHours });
				}
			);

		}
	);
});

app.post('/undoBurndown', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;

	burndownsCollection.updateOne(
		{'teamId': teamId},
		{$pop: { 
			"hoursData": 1
			}
		},
		function(err, result) {
			assert.equal(err, null);
			return res.json({type: "success"});
		}
	);
});



//Helpers

function checkPostPermissionForTeam(req, res, next) {
	var teamId = req.body.teamId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length == 1) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
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
	var teamId = req.query.teamId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length == 1) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
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
  	});
}

app.listen(process.env.PORT || 5000)
console.log("RUNNING ON PORT 5000");