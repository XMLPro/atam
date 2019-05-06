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

async function syncEach(array, f) {
  const createFunc = value => () => f(value);
  let tmp = { then: dummy => dummy() };
  while (array.length !== 0) {
    tmp = tmp.then(createFunc(array.shift()));
  }
  await tmp;
}

async function syncMap(array, f) {
  const result = [];
  const createFunc = value => (ret) => {
    result.push(ret);
    return f(value);
  };
  let tmp = { then: dummy => dummy() };
  while (array.length !== 0) {
    tmp = tmp.then(createFunc(array.shift()));
  }
  return tmp.then(ret => result.slice(1).concat(ret));
}

module.exports = {
  createBrowser,
  helpMessage,
  syncEach,
  syncMap,
};
