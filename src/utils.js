const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

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

module.exports = {
  createBrowser,
  helpMessage,
  printResult,
  syncEach,
  syncMap,
};
