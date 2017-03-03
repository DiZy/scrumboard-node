var mongoUrl = process.env.SCRUM_MONGO;
var MongoClient = require('mongodb').MongoClient;
UsersCollection = function() {
	var that = this;
	MongoClient.connect(mongoUrl, function(err, db){
		if(err) { 
			return console.dir(err); 
		}
		that.db = db;
	})
}

UsersCollection.prototype.getCollection= function(callback) {
	this.db.collection('users', function(error, usersCollection) {
		if(error) {
			callback(error);
		}
		else {
			callback(null, usersCollection);
		}
	});
};

UsersCollection.prototype.find = function(user, callback) {
	this.getCollection(function(error, usersCollection) {
		if(error) {
			callback(error)
		}
		else {
			usersCollection.find(user).toArray(function(error, results) {
				if(error) {
					callback(error);
				}
				else {
					callback(null, results);
				}
			});
		}
	});
};

UsersCollection.prototype.insert = function(user, callback) {
	this.getCollection(function(error, usersCollection) {
		if(error){
			callback(error);
		}
		else {

			usersCollection.insert(user, function() {
				callback(null, user);
			});
		}
	});	
};

module.exports = new UsersCollection();