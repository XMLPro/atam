const puppeteer = require('puppeteer');
const queryString = require('query-string');
const fs = require('fs');
const login = require('./login');
const color = require('./message_color');

const baseUrl = 'https://beta.atcoder.jp/contests/';
const submissionsUrl = 'submissions/me';
const submit = async (loginedPage, prob, probNumber, task, lang, sourceCode) => {
  const submitUrl = `${baseUrl}${prob}${probNumber}/submit`;
  const page = loginedPage;

  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: 'domcontentloaded',
  });
  await page.goto(submitUrl);
  await navigationPromise;

  await page.select('select[name="data.TaskScreenName"]', task);
  await page.select('select[name="data.LanguageId"]', lang);
  await page.click('button.btn-toggle-editor');
  await page.type('textarea[name="sourceCode"]', sourceCode);

  page.click('#submit');
  await page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' });
  if(page.url().endsWith(submissionsUrl)){
    console.log(color.success('提出が完了しました'));
  } else {
    console.log(color.error('提出できませんでした'));
  }
  console.log('url: ' + await page.url())
};

exports.submit = submit;
