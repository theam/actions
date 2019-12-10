import * as core from '@actions/core'
import { exec } from 'child_process'

const getCommitMessageCommand = 'git log -n 1 --pretty="format:%s" | tail'
const publish = 'npx lerna publish --loglevel debug -y'

function runComm(command) {
  exec(command, (err, stdout, stderr) => {
    core.info(stdout)
    core.error(stderr)
    if (err) throw err
  })
}

async function run() {
  try {
    exec(getCommitMessageCommand, (err, stdout) => {
      if (err) throw err
      if (stdout.includes('BREAKING CHANGE')) {
        runComm(`${publish} major`)
      } else if (stdout.includes('FEATURE')) {
        runComm(`${publish} minor`)
      } else if (stdout.includes('PATCH')) {
        runComm(`${publish} patch`)
      } else {
        core.info(`Commit message didn't contain:
\t* BREAKING CHANGE
\t* FEATURE
\t* PATCH

Skipping publishing
`)
      }
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
