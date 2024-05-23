import { api, ProfileInfo } from '~/services/api'
import { Account } from '~/services/accountManager'
import { config } from '~/config'
import { logger, sleep, time } from '~/utils'
import { buildClientParams, getRandomRangeNumber } from '~/helpers'
import { BotMasterState } from './botMaster.interface'
import Axios from '~/services/axios'
import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { FloodWaitError } from 'telegram/errors'

const oneHour = 3600
const oneDay = 24 * 60 * 60
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
  private fingerprint: Account['fingerprint']
  private proxyString: Account['proxyString']
  private session: Account['session']
  tokenCreatedTime = 0
  name: Account['name']
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
    this._ = new Axios({ headers: props.agent }, props.proxyString)
    this.name = props.name
    this.fingerprint = props.fingerprint
    this.proxyString = props.proxyString
    this.session = props.session
  }

  private async getTgWebData() {
    const { userName, origin } = config.info
    const { api_id, api_hash } = config.settings

    const params = await buildClientParams(this.proxyString, this.name)
    const stringSession = new StringSession(this.session)
    const client = new TelegramClient(stringSession, api_id, api_hash, params)

    const isValidSession = await client.connect()
    if (!isValidSession) throw new Error('Session is invalid')

    const userEntity = await client.getEntity(userName)
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
    const data = decodeURIComponent(authUrl.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0])
    await client.destroy()

    return data
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
    await api.login(this._, tgWebData, this.fingerprint)
    this.tokenCreatedTime = time()
    logger.success('Successfully authenticated', this.name)
  }

  private async selectExchange() {
    const exchange = 'okx'
    await api.selectExchange(this._, exchange)

    logger.success(`Successfully selected ${exchange} exchange`, this.name)
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
        this.name,
      )
    }
  }

  private async applyDailyTurbo() {
    await api.applyBoost(this._, 'BoostMaxTaps')
    logger.success('Turbo has been successfully applied', this.name)
    await sleep(1)
    await this.sendTaps(turbo_taps_count)
  }

  private async applyDailyEnergy() {
    const data = await api.applyBoost(this._, 'BoostFullAvailableTaps')
    this.updateState(data)

    logger.success(
      `Energy has been successfully restored | Energy: ${data.availableTaps}`,
      this.name,
    )
  }

  private async sendTaps(count?: number) {
    const [min, max] = taps_count_range
    const tapsCount = count || getRandomRangeNumber(min, max)

    const data = await api.sendTaps(this._, tapsCount, this.state.availableTaps)
    this.updateState(data)

    logger.success(
      `Successfully tapped! (+${tapsCount}) | Balance: ${data.balanceCoins.toFixed(2)}`,
      this.name,
    )
  }

  private async setProfileInfo() {
    const data = await api.getProfileInfo(this._)
    const { lastPassiveEarn, earnPassivePerHour } = data
    this.updateState(data)

    const lpe = lastPassiveEarn.toFixed(2)
    logger.info(`Last passive earn: ${lpe} | Earn every hour: ${earnPassivePerHour}`, this.name)
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
          this.name,
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

        const isTokenExpired = time() - this.tokenCreatedTime >= oneHour
        const isDailyTurboReady = time() - turboBoostLastUpdate > oneDay && false // Turbo is not available in the app right now
        const isDailyEnergyReady = time() - energyBoostLastUpdate > oneHour
        const isDailyTaskAvailable = time() - lastCompletedDaily > oneDay

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
                this.name,
              )

              await sleep(sleepTime)
            }
          }
        } catch (e) {
          logger.error(String(e), this.name)
          await sleep(3)
        }
      }
    } catch (error) {
      if (error instanceof FloodWaitError) {
        logger.error(String(error), this.name)
        logger.warn(`Sleep ${error.seconds} seconds`, this.name)
        await sleep(error.seconds)
      }
      await sleep(2)
      await this.start()
    }
  }
}
