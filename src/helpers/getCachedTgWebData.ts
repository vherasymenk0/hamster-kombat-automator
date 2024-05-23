import { cacheStore } from '~/services/cacheStore'
import { time } from '~/utils/time'
import { logger } from '~/utils/logger'
import { ONE_DAY_TIMESTAMP } from '~/constants'

export const getCachedTgWebData = (id: string) => {
  const cachedWebData = cacheStore.getById(id)
  if (cachedWebData) {
    const cacheAge = time() - cachedWebData.lastUpdateAt
    const isCacheDataValid = cacheAge < ONE_DAY_TIMESTAMP

    if (isCacheDataValid) {
      const timeUntilRevalidation = ONE_DAY_TIMESTAMP - cacheAge

      const [h, m, s] = [
        Math.floor(timeUntilRevalidation / 3600),
        Math.floor((timeUntilRevalidation % 3600) / 60),
        timeUntilRevalidation % 60,
      ]
      logger.info(`Used cached tg web data | Cache will be revalidated in [${h}h:${m}m:${s}s]`, id)
      return cachedWebData.data
    }
  }
  return null
}
