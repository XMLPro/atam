#!/usr/bin/env node

const program = require('commander');

const actions = require('./command_actions');
const utils = require('./utils');

const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .usage('<command> -h');

program
  .command('login')
  .alias('l')
  .description('Login AtCoder')
  .action(actions.login)
  .on('--help', () => {
    utils.helpMessage({
      example: [
        'login', 'l',
      ],
    });
  });

program
  .command('test <prob> <number> [commands...]')
  .alias('t')
  .description('Check sample case')
  .action(actions.sample)
  .on('--help', () => {
    utils.helpMessage({
      message: [
        'prob (e.g.: abc)',
        'number (e.g.: 001)',
        'commands (e.g.: python main.py)',
      ],
      example: [
        'test abc 001 node main.js',
        'test abc 010 ./a.out',
        't abc 011 python main.py',
      ],
    });
  });

program
  .command('submit <prob> <number> <filename>')
  .alias('s')
  .description('Submit your code')
  .action(actions.submit)
  .on('--help', () => {
    utils.helpMessage({
      message: [
        'prob (e.g.: abc)',
        'number (e.g.: 001)',
      ],
      example: [
        'submit abc 001 main.js',
        's abc 011 main.py',
      ],
    });
  });

program
  .parse(process.argv);

module.exports = program;
