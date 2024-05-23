import { CompletedTask, LoginResponse, ProfileInfo, TasksList, Upgrades } from './api.interfaces'
import { apiMap } from './api.constants'
import { Account } from '~/services/accountManager'
import Axios from '~/services/axios'
import { time } from '~/utils'

class Api {
  async login(axios: Axios, tgWebData: string, fp: Account['fingerprint']) {
    try {
      let fingerprint = {}
      axios.setAuthToken()

      if (fp) {
        fingerprint = {
          version: '4.2.1',
          visitorId: fp.visitorId,
          components: fp.components,
        }
      }

      const dto = { initDataRaw: tgWebData, fingerprint }
      const { authToken } = await axios.post<LoginResponse>(apiMap.login, {
        data: dto,
      })

      axios.setAuthToken(authToken)
    } catch (e) {
      throw new Error(`Api | login() | ${e}`)
    }
  }

  async getProfileInfo(axios: Axios) {
    try {
      const { clickerUser } = await axios.post<ProfileInfo>(apiMap.profileInfo)
      return clickerUser
    } catch (e) {
      throw new Error(`Api | getProfileInfo() | ${e}`)
    }
  }

  async selectExchange(axios: Axios, exchangeId: string) {
    try {
      const dto = { exchangeId }
      const { clickerUser } = await axios.post<ProfileInfo>(apiMap.exchange, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | selectExchange(${exchangeId}) | ${e}`)
    }
  }

  async getTasks(axios: Axios) {
    try {
      const { tasks } = await axios.post<TasksList>(apiMap.tasksList)
      return tasks
    } catch (e) {
      throw new Error(`Api | getTasks() | ${e}`)
    }
  }

  async completeTask(axios: Axios, taskId: string) {
    try {
      const dto = { taskId }
      const { task } = await axios.post<CompletedTask>(apiMap.completeTask, {
        data: dto,
      })
      return task
    } catch (e) {
      throw new Error(`Api | completeTask(${taskId}) | ${e}`)
    }
  }

  async sendTaps(axios: Axios, count: number, availableTaps: number) {
    try {
      const dto = { count, availableTaps, timestamp: time() }
      const { clickerUser } = await axios.post<ProfileInfo>(apiMap.tap, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | sendTaps(${count}) | ${e}`)
    }
  }

  async applyBoost(axios: Axios, boostId: string) {
    try {
      const dto = { boostId, timestamp: time() }
      const { clickerUser } = await axios.post<ProfileInfo>(apiMap.boost, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | applyBoost(${boostId}) | ${e}`)
    }
  }

  async getUpgrades(axios: Axios) {
    try {
      const { upgradesForBuy } = await axios.post<Upgrades>(apiMap.upgrades)
      return upgradesForBuy
    } catch (e) {
      throw new Error(`Api | getUpgrades() | ${e}`)
    }
  }

  async buyUpgrade(axios: Axios, upgradeId: string) {
    try {
      const dto = { upgradeId, timestamp: Date.now() }
      const { clickerUser } = await axios.post<ProfileInfo>(apiMap.buyUpgrade, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | buyUpgrade(${upgradeId}) | ${e}`)
    }
  }
}

export const api = new Api()
