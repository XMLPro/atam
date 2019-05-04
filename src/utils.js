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

module.exports = {
  createBrowser,
  helpMessage,
};
