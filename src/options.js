#!/usr/bin/env node

var program = require('commander');
const login = require('./login');

program
  .version('0.0.1')
  .usage('<filename> <prob(e.g.: abc)> <number(e.g.: 001)>')
  .option('-l,  --login', 'Login AtCoder')
  .parse(process.argv);

  if (program.login) login.loginByNameAndPW();

module.exports = program
