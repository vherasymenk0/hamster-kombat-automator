export const stringToBoolean = (value: string): boolean => {
  if (value === 'true') return true
  if (value === 'false') return false

  throw new Error(`Invalid string boolean value: ${value}`)
}
