const puppeteer = require('puppeteer');
const queryString = require('query-string')
const fs = require('fs');
const login = require('./login')

const base_url = 'https://beta.atcoder.jp/contests/'
const cookie_path = './cookie_login.json';
const submit = async(prob, prob_number, prob_hard, lang, source_code) => {
  const submit_url = `${base_url}${prob}${prob_number}/submit`

  data = await login.loginByCookie(submit_url)
  page = data[0];
  browser = data[1];

  await page.screenshot({path: 'submit_result1.png'}); // debug!!!!!!!!

  const task = `${prob}${prob_number}_${prob_hard}`;
  await page.select('select[name="data.TaskScreenName"]', task);
  await page.select('select[name="data.LanguageId"]', lang);
  await page.click('button.btn-toggle-editor');
  await page.type('textarea[name="sourceCode"]', source_code);
  page.click('#submit');
  await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});

  await page.screenshot({path: 'submit_result2.png'}); // debug!!!!!!!!

  await browser.close();
}

exports.submit = submit;
