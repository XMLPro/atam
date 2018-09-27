const puppeteer = require('puppeteer');
const queryString = require('query-string')
const fs = require('fs');

const base_url = 'https://beta.atcoder.jp/contests/'
const cookie_path = '../cookie_login.json';
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
  item = await page.$('input[name=csrf_token]');
  const csrf_token = await (await item.getProperty('value')).jsonValue();
  console.log(csrf_token)

  const data = {
    'data.TaskScreenName': `${prob}${prob_number}_${prob_hard}`,
    'data.LanguageId': lang,
    'sourceCode': source_code,
    'csrf_token': csrf_token,
  }

  await page.setRequestInterception(true);
  page.on('request', request => {
    const overrides = {};
    overrides.method = 'POST';
    overrides.postData = queryString.stringify(data);
    request.continue(overrides);
  });
  await page.goto(submit_url);
  // 確認用スクリーンショット
  await page.screenshot({path: 'sb.png'});
  
  await browser.close();
}

(async() => {
  await submit('abc', '110', 'a', '3023', 'a = list(map(int, input().split())); print(max(a) * 9 + sum(a))');
})();

// module.exports = chalk_convert
