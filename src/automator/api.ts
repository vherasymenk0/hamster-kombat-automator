import { Axios } from '~/services'
import {
  CompletedTaskModel,
  LoginResponseModel,
  ProfileModel,
  TasksListModel,
  UpgradesModel,
} from './interfaces'
import { API_MAP } from './constants'
import { AccountModel } from '~/interfaces'
import { time } from '~/utils'

class ApiService {
  async login(axios: Axios, tgWebData: string, fp: AccountModel['fingerprint']) {
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
      const { authToken } = await axios.post<LoginResponseModel>(API_MAP.login, {
        data: dto,
      })

      axios.setAuthToken(authToken)
    } catch (e) {
      throw new Error(`Api | login() | ${e}`)
    }
  }

  async getProfileInfo(axios: Axios) {
    try {
      const { clickerUser } = await axios.post<ProfileModel>(API_MAP.profileInfo)
      return clickerUser
    } catch (e) {
      throw new Error(`Api | getProfileInfo() | ${e}`)
    }
  }

  async selectExchange(axios: Axios, exchangeId: string) {
    try {
      const dto = { exchangeId }
      const { clickerUser } = await axios.post<ProfileModel>(API_MAP.exchange, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | selectExchange(${exchangeId}) | ${e}`)
    }
  }

  async getTasks(axios: Axios) {
    try {
      const { tasks } = await axios.post<TasksListModel>(API_MAP.tasksList)
      return tasks
    } catch (e) {
      throw new Error(`Api | getTasks() | ${e}`)
    }
  }

  async completeTask(axios: Axios, taskId: string) {
    try {
      const dto = { taskId }
      const { task } = await axios.post<CompletedTaskModel>(API_MAP.completeTask, {
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
      const { clickerUser } = await axios.post<ProfileModel>(API_MAP.tap, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | sendTaps(${count}) | ${e}`)
    }
  }

  async applyBoost(axios: Axios, boostId: string) {
    try {
      const dto = { boostId, timestamp: time() }
      const { clickerUser } = await axios.post<ProfileModel>(API_MAP.boost, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | applyBoost(${boostId}) | ${e}`)
    }
  }

  async getUpgrades(axios: Axios) {
    try {
      const { upgradesForBuy } = await axios.post<UpgradesModel>(API_MAP.upgrades)
      return upgradesForBuy
    } catch (e) {
      throw new Error(`Api | getUpgrades() | ${e}`)
    }
  }

  async buyUpgrade(axios: Axios, upgradeId: string) {
    try {
      const dto = { upgradeId, timestamp: Date.now() }
      const { clickerUser } = await axios.post<ProfileModel>(API_MAP.buyUpgrade, { data: dto })
      return clickerUser
    } catch (e) {
      throw new Error(`Api | buyUpgrade(${upgradeId}) | ${e}`)
    }
  }
}

export const Api = new ApiService()
