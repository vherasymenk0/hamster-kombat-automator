import { Account, DB, log } from '~/services'
import { AUTHOR } from '~/constants'
import { runAutomator } from '~/automator'
import { launchPrompt } from '~/prompts'
import { LAUNCH_MODE_ENUM } from '~/enums'

const launcher = async () => {
  const action = await launchPrompt()
  const { add_account, automator } = LAUNCH_MODE_ENUM

  switch (action) {
    case add_account:
      await Account.add()
      break
    case automator:
      await runAutomator()
      break
  }
}

try {
  DB.init()
  log.info(AUTHOR)

  if (process.argv[2] === '--automator') runAutomator()
  else launcher()
} catch (e) {
  log.error(String(e))
}
