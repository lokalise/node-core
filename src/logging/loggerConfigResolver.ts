import type { LoggerOptions } from 'pino'

export type AppLoggerConfig = {
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  nodeEnv: 'production' | 'development' | 'test'
}

export type MonorepoAppLoggerConfig = AppLoggerConfig & {
  targetFile?: string
  append?: boolean
}

// Note that transports do not work in vitest, likely because pino attempts to run them in a separate worker
/* c8 ignore next 27 */
export function resolveMonorepoLoggerConfiguration(
  appConfig: MonorepoAppLoggerConfig,
): LoggerOptions {
  if (appConfig.nodeEnv === 'test') {
    return resolveLoggerConfiguration(appConfig)
  }

  const config: LoggerOptions = {
    level: appConfig.logLevel,
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
  }
  if (appConfig.nodeEnv === 'development') {
    config.transport = {
      target: 'pino/file',
      options: {
        destination: appConfig.targetFile ?? './service.log',
        mkdir: true,
        append: appConfig.append ?? false,
      },
    }
  }
  return config
}

export function resolveLoggerConfiguration(appConfig: AppLoggerConfig): LoggerOptions {
  const config: LoggerOptions = {
    level: appConfig.logLevel,
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
  }
  if (appConfig.nodeEnv !== 'production') {
    config.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid',
      },
    }
  }
  return config
}
