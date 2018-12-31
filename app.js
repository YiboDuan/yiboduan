const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const yaml = require('js-yaml');
const fs   = require('fs');
const router = express.Router();
const child_process = require('child_process');

const environment = process.env.NODE_ENV || 'dev';
console.log(`launching application in ${environment} mode`);

function exec(cmd) {
  const buffer_output = child_process.execSync(cmd);
  if (buffer_output.length > 0) {
    console.log(buffer_output.toString());
  }
}

let app_config = null;
try {
  app_config = yaml.safeLoad(fs.readFileSync('app_config.yaml', 'utf8'));
} catch (e) {
  console.log(e);
}

const env_config = app_config.environments[environment];

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

app_config_list = app_config.app_list
console.log(`loading apps...${app_config_list.map(x => `\n${x.repo_name}`)}`);

const working_directory = '..'; // currently always the parent directory
for (var config of app_config_list) {
  const base_path = `${working_directory}/${config.repo_name}`

  console.log(`checking base path: ${base_path}`);
  if (fs.existsSync(base_path)) {
    console.log('repo found!')
  } else {
    console.log('repo not found, cloning...')
    exec(`cd ${working_directory} && git clone ${config.git_ssh_url}`);
  }

  if (env_config.pull_latest_code_on_startup) {
    console.log('pulling latest code');
    exec(`cd ${base_path} && git pull`);
  }

  const client_dir_path = `${base_path}/${config.client_files_relative_path}`;
  console.log(`serving static files at ${client_dir_path} to ${config.route}`);

  app.use(config.route, express.static(client_dir_path));

  if (config.server_entry_point_path) {
    const server_entry_point = `${base_path}/${config.server_entry_point_path}`;
    console.log(`using routing and io logic in ${server_entry_point}`);
    require(server_entry_point)(router, io);
  }
}

// router
// =============================================================================
require('./app/api.js')(router);
app.use('/', router);

http.listen(env_config.port, () => {
    console.log('app running in port ' + env_config.port);
})

module.exports = app;
