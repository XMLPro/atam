const fs = require('fs');

const consts = require('./consts');

function get(options) {
  if (options.force) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(consts.confPath, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function save(config) {
  fs.writeFileSync(consts.confPath, JSON.stringify(config));
}

module.exports = {
  get,
  save,
};
