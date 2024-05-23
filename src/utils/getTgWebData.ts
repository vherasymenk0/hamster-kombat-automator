import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { TelegramClientParams } from 'telegram/client/telegramBaseClient'
import { config } from '~/config'

const getClient = async (session: string, params: TelegramClientParams) => {
  try {
    const { api_id, api_hash } = config.settings
    const stringSession = new StringSession(session)

    const client = new TelegramClient(stringSession, api_id, api_hash, params)

    const isValidSession = await client.connect()
    if (!isValidSession) throw new Error('Session is invalid')
    return client
  } catch (e) {
    throw new Error(String(e))
  }
}

export const getTgWebData = async (session: string, params: TelegramClientParams) => {
  const tgClient = await getClient(session, params)
  const { userName, origin } = config.info

  try {
    const userEntity = await tgClient.getEntity(userName)
    const webview = await tgClient.invoke(
      new Api.messages.RequestWebView({
        peer: userEntity,
        bot: userEntity,
        platform: 'android',
        fromBotMenu: false,
        url: origin,
      }),
    )
    const authUrl = webview.url
    const data = decodeURIComponent(authUrl.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0])
    await tgClient.destroy()

    return data
  } catch (error) {
    throw new Error(`getTgWebData() | ${error}`)
  }
}
