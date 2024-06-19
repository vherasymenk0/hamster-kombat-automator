import { getEnvVar, stringToBoolean } from '~/helpers'

const settings = {
  api_id: Number(getEnvVar('API_ID')),
  api_hash: getEnvVar('API_HASH'),
  tap_mode: stringToBoolean(getEnvVar('TAP_MODE', 'true')),
  buy_mode: stringToBoolean(getEnvVar('BUY_MODE', 'true')),
  min_energy: Number(getEnvVar('MIN_ENERGY', '100')),
  turbo_taps_count: Number(getEnvVar('TURBO_TAPS_COUNT', '2500')),
  max_upgrade_lvl: Number(getEnvVar('MAX_UPGRADE_LVL', '20')),
  taps_count_range: [
    Number(getEnvVar('TAPS_COUNT_RANGE_MIN', '50')),
    Number(getEnvVar('TAPS_COUNT_RANGE_MAX', '199'))
  ],
  sleep_between_taps: [
    Number(getEnvVar('SLEEP_BETWEEN_TAPS_MIN', '10')),
    Number(getEnvVar('SLEEP_BETWEEN_TAPS_MAX', '15'))
  ],
}

export const config = {
  settings,
  info: {
    origin: 'https://hamsterkombat.io',
    api: 'api.hamsterkombat.io',
    name: 'Hamster Kombat',
    userName: 'hamster_kombat_bot',
  },
}
