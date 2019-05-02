#!/usr/bin/env node

const opt = require('./options');
// const mkdotfile = require('./mkdotfile');
const gets = require('./gets');
const login = require('./login');
const { submit } = require('./submit');

const command = opt.args;
const filename = command[0];
const prob = command[1];
const number = command[2];


(async () => {
  if (opt.login) {
    login.loginByNameAndPW();
    return;
  }
  if (filename && prob && number) {
    const data = await login.loginByCookie();
    const page = data[0];
    const browser = data[1];

    const sourceCode = gets.getSource(filename);
    const lang = await gets.getLangId(page, prob, number);
    const task = await gets.getProblemId(page, prob, number);
    await submit(page, prob, number, task, lang, sourceCode);
    browser.close();
  } else {
    opt.outputHelp();
  }
})();
