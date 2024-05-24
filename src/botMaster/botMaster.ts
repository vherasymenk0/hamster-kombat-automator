import { api, ProfileInfo } from '~/services/api'
import { Account } from '~/services/accountManager'
import { config } from '~/config'
import { logger, sleep, time } from '~/utils'
import { buildClientParams, getRandomRangeNumber, isValidWebData } from '~/helpers'
import Axios from '~/services/axios'
import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { FloodWaitError } from 'telegram/errors'
import { ONE_DAY_TIMESTAMP, ONE_HOUR_TIMESTAMP } from '~/constants'
import { DB } from '~/services/dbService'
import { BOT_MASTER_AXIOS_CONFIG } from '~/botMaster/constants'
import { BotMasterState } from './interfaces'

const dailyTaskId = 'streak_days'
const {
  taps_count_range,
  turbo_taps_count,
  min_energy,
  sleep_between_taps,
  max_upgrade_lvl,
  tap_mode,
} = config.settings

export class BotMaster {
  private account: Account
  tokenCreatedTime = 0
  state: BotMasterState = {
    availableTaps: 0,
    totalCoins: 0,
    balanceCoins: 0,
    exchangeId: '',
    energyBoostLastUpdate: 0,
    turboBoostLastUpdate: 0,
    maxEnergy: 0,
    tapsRecoverPerSec: 0,
    lastCompletedDaily: 0,
  }
  isStateInit = false
  _: Axios

  constructor(props: Account) {
    const { headers, baseURL } = BOT_MASTER_AXIOS_CONFIG
    this._ = new Axios({
      config: { baseURL, headers: { ...headers, ...props.agent } },
      proxyString: props.proxyString,
    })
    this.account = props
  }

  private async getTgWebData() {
    const { userName, origin } = config.info
    const { api_id, api_hash } = config.settings
    const { webData, name, proxyString, session } = this.account

    const cachedWebData = isValidWebData(webData, name)
    if (cachedWebData) return cachedWebData

    const params = await buildClientParams(proxyString, name)
    const stringSession = new StringSession(session)
    const client = new TelegramClient(stringSession, api_id, api_hash, params)

    const isValidSession = await client.connect()
    if (!isValidSession) throw new Error('Session is invalid')

    const userEntity = await client.getEntity(userName)
    await sleep(3)
    const webview = await client.invoke(
      new Api.messages.RequestWebView({
        peer: userEntity,
        bot: userEntity,
        platform: 'android',
        fromBotMenu: false,
        url: origin,
      }),
    )
    const authUrl = webview.url
    const stringData = decodeURIComponent(
      authUrl.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0],
    )

    DB.set({ ...this.account, webData: { lastUpdateAt: time(), stringData } })
    logger.info(`Web data has been successfully cached`, name)
    await sleep(2)
    await client.destroy()

