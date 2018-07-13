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

  // make page instance
  // return promise
  const page = await browser.newPage();

  // get url from command line arg
  const url = process.argv[2];
  // print
  // console.log(url);

  await page.goto(url);

  const scrapingData = await page.evaluate(() => {
    const dataList = [];
    const nodeList = document.querySelectorAll("table");
    nodeList.forEach(_node => {
      // let elem = _node.innerText.split("\t").join(" ");
      // elem = elem.split("\t").join(" ");
      dataList.push(_node.innerText);
    })
    return dataList;
  });

  console.log(scrapingData[2]);
  browser.close();
})();
