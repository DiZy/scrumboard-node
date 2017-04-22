const MongoCollection = require('./modules/MongoCollection');
const usersCollection = new MongoCollection('users');
const companiesCollection = new MongoCollection('companies');
const teamsCollection = new MongoCollection('teams');
const storiesCollection = new MongoCollection('stories');
const burndownsCollection = new MongoCollection('burndowns');

const assert = require('assert');

function hasSocketPermissionForTeam(socket, teamId, callback) {
	teamsCollection.find({'_id': teamId}, function(err, results) {
		assert.equal(err, null);
		if(results.length == 1) {
			var team = results[0];
			if(team.companyId == socket.request.session.companyId) {
				callback();
			}
			else {
				console.log('not match');
			}
		}
		else {
			console.log('mongo issue');
		}
	});
}

module.exports = function(socket) {
	if(!socket.request.session.userId || !socket.request.session.companyId) {
		//How to throw error?
	} else {
		socket.on('join room', function(teamId) {
	        hasSocketPermissionForTeam(socket, teamId, function() {
	        	if(socket.room) {
	        		// console.log('leaving: ' + socket.room);
	        		socket.leave(socket.room);
	        	}
	        	socket.room = teamId;
	        	socket.join(teamId);
	        	// console.log(teamId + " joined");
	        });
	    });
	}
}