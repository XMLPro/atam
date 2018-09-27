#!/usr/bin/env node

var program = require('commander');
const login = require('./login');

program
  .version('0.0.1')
  .option('-l,  --login', 'Login AtCoder')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

  if (program.login) login.loginByNameAndPW();
  if (program.peppers) console.log('ぺっぱー');
  if (program.pineapple) console.log('ぱいなっぷる');
  if (program.bbqSauce) console.log('ばーべきゅーそーす');

module.exports = program

