const os = require('os');

const utils = require('./utils');

const dotfilePath = `${os.homedir()}/.atam`;

function mkdotfile() {
  utils.mkdirIfNotExists(dotfilePath);
}

exports.dotfilePath = dotfilePath;
exports.mkdotfile = mkdotfile;
