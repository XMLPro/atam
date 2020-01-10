const inquirer = require('inquirer');
const Fuse = require('fuse.js');
const fs = require('fs');
const autocompletePrompt = require('inquirer-autocomplete-prompt');
const cheerio = require('cheerio');

const consts = require('./consts');
const utils = require('./utils');

const baseUrl = `${consts.atcoderUrl}/contests/`;
const langIdOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'lang',
  ],
};

const problemIdOptions = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    'problem',
  ],
};

async function getSamples(page, prob, task) {
  const url = `${baseUrl}${prob}/tasks/${task}`;

  await page.goto(url);

  let samples = await page.$$('pre[id^="pre-sample"]');
  if (samples.length === 0) {
    samples = await page.$$('pre[id^="for_copy"]');
  }

  const results = await utils.syncMap(samples,
    async value => (await value.getProperty('textContent')).jsonValue());
  const sampleCase = Array.from({
    length: results.length / 2,
  }).map((v, i) => [results[i * 2], results[i * 2 + 1]]);
  return sampleCase; // input, output
}

async function getLangId(loginedPage, prob) {
  const url = `${baseUrl}${prob}/submit`;

  await utils.waitFor(loginedPage, p => p.goto(url));

  const items = await loginedPage.$$('select[name="data.LanguageId"] option');
  const langId = {};
  await Promise.all(items.map(async (item) => {
    const id = await (await item.getProperty('value')).jsonValue();
    const lang = await (await item.getProperty('textContent')).jsonValue();
    langId[lang] = id;
  }));


  const language = Object.keys(langId).map(elm => ({ lang: elm }));

  const fuse = new Fuse(language, langIdOptions);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', autocompletePrompt);

  return prompt({
    type: 'autocomplete',
    name: 'lang',
    message: '言語を選んでね！！！！ >> ',
    source: async (answer, input) => (
      input ? fuse.search(input) : language
    ).map(elm => elm.lang),
  }).then(answer => langId[answer.lang]);
}

async function getProblemIds(prob) {
  const ids = await utils.getRequest(prob, 'submissions/me', (data) => {
    const $ = cheerio.load(data);
    const result = {};
    $('#select-task option').each((i, e) => {
      const elm = $(e);
      const id = elm.attr('value');
      if (id !== '') result[elm.text()] = id;
    });
    return result;
  });
  return ids;
}

async function getProblemId(loginedPage, prob) {
  const taskScreenName = await getProblemIds(prob);
  const task = Object.keys(taskScreenName).map(elm => ({ problem: elm }));

  const fuse = new Fuse(task, problemIdOptions);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', autocompletePrompt);

  return prompt({
    type: 'autocomplete',
    name: 'problem',
    message: '問題を選んでね！！！！ >> ',
    source: async (answer, input) => (
      input ? fuse.search(input) : task
    ).map(elm => elm.problem),
  }).then(answer => taskScreenName[answer.problem]);
}

function getSource(sourceName) {
  const source = fs.readFileSync(sourceName, 'utf-8');
  return source;
}

async function getResult(page, prob, sids) {
  const url = `${consts.atcoderUrl}/contests/${prob}/submissions/${sids}`;

  await Promise.all([
    page.goto(url),
    page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' }),
  ]);

  const information = await page.evaluate(
    item => Array.from(item.querySelectorAll('td')).map(e => e.textContent),
    await page.waitForSelector('.panel.panel-default'),
  );

  // スクレイピングによりデータを取得し、整形する。
  const result = await page.evaluate(() => {
    // tableクラス内の要素を取り出す。
    const tableList = document.querySelectorAll('table');
    // 要素が適切にわけられた配列。
    // tableListを型変換しつつdataListに渡す。
    const dataList = Array.from(tableList).map(node => node.innerText);
    // AtCoderには、tableクラスの2番目にサンプルの可否があるので、そこだけ取り出す。
    // 改行区切りで分割。
    if (dataList.length > 2) {
      const data = dataList[2].split('\n');
      // 各要素をタブで分割する。二次元配列になる。
      return data.map(value => value.split('\t'));
    }
    return '';
  });
  return { information, result };
}

module.exports = {
  getLangId,
  getProblemId,
  getProblemIds,
  getSource,
  getSamples,
  getResult,
};
