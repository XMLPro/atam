const puppeteer = require('puppeteer');
const notifier = require('node-notifier');
const https = require('https');
const fs = require('fs');

const color = require('./message_color');
const consts = require('./consts');

async function createBrowser() {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  return [page, browser];
}

function helpMessage({ message, example }) {
  if (message) {
    console.log();
    message.forEach(e => console.log(e));
  }
  if (example) {
    console.log('\nExamples:\n');
    example.forEach(e => console.log(`  'atam ${e}'`));
  }
  console.log();
}

// 結果を通知する。
async function printResult(scrapingData) {
  const head = 'case\tstat\ttime\tmemory';
  const formated = scrapingData.slice(1).map((row) => {
    let textName = row[0].substr(0, 5);
    if (row[0].length > 5) {
      textName += '..';
    }
    return [textName, ...row.slice(1)].join('\t');
  });

  notifier.notify({
    title: 'atcoder',
    message: head + formated.join('\n'),
    wait: 0.1, // 通知が終了するのを待たない
  });
}

async function waitFor(page, func) {
  await Promise.all([
    func(page),
    page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' }),
  ]);
}

async function syncEach(array, f) {
  const createFunc = value => () => f(value);
  let prev = Promise.resolve();
  while (array.length !== 0) {
    prev = prev.then(createFunc(array.shift()));
  }
  await prev;
}

async function syncMap(array, f) {
  const result = [];
  const createFunc = value => (ret) => {
    result.push(ret);
    return f(value);
  };
  let prev = Promise.resolve();
  while (array.length !== 0) {
    prev = prev.then(createFunc(array.shift()));
  }
  return prev.then(ret => result.slice(1).concat(ret));
}

function getCookie() {
  try {
    return JSON.parse(fs.readFileSync(consts.cookiePath, 'utf-8'));
  } catch (e) {
    console.log(color.error('Error!! Faild login.'));
    console.log('Try "atam -l"');
    return null;
  }
}

function getRequest(prob, type, callback) {
  const path = `/contests/${prob}/${type}`;
  const { hostname } = new URL(consts.atcoderUrl);

  const cookies = getCookie();
  if (cookies == null) process.exit(1);
  const cookie = cookies.map(e => `${e.name}=${e.value}`);
  const headers = { cookie };

  return new Promise((resolve) => {
    const req = https.request({ hostname, path, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => resolve(callback(data)));
    });

    req.end();
  });
}

module.exports = {
  createBrowser,
  helpMessage,
  printResult,
  waitFor,
  syncEach,
  syncMap,
  getRequest,
  getCookie,
};
