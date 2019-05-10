const { spawn } = require('child_process');

const color = require('./message_color');
const consts = require('./consts');
const utils = require('./utils');

const submissionsUrl = 'submissions/me';
const baseUrl = `${consts.atcoderUrl}/contests/`;

const submit = async (loginedPage, prob, probNumber, task, lang, sourceCode) => {
  const submitUrl = `${baseUrl}${prob}${probNumber}/submit`;
  const page = loginedPage;

  await utils.waitFor(page, p => p.goto(submitUrl));

  await page.select('select[name="data.TaskScreenName"]', task);
  await page.select('select[name="data.LanguageId"]', lang);
  await page.click('button.btn-toggle-editor');
  await page.type('textarea[name="sourceCode"]', sourceCode);

  await utils.waitFor(page, p => p.click('#submit'));
  if ((await page.url()).endsWith(submissionsUrl)) {
    console.log(color.success('提出が完了しました'));
    const sids = await page.evaluate(
      item => item.getAttribute('data-id'),
      await page.waitForSelector('.submission-score'),
    );

    const proc = spawn('node', [`${__dirname}/result_announcer.js`, sids, prob, probNumber], { stdio: 'inherit' });
    proc.unref();
  } else {
    console.log(color.error('提出できませんでした'));
  }
  console.log(`url: ${await page.url()}`);
};

exports.submit = submit;
