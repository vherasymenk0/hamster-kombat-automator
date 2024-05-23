import { BotMaster } from './botMaster'
import { config } from '~/config'
import { logger } from '~/utils'
import { DB } from '~/services/dbService'

export const botMasterStarter = async () => {
  const accounts = DB.getAccounts()

  const bots = accounts.map(async (account) => {
    try {
      if (config.settings.use_proxy && !account.proxyString) {
        logger.error("BotMaster running in proxy mode but account doesn't have proxy", account.name)
        process.exit(1)
      }

      const bot = new BotMaster(account)
      await bot.start()
    } catch (error) {
      logger.error(String(error), account.name)
    }
  })

  await Promise.all(bots)
}
