interface UpgradedItem {
  id: string
  level: number
  lastUpgradeAt: number
  snapshotReferralsCount: number
}

type UpgradeConditionType = {
  _type: string
  upgradeId: string
  level: number
  link: string
  channelUsername: string
  moreReferralsCount: number
}

interface UpgradeSection {
  section: string
  isAvailable: boolean
}

interface UpgradeItem {
  id: string
  name: string
  price: number
  profitPerHour: number
  expiresAt?: string
  condition: UpgradeConditionType | null
  section: string
  level: number
  currentProfitPerHour: number
  profitPerHourDelta: number
  isAvailable: boolean
  isExpired: boolean
}

interface RewardItem {
  days: number
  rewardCoins: number
}

interface Task {
  id: string
  rewardCoins: number
  periodicity: string
  isCompleted: boolean
  link?: string
  days?: number
  rewardsByDays?: RewardItem[]
  completedAt?: string
}

interface Boosts {
  BoostMaxTaps: {
    id: 'BoostMaxTaps'
    level: number
    lastUpgradeAt: number
  }
  BoostFullAvailableTaps: {
    id: 'BoostFullAvailableTaps'
    level: number
    lastUpgradeAt: number
  }
}

type CompletedTaskType = Omit<Task, 'id' | 'days' | 'completedAt'> & {
  id: string
  days: number
  completedAt: string
}

export interface ErrorResponse {
  error_code: string
  error_message: string
}

export interface LoginResponse {
  authToken: string
  status: string
}

export interface ProfileInfo {
  clickerUser: {
    id: string
    totalCoins: number
    balanceCoins: number
    level: number
    availableTaps: number
    lastSyncUpdate: number
    exchangeId: string
    boosts: Boosts
    upgrades: Record<string, UpgradedItem>
    tasks: Record<string, CompletedTaskType>
    referralsCount: number
    maxTaps: number
    earnPerTap: number
    earnPassivePerSec: number
    earnPassivePerHour: number
    lastPassiveEarn: number
    tapsRecoverPerSec: number
    referral: Record<string, unknown>
  }
}

export interface TasksList {
  tasks: Task[]
}

export interface CompletedTask extends ProfileInfo {
  task: CompletedTaskType
}

export interface Upgrades {
  upgradesForBuy: UpgradeItem[]
  sections: UpgradeSection[]
}
