const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const Fuse = require('fuse.js');

const base_url = "https://beta.atcoder.jp/contests/";
var options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "lang",
  ]};

async function get_lang_id(logined_page, prob, prob_number) {
  const url = `${base_url}${prob}${prob_number}/submit`;

  await logined_page.goto(url);

  const items = await logined_page.$$('select[name="data.LanguageId"] option');
  let langId = {};
  for (let item of items) {
    const id = await (await item.getProperty('value')).jsonValue();
    const lang = await (await item.getProperty('textContent')).jsonValue();
    langId[lang] = id;
  }


  const language = Object.keys(langId).map(elm => ({lang: elm}));

  const fuse = new Fuse(language, options);

  const prompt = inquirer.createPromptModule();
  prompt.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

  return prompt({
    type: "autocomplete",
    name: "lang",
    message: "言語を選んでね！！！！ >> ",
    source: async (answer, input) => (
      input ? fuse.search(input) : language
    ).map(elm => elm.lang),
  }).then(answer => langId[answer.lang]);
}

exports.get_lang_id = get_lang_id;
