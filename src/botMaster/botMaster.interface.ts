import { ProfileInfo } from '~/services/api'
import { Account } from '~/services/accountManager'

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

export type BotMasterProps = Omit<Account, 'session' | 'fingerprint'>
