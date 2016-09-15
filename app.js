var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
yaml = require('js-yaml');
fs   = require('fs');

// Get document, or throw exception on error
// try {
//   var app_list = yaml.safeLoad(fs.readFileSync('./app_list.yml', 'utf8'));
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
require('../jayme/app.js')(io)

// router
// =============================================================================

var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

var exec = require('child_process').exec;

// receive json from git webhook
router.route('/push').post(function(req, res) {
    var cmd = `cd ~/${req.repository.name} && git pull && sleep 5 && npm install && pm2 restart app`
    console.log(req);
    exec(cmd, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });
    res.sendStatus(200)
});

app.use('/api', router);

http.listen(80, function() {
    console.log('app running in port 80');
})

module.exports = app;
