const puppeteer = require('puppeteer');
const queryString = require('query-string')
const fs = require('fs');

const base_url = 'https://beta.atcoder.jp/contests/'
const cookie_path = './cookie_login.json';
const submit = async(prob, prob_number, prob_hard, lang, source_code) => {
  const submit_url = `${base_url}${prob}${prob_number}/submit`
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const cookies = JSON.parse(fs.readFileSync(cookie_path, 'utf-8'));
  for(let cookie of cookies) await page.setCookie(cookie);

  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: 'domcontentloaded'
  });
  await page.goto(submit_url);
  await navigationPromise;

  const task = `${prob}${prob_number}_${prob_hard}`;
  await page.select('select[name="data.TaskScreenName"]', task);
  await page.select('select[name="data.LanguageId"]', lang);
  await page.click('button.btn-toggle-editor');
  await page.type('textarea[name="sourceCode"]', source_code);
  page.click('#submit');
  await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
  
  await browser.close();
}

exports.submit = submit;
