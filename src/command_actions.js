const childProcess = require('child_process');

const loginMod = require('./login');
const submitMod = require('./submit');
const gets = require('./gets');
const utils = require('./utils');
const color = require('./message_color');
const dirTree = require('./dir_tree');

async function login() {
  loginMod.loginByNameAndPW();
}

async function submit(prob, filename) {
  let paramFilename = filename;
  let paramProb = prob;
  if (filename === undefined) {
    paramFilename = prob;
    paramProb = await dirTree.getProbFromCWD();
  }

  if (paramProb === undefined) {
    console.log(color.error('問題が不明です'));
    process.exit(1);
  }

  const [page, browser] = await loginMod.loginByCookie();

  const sourceCode = gets.getSource(paramFilename);
  const lang = await gets.getLangId(page, paramProb);
  const task = await gets.getProblemId(page, paramProb);
  await submitMod.submit(page, paramProb, task, lang, sourceCode);
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

async function sample(prob, commands) {
  const [page, browser] = await loginMod.loginByCookie();
  const task = await gets.getProblemId(page, prob);
  const samples = await gets.getSamples(page, prob, task);
  utils.syncMap(samples, value => execSampleCase(commands, ...value));

  browser.close();
}

async function createDirTreeCmd(prob) {
  dirTree.createDirTree(prob);
}

module.exports = {
  login,
  submit,
  sample,
  createDirTreeCmd,
};
