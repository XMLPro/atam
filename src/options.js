#!/usr/bin/env node

const program = require('commander');
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .usage('<filename> <prob(e.g.: abc)> <number(e.g.: 001)>')
  .option('-l,  --login', 'Login AtCoder')
  .parse(process.argv);

module.exports = program;
