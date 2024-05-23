import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import { config } from '~/config'
import { proxyService } from '~/services/proxyService'
import { ErrorResponse } from '~/services/api'

type Handler = <TData>(url: string, config?: AxiosRequestConfig) => Promise<TData>

const { info } = config

class Axios {
  private instance

  constructor({ headers }: AxiosRequestConfig, proxyString: string | null) {
    this.instance = axios.create({
      baseURL: info.api,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'uk,en-GB;q=0.9,en;q=0.8',
        Origin: info.origin,
        Referer: `${info.origin}/`,
        Priority: 'u=1, i',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        ...headers,
      },
      timeout: 1000 * 15,
    })

    if (proxyString) {
      const proxy = proxyService.parse(proxyString)
      const agent = proxyService.getHttpsAgent(proxy)
      this.instance.defaults.httpsAgent = agent
      this.instance.defaults.httpAgent = agent
    }

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error instanceof AxiosError) {
          const errorInfo = error?.response?.data as ErrorResponse
          const isApiError = errorInfo?.error_code && errorInfo?.error_message

          if (isApiError) {
            throw new Error(
              `api_code: ${errorInfo.error_code} | api_message: ${errorInfo.error_message}`,
            )
          } else throw new Error(error.message)
        }
        throw new Error(String(error))
      },
    )
  }

  async makeRequest(method: string, url: string, options: AxiosRequestConfig = {}) {
    try {
      const resp = await this.instance({
        ...options,
        method,
        url,
      })
      return resp?.data
    } catch (error) {
      return await Promise.reject(error)
    }
  }

  setAuthToken(auth_token?: string) {
    if (auth_token) this.instance.defaults.headers.common.Authorization = `Bearer ${auth_token}`
    else delete this.instance.defaults.headers.common.Authorization
  }

  get: Handler = (url, axConfig) => this.makeRequest('get', url, axConfig)
  post: Handler = (url, axConfig) => this.makeRequest('post', url, axConfig)
}

export default Axios
