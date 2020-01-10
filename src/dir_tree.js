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

module.exports = {
  createDirTree,
};
