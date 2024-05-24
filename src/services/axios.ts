import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { ErrorModel } from '~/interfaces'

type Handler = <TData>(url: string, config?: AxiosRequestConfig) => Promise<TData>
type Props = {
  config?: AxiosRequestConfig
  proxyString?: string | null
}

export class Axios {
  private readonly instance

  constructor(props?: Props) {
    this.instance = axios.create({
      baseURL: props?.config?.baseURL,
      headers: {
        Accept: '*/*',
        ...props?.config?.headers,
      },
      timeout: 1000 * 15,
    })

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const isAxiosError = error instanceof AxiosError
        if (!isAxiosError) throw new Error(String(error))

        const errorInfo = error?.response?.data as ErrorModel
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

    axiosRetry(this.instance, {
      retries: 3,
      retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000),
      retryCondition(error) {
        const statusCode = error?.response?.status
        if (!statusCode) return false

        const retryErrorCodes = [429, 502, 503, 504]
        return retryErrorCodes.includes(statusCode)
      },
    })
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
