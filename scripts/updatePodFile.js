#!/usr/bin/env node

/* eslint-disable no-console */

// Libraries
const fs = require('fs')
const path = require('path')
const util = require('util')

module.exports = async (context) => {
  const rootDir = context.opts.projectRoot
  console.log('Setting dynamic Podfile linking')
  const podFilePath = path.join(rootDir, '/platforms/ios/')
  updateFileString(path.join(podFilePath, '/Podfile'), 'use_frameworks!', 'use_frameworks! :linkage => :static') // Allow dynamic static linking for Google Tag Manager plugin compatibility

  await podInstall(podFilePath)
}

const updateFileString = async (filePath, targetText, replaceText) => {
  // make sure the file exists
  try {
    fs.accessSync(filePath, fs.F_OK)
  } catch (e) {
    console.error(`Could not find file at ${filePath}`)
    return
  }

  const fileData = fs.readFileSync(filePath, 'utf8')

  if (fileData.indexOf(targetText) < 0) {
    console.log(`${targetText} is missing from the file. Skipping.`)
    return
  }

  if (fileData.indexOf(replaceText) > -1) {
    console.log('File is already updated. Skipping.')
    return
  }

  console.log(`Updating file with replace text: ${replaceText}`)

  const updatedText = fileData.replace(targetText, replaceText)

  fs.writeFileSync(filePath, updatedText)

  console.log('File updated')
}

const podInstall = async (platformPath) => {
  console.log('Running pod install')

  const exec = util.promisify(require('child_process').exec)

  try {
    const { stdout } = await exec('pod install', { cwd: platformPath })
    console.log('Pod install response:\n' + stdout)
  } catch (err) {
    console.error('Pod install error')
    console.error(err)
  }
}
