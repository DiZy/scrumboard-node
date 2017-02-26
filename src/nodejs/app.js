var express = require('express');
var app = express();
var path = require('path');
var assert = require('assert');
var bodyParser = require('body-parser');

var mongoUrl = process.env.SCRUM_MONGO;
var MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/assets/', express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.post('/signUp', function(req, res) {
	MongoClient.connect(mongoUrl, function(err, db) {
		assert.equal(null, err);
	  	var scrumDb = db.db('scrumboardnode');
	  	var users = db.collection('users');
	  	var companies = db.collection('companies');
	  	//remember to insert a user and a company that match
	  	// users.insert({
	  	// 	test: 'test'
	  	// });
		db.close();
	});

	console.log(req.body);

	res.json({type: "success"});
});

app.listen(5000);
console.log("RUNNING ON PORT 5000");