const loginMod = require('./login');
const submitMod = require('./submit');
const gets = require('./gets');

async function login() {
  loginMod.loginByNameAndPW();
}

async function submit(filename, prob, number) {
  const [page, browser] = await loginMod.loginByCookie();

  const sourceCode = gets.getSource(filename);
  // const lang = await gets.getLangId(page, prob, number);
  // const task = await gets.getProblemId(page, prob, number);
  const lang = '3023';
  const task = 'abc001_1';
  await submitMod.submit(page, prob, number, task, lang, sourceCode);
  browser.close();
}

module.exports = {
  login,
  submit,
};
