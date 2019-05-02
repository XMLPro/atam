const chalk = require('chalk');

const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const success = chalk.keyword('green');
const info = chalk.keyword('blue');

module.exports = {
  error,
  warning,
  success,
  info,
};
