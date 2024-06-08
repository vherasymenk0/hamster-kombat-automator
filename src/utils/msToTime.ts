export const msToTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / 1000 / 60) % 60)
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24)

  return {
    formattedTime: [
      hours.toString().padStart(2, '0') + 'h',
      minutes.toString().padStart(2, '0') + 'm',
      seconds.toString().padStart(2, '0') + 's',
    ].join(':'),
    hours,
    minutes,
    seconds,
  }
}
