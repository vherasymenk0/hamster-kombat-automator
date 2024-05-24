import { TelegramClientParams } from 'telegram/client/telegramBaseClient'
import { AccountModel } from '~/interfaces'
import { Proxy } from '~/services'

export const buildTgClientParams = async (proxyString: AccountModel['proxyString']) => {
  let params: TelegramClientParams = { connectionRetries: 5 }

  if (proxyString) {
    const proxy = Proxy.parse(proxyString)
    const { port, host, password, login } = proxy

    params = {
      ...params,
      useWSS: false,
      proxy: {
        ip: host,
        port,
        username: login,
        password,
        socksType: 5,
        timeout: 2,
      },
    }
  }

  return params
}
