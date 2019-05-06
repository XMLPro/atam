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
  .command('sample <prob> <number> [commands...]')
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
        'sample abc 001 main.js',
      ],
    });
  });

program
  .command('submit <filename> <prob> <number>')
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
