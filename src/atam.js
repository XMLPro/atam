#!/usr/bin/env node

const opt = require('./options');

if (opt.args.length === 0) {
  opt.outputHelp();
}
