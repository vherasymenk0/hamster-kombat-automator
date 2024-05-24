import parser from 'ua-parser-js'
import fs from 'fs'
import { AGENTS_PATH } from '~/constants'
import { DB } from '~/services'

export const generateUA = () => {
  const agents: string[] = JSON.parse(fs.readFileSync(AGENTS_PATH, 'utf8'))
  const db = DB.getAll()

  const maxIndex = agents.length - 1
  const randomIndex = Math.floor(Math.random() * (maxIndex + 1))
  const userAgent = agents[randomIndex]

  if (db.length < agents.length) {
    const isExistedAgent = db.some(({ agent }) => agent['User-Agent'] === userAgent)
    if (isExistedAgent) generateUA()
  }

  const data = parser(userAgent)
  const { browser, os, device } = data
  const hasDevice = Boolean(device?.vendor && device?.model)
  const mobile = hasDevice ? `, "${device.vendor}";v="${device.vendor}"` : ''
  const version = browser.major || browser.version

  return {
    'Sec-Ch-Ua-Mobile': '?1',
    'Sec-Ch-Ua-Platform': os.name || 'Android',
    'User-Agent': userAgent,
    'Sec-Ch-Ua': `"Chromium";v="${version}", "Google Chrome";v="${version}", "Mobile";v="1"${mobile}`,
  }
}
