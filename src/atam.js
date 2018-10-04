#!/usr/bin/env node

const opt = require('./options');
const mkdotfile = require('./mkdotfile');
const gets = require('./gets');
const login = require('./login');
const {submit} = require('./submit');

const command = opt.args;
const filename = command[0];
const prob = command[1];
const number = command[2];

if (opt.login) {
  login.loginByNameAndPW();
  return;
}

(async() => {
  if(filename && prob && number) {
    const data = await login.loginByCookie();
    const page = data[0];
    const browser = data[1];

    const source_code = gets.get_source(filename);
    let lang = await gets.get_lang_id(page, prob, number);
    let task = await gets.get_problem_id(page, prob, number);
    await submit(page, prob, number, task, lang, source_code);
    browser.close();
  } else {
    opt.outputHelp();
  }
})()
