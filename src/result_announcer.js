const cheerio = require('cheerio');
const notifier = require('node-notifier');

const login = require('./login.js');
const consts = require('./consts');
const gets = require('./gets');

const [sids, prob] = process.argv.slice(2);
const url = `${consts.atcoderUrl}/contests/${prob}/submissions/me/status/json?sids[]=${sids}`;

// 自分の提出以外は受け付けません
(async () => {
  const [loginedPage, browser] = await login.loginByCookie();
  let limit = 60 * 5; // time out on 5 minutes.
  const id = setInterval(async () => {
    try {
      await Promise.all([
        loginedPage.goto(url),
        loginedPage.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      ]);
      const result = await loginedPage.$('pre');
      const data = JSON.parse(await (await result.getProperty('textContent')).jsonValue());
      const html = data.Result[sids].Html;

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
        const allResult = await gets.getResult(loginedPage, prob, sids);
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
    } catch (error) {
      console.log(error);
      console.log('エラーにより通知機能が動きません');
      clearInterval(id);
      await browser.close();
    }
  }, 1000);
})();