    return stringData
  }

  private updateState(info: ProfileInfo['clickerUser']) {
    const { tasks } = info
    const completedTime = tasks?.[`${dailyTaskId}`]?.completedAt
    const lastCompletedDaily = completedTime
      ? Math.floor(Date.parse(tasks[`${dailyTaskId}`].completedAt) / 1000)
      : 0

    this.state = {
      availableTaps: info.availableTaps,
      totalCoins: info.totalCoins,
      balanceCoins: info.balanceCoins,
      exchangeId: info.exchangeId,
      energyBoostLastUpdate: info.boosts?.BoostFullAvailableTaps?.lastUpgradeAt || 0,
      turboBoostLastUpdate: info.boosts?.BoostMaxTaps?.lastUpgradeAt || 0,
      maxEnergy: info.maxTaps,
      tapsRecoverPerSec: info.tapsRecoverPerSec,
      lastCompletedDaily,
    }
    this.isStateInit = true
  }

  private async auth(tgWebData: string) {
    await api.login(this._, tgWebData, this.account.fingerprint)
    this.tokenCreatedTime = time()
    logger.success('Successfully authenticated', this.account.name)
  }

  private async selectExchange() {
    const exchange = 'okx'
    await api.selectExchange(this._, exchange)

    logger.success(`Successfully selected ${exchange} exchange`, this.account.name)
  }

  private async completeDailyTask() {
    const tasks = await api.getTasks(this._)
    const dailyTask = tasks.find(({ id }) => id === dailyTaskId)

    if (!dailyTask?.isCompleted) {
      const { rewardsByDays, days, completedAt } = await api.completeTask(this._, dailyTaskId)

      this.state.lastCompletedDaily = Math.floor(Date.parse(completedAt) / 1000)
      const reward = rewardsByDays?.[days - 1].rewardCoins

      logger.success(
        `Successfully get daily reward | Days: ${days} | Reward coins: ${reward}`,
        this.account.name,
      )
    }
  }

  private async applyDailyTurbo() {
    await api.applyBoost(this._, 'BoostMaxTaps')
    logger.success('Turbo has been successfully applied', this.account.name)
    await sleep(1)
    await this.sendTaps(turbo_taps_count)
  }

  private async applyDailyEnergy() {
    const data = await api.applyBoost(this._, 'BoostFullAvailableTaps')
    this.updateState(data)

    logger.success(
      `Energy has been successfully restored | Energy: ${data.availableTaps}`,
      this.account.name,
    )
  }

  private async sendTaps(count?: number) {
    const [min, max] = taps_count_range
    const tapsCount = count || getRandomRangeNumber(min, max)

    const data = await api.sendTaps(this._, tapsCount, this.state.availableTaps)
    this.updateState(data)

    logger.success(
      `Successfully tapped! (+${tapsCount}) | Balance: ${data.balanceCoins.toFixed(2)}`,
      this.account.name,
    )
  }

  private async setProfileInfo() {
    const data = await api.getProfileInfo(this._)
    const { lastPassiveEarn, earnPassivePerHour } = data
    this.updateState(data)

    const lpe = lastPassiveEarn.toFixed(2)
    logger.info(
      `Last passive earn: ${lpe} | Earn every hour: ${earnPassivePerHour}`,
      this.account.name,
    )
  }

  private async getAvailableUpgrades() {
    const data = await api.getUpgrades(this._)

    const availableUpgrades = data
      .filter(({ isAvailable: isUnlock, isExpired, level, maxLevel = 999 }) => {
        const isAvailable = isUnlock && !isExpired
        const hasMaxUpgradeLevel = level >= max_upgrade_lvl
        const isAvailableToUpgrade = maxLevel > level

        return isAvailable && !hasMaxUpgradeLevel && isAvailableToUpgrade
      })
      .sort((a, b) => {
        const a_ppr = a.profitPerHourDelta / a.price
        const b_ppr = b.profitPerHourDelta / b.price

        return b_ppr - a_ppr
      })

    return availableUpgrades
  }

  private async buyAvailableUpgrades() {
    const upgrades = await this.getAvailableUpgrades()
    let balance = this.state.balanceCoins
    let profileInfo = null

    for (const { profitPerHourDelta, id, level, price } of upgrades) {
      if (balance >= price) {
        const res = await api.buyUpgrade(this._, id)
        profileInfo = res
        balance -= price

        logger.success(
          `Upgraded [${id}] to ${level} lvl | +${profitPerHourDelta} | Total per hour ${res.earnPassivePerHour}`,
          this.account.name,
        )
        await sleep(4)
      }
    }

    if (profileInfo) this.updateState(profileInfo)
  }

  async start() {
    try {
      const tgWebData = await this.getTgWebData()
      await sleep(2)

      while (true) {
        const {
          turboBoostLastUpdate,
          exchangeId,
          energyBoostLastUpdate,
          availableTaps,
          maxEnergy,
          tapsRecoverPerSec,
          lastCompletedDaily,
        } = this.state

        const isTokenExpired = time() - this.tokenCreatedTime >= ONE_HOUR_TIMESTAMP
        const isDailyTurboReady = time() - turboBoostLastUpdate > ONE_DAY_TIMESTAMP && false // Turbo is not available in the app right now
        const isDailyEnergyReady = time() - energyBoostLastUpdate > ONE_HOUR_TIMESTAMP
        const isDailyTaskAvailable = time() - lastCompletedDaily > ONE_DAY_TIMESTAMP

        try {
          if (isTokenExpired) {
            await this.auth(tgWebData)
            await sleep(2)
            continue
          }

          if (!this.isStateInit) {
            await this.setProfileInfo()
            await sleep(2)
            continue
          }

          if (exchangeId === 'hamster') {
            await this.selectExchange()
            await sleep(2)
            continue
          }

          if (isDailyTaskAvailable) {
            await this.completeDailyTask()
            await sleep(2)
            continue
          }

          if (!isDailyTurboReady) {
            await this.buyAvailableUpgrades()
            await sleep(2)
          }

          if (tap_mode) {
            if (isDailyTurboReady) {
              await this.applyDailyTurbo()
              await sleep(2)
              continue
            }

            if (min_energy <= availableTaps) {
              const [min, max] = sleep_between_taps
              const sleepTime = getRandomRangeNumber(min, max)

              await this.sendTaps()
              await sleep(sleepTime)
              continue
            }

            if (isDailyEnergyReady) {
              await this.applyDailyEnergy()
              await sleep(2)
            } else {
              const sleepTime = (maxEnergy - availableTaps) / tapsRecoverPerSec
              const timeInMinutes = Math.round((maxEnergy - availableTaps) / tapsRecoverPerSec / 60)

              logger.info(
                `Minimum energy reached: ${availableTaps} | Approximate energy recovery time ${timeInMinutes} minutes`,
                this.account.name,
              )

              await sleep(sleepTime)
            }
          }
        } catch (e) {
          logger.error(String(e), this.account.name)
          await sleep(3)
        }
      }
    } catch (error) {
      if (error instanceof FloodWaitError) {
        logger.error(String(error), this.account.name)
        logger.warn(`Sleep ${error.seconds} seconds`, this.account.name)
        await sleep(error.seconds)
      }
      await sleep(2)
      await this.start()
    }
  }
}
