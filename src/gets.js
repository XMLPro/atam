const inquirer = require('inquirer');
const Fuse = require('fuse.js');
const fs = require('fs');

const autocompletePrompt = require('inquirer-autocomplete-prompt');

const baseUrl = 'https://beta.atcoder.jp/contests/';
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

async function getLangId(loginedPage, prob, probNumber) {
  const url = `${baseUrl}${prob}${probNumber}/submit`;

  await loginedPage.goto(url);

  const items = await loginedPage.$$('select[name="data.LanguageId"] option');
  const langId = {};
  console.log('ok');
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


async function getProblemId(loginedPage, prob, probNumber) {
  const url = `${baseUrl}${prob}${probNumber}/submit`;

  await loginedPage.goto(url);

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


exports.getLangId = getLangId;
exports.getProblemId = getProblemId;
exports.getSource = getSource;
