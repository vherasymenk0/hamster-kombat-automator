export const formatNum = (num: string | number, fractionDigits?: number) => {
  if (typeof num === 'string')
    return parseFloat(parseFloat(num).toFixed(fractionDigits)).toLocaleString()
  return parseFloat(num.toFixed(fractionDigits)).toLocaleString()
}
