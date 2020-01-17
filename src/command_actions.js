const childProcess = require('child_process');
const fs = require('fs');

const loginMod = require('./login');
const submitMod = require('./submit');
const gets = require('./gets');
const utils = require('./utils');
const color = require('./message_color');
const dirTree = require('./dir_tree');
const configure = require('./configure');

async function login() {
  loginMod.loginByNameAndPW();
}

async function submit(prob, filenameOrEmpty, options) {
  let filename = filenameOrEmpty;
  let probId = prob;

  const config = configure.get(options);
  config.submit = config.submit || {};

  if (filename === undefined) {
    // 両方省略時 prob省略時と同じ状態にする
    probId = probId || config.submit.filename;

    // prob 省略時
    filename = probId;
    probId = config.submit.probId || await dirTree.getProbFromCWD();
  }

  if (!fs.existsSync(filename)) {
    console.log(color.error(`ファイル名が不明です : ${filename}`));
    process.exit(1);
  }

  if (probId === undefined) {
    console.log(color.error('問題が不明です'));
    process.exit(1);
  }

  probId = utils.unificationOfProb(probId);

  if (config.submit.probId !== probId) {
    config.submit.lang = undefined;
    config.submit.task = undefined;
  }

  const [page, browser] = await loginMod.loginByCookie();

  const sourceCode = gets.getSource(filename);
  const lang = config.submit.lang || await gets.getLangId(page, probId);
  const task = config.submit.task || await gets.getProblemId(page, probId);

  config.submit = {
    filename, probId, lang, task,
  };
  configure.save(config);

  await submitMod.submit(page, probId, task, lang, sourceCode);
  browser.close();
}

function execSampleCase(commands, input, output) {
  return new Promise((resolve) => {
    const proc = childProcess.spawn(commands[0], commands.slice(1), {
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    proc.stdin.write(input);
    proc.stdin.end();
    let execResult = '';
    proc.stdout.on('data', (data) => {
      execResult += data.toString();
    });

    proc.on('close', (code) => {
      let answer = 0;
      if (code === 0) {
        process.stdout.write(execResult);
        process.stdout.write(color.success(output));
        answer = Number(execResult === output);
      } else {
        process.stdout.write(execResult);
        answer = 2;
      }
      const message = [
        color.warning('WA'),
        color.success('AC'),
        color.warning('RE'),
      ];
      console.log(`==============  ${message[answer]}`);
      resolve(execResult);
    });
  });
}

async function sample(prob, commands, options) {
  const config = configure.get(options);
  config.sample = config.sample || {};

  let probId = utils.unificationOfProb(prob);
  if (!await utils.probExists(probId)) {
    if (probId) commands.unshift(probId);
    probId = config.sample.probId || await dirTree.getProbFromCWD();
  } else {
    config.sample.probId = undefined;
  }

  if (commands.length === 0) {
    if (config.sample.commands) {
      commands.unshift(...config.sample.commands);
    }
  } else {
    config.sample.commands = commands;
  }

  if (probId === undefined) {
    console.log(color.error('問題が不明です'));
    process.exit(1);
  }

  const [page, browser] = await loginMod.loginByCookie();

  if (config.sample.probId !== probId) {
    config.sample.samples = undefined;
  }

  let { samples } = config.sample;
  if (!samples) {
    const task = await gets.getProblemId(page, probId);
    samples = await gets.getSamples(page, probId, task);
  }
  utils.syncMap(samples, value => execSampleCase(commands, ...value));

  config.sample = {
    probId, commands, samples,
  };
  configure.save(config);

  browser.close();
}

async function createDirTreeCmd(prob) {
  dirTree.createDirTree(utils.unificationOfProb(prob));
}

module.exports = {
  login,
  submit,
  sample,
  createDirTreeCmd,
};
