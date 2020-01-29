const server = require('http').createServer();
const Io = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const login = require('./login');
const gets = require('./gets');
const consts = require('./consts');

const port = 3001;
const nodeModules = `${path.resolve(__dirname, '..')}/node_modules`;

async function pageEvent(page) {
  if (page) {
    page.on('load', async () => {
      if (!(page.url().startsWith(consts.atcoderUrl)
        || page.url().startsWith(consts.atcoderProblemsUrl))) {
        return;
      }

      await page.evaluate(() => {
        const body = document.querySelector('body');

        const termArea = document.createElement('div');
        termArea.style.width = '40%';
        termArea.style.height = '30%';
        termArea.style.position = 'fixed';
        termArea.style.backgroundColor = 'rgba(50, 50, 70, 0.8)';

        termArea.style.padding = '5px';
        termArea.style.bottom = '0px';
        termArea.style.right = '0px';
        termArea.style.borderRadius = '5px';
        termArea.style.zIndex = 1000;
        termArea.className = 'resizable';

        const terminal = document.createElement('div');

        terminal.style.width = '100%';
        terminal.style.height = '100%';
        terminal.id = 'atam_terminal';
        termArea.appendChild(terminal);

        body.parentElement.appendChild(termArea);
      });

      await page.addStyleTag({ path: `${nodeModules}/xterm/dist/xterm.css` });
      await page.addScriptTag({ path: `${nodeModules}/xterm/dist/xterm.js` });
      await page.addScriptTag({ path: `${nodeModules}/interactjs/dist/interact.min.js` });
      await page.addScriptTag({ url: `http://localhost:${port}/socket.io/socket.io.js` });


      await page.evaluate((socketIOPort) => {
        const socket = window.io(`http://localhost:${socketIOPort}`);

        function fit(term) {
          const termCore = term._core;
          const height = term.element.parentElement.offsetHeight;
          const width = term.element.parentElement.offsetWidth - termCore.viewport.scrollBarWidth;

          const renderCoordinator = termCore._renderCoordinator;
          const cols = Math.floor(width / renderCoordinator.dimensions.actualCellWidth);
          const rows = Math.floor(height / renderCoordinator.dimensions.actualCellHeight);
          if (term.rows !== rows || term.cols !== cols) {
            renderCoordinator.clear();
            term.resize(cols, rows);
            socket.emit('resize', { cols, rows });
          }
        }

        const termParent = document.getElementById('atam_terminal');
        console.log(termParent);
        const term = new window.Terminal({
          allowTransparency: true,
          theme: {
            background: 'rgba(0, 0, 0, 0)',
          },
        });
        term.open(termParent);

        window.onresize = () => fit(term);
        fit(term);

        term.onData((data) => {
          socket.emit('data', data);
        });

        socket.on('client', (data) => {
          term.write(data);
        });

        window.interact('.resizable').resizable({
          edges: {
            left: true,
            right: true,
            bottom: true,
            top: true,
          },
          modifiers: [
            window.interact.modifiers.restrictEdges({
              outer: 'parent',
            }),

            window.interact.modifiers.restrictSize({
              min: { width: 60, height: 30 },
            }),
          ],
        }).on('resizemove', (event) => {
          const { target } = event;
          target.style.width = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;

          fit(term);
        });
      }, port);
    });
  }
}

async function openAtcoderProblems() {
  const [page, browser] = await login.loginByCookie(false);

  pageEvent(page);

  browser.on('targetcreated', async (target) => {
    pageEvent(await target.page());
  });

  const url = `${consts.atcoderProblemsUrl}/atcoder/#/table/${await gets.getScreenName()}`;
  await page.goto(url, { waitUntil: 'networkidle0' });
}

function startTerminalServer() {
  const io = new Io(server);

  let term;
  let history = '';
  io.on('connect', (socket) => {
    if (term === undefined) {
      term = pty.spawn(process.env.SHELL, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env,
      });

      term.on('exit', () => {
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
}

module.exports = {
  openAtcoderProblems,
  startTerminalServer,
};
