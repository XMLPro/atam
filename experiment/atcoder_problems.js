const server = require('http').createServer();
const Io = require('socket.io');
const pty = require('node-pty');

const login = require('../src/login');

const port = 3001;

async function pageEvent(page) {
  if (page) {
    page.on('load', async () => {
      await page.evaluate(() => {
        const body = document.querySelector('body');
        body.style.width = '60%';
        body.style.display = 'inline-flex';

        const termArea = document.createElement('body');
        termArea.style.display = 'inline-flex';
        termArea.style.width = '40%';
        termArea.style.height = '100%';
        termArea.style.position = 'fixed';
        termArea.style.top = '0px';
        termArea.style.backgroundColor = 'black';
        termArea.style.paddingTop = body.style.paddingTop;
        termArea.style.paddingBottom = body.style.paddingBottom;

        const terminal = document.createElement('div');

        terminal.style.width = '100%';
        terminal.id = 'atam_terminal';
        termArea.appendChild(terminal);

        body.parentElement.appendChild(termArea);
      });

      await page.addStyleTag({path: '../node_modules/xterm/dist/xterm.css'});
      await page.addScriptTag({path: '../node_modules/xterm/dist/xterm.js'});
      await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js'});

      await page.evaluate((port) => {
        const socket = io(`http://localhost:${port}`);

        function fit(term, socket) {
          const height = term.element.parentElement.offsetHeight;
          const width = term.element.parentElement.offsetWidth - term._core.viewport.scrollBarWidth;

          const cols = Math.floor(width / term._core._renderCoordinator.dimensions.actualCellWidth);
          const rows = Math.floor(height / term._core._renderCoordinator.dimensions.actualCellHeight);
          if (term.rows !== rows || term.cols !== cols) {
            term._core._renderCoordinator.clear();
            term.resize(cols, rows);
            socket.emit('resize', { cols, rows });
          }
        }

        const term = new Terminal();
        term.open(document.getElementById('atam_terminal'));

        window.onresize = () => fit(term, socket);
        fit(term, socket);

        term.onData((data) => {
          socket.emit('data', data);
        });

        socket.on('client', data => {
          term.write(data);
        });
      }, port);
    });
  }
}

(async () => {
  const [page, browser] = await login.loginByCookie(headless = false);

  pageEvent(page);

  browser.on('targetcreated', async (target) => {
    pageEvent(await target.page());
  });

  const url = 'https://kenkoooo.com/atcoder/#/table/';
  await page.goto(url, { waitUntil: 'networkidle0' });
})();

let io = new Io(server);

let term = undefined;
let history = '';
io.on('connect', socket => {
  if (term === undefined) {
    term = pty.spawn(process.env.SHELL, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env,
    });

    term.on('exit', (code) => {
      console.log('Good bye.');
      process.exit(0);
    });
  }

  term.on('data', (data) => {
    history += data;
    if (history.length > 20000) {
      history = history.slice(10000);
    }
    socket.emit('client', data);
  });

  socket.on('data', (data) => {
    term.write(data);
  });

  let firstResize = true;
  socket.on('resize', (size) => {
    term.resize(size.cols, size.rows);
    if (firstResize) socket.emit('client', history);
    firstResize = false;
  });

  // socket.on('disconnect', () => term.destroy());
});

server.listen(port, () => {
  console.log(`listen : ${port}`);
});
