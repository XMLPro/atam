#!/usr/bin/env node
const fs = require('fs')
const os = require('os')

function mkdotfile()
{
  try
  {
    let dir = fs.readdirSync(`${os.homedir()}/.atam`)
  }
  catch(e)
  {
    fs.mkdirSync(`${os.homedir()}/.atam`)
  }
}

module.exports = mkdotfile

