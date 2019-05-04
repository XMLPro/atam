#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const rls = require('readline-sync');

const consts = require('./consts');
const mkdotfile = require('./mkdotfile');
const color = require('./message_color');

const loginUrl = `${consts.atcoderUrl}/login`;
const cookiePath = `${mkdotfile.dotfilePath}/cookieLogin.json`;

const loginByNameAndPW = async () => {
  mkdotfile.mkdotfile();
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();

  try {
    await page.goto(loginUrl);
  } catch (e) {
    console.log(color.error('check network connection.'));
    browser.close();
    return;
  }

  const username = rls.question('username: ');
  const password = rls.question('password: ', { hideEchoBack: true });
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  // 60000msでタイムアウトし、ページが遷移するまで待機する設定
  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: 'domcontentloaded',
  });
  await page.click('#submit');
  // 待つ
  await navigationPromise;

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
  fs.writeFileSync(cookiePath, JSON.stringify(cookies));

  await browser.close();
};

const loginByCookie = async () => {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();

  // cookiesの読み込み
  let cookies;
  try {
    cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
  } catch (e) {
    console.log(color.error('Error!! Faild login.'));
    console.log('Try "atam -l"');
    browser.close();
    process.exit(1);
  }
  await page.setCookie(...cookies);

  return [page, browser];
};


exports.loginByNameAndPW = loginByNameAndPW;
exports.loginByCookie = loginByCookie;
