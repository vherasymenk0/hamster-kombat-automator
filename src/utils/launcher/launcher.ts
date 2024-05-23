import { launchActionPrompt } from './launcher.prompts'
import { addAccount } from '~/services/accountManager'
import { botMasterStarter } from '~/botMaster'

export const launcher = async () => {
  const action = await launchActionPrompt()

  if (action === 'add') addAccount()
  if (action === 'bot') botMasterStarter()
}
