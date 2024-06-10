import { Axios } from '~/services'
import { ComboModel } from '~/automator/interfaces'

export const getDailyCombo = async () => {
  try {
    const axios = new Axios()
    const data = await axios.get<ComboModel>('/api/GetCombo', {
      baseURL: 'https://api21.datavibe.top',
    })
    return data
  } catch (e) {
    throw new Error(`Api | getCombo() | ${e}`)
  }
}
