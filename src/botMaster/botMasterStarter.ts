import { BotMaster } from './botMaster'
import { config } from '~/config'
import { getTgWebData, logger, sleep } from '~/utils'
import { buildClientParams } from '~/helpers'
import { DB } from '~/services/dbService'

const accounts = DB.getAccounts()
export const botMasterStarter = async () => {
  const bots = accounts.map(async ({ name, agent, proxyString, session, fingerprint }) => {
    try {
      if (config.settings.use_proxy && !proxyString) {
        logger.error("BotMaster running in proxy mode but account doesn't have proxy", name)
        process.exit(1)
      }

      const tgClientParams = await buildClientParams(proxyString, name)
      await sleep(1)
      const tgWebData = await getTgWebData(session, tgClientParams)

      const bot = new BotMaster({ name, agent, proxyString })
      await bot.start(tgWebData, fingerprint)
    } catch (error) {
      logger.error(String(error), name)
      await sleep(3)
      await botMasterStarter()
    }
  })

  await Promise.all(bots)
}
