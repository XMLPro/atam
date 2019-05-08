const cheerio = require('cheerio');
const notifier = require('node-notifier');

const login = require('./login.js');
const consts = require('./consts');
const gets = require('./gets');

const [sids, prob, number] = process.argv.slice(2);
const targetProb = `${prob}${number || ''}`;
const url = `${consts.atcoderUrl}/contests/${targetProb}/submissions/me/status/json?sids[]=${sids}`;
console.log(url);

// 自分の提出以外は受け付けません
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
        return false;
      }
      return true;
    }).get().every(value => value);
    if (judges) {
      const resultData = $('td').map((i, e) => $(e).text()).get();
      clearInterval(id);
      const allResult = await gets.getResult(loginedPage, prob, number, sids);
      notifier.notify({
        title: 'atcoder',
        subtitle: allResult.information[1],
        message: resultData.join('\t'),
        wait: 0.1,
      });
      // await utils.printResult(result);
      await browser.close();
    }
    limit -= 1;
  }, 1000);
})();
