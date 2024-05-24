export interface AccountModel {
  name: string
  session: string
  proxyString: string | null
  agent: {
    'Sec-Ch-Ua-Mobile': string
    'Sec-Ch-Ua-Platform': string
    'Sec-Ch-Ua': string
    'User-Agent': string
  }
  fingerprint: {
    visitorId: string
    components: {
      [key: string]: { value: unknown; duration: number } | { error: unknown; duration: number }
    }
  } | null
  webData: {
    stringData: string
    lastUpdateAt: number
  } | null
}

export interface ProxyModel {
  host: string
  port: number
  login?: string
  password?: string
}

export interface IpInfoModel {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
}

export interface ErrorModel {
  error_code: string
  error_message: string
}
