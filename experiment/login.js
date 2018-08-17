const puppeteer = require('puppeteer');
const fs = require('fs');

const cookie_path = './cookie_login.json';
const login_url = "https://beta.atcoder.jp/login";

const first_login = async() => {
  const username = "";
  const password = "";

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
  // 60000msでタイムアウトし、ページが遷移するまで待機する
  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: "domcontentloaded"
  });
  // ログインをクリック
  await page.click('#submit');
  await navigationPromise;
  // ログイン確認用スクリーンショット
  await page.screenshot({path: "check_login.png"});

  const cookies = await page.cookies();
  fs.writeFileSync(cookie_path, JSON.stringify(cookies));

  await browser.close();
};

const login_by_cookie = async() => {

  const browser = await puppeteer.launch({
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  
  console.log("A");

  const cookies = JSON.parse(fs.readFileSync(cookie_path, 'utf-8'));
  console.log(cookies);
  for(let cookie of cookies) await page.setCookie(cookie);

  await page.goto('https://beta.atcoder.jp/');

  await page.screenshot({path: "login_by_cookie.png"});

  await browser.close();
}

login_by_cookie();

