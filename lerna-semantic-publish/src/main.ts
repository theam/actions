import * as core from '@actions/core'
import { exec } from 'child_process'

const getCommitMessageCommand = 'git log -n 1 --pretty="format:%s" | tail'
const lernaPublish = 'npx lerna publish --loglevel debug -y'
const npmPublish = 'npm publish --loglevel debug -y'

function runComm(command) {
  exec(command, (err, stdout, stderr) => {
    core.info(stdout)
    core.error(stderr)
    if (err) throw err
  })
}

async function run() {
  let publish = lernaPublish
  if (process.env?.USE_NPM) {
    publish = npmPublish
  }
  
  try {
    exec(getCommitMessageCommand, (err, stdout) => {
      if (err) throw err
      if (stdout.includes('BREAKING CHANGE:')) {
        runComm(`${publish} major`)
      } else if (stdout.startsWith('feat')) {
        runComm(`${publish} minor`)
      } else if (stdout.startsWith('fix')) {
        runComm(`${publish} patch`)
      } else {
        core.info(`Commit message didn't contain:
\t* BREAKING CHANGE:
\t* feat
\t* fix

Skipping publishing
`)
      }
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
