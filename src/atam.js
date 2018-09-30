#!/usr/bin/env node

const opt = require("./options");
const mkdotfile = require("./mkdotfile");
const gets = require("./gets");

let command = opt.args;
let filename = command[0];
let number = command[1];
let prob = command[2];
