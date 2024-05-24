import { createLogger, format, transports } from 'winston'
import { WinstonColorsType, WinstonColorsTypeLevels } from '~/interfaces'

class Logger {
  private readonly levels: Record<WinstonColorsTypeLevels, number>
  private readonly levelColors: Record<WinstonColorsTypeLevels, WinstonColorsType>
  private logger

  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      success: 3,
      debug: 4,
    }

    this.levelColors = {
      error: 'red',
      warn: 'yellow',
      info: 'blue',
      success: 'green',
      debug: 'white',
    }

    this.logger = createLogger({
      levels: this.levels,
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'HH:mm:ss' }),
        format.errors({ stack: true }),
        this.customFormat,
      ),
      transports: [new transports.Console()],
    })
  }

  private colorize(str: string, color: WinstonColorsType) {
    const codes = {
      red: 31,
      yellow: 33,
      blue: 36,
      green: 32,
      white: 37,
    }

    const code = codes[color] || 37
    return `\u001b[${code}m${str}\u001b[0m`
  }

  private customFormat = format.printf(({ level: lvl, timestamp, message, label }) => {
    const color = this.levelColors[lvl as WinstonColorsTypeLevels]
    const levelUppercase = lvl.toUpperCase()
    const level = this.colorize(levelUppercase, color)
    let colorizedLevel = ''

    if (lvl === 'info') colorizedLevel = ` |  ${level}   |`
    if (lvl === 'warn') colorizedLevel = ` |  ${level}   |`
    if (lvl === 'error') colorizedLevel = ` |  ${level}  |`
    if (lvl === 'success') colorizedLevel = ` | ${level} |`

    const lbl = label ? ` ${label.toUpperCase()} |` : ''
    return `${timestamp}${colorizedLevel}${lbl} ${this.colorize(message, color)}`
  })

  info(message: string, label?: string) {
    this.logger.info({ message, label })
  }
  warn(message: string, label?: string) {
    this.logger.warn({ message, label })
  }
  error(message: string, label?: string) {
    this.logger.error({ message, label })
  }
  success(message: string, label?: string) {
    this.logger.log({ level: 'success', message, label })
  }
  debug(message: string, label?: string) {
    this.logger.debug({ message, label })
  }
}

export const log = new Logger()
