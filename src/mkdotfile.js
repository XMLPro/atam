#!/usr/bin/env node
const fs = require('fs');
const os = require('os');

const dotfilePath = `${os.homedir()}/.atam`;

function mkdotfile() {
  try {
    fs.readdirSync(dotfilePath);
  } catch (e) {
    fs.mkdirSync(dotfilePath);
  }
}

exports.dotfilePath = dotfilePath;
exports.mkdotfile = mkdotfile;
