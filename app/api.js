module.exports = function(router) {
    var exec = require('child_process').exec;
    var crypto = require('crypto');
    // receive json from git webhook
    router.route('/api/push').post(function(req, res) {
        if(req.headers['x-hub-signature'] !== undefined) {
            const hash = crypto.createHmac('sha1', process.env.SECRET_TOKEN)
                   .update(req.body)
                   .digest('hex');
            console.log(req.headers['x-hub-signature'])
            console.log('sha1=' + hash);
        }

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
