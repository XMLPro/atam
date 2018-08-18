const puppeteer = require('puppeteer');
const fs = require('fs');
const readlinesync = require('readline-sync');

const cookie_path = './cookie_login.json';
const login_url = "https://beta.atcoder.jp/login";
const atcoder_url = 'https://beta.atcoder.jp/';

const first_login = async() => {
  // 各自入力してください
  const username = "";
  const password = "";
  
  // インスタンス作成
  const browser = await puppeteer.launch({
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.goto(login_url);
  
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

  // ログイン確認用スクリーンショット
  await page.screenshot({path: "check_login.png"});

  // cookie取得
  const cookies = await page.cookies();
  // ファイルに保持
  fs.writeFileSync(cookie_path, JSON.stringify(cookies));

  await browser.close();
};

const login_by_cookie = async() => {
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

  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: "domcontentloaded"
  });
  await page.goto(atcoder_url);

  await navigationPromise;
  // 確認用スクリーンショット
  await page.screenshot({path: "login_by_cookie.png"});

  await browser.close();
}


(async() => {
  await first_login();
  await login_by_cookie();
})();
