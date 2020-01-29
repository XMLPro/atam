const express = require('express');
const app = express();
const server = require('http').createServer(app);
const Io = require('socket.io');
const pty = require('node-pty');

app.use('/xterm', express.static('../node_modules/xterm'));
app.use('/', express.static('./'));

let io = new Io(server);

io.on('connect', socket => {
  const term = pty.spawn(process.env.SHELL, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  term.on('data', (data) => {
    socket.emit('client', data);
  });

  socket.on('data', (data) => {
    term.write(data);
  });

  socket.on('resize', (size) => {
    term.resize(size.cols, size.rows);
  });

  socket.on('disconnect', () => term.destroy());
});

const port = 3001;
server.listen(port, () => {
  console.log(`localhost:${port}/term_test.html`)
});
