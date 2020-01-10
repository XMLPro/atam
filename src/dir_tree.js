const fs = require('fs');
const path = require('path');

const utils = require('./utils');
const gets = require('./gets');
const consts = require('./consts');
const color = require('./message_color');

async function createDirTree(prob) {
  const root = `./${prob}`;
  const confPath = `${root}/${consts.dirTreeConf}`;

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

  const conf = {
    prob,
    dirMap,
  };
  fs.writeFileSync(confPath, JSON.stringify(conf));
}

function findRoot(root) {
  if (fs.existsSync(`${root}/${consts.dirTreeConf}`)) {
    return root;
  }

  if (root !== '/') {
    return findRoot(path.resolve(root, '..'));
  }

  return null;
}

module.exports = {
  createDirTree,
  findRoot,
};
