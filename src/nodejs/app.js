//Requirements
const express = require('express');
const app = express();
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const uuidV4 = require('uuid/v4');
const session = require('express-session');
var http = require('http').Server(app);
var socketio = require('socket.io')(http);
var socketInit = require('./socketInit');

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

var sessionMiddleware = session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'everything is secret'
});

app.use(sessionMiddleware);

socketio.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

socketio.on('connection', socketInit);

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

	username = username.toLowerCase();

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

	username = username.toLowerCase();

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
				{"_id": uuidV4(), "username": username, "password": password, "name":fullName,'email':email, 'companyId': companyId},
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
	var defaultColumns = ['Not Started', 'In Progress', 'To Be Verified', 'Done'];
	teamsCollection.insert({"_id": uuidV4(), "name": name, "companyId": req.session.companyId, "people": [], "columnNames": defaultColumns}, function(err, results, team) {
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

app.put('/updateTeamColumns', requiresLogin, checkPostPermissionForTeam, function(req, res, next) {
	var teamId = req.body.teamId;
	var newColumnNames = req.body.newColumnNames;

	teamsCollection.updateOne(
		{'_id': teamId},
		{
			$set: {
				"columnNames": newColumnNames
			}
		},
		function(err, result) {
			assert.equal(err, null);
			socketio.sockets.in(teamId).emit('edit columns', {});
			return res.json({type: "success"});
		}
	);
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

app.put('/moveStory', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;
	var storyId = req.body.storyId;
	var newStatusCode = req.body.newStatusCode;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				if(newStatusCode < team.columnNames.length && newStatusCode >= -1) {
					storiesCollection.updateOne(
						{'_id': storyId, 'teamId': teamId},
						{
							$set : {
								'statusCode': newStatusCode
							}
						},
						function(err, result) {
							assert.equal(err, null);
							socketio.sockets.in(teamId).emit('move story', {storyId: storyId, newStatusCode: newStatusCode});
							return res.json({type: "success", newStatusCode: newStatusCode, result: result });
						}
					);
				}
				else {
					return res.json({ type: "error", error: "Cannot move story to a column that does not exist"});
				}
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
	var newTeamId = newStoryJson.teamId;

	var transferringTeams = teamId != newTeamId;

	teamsCollection.find({'$or': [{'_id': teamId}, {'_id': newTeamId}]}, function(err, results) {
		assert.equal(err, null);
		if((transferringTeams && results.length == 2) || (!transferringTeams && results.length == 1)) {
			var team = results[0];
			var newTeam;
			if(transferringTeams) {
				newTeam = results[1];
			}
			else {
				newTeam = team;
			}
			if(team.companyId == req.session.companyId && newTeam.companyId == req.session.companyId) {
				storiesCollection.updateOne(
					{'_id': newStoryJson._id, 'teamId': teamId},
					{
						$set : {
							'name': newStoryJson.name,
							'points': newStoryJson.points,
							'teamId': newTeamId
						}
					},
					function(err, result) {
						assert.equal(err, null);
						socketio.sockets.in(teamId).emit('edit story', {story: newStoryJson});
						return res.json({type: "success", story: newStoryJson });
					}
				);
				
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to edit this story in this way."});
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
						socketio.sockets.in(teamId).emit('remove story', {storyId: storyId});
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
	var notes = req.body.notes;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length > 0) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				var newTaskId = uuidV4();
				storiesCollection.updateOne(
					{'_id': storyId, 'teamId': teamId},
					{$push: { 
						"tasks": {"_id": newTaskId, "name": name, "statusCode": 0, "points": points, "notes": notes} 
						}
					},
					function(err, result) {
						assert.equal(err, null);
						var newTaskCreated = {_id: newTaskId, name: name, statusCode: 0, points: points, notes: notes};
						socketio.sockets.in(teamId).emit('add task', {storyId: storyId, task: newTaskCreated});
						return res.json({type: "success", storyId: storyId, task: newTaskCreated });
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
						socketio.sockets.in(teamId).emit('remove task', {storyId: storyId, taskId: taskId});
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
				if(newStatusCode < team.columnNames.length && newStatusCode >= 0) {
					storiesCollection.updateOne(
						{'_id': storyId, 'teamId': teamId, 'tasks._id': taskId},
						{
							$set : {
								'tasks.$.statusCode': newStatusCode
							}
						},
						function(err, result) {
							assert.equal(err, null);
							socketio.sockets.in(teamId).emit('move task', {storyId: storyId, taskId: taskId, newStatusCode: newStatusCode});
							return res.json({type: "success", newStatusCode: newStatusCode, result: result });
						}
					);
				}
				else {
					return res.json({ type: "error", error: "Cannot move task to a column that does not exist"});
				}
				
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
							'tasks.$.points': newTaskJson.points,
							'tasks.$.notes': newTaskJson.notes
						}
					},
					function(err, result) {
						assert.equal(err, null);
						socketio.sockets.in(teamId).emit('edit task', {storyId: storyId, task: newTaskJson});
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
						socketio.sockets.in(teamId).emit('update task style', {storyId: storyId, taskId: taskId, height: height, width: width});
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
						var newPersonData = {_id: newPersonId, name: personName, taskId: null};
						socketio.sockets.in(teamId).emit('add person', {person: newPersonData});
    					return res.json({type: "success", person: newPersonData });
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
	var storyId = req.body.storyId;

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
						socketio.sockets.in(teamId).emit('assign person', {personId: personId, storyId: storyId, taskId: newTaskId});
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

app.delete('/removePersonFromTeam', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;
	var personId = req.body.personId;
	teamsCollection.updateOne(
		{'_id': teamId},
		{$pull: { 
			"people": {"_id": personId} 
			}
		},
		function(err, result) {
			assert.equal(err, null);
			socketio.sockets.in(teamId).emit('remove person', {personId: personId});
			return res.json({type: "success"});
		}
	);
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
				return res.json({type: "success", chartLabels: labels, hoursData: result.hoursData, pointsData: result.pointsData});
			}
		}
	);
}, createBurndown);

function createBurndown(req, res) {
	var teamId = req.query.teamId;
	burndownsCollection.insert(
		{"_id": uuidV4(), "teamId": teamId, "hoursData": [], "pointsData": []}, 
		function(err, results, burndown) {
			assert.equal(err, null);
			return res.json({type: "success", chartLabels: [], hoursData: [], pointsData: []});
		}
	);
}

app.post('/startBurndown', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;

	burndownsCollection.updateOne(
		{'teamId': teamId},
		{$set: { 
			"hoursData": [],
			"pointsData": []
		}},
		function(err, result) {
			assert.equal(err, null);
			socketio.sockets.in(teamId).emit('start burndown', {});
			return res.json({type: "success"});
		}
	);
});

app.post('/markBurndown', requiresLogin, function(req, res) {
	var teamId = req.body.teamId;

	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length == 1) {
			var team = results[0];
			if(team.companyId == req.session.companyId) {
				var lastColIndex = team.columnNames.length - 1
				storiesCollection.find(
					{'teamId' : teamId, 'statusCode' : {'$ne': lastColIndex.toString()}}, 
					function(err, results) {
						var totalHours = 0;
						var totalStoryPoints = 0;
						for(var i = 0; i < results.length; i++) {
							var curStory = results[i];
							if(!isNaN(parseFloat(curStory.points))){
								totalStoryPoints += parseFloat(curStory.points);
							}
							var curTasks = curStory.tasks;
							for(var j = 0; j < curTasks.length; j++) {
								var hoursToAdd = curTasks[j].points;
								var isNotDone = curTasks[j].statusCode != lastColIndex;
								if(!isNaN(parseFloat(hoursToAdd)) && isNotDone){
									totalHours += parseFloat(hoursToAdd);
								}
							}
						}

						burndownsCollection.updateOne(
							{'teamId': teamId},
							{$push: { 
								"hoursData": totalHours,
								"pointsData": totalStoryPoints
							}},
							function(err, result) {
								assert.equal(err, null);
								socketio.sockets.in(teamId).emit('mark burndown', {newHours: totalHours, newPoints: totalStoryPoints});
								return res.json({type: "success", newHours: totalHours, newPoints: totalStoryPoints });
							}
						);

					}
				);
			}
			else {
				return res.json({ type: "error", error: "You do not have permissions to do anything for this team."});
			}
		}
		else {
			return res.json({ type: "error", error: "This team does not exist."});
		}
	});
});

app.post('/undoBurndown', requiresLogin, checkPostPermissionForTeam, function(req, res) {
	var teamId = req.body.teamId;

	burndownsCollection.updateOne(
		{'teamId': teamId},
		{$pop: { 
			"hoursData": 1,
			"pointsData": 1
			}
		},
		function(err, result) {
			assert.equal(err, null);
			socketio.sockets.in(teamId).emit('undo burndown', {});
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

http.listen(process.env.PORT || 5000)
console.log("RUNNING ON PORT 5000");