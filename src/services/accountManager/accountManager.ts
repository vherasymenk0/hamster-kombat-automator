import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import {
  accountNamePrompt,
  codePrompt,
  existingAccountActionPrompt,
  passwordPrompt,
  phonePrompt,
  proxyPrompt,
} from './account.prompts'
import { Account } from './account.interface'
import { config } from '~/config'
import { DB } from '~/services/dbService'
import { buildClientParams } from '~/helpers'
import { generateUA, logger } from '~/utils'

class AccountManager {
  async add(): Promise<void> {
    const { api_id, api_hash } = config.settings

    const name = await this._createName()
    const proxyString = await proxyPrompt()
    const tgClientParams = await buildClientParams(proxyString, name)

    const client = new TelegramClient(new StringSession(''), api_id, api_hash, tgClientParams)

    try {
      await client.start({
        phoneNumber: phonePrompt,
        password: passwordPrompt,
        phoneCode: codePrompt,
        onError: (err) => logger.error(String(err)),
      })
      const session = client.session.save() as unknown as string

      await this._save(session, proxyString, name)
    } catch (e) {
      logger.error(String(e))
    } finally {
      client.session.close()
      await client.disconnect()
      process.exit(0)
    }
  }

  private async _createName(): Promise<string> {
    const name = await accountNamePrompt()
    const isAccountExisted = this._isExists(name)

    if (isAccountExisted) {
      const action = await existingAccountActionPrompt(name)
      if (action === 'new') return this._createName()
      DB.deleteAccount(name)
      logger.info(`${name} account has been deleted`)
    }

    return name
  }

  private async _save(session: string, proxyString: string | null, name: string): Promise<void> {
    const agent = generateUA()
    const account: Account = { name, session, proxyString, agent, fingerprint: null }

    DB.saveAccount(account)
    logger.success(`${name} account has been successfully saved`)
  }

  private _isExists(name: string) {
    const clients = DB.getAccounts()
    return clients.some((client) => client.name === name)
  }
}

export const addAccount = () => new AccountManager().add()
