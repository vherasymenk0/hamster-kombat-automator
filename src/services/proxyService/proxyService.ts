import { SocksProxyAgent } from 'socks-proxy-agent'
import axios from 'axios'
import { IpInfo, Proxy } from './proxy.interface'
import { logger } from '~/utils'

class ProxyService {
  private ipInfoUrl: string
  private regex: RegExp

  constructor() {
    this.ipInfoUrl = 'https://ipinfo.io/json'
    this.regex = /^(?<login>[\w-]+):(?<password>[\w-]+)@(?<host>[\w.-]+):(?<port>\d+)$/
  }

  getHttpsAgent(proxy: string | Proxy) {
    let proxyString = null

    if (typeof proxy === 'string') proxyString = proxy
    else proxyString = this.stringify(proxy)

    return new SocksProxyAgent(proxyString)
  }

  isValidProxy(proxyString: string) {
    return this.regex.test(proxyString)
  }

  parse(proxyString: string) {
    const isValid = this.isValidProxy(proxyString)

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

  stringify(proxy: Proxy): string {
    const { host, port, login, password } = proxy
    let result = 'socks5://'

    if (login && password) result += `${login}:${password}@`

    result += `${host}:${port}`
    return result
  }

  async check(proxy: Proxy) {
    const httpsAgent = this.getHttpsAgent(proxy)
    const res = await axios.get<IpInfo>(this.ipInfoUrl, { timeout: 5000, httpsAgent })

    return res.data
  }
}

export const proxyService = new ProxyService()
