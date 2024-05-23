import inquirer, { QuestionCollection } from 'inquirer'
import { PROXY_TEMPLATE, proxyService } from '~/services/proxyService'
import { logger } from '~/utils'

export const proxyPrompt = async (): Promise<string | null> => {
  const questions: QuestionCollection = [
    {
      type: 'input',
      name: 'proxy',
      message: `Enter proxy [format: ${PROXY_TEMPLATE}] (press enter to skip): `,
    },
  ]

  const { proxy = '' } = await inquirer.prompt(questions)
  const isValid = proxyService.isValidProxy(proxy)

  if (!proxy) return null
  if (!isValid) {
    logger.error('Invalid proxy format, try again')
    return proxyPrompt()
  }

  const prx = proxyService.parse(proxy)
  const { ip, country, city, timezone } = await proxyService.check(prx)
  logger.info(`Proxy_info: ${ip} | ${country} | ${city} | ${timezone}`)

  return proxy
}

export const phonePrompt = async () => {
  const questions: QuestionCollection = [
    {
      type: 'input',
      name: 'phone',
      message: 'Enter your phone number',
    },
  ]

  const { phone = '' } = await inquirer.prompt(questions)
  return phone
}

export const passwordPrompt = async () => {
  const questions: QuestionCollection = [
    {
      type: 'password',
      mask: '*',
      name: 'password',
      message: 'Enter your password',
    },
  ]

  const { password = '' } = await inquirer.prompt(questions)
  return password
}

export const codePrompt = async () => {
  const questions: QuestionCollection = [
    {
      type: 'password',
      mask: '*',
      name: 'code',
      message: 'Enter the code you received',
    },
  ]

  const { code = '' } = await inquirer.prompt(questions)
  return code
}

export const accountNamePrompt = async (): Promise<string> => {
  const questions: QuestionCollection = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a client name',
    },
  ]

  const { name = '' } = await inquirer.prompt(questions)

  if (!name) return accountNamePrompt()
  return name
}

export const existingAccountActionPrompt = async (name: string): Promise<'delete' | 'new'> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'type',
      message: `Client ${name} already exists, choose action`,
      choices: [
        { key: 1, name: 'Enter a different client name', value: 'new' },
        { key: 2, name: 'Delete an existing client', value: 'delete' },
      ],
    },
  ]

  const { type } = await inquirer.prompt(questions)
  return type
}
