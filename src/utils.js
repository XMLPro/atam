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

module.exports = {
  createBrowser,
  helpMessage,
  printResult,
};
