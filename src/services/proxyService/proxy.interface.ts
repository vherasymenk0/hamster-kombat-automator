export interface Proxy {
  host: string
  port: number
  login?: string
  password?: string
}

export interface IpInfo {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
}
