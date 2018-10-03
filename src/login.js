#!/usr/bin/env node
'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const rls = require('readline-sync');

const mkdotfile = require('./mkdotfile');

const login_url = "https://beta.atcoder.jp/login";
const cookie_path = `${mkdotfile.dotfile_path}/cookie_login.json`;

const loginByNameAndPW = async() => {
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
  // usename欄にusername書いて
  await page.type('input[name="username"]', username);
  // password欄にpassword書いて
  await page.type('input[name="password"]', password);
  // 60000msでタイムアウトし、ページが遷移するまで待機する設定
  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: "domcontentloaded"
  });
  // ログインをクリック
  await page.click('#submit');
  // 待つ
  await navigationPromise;

  // cookie取得
  const cookies = await page.cookies();
  // ファイルに保持
  fs.writeFileSync(cookie_path, JSON.stringify(cookies));

  await browser.close();
};

const loginByCookie = async() => {
  // インスタンス作成
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

  return [page, browser];
}

exports.loginByNameAndPW = loginByNameAndPW;
exports.loginByCookie = loginByCookie;

