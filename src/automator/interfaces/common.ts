import { ProfileModel } from './models'

export interface AutomatorState
  extends Pick<
    ProfileModel['clickerUser'],
    | 'balanceCoins'
    | 'availableTaps'
    | 'totalCoins'
    | 'exchangeId'
    | 'tapsRecoverPerSec'
    | 'earnPassivePerSec'
  > {
  energyBoostLastUpdate: number
  turboBoostLastUpdate: number
  maxEnergy: number
  lastCompletedDaily: number
}
