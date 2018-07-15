// require
const puppeteer = require('puppeteer');

const getAnswerStat = async() => {
  // オプション
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  // とりあえず、コマンドライン引数からページのURLを取得。
  // TODO: 「提出する」コードが完成したら、変更する必要あり。
  const url = process.argv[2];

  // ページのインスタンスを作る。
  const page = await browser.newPage();
  // URLのページに移動する。
  await page.goto(url);

  // スクレイピングによりデータを取得し、整形する。
  const parseList = await page.evaluate(() => {
    // 要素が適切にわけられた配列。
    let dataList = [];
    // tableクラス内の要素を取り出す。
    const tableList = document.querySelectorAll("table");
    // tableListを型変換しつつdataListに渡す。
    tableList.forEach(_node => {
      dataList.push(_node.innerText);
    })
    // AtCoderには、tableクラスの2番目にサンプルの可否があるので、そこだけ取り出す。
    // 配列から文字列になる。
    dataList = dataList[2];
    // 改行区切りで分割。ここで再び配列になる。
    dataList = dataList.split("\n");
    // 各要素をタブで分割する。二次元配列になる。
    for(let i = 0; i < dataList.length; i++) dataList[i] = dataList[i].split("\t");
    return dataList;
  })
  browser.close();
  // 要素わけされた配列を戻り値とする。
  return parseList;
};


// 結果をターミナルに表示する。
const printResult = async(scrapingData) => {
  console.log("case\tstat\ttime\tmemory");
  // TODO:もっといい書き方がないか聞く。
  // インデックスによって処理が異なるので、通常のfor文。
  for(let i = 1; i < scrapingData.length; i++)
  {
    for(let j = 0; j < scrapingData[i].length; j++)
    {
      if(j == 0) {
        // 文字がずれてしまうので、最初の5文字だけ表示。
        process.stdout.write(scrapingData[i][j].substr(0, 5));
        // 6文字以上の場合は..を表記。
        if(scrapingData[i][j].length > 5) process.stdout.write("..");
      }
      else
        process.stdout.write(scrapingData[i][j]);
      process.stdout.write("\t");
    }
    await console.log("");
  }
};

// TODO: 提出時はジャッジ中の待機時間があるので、ジャッジが終わるまで待機するようにする。(「提出する」コードが完成したら)
// TODO: 途中でキャンセルもできるようにする。
// getAnswerStatのあとにprintResultを実行。
const main = async() => {
  printResult(await getAnswerStat());
}

main();


