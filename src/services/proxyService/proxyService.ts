import { SocksProxyAgent } from 'socks-proxy-agent'
import { IpInfo, Proxy } from './proxy.interface'
import { logger } from '~/utils'
import BaseAxios from '~/services/baseAxios'

class ProxyService {
  private axios: BaseAxios
  private ipInfoUrl = 'https://ipinfo.io/json'
  private regex = /^(?<login>[\w-]+):(?<password>[\w-]+)@(?<host>[\w.-]+):(?<port>\d+)$/

  constructor() {
    this.axios = new BaseAxios({})
  }

  getAgent(proxyString: string) {
    const parsedProxy = this.parse(proxyString)
    const proxy = this.toStringAgent(parsedProxy)
    return new SocksProxyAgent(proxy)
  }

  isValid(proxyString: string) {
    return this.regex.test(proxyString)
  }

  parse(proxyString: string) {
    const isValid = this.isValid(proxyString)

    if (!isValid) {
      logger.error('Invalid proxy format')
      process.exit(1)
    }

    const match = proxyString.trim().match(this.regex)
    const { host, port, login, password } = match?.groups as Record<string, string>

    return {
      host,
      port: Number(port),
      ...(login && { login }),
      ...(password && { password }),
    }
  }

  toStringAgent(proxy: Proxy): string {
    const { host, port, login, password } = proxy
    let result = 'socks5://'

    if (login && password) result += `${login}:${password}@`

    result += `${host}:${port}`
    return result
  }

  async check(proxyString: string, id: string) {
    try {
      const httpsAgent = this.getAgent(proxyString)
      const { ip, country, city, timezone } = await this.axios.get<IpInfo>(this.ipInfoUrl, {
        httpsAgent,
        httpAgent: httpsAgent,
      })
      logger.info(`${id} | proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)
    } catch (e) {
      throw new Error(`Error during connect to proxy ${proxyString} | error: ${String(e)}`)
    }
  }
}

export const proxyService = new ProxyService()
