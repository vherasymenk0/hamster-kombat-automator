import { config } from '~/config'
import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { wait, time, buildTgClientParams } from '~/utils'
import { ONE_DAY_TIMESTAMP } from '~/constants'
import { AccountModel } from '~/interfaces'
import { DB } from './db'
import { log } from './logger'

export class TGClient {
  protected readonly client: AccountModel

  constructor(account: AccountModel) {
    this.client = account
  }

  private async getClient() {
    try {
      const { api_id, api_hash } = config.settings
      const { proxyString, session } = this.client

      const params = await buildTgClientParams(proxyString)
      const stringSession = new StringSession(session)
      const client = new TelegramClient(stringSession, api_id, api_hash, params)

      const isValidSession = await client.connect()
      if (!isValidSession) throw new Error('Session is invalid')

      return client
    } catch (e) {
      throw new Error(String(e))
    }
  }

  private getCachedWebData() {
    const { webData, name } = this.client

    if (webData) {
      const cacheAge = time() - webData.lastUpdateAt
      const isExpired = cacheAge < ONE_DAY_TIMESTAMP

      if (isExpired) {
        const timeUntilRevalidation = ONE_DAY_TIMESTAMP - cacheAge
        const [h, m, s] = [
          Math.floor(timeUntilRevalidation / 3600),
          Math.floor((timeUntilRevalidation % 3600) / 60),
          timeUntilRevalidation % 60,
        ]

        log.info(`Used cached tg web data | Cache will be revalidated in [${h}h:${m}m:${s}s]`, name)
        return webData.stringData
      }
    }

    return null
  }

  protected async getTgWebData() {
    const { userName, origin } = config.info
    const { name } = this.client

    const cachedWebData = this.getCachedWebData()
    if (cachedWebData) return cachedWebData

    const client = await this.getClient()
    await wait()
    const userEntity = await client.getEntity(userName)
    await wait()

    const webview = await client.invoke(
      new Api.messages.RequestWebView({
        peer: userEntity,
        bot: userEntity,
        platform: 'android',
        fromBotMenu: false,
        url: origin,
      }),
    )

    const encodeWebData = webview.url.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0]
    const webData = decodeURIComponent(encodeWebData)

    DB.set({ ...this.client, webData: { lastUpdateAt: time(), stringData: webData } })
    log.info(`Web data has been successfully cached`, name)

    await wait()
    await client.destroy()

    return webData
  }
}
