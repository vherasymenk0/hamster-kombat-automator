import { config } from '~/config'

export const DAILY_TASK_ID = 'streak_days'

export const BOT_MASTER_AXIOS_CONFIG = {
  baseURL: `https://${config.info.api}/`,
  headers: {
    Accept: '*/*',
    'Accept-Language': 'uk,en-GB;q=0.9,en;q=0.8',
    Host: config.info.api,
    Origin: config.info.origin,
    Referer: `${config.info.origin}/`,
    Priority: 'u=1, i',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
  },
}

export const API_MAP = {
  login: '/auth/auth-by-telegram-webapp',
  profileInfo: '/clicker/sync',
  tasksList: '/clicker/list-tasks',
  exchange: '/clicker/select-exchange',
  completeTask: '/clicker/check-task',
  boost: '/clicker/buy-boost',
  upgrades: '/clicker/upgrades-for-buy',
  buyUpgrade: '/clicker/buy-upgrade',
  tap: '/clicker/tap',
} as const
