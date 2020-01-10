const path = require('path');

const utils = require('./utils');
const gets = require('./gets');
const color = require('./message_color');

async function createDirTree(prob) {
  const root = `./${prob}`;

  if (utils.mkdirIfNotExists(root)) {
    console.log(color.success(`create ${root}/`));
  }

  const task = await gets.getProblemIds(prob);
  const dirMap = {};
  const taskIds = Object.values(task).map((e, i) => {
    const dirName = String.fromCharCode(97 + i); // 97 is a
    dirMap[dirName] = e;
    return dirName;
  });

  taskIds.forEach((dirName) => {
    const dir = `${root}/${dirName}`;
    if (utils.mkdirIfNotExists(dir)) {
      console.log(color.success(`create ${dir}`));
    }
  });
}

async function getProbFromCWD() {
  const cwd = path.resolve('.').split('/');

  // 4階層上まで見る
  const probs = await Promise.all(cwd.slice(cwd.lenght - 4).map(prob => utils.getRequest(prob, '', (data, response) => {
    if (response.statusCode === 200) {
      return prob;
    }
    return undefined;
  })));

  const prob = probs.filter(value => value !== undefined)[0];
  return prob;
}

module.exports = {
  createDirTree,
  getProbFromCWD,
};
