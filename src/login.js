#!/usr/bin/env node


const puppeteer = require('puppeteer');
const fs = require('fs');
const rls = require('readline-sync');

const mkdotfile = require('./mkdotfile');

const loginUrl = 'https://beta.atcoder.jp/login';
const cookiePath = `${mkdotfile.dotfile_path}/cookieLogin.json`;

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
    console.log(e);
    console.log('check network connection.');
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
  const urlAfterLogging = await page._target._targetInfo.title;

  if (urlAfterLogging == loginUrl) {
    console.log('Error! Wrong username or password.');
    await browser.close();
    return;
  }
  console.log('Complete login!!');
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
  const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
  for (const cookie of cookies) await page.setCookie(cookie);

  return [page, browser];
};


exports.loginByNameAndPW = loginByNameAndPW;
exports.loginByCookie = loginByCookie;
