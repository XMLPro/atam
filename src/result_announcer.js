const cheerio = require('cheerio');

const login = require('./login.js');
const consts = require('./consts');

const sids = process.argv[2];
const url = `${consts.atcoderUrl}/contests/abc001/submissions/me/status/json?sids[]=${sids}`;

(async () => {
  const [loginedPage, browser] = await login.loginByCookie();
  let limit = 60 * 5; // time out on 5 minutes.
  const id = setInterval(async () => {
    await Promise.all([
      loginedPage.goto(url),
      loginedPage.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);
    const result = await loginedPage.$('pre');
    const data = JSON.parse(await (await result.getProperty('textContent')).jsonValue());
    const html = data[sids].Html;

    const $ = cheerio.load(`<table>${html}</table>`);

    const judges = $('.waiting-judge').map((i, e) => {
      if (limit === 0) return true;
      if (sids === $(e).attr('data-id')) {
        console.log('waiting...');
        return false;
      }
      return true;
    }).get().every(value => value);
    if (judges) {
      console.log('----- ok ----------');
      console.log(html);
      clearInterval(id);
      await browser.close();
    }
    limit -= 1;
  }, 1000);
})();
