const os = require('os');

const dotfilePath = `${os.homedir()}/.atam`;
module.exports = {
  dotfilePath,
  atcoderUrl: 'https://atcoder.jp',
  atcoderProblemsUrl: 'https://kenkoooo.com',
  cookiePath: `${dotfilePath}/cookieLogin.json`,
  confPath: '.atam.local.json',

  // more
};
