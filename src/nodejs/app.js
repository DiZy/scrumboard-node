var express = require('express');
var app = express();
var path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
    res.send("Hello World");
});

app.listen(5000);
console.log("RUNNING ON PORT 5000");