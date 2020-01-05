const fs = require('fs');

const utils = require('./utils');
const gets = require('./gets');
const consts = require('./consts');
const color = require('./message_color');

async function createDirTree(prob) {
  const root = `./${prob}`;
  const confPath = `${root}/${consts.dirTreeConf}`;

  utils.mkdirIfNotExists(root);

  const task = await gets.getProblemIds(prob);
  const dirMap = {};
  const taskIds = Object.values(task).map((e, i) => {
    const dirName = String.fromCharCode(97 + i); // 97 is a
    dirMap[dirName] = e;
    return dirName;
  });

  taskIds.forEach((dirName) => {
    const path = `${root}/${dirName}`;
    utils.mkdirIfNotExists(path);
  });

  const conf = {
    prob,
    dirMap,
  };
  fs.writeFileSync(confPath, JSON.stringify(conf));
  console.log(color.success(`create ${prob}/`));
}

module.exports = {
  createDirTree,
};
