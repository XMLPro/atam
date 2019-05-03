const consts = require('./consts');

const baseUrl = `${consts.atcoderUrl}/contests/`;

const submit = async (loginedPage, prob, probNumber, task, lang, sourceCode) => {
  const submitUrl = `${baseUrl}${prob}${probNumber}/submit`;
  const page = loginedPage;

  const navigationPromise = page.waitForNavigation({
    timeout: 60000, waitUntil: 'domcontentloaded',
  });
  await page.goto(submitUrl);
  await navigationPromise;

  await page.select('select[name="data.TaskScreenName"]', task);
  await page.select('select[name="data.LanguageId"]', lang);
  await page.click('button.btn-toggle-editor');
  await page.type('textarea[name="sourceCode"]', sourceCode);
  page.click('#submit');
  await page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' });
};

exports.submit = submit;
