const childProcess = require('child_process');

const loginMod = require('./login');
const submitMod = require('./submit');
const gets = require('./gets');
const utils = require('./utils');
const color = require('./message_color');

async function login() {
  loginMod.loginByNameAndPW();
}

async function submit(prob, filename) {
  const [page, browser] = await loginMod.loginByCookie();

  const sourceCode = gets.getSource(filename);
  const lang = await gets.getLangId(page, prob);
  const task = await gets.getProblemId(page, prob);
  await submitMod.submit(page, prob, task, lang, sourceCode);
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

module.exports = {
  login,
  submit,
  sample,
};
