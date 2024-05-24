import { SocksProxyAgent } from 'socks-proxy-agent'
import { IpInfoModel, ProxyModel } from '~/interfaces'
import { Axios } from './axios'
import { log } from './logger'

class ProxyService {
  private ax: Axios
  private ipInfoUrl = 'https://ipinfo.io/json'
  private regex = /^(?<login>[\w-]+):(?<password>[\w-]+)@(?<host>[\w.-]+):(?<port>\d+)$/

  constructor() {
    this.ax = new Axios()
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
      log.error('Invalid proxy format')
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

  toStringAgent(proxy: ProxyModel): string {
    const { host, port, login, password } = proxy
    let result = 'socks5://'

    if (login && password) result += `${login}:${password}@`

    result += `${host}:${port}`
    return result
  }

  async check(proxyString: string, id: string) {
    try {
      const httpsAgent = this.getAgent(proxyString)
      const { ip, country, city, timezone } = await this.ax.get<IpInfoModel>(this.ipInfoUrl, {
        httpsAgent,
        httpAgent: httpsAgent,
      })
      log.info(`${id} | proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)
    } catch (e) {
      throw new Error(`Error during connect to proxy ${proxyString} | error: ${String(e)}`)
    }
  }
}

export const Proxy = new ProxyService()
