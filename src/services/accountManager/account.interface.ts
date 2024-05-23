export interface Account {
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
