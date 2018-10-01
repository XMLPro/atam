#!/usr/bin/env node
const fs = require('fs');
const os = require('os');

const dotfile_path = `${os.homedir()}/.atam`;

function mkdotfile() {
  try {
    let dir = fs.readdirSync(dotfile_path);
  }
  catch(e) {
    fs.mkdirSync(dotfile_path);
  }
}

exports.dotfile_path = dotfile_path;
exports.mkdotfile = mkdotfile;
