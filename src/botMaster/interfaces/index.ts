import { ProfileInfo } from '~/services/api'

export interface BotMasterState
  extends Pick<
    ProfileInfo['clickerUser'],
    'balanceCoins' | 'availableTaps' | 'totalCoins' | 'exchangeId' | 'tapsRecoverPerSec'
  > {
  energyBoostLastUpdate: number
  turboBoostLastUpdate: number
  maxEnergy: number
  lastCompletedDaily: number
}
