import fs from 'fs'
import { AccountModel } from '~/interfaces'
import { DB_PATH } from '~/constants'
import { log } from './logger'

class DataBaseService {
  private _write(data: AccountModel[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  }

  init() {
    const isDBCreated = fs.existsSync(DB_PATH)
    if (!isDBCreated) {
      this._write([])
      log.success('Database has been successfully initialized')
    }
  }

  set(account: AccountModel) {
    const data = this.getAll()
    const newData = data.filter(({ name }) => name !== account.name)
    this._write([...newData, account])
  }

  getAll(): AccountModel[] {
    const jsonData = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(jsonData)
  }

  delete(name: AccountModel['name']) {
    const data = this.getAll()
    const newData = data.filter((client) => client.name !== name)
    this._write(newData)
  }
}

export const DB = new DataBaseService()
