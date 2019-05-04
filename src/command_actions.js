// const utils = require('./utils');
// const gets = require('./gets');
const loginMod = require('./login');
const submitMod = require('./submit');
const gets = require('./gets');
//
// async function sampleCase(prob, number, ...commands) {
//   const task = 'abc001_1';
//   const [browser, page] = await utils.createBrowser();
//   const samples = await gets.getSamples(page, prob, number, task);
//   // samples.each(() => {
//   //   console.log(this);
//   // });
//
//   browser.close();
// }
//
// async function test() {
//   console.log("this is test");
// }

async function login() {
  loginMod.loginByNameAndPW();
}

async function submit(filename, prob, number) {
  const [page, browser] = await loginMod.loginByCookie();

  const sourceCode = gets.getSource(filename);
  const lang = await gets.getLangId(page, prob, number);
  const task = await gets.getProblemId(page, prob, number);
  await submitMod.submit(page, prob, number, task, lang, sourceCode);
  browser.close();
}

module.exports = {
  login,
  submit,
};
