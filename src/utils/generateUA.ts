import parser from 'ua-parser-js'
import fs from 'fs'
import { Account } from '~/services/accountManager'

export const generateUA = () => {
  const agents: string[] = JSON.parse(fs.readFileSync('src/data/agents.json', 'utf8'))
  const db: Account[] = JSON.parse(fs.readFileSync('db.json', 'utf8'))

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

  return {
    'Sec-Ch-Ua-Mobile': '?1',
    'Sec-Ch-Ua-Platform': os.name || 'Android',
    'User-Agent': userAgent,
    'Sec-Ch-Ua': `"Chromium";v="${browser.major}", "Google Chrome";v="${browser.major}", "Mobile";v="1"${mobile}`,
  }
}
