import * as core from '@actions/core'
import { exec } from 'child_process'

const getCommitMessageCommand = 'git log -n 1 --pretty="format:%s" | tail'
const publish = 'npx lerna publish -y'

async function run() {
  try {
    exec(getCommitMessageCommand, (err, stdout) => {
      if (err) throw err
      if (stdout.includes('BREAKING CHANGE')) {
        exec(`${publish} major`, (_, stdout) => {
          core.info(stdout)
        })
      } else if (stdout.includes('FEATURE')) {
        exec(`${publish} minor`, (_, stdout) => {
          core.info(stdout)
        })
      } else if (stdout.includes('PATCH')) {
        exec(`${publish} patch`, (_, stdout) => {
          core.info(stdout)
        })
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
