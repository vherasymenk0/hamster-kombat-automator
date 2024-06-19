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

export interface UpgradeItem {
  id: string
  name: string
  price: number
  profitPerHour: number
  expiresAt?: string
  condition: UpgradeConditionType | null
  section: string
  level: number
  maxLevel?: number
  currentProfitPerHour: number
  totalCooldownSeconds?: number
  cooldownSeconds?: number
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
    lastUpgradeAt?: number
  }
  BoostFullAvailableTaps: {
    id: 'BoostFullAvailableTaps'
    level: number
    lastUpgradeAt?: number
  }
}

interface Cipher {
  cipher: string
  bonusCoins: number
  isClaimed: boolean
  remainSeconds: number
}

type CompletedTaskType = Omit<Task, 'id' | 'days' | 'completedAt'> & {
  id: string
  days: number
  completedAt: string
}

export interface LoginResponseModel {
  authToken: string
  status: string
}

interface ClickerUser {
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

interface ComboInfoModel {
  upgradeIds: string[]
  bonusCoins: number
  isClaimed: boolean
  remainSeconds: number
}

export interface ProfileModel {
  clickerUser: ClickerUser
  dailyCombo: ComboInfoModel
}

export interface TasksListModel {
  tasks: Task[]
}

export interface CompletedTaskModel extends ProfileModel {
  task: CompletedTaskType
}

export interface UpgradesModel {
  upgradesForBuy: UpgradeItem[]
  sections: UpgradeSection[]
  dailyCombo: ComboInfoModel
}

export interface BoostsModel {
  boostsForBuy: {
    id: 'BoostFullAvailableTaps' | 'BoostEarnPerTap' | 'BoostMaxTaps'
    price: number
    earnPerTap: number
    maxTaps: number
    maxLevel?: number
    cooldownSeconds: number
    level: number
    maxTapsDelta: number
    earnPerTapDelta: number
  }[]
}

export interface DailyCipherModel {
  clickerUser: ClickerUser
  dailyCipher: Cipher
}

export interface ComboModel {
  combo: string[]
  date: string
}
