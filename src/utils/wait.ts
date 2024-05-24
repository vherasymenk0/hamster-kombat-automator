export const wait = (seconds = 2) => {
  const ms = seconds * 1000
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
