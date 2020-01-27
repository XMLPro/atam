const urlLib = require('url');
const puppeteer = require('puppeteer');
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const color = require('../src/message_color');
const mkdotfile = require('../src/mkdotfile');
const cookiePath = `${mkdotfile.dotfilePath}/cookieLogin.json`;

// const utils = require('../src/utils');

function getRequest(url, callback) {
  let cookies = null;
  try {
    cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
  } catch (e) {
    console.log(color.error('Error!! Faild login.'));
    console.log('Try "atam -l"');
    process.exit(1);
  }
  let cookie = cookies.map(e => `${e.name}=${e.value}`);
  let headers = { cookie };

  return new Promise(resolve => {
    let parsedUrl = new URL(url)
    console.log(parsedUrl.pathname)
    let req = https.request({hostname: parsedUrl.hostname, path: parsedUrl.pathname, headers}, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => resolve(callback(data)));
    })

    req.end();
  });
}

const url = 'https://atcoder.jp/contests/abs/submissions/me';

(async () => {
  let data = await getRequest(url, data => {
    const $ = cheerio.load(data);
    const contests = $('#select-task option')
      .map((i, e) => {
        const elm = $(e);
        return {
          value: elm.attr('value'),
          text: elm.text()
        };
      })
      .filter((i, e) => e.value !== '');
    return contests.get();
  });
  console.log(data);
})()
