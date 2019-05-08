const puppeteer = require('puppeteer');

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

async function waitFor(page, func) {
  await Promise.all([
    func(page),
    page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' }),
  ]);
}

module.exports = {
  createBrowser,
  helpMessage,
  waitFor,
};
