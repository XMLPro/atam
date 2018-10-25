const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const Fuse = require('fuse.js');
const fs = require('fs');

const base_url = 'https://beta.atcoder.jp/contests/';
const lang_id_options = {
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

const problem_id_options = {
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

async function get_lang_id(logined_page, prob, prob_number) {
  const url = `${base_url}${prob}${prob_number}/submit`;

  await logined_page.goto(url);

  const items = await logined_page.$$('select[name="data.LanguageId"] option');
  const langId = {};
  for (const item of items) {
    const id = await (await item.getProperty('value')).jsonValue();
    const lang = await (await item.getProperty('textContent')).jsonValue();
    langId[lang] = id;
  }


  const language = Object.keys(langId).map(elm => ({ lang: elm }));

  const fuse = new Fuse(language, lang_id_options);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

  return prompt({
    type: 'autocomplete',
    name: 'lang',
    message: '言語を選んでね！！！！ >> ',
    source: async (answer, input) => (
      input ? fuse.search(input) : language
    ).map(elm => elm.lang),
  }).then(answer => langId[answer.lang]);
}


async function get_problem_id(logined_page, prob, prob_number) {
  const url = `${base_url}${prob}${prob_number}/submit`;

  await logined_page.goto(url);

  const items = await logined_page.$$('select[name="data.TaskScreenName"] option');
  const TaskScreenName = {};
  for (const item of items) {
    const id = await (await item.getProperty('value')).jsonValue();
    const problem = await (await item.getProperty('textContent')).jsonValue();
    TaskScreenName[problem] = id;
  }


  const Task = Object.keys(TaskScreenName).map(elm => ({ problem: elm }));

  const fuse = new Fuse(Task, problem_id_options);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

  return prompt({
    type: 'autocomplete',
    name: 'problem',
    message: '問題を選んでね！！！！ >> ',
    source: async (answer, input) => (
      input ? fuse.search(input) : Task
    ).map(elm => elm.problem),
  }).then(answer => TaskScreenName[answer.problem]);
}

function get_source(source_name) {
  const source = fs.readFileSync(source_name, 'utf-8');
  return source;
}


exports.get_lang_id = get_lang_id;
exports.get_problem_id = get_problem_id;
exports.get_source = get_source;
