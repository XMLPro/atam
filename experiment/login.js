const puppeteer = require('puppeteer');

const login = async() => {
  const browser = await puppeteer.launch({
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
    ]
  });


  const login_url = "https://beta.atcoder.jp/login";
  username = "";
  password = "";

  const page = await browser.newPage();
  await page.goto(login_url);
  
  // usename欄にusername書いて
  await page.type('input[name="username"]', username);
  // password欄にpassword書いて
  await page.type('input[name="password"]', password);
  // ログインをクリック
  await page.click('#submit');

  // ログイン確認用スクリーンショット
  // await page.screenshot({path: "check_login.png"});

  await browser.close();
};

login();

