const fs = require('fs');
const rls = require('readline-sync');

const consts = require('./consts');
const color = require('./message_color');
const utils = require('./utils');

const loginUrl = `${consts.atcoderUrl}/login`;
const mkdotfile = require('./mkdotfile');

const loginByNameAndPW = async () => {
  mkdotfile.mkdotfile();
  const [page, browser] = await utils.createBrowser();

  try {
    await utils.waitFor(page, p => p.goto(loginUrl));
  } catch (e) {
    console.log(color.error('check network connection.'));
    browser.close();
    return;
  }

  const username = rls.question('username: ');
  const password = rls.question('password: ', { hideEchoBack: true });
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  await utils.waitFor(page, p => p.click('#submit'));

  // 要素にアンダースコアが入っているので仕方なし
  /* eslint no-underscore-dangle:
     ["error", { "allow": ["_targetInfo", "_target"] }] */
  const urlAfterLogging = await page._target._targetInfo.title;

  if (urlAfterLogging === loginUrl) {
    console.log(color.error('Error! Wrong username or password.'));
    await browser.close();
    process.exit();
  } else {
    console.log(color.success('Complete login!!'));
  }
  // cookie取得
  const cookies = await page.cookies();
  fs.writeFileSync(consts.cookiePath, JSON.stringify(cookies));

  await browser.close();
};

const loginByCookie = async (headless = true) => {
  // cookiesの読み込み
  const cookies = utils.getCookie();
  if (cookies == null) process.exit(1);

  const [page, browser] = await utils.createBrowser(headless);
  await page.setCookie(...cookies);

  return [page, browser];
};

module.exports = {
  loginByNameAndPW,
  loginByCookie,
};
