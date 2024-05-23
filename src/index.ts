import { launcher, logger } from '~/utils'
import { AUTHOR } from '~/constants'
import { DB } from '~/services/dbService'

try {
  DB.init()
  logger.info(AUTHOR)
  launcher()
} catch (e) {
  logger.error(String(e))
}
