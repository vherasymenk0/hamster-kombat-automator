export const apiMap = {
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
