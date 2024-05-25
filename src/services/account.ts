import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import {
  accountActionPrompt,
  accountNamePrompt,
  codePrompt,
  passwordPrompt,
  phonePrompt,
  proxyPrompt,
} from '~/prompts'
import { Proxy } from './proxy'
import { DB } from './db'
import { buildTgClientParams, generateUA } from '~/utils'
import { AccountModel } from '~/interfaces'
import { config } from '~/config'
import { log } from './logger'

class AccountManager {
  private async getProxyString(id: string): Promise<string> {
    const proxyString = await proxyPrompt()
    const isValid = Proxy.isValid(proxyString)

    if (!isValid) {
      log.error('Invalid proxy format, try again')
      return this.getProxyString(id)
    }
    await Proxy.check(proxyString, id)

    return proxyString
  }

  private async _createName(): Promise<string> {
    const name = await accountNamePrompt()
    const isAccountExisted = this.isExists(name)

    if (isAccountExisted) {
      const action = await accountActionPrompt(name)
      if (action === 'new') return this._createName()
      DB.delete(name)
      log.info(`${name} account has been deleted`)
    }

    return name
  }

  private async save(session: string, proxyString: string | null, name: string): Promise<void> {
    const agent = generateUA()
    const account: AccountModel = {
      name,
      session,
      proxyString,
      agent,
      fingerprint: null,
      webData: null,
    }

    DB.set(account)
    log.success(`${name} account has been successfully saved`)
  }

  private isExists(name: string) {
    const clients = DB.getAll()
    return clients.some((client) => client.name === name)
  }

  async add(): Promise<void> {
    const { api_id, api_hash } = config.settings

    const name = await this._createName()
    const proxyString = await this.getProxyString(name)

    const tgClientParams = await buildTgClientParams(proxyString)
    const client = new TelegramClient(new StringSession(''), api_id, api_hash, tgClientParams)

    try {
      await client.start({
        phoneNumber: phonePrompt,
        password: passwordPrompt,
        phoneCode: codePrompt,
        onError: (err) => log.error(String(err)),
      })
      const session = client.session.save() as unknown as string

      await this.save(session, proxyString, name)
    } catch (e) {
      log.error(String(e))
    } finally {
      client.session.close()
      await client.disconnect()
      process.exit(0)
    }
  }
}

export const Account = new AccountManager()
