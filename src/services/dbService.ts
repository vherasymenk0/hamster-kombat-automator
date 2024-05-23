import fs from 'fs'
import { Account } from '~/services/accountManager'

class DBService {
  private db: string

  constructor() {
    this.db = 'db.json'
  }

  init() {
    const isDBCreated = fs.existsSync(this.db)
    if (!isDBCreated) this._write([])
  }

  saveAccount(account: Account) {
    const data = this.getAccounts()
    const newData = [...data, account]
    this._write(newData)
  }

  getAccounts(): Account[] {
    const jsonData = fs.readFileSync(this.db, 'utf8')
    return JSON.parse(jsonData)
  }

  deleteAccount(name: Account['name']) {
    const data = this.getAccounts()
    const newData = data.filter((client) => client.name !== name)
    this._write(newData)
  }

  private _write(data: Account[]) {
    fs.writeFileSync(this.db, JSON.stringify(data, null, 2), 'utf8')
  }
}

export const DB = new DBService()
