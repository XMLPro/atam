// require
const puppeteer = require('puppeteer');

(async() => {
  // option
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  // ページのインスタンスを作る。
  const page = await browser.newPage();

  // コマンドライン引数からページのURLを取得。
  // 提出するコードが完成したら、変更する必要あり。
  const url = process.argv[2];

  // URLのページに移動する。
  await page.goto(url);

  // スクレイピングによりデータを取得する。
  const scrapingData = await page.evaluate(() => {
    let dataList = [];
    const tableList = document.querySelectorAll("table");
    tableList.forEach(_node => {
      dataList.push(_node.innerText);
    })
    dataList = dataList[2];
    return dataList;
  });

  console.log(scrapingData);
  browser.close();
})();
