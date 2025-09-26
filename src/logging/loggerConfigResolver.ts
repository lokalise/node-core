import type { Level, Logger, LoggerOptions } from 'pino'
import pino, { levels } from 'pino'
import pretty from 'pino-pretty'

export type AppLoggerConfig = {
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  nodeEnv: 'production' | 'development' | 'test'
  base?: Record<string, unknown>
  redact?: LoggerOptions['redact']
}

export type MonorepoAppLoggerConfig = AppLoggerConfig & {
  targetFile?: string
  append?: boolean
}

/* c8 ignore next 8 */
export function resolveMonorepoLogger(appConfig: MonorepoAppLoggerConfig): Logger {
  if (appConfig.nodeEnv !== 'development') {
    return resolveLogger(appConfig)
  }

  const configuration = resolveMonorepoLoggerConfiguration(appConfig)
  return pino(configuration)
}

// Note that transports do not work in vitest, likely because pino attempts to run them in a separate worker
/* c8 ignore next 25 */
export function resolveMonorepoLoggerConfiguration(
  appConfig: MonorepoAppLoggerConfig,
): LoggerOptions {
  return {
    level: appConfig.logLevel,
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
    redact: appConfig.redact,
    transport: {
      target: 'pino/file',
      options: {
        destination: appConfig.targetFile ?? './service.log',
        mkdir: true,
        append: appConfig.append ?? false,
      },
    },
  } satisfies LoggerOptions
}

export function resolveLogger(appConfig: AppLoggerConfig): Logger {
  const configuration = resolveLoggerConfiguration(appConfig)

  if (appConfig.nodeEnv !== 'production') {
    return pino(
      configuration,
      pretty({
        sync: true,
        minimumLevel: appConfig.logLevel as Level,
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid',
      }),
    )
  }

  return pino(configuration)
}

export function resolveLoggerConfiguration(appConfig: AppLoggerConfig): LoggerOptions {
  return {
    level: appConfig.logLevel,
    formatters: {
      level: (_label, numericLevel): { level: string } => {
        const level = levels.labels[numericLevel] || 'unknown'
        return { level }
      },
    },
    redact: appConfig.redact,
  } satisfies LoggerOptions
}
