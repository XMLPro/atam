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
  .command('test [prob] [commands...]')
  .alias('t')
  .option('-f, --force', 'Not use config file')
  .description('Check sample case')
  .action(actions.sample)
  .on('--help', () => {
    utils.helpMessage({
      message: [
        'prob (e.g.: abc001)',
        'commands (e.g.: python main.py)',
      ],
      example: [
        'test abc001 node main.js',
        'test abc010 ./a.out',
        't abc011 python main.py',
      ],
    });
  });

program
  .command('submit [prob] [filename]')
  .alias('s')
  .option('-f, --force', 'Not use config file')
  .description('Submit your code')
  .action(actions.submit)
  .on('--help', () => {
    utils.helpMessage({
      message: [
        'prob (e.g.: abc001)',
      ],
      example: [
        'submit abs main.js',
        's abc011 main.py',
      ],
    });
  });

program
  .command('new <prob>')
  .alias('n')
  .description('Create dir tree')
  .action(actions.createDirTreeCmd)
  .on('--help', () => {
    utils.helpMessage({
      message: [
        'prob (e.g.: abc001)',
      ],
      example: [
        'new abc001',
        'n abs',
      ],
    });
  });

program
  .command('term')
  .description('Open atcoder problems with terminal')
  .action(actions.termCmd)
  .on('--help', () => {
    utils.helpMessage({
      example: [
        'term',
      ],
    });
  });

program
  .parse(process.argv);

module.exports = program;
