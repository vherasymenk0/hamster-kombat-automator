import inquirer, { QuestionCollection } from 'inquirer'

export const launchActionPrompt = async (): Promise<'add' | 'bot'> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'action',
      message: 'Select an action',
      choices: [
        { key: 1, name: 'Add new account', value: 'add' },
        { key: 2, name: 'Run bot', value: 'bot' },
      ],
    },
  ]

  const { action } = await inquirer.prompt(questions)
  return action
}
