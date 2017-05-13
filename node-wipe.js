#! /usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')

const chalk = require('chalk')
const yargs = require('yargs').alias('f', 'force').argv

const version = require('./package.json').version

function halt (message) {
  console.error(chalk.bgRed('  ERROR ') + ' ' + message.replace('\n', '\n         • '))
  process.exit()
}

function warn (message) {
  if (yargs.force) return
  console.warn(chalk.bgMagenta('   WARN ') + ' ' + message.replace('\n', '\n         • '))
}

function finish (message) {
  console.log(chalk.bgGreen.black(' FINISH ') + ' ' + message.replace('\n', '\n         • '))
  process.exit()
}

function info (message) {
  console.log('         ' + message.replace('\n', '\n         • '))
}

console.log(chalk.bgWhite.black(' node-wipe v' + version + ' '))

let dir = null
let days = null

switch (yargs._.length) {
  case 0:
    dir = '.'
    days = 30
    break
  case 1:
    if (typeof yargs._[0] === 'string') {
      dir = yargs._[0]
      days = 30
    } else {
      dir = '.'
      days = yargs._[0]
    }
    break
  case 2:
    dir = yargs._[0]
    days = yargs._[1]
}

if (yargs.path) dir = yargs.path
if (yargs.days) days = yargs.days

// Ensure days is positive and integer
if (days < 0) halt('Days cannot be negative!\nYou cannot delete `node_modules` from the FUTURE!')
if (days % 1 !== 0) warn('Fractional days.\nAlthough this will work, it\'s a little bit weird!')

dir = path.resolve(process.cwd(), dir)
let before = new Date((new Date()).getTime() - (1000 * 60 * 60 * 24) * days)

// Ensure dir actually exists
if (!fs.existsSync(dir)) {
  halt('Directory "' + dir + '" could not be found.\nEnsure the correct directory is being used!')
} else {
  info('Directory: ' + dir)
  info('Wipe Before: ' + before)
}

// Get all subdirs
let dirs = fs.readdirSync(dir).filter(file => fs.statSync(path.resolve(dir, file)).isDirectory() && fs.existsSync(path.resolve(dir, file, 'node_modules')))

// Output how many we found
const totalValidDirs = dirs.length

dirs = dirs.map(folder => {
  let stat = fs.statSync(path.resolve(dir, folder))
  let mtime = new Date(stat.mtime).getTime()
  return {
    folder,
    modified: mtime
  }
})

dirs = dirs.filter(o => o.modified < +before)

const finalValidDirs = dirs.length

info(chalk.bold(totalValidDirs) + ' inspected, ' + chalk.bold(finalValidDirs) + ' inactive')

if (finalValidDirs === 0) {
  finish('No inactive projects to wipe!\nPerhaps reduce your "days" threshold?')
}

if (!yargs.force) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(chalk.cyan('Continue with `node_modules` removal of ' + chalk.bold(finalValidDirs) + ' projects? (y/n):') + ' ', (answer) => {
    rl.close()
    answerQ(answer)
  })
} else {
  answerQ('y')
}

function answerQ (answer) {
  answer = answer.toLowerCase()
  if (answer !== 'y' && answer !== 'yes') finish('No inactive projects were wiped\nWiping was halted by user.')

  // Begin wiping!
  dirs = dirs.filter(d => fs.existsSync(path.resolve(dir, d.folder, 'node_modules')))

  info(dirs.length + ' valid inactive projects to be wiped' + (finalValidDirs - dirs.length > 0 ? '\n' + (finalValidDirs - dirs.length) + ' inactive projects do not have "node_modules" folders' : ''))
  info(chalk.yellow('Wiping ' + dirs.length + ' "node_modules"\nThis may take a while...'))

  let total = 0

  dirs.forEach(d => {
    fs.remove(path.resolve(dir, d.folder, 'node_modules'), err => {
      if (err) halt(err)
      total++
      console.log('Removed ' + d.folder + ' "node_modules"')
      if (total === dirs.length) {
        finish(dirs.length + ' inactive projects wiped of their "node_modules" folders!')
      }
    })
  })
}
