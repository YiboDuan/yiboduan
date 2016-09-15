module.exports = function(router) {
    var exec = require('child_process').exec;

    // receive json from git webhook
    router.route('/push').post(function(req, res) {
        console.log(req);
        var cmd = `cd ~/${req.body.repository.name} && git pull && sleep 5 && npm install && pm2 restart app`
        exec(cmd, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
        res.sendStatus(200)
    });
}
