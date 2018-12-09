var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var yaml = require('js-yaml');
// var fs   = require('fs');
var router = express.Router();

// Get document, or throw exception on error
// try {
//   var app_list = yaml.safeLoad(fs.readFileSync('./something.yml', 'utf8'));
//   console.log(app_list);
// } catch (e) {
//   console.log(e);
// }

// middleware
app.use(function(req, res, next) {
    console.log(`${req.method} request for '${req.url}`);
    next();
});

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app routing TODO: refactor to dynamically serve content and setup socket listening
app.use('/', express.static('./app'))
app.use('/trace-race', express.static('../jayme/app'));
require('../jayme/app.js')(router, io);
app.use('/jigrambe', express.static('../jigrambe/app'));
app.use('/betabattles', express.static('../betabattles/client'));
require('../betabattles/server/init.js')(router, io);

// router
// =============================================================================
require('./app/api.js')(router);
app.use('/', router);

var port = 80;
http.listen(port, function() {
    console.log('app running in port ' + port);
})

module.exports = app;
