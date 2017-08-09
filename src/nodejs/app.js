//Requirements
const express = require('express');
const app = express();
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');
const session = require('express-session');
const collections = require('./modules/collections');
const morgan = require('morgan');

//TODO: remove
const loggedInRedirect = require('./controllers/helpers').loggedInRedirect;
const requiresLoginRedirect = require('./controllers/helpers').requiresLoginRedirect;

let server = require('http').Server(app);
let socketio = require('socket.io')(server);
let socketInit = require('./socketInit');
const routes = require('./controllers')(socketio);

//App Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/assets/', express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let sessionMiddleware = session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'everything is secret'
});
app.use(morgan('tiny'));
app.use(sessionMiddleware);

app.use('/', routes);

app.get('/home', requiresLoginRedirect, function(req, res) {
    res.render('pages/teamhome');
});

socketio.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

socketio.on('connection', socketInit);

app.get('/', loggedInRedirect, function(req, res) {
    res.render('pages/index');
});

server.listen(process.env.PORT || 5000, function() {
    console.log("RUNNING ON PORT 5000");
});