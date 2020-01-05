const utils = require('./utils');
const consts = require('./consts');

function mkdotfile() {
  utils.mkdirIfNotExists(consts.dotfilePath);
}

exports.mkdotfile = mkdotfile;
