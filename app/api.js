module.exports = function(router) {
    var exec = require('child_process').exec;

    // receive json from git webhook
    router.route('/api/push').post(function(req, res) {
        console.log(req.headers)
        console.log(req.body);
        console.log(req.headers['x-hub-signature'])
        // wow

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
