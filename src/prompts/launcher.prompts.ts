import inquirer, { QuestionCollection } from 'inquirer'
import { LAUNCH_MODE_ENUM } from '~/enums'

export const launchPrompt = async (): Promise<LAUNCH_MODE_ENUM> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'action',
      message: 'Select an action',
      choices: [
        { key: 1, name: 'Add new account', value: LAUNCH_MODE_ENUM.add_account },
        { key: 2, name: 'Run automator', value: LAUNCH_MODE_ENUM.automator },
      ],
    },
  ]

  const { action } = await inquirer.prompt(questions)
  return action
}
