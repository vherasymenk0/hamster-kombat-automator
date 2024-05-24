import { Automator } from './automator'
import { DB, log } from '~/services'

export const runAutomator = async () => {
  const accounts = DB.getAll()

  const bots = accounts.map(async (account) => {
    try {
      const bot = new Automator(account)
      await bot.start()
    } catch (error) {
      log.error(String(error), account.name)
    }
  })

  await Promise.all(bots)
}
