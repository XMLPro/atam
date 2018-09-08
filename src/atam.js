#!/usr/bin/env node

const opt = require("./options");

let command = opt.args;
let filename = command[0];
let number = command[1];
let prob = command[2];

if (command.length > 0) {
  if (command.length == 3) {
    console.log('filename:',filename);
    console.log('number:',number);
    console.log('prob:',prob);
  } else {
    console.log('error');
    console.log('ex: atam <filename> <number> <prob>');
  }
}
