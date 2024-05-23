import fs from 'fs'
import { logger } from '~/utils/logger'

type WebData = {
  id: string
  lastUpdateAt: number
  data: string
}

class CacheStore {
  cacheFile = 'web_data_cache.json'

  init() {
    const isStoreExist = fs.existsSync(this.cacheFile)
    if (!isStoreExist) {
      this._write([])
      logger.success('Web data cache store has been successfully initialized')
    }
  }

  get() {
    const jsonData = fs.readFileSync(this.cacheFile, 'utf8')
    const data: WebData[] = JSON.parse(jsonData)
    return data
  }

  getById(id: string) {
    const store = this.get()
    const webData = store.find((item) => item.id === id)
    return webData || null
  }

  set(data: WebData) {
    const store = this.get()
    const newStore = [...store, data]
    this._write(newStore)
  }

  private _write(data: WebData[]) {
    fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2), 'utf8')
  }
}

export const cacheStore = new CacheStore()
