import { BotMaster } from './botMaster'
import { logger } from '~/utils'
import { DB } from '~/services/dbService'

export const botMasterStarter = async () => {
  const accounts = DB.getAll()

  const bots = accounts.map(async (account) => {
    try {
      const bot = new BotMaster(account)
      await bot.start()
    } catch (error) {
      logger.error(String(error), account.name)
    }
  })

  await Promise.all(bots)
}
