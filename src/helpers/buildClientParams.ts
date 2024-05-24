import { TelegramClientParams } from 'telegram/client/telegramBaseClient'
import { proxyService } from '~/services/proxyService'
import { Account } from '~/services/accountManager'
import { logger } from '~/utils'

export const buildClientParams = async (
  proxyString: string | null,
  accountName: Account['name'],
) => {
  let params: TelegramClientParams = { connectionRetries: 5 }

  if (proxyString) {
    const proxy = proxyService.parse(proxyString)
    const { port, host, password, login } = proxy

    try {
      const { ip, country, city, timezone } = await proxyService.check(proxy)
      logger.info(`${accountName} | proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)
    } catch (e) {
      throw new Error(`Error during connect to proxy | IP: ${proxy.host} | error: ${String(e)}`)
    }

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
