import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import { ErrorResponse } from '~/services/api'
import axiosRetry from 'axios-retry'
import { proxyService } from '~/services/proxyService'

type Handler = <TData>(url: string, config?: AxiosRequestConfig) => Promise<TData>
type Props = {
  config?: AxiosRequestConfig
  proxyString?: string | null
}

class Axios {
  private instance

  constructor({ config, proxyString }: Props) {
    this.instance = axios.create({
      headers: {
        Accept: '*/*',
        ...config?.headers,
      },
      timeout: 1000 * 15,
    })

    if (proxyString) {
      const agent = proxyService.getAgent(proxyString)
      this.instance.defaults.httpsAgent = agent
      this.instance.defaults.httpAgent = agent
    }

    axiosRetry(axios, {
      retries: 3,
      retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000),
      retryCondition(error) {
        switch (error?.response?.status) {
          case 429:
          case 502:
          case 503:
          case 504:
            return true
          default:
            return false
        }
      },
    })

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const isAxiosError = error instanceof AxiosError
        if (!isAxiosError) throw new Error(String(error))

        const errorInfo = error?.response?.data as ErrorResponse
        const isApiError = errorInfo?.error_code && errorInfo?.error_message

        if (isApiError)
          throw new Error(
            `api_code: ${errorInfo.error_code} | api_message: ${errorInfo.error_message}`,
          )

        if (error.code === AxiosError.ECONNABORTED)
          throw new Error(`Timeout Error: ${error.message}`)

        throw new Error(error.message)
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
