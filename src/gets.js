const inquirer = require('inquirer');
const Fuse = require('fuse.js');
const fs = require('fs');
const autocompletePrompt = require('inquirer-autocomplete-prompt');

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


async function getProblemId(loginedPage, prob) {
  const url = `${baseUrl}${prob}/submit`;

  await utils.waitFor(loginedPage, p => p.goto(url));

  const items = await loginedPage.$$('select[name="data.TaskScreenName"] option');
  const TaskScreenName = {};
  await Promise.all(items.map(async (item) => {
    const id = await (await item.getProperty('value')).jsonValue();
    const problem = await (await item.getProperty('textContent')).jsonValue();
    TaskScreenName[problem] = id;
  }));

  const Task = Object.keys(TaskScreenName).map(elm => ({ problem: elm }));

  const fuse = new Fuse(Task, problemIdOptions);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', autocompletePrompt);

  return prompt({
    type: 'autocomplete',
    name: 'problem',
    message: '問題を選んでね！！！！ >> ',
    source: async (answer, input) => (
      input ? fuse.search(input) : Task
    ).map(elm => elm.problem),
  }).then(answer => TaskScreenName[answer.problem]);
}

function getSource(sourceName) {
  const source = fs.readFileSync(sourceName, 'utf-8');
  return source;
}


module.exports = {
  getLangId,
  getProblemId,
  getSource,
  getSamples,
};
