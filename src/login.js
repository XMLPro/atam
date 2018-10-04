#!/usr/bin/env node
'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const rls = require('readline-sync');

const mkdotfile = require('./mkdotfile');

const login_url = "https://beta.atcoder.jp/login";
const cookie_path = `${mkdotfile.dotfile_path}/cookie_login.json`;

const loginByNameAndPW = async() => {
  mkdotfile.mkdotfile();
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();

  try {
    await page.goto(login_url);
  } catch (e) {
    console.log(e);
    console.log('check network connection.');
    browser.close();
    return;
  }

  let username = rls.question('username: ');
  let password = rls.question('password: ', {hideEchoBack: true});
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  // 60000msでタイムアウトし、ページが遷移するまで待機する設定
  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: "domcontentloaded"
  });
  await page.click('#submit');
  // 待つ
  await navigationPromise;
  const url_after_logging = await page['_target']['_targetInfo']['title'];

  if(url_after_logging == login_url){
    console.log('Error! Wrong username or password.');
    await browser.close();
    return;
  }
  else console.log('Complete login!!');
  // cookie取得
  const cookies = await page.cookies();
  fs.writeFileSync(cookie_path, JSON.stringify(cookies));

  await browser.close();
};

const loginByCookie = async() => {
  const browser = await puppeteer.launch({
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();

  // cookiesの読み込み
  const cookies = JSON.parse(fs.readFileSync(cookie_path, 'utf-8'));
  for(let cookie of cookies) await page.setCookie(cookie);

  browser.close();
  return [page, browser];
}


exports.loginByNameAndPW = loginByNameAndPW;
exports.loginByCookie = loginByCookie;

