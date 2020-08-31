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
  console.log('Current Podfile path: ' + filePath)

  const fileData = fs.readFileSync(filePath, 'utf8')

  console.log('Current Podfile: ' + fileData)

  if (fileData.indexOf(replaceText) > -1) {
    console.log('File already updated. Skipping.')
    return
  }

  const updatedText = fileData.replace(targetText, replaceText)

  console.log('Update Podfile: ' + updatedText)

  fs.writeFileSync(filePath, updatedText)
}

const podInstall = async (platformPath) => {
  console.log('Current ios platform path: ' + platformPath)

  const exec = util.promisify(require('child_process').exec)

  try {
    const { stdout, stderr } = await exec('pod install', { cwd: platformPath })
    console.log('Pod install response:' + stdout)

    if (stderr) {
      console.log('Pod install error:' + stderr)
    }
  } catch (err) {
    console.error('Pod install error')
    console.error(err)
  }
}
