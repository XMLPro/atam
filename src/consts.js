const os = require('os');

const dotfilePath = `${os.homedir()}/.atam`;
module.exports = {
  dotfilePath,
  atcoderUrl: 'https://atcoder.jp',
  cookiePath: `${dotfilePath}/cookieLogin.json`,
  dirTreeConf: '.atam.json',

  // more
};
