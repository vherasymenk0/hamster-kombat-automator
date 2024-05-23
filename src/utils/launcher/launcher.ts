import { launchActionPrompt } from './launcher.prompts'
import { botMasterStarter } from '~/botMaster'
import { accountManager } from '~/services/accountManager'

export const launcher = async () => {
  const action = await launchActionPrompt()

  if (action === 'add') await accountManager.add()
  if (action === 'bot') await botMasterStarter()
}
