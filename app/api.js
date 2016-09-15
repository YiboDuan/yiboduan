module.exports = function(router) {
    var exec = require('child_process').exec;
    var crypto = require('crypto');
    // receive json from git webhook
    router.route('/api/push').post(function(req, res) {
        // authenticate
        if(req.headers['x-hub-signature'] !== undefined) {
            const hash = crypto.createHmac('sha1', process.env.SECRET_TOKEN)
                            .update(JSON.stringify(req.body)) // need to do this because of bodyParser
                            .digest('hex');
            var signature = 'sha1=' + hash;
            if(signature !== req.headers['x-hub-signature']) {
                res.sendStatus(401);
                return;
            }
        }

        // go to project directory, pull and restart
        var cmd = `cd ~/${req.body.repository.name} && git pull && sleep 5 && cd ~/yiboduan && npm install && pm2 restart app`;
        exec(cmd, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
        res.sendStatus(200);
    });
}
