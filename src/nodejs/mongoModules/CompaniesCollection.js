var mongoUrl = process.env.SCRUM_MONGO;
var MongoClient = require('mongodb').MongoClient;
CompaniesCollection = function() {
	var that = this;
	MongoClient.connect(mongoUrl, function(err, db){
		if(err) { 
			return console.dir(err); 
		}
		that.db = db;
	})
}

CompaniesCollection.prototype.getCollection= function(callback) {
	this.db.collection('companies', function(error, companiesCollection) {
		if(error) {
			callback(error);
		}
		else {
			callback(null, companiesCollection);
		}
	});
};

CompaniesCollection.prototype.find = function(user, callback) {
	this.getCollection(function(error, companiesCollection) {
		if(error) {
			callback(error)
		}
		else {
			companiesCollection.find(user).toArray(function(error, results) {
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

CompaniesCollection.prototype.insert = function(user, callback) {
	this.getCollection(function(error, companiesCollection) {
		if(error){
			callback(error);
		}
		else {

			companiesCollection.insert(user, function() {
				callback(null, user);
			});
		}
	});	
};

module.exports = new CompaniesCollection();