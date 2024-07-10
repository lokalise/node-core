import type { Level, Logger, LoggerOptions, redactOptions } from 'pino'
import { levels, pino } from 'pino'
import pretty from 'pino-pretty'

export type AppLoggerConfig = {
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  nodeEnv: 'production' | 'development' | 'test'
  base?: Record<string, unknown>
  redact?: redactOptions
}

export type MonorepoAppLoggerConfig = AppLoggerConfig & {
  targetFile?: string
  append?: boolean
}

// Note that transports do not work in vitest, likely because pino attempts to run them in a separate worker
/* c8 ignore next 24 */
export function resolveMonorepoLoggerConfiguration(
  appConfig: MonorepoAppLoggerConfig,
): LoggerOptions | Logger | boolean {
  if (appConfig.nodeEnv !== 'development') {
    return resolveLoggerConfiguration(appConfig)
  }

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
  }
}

export function resolveLoggerConfiguration(
  appConfig: AppLoggerConfig,
): LoggerOptions | Logger | boolean {
  if (appConfig.nodeEnv !== 'production') {
    return pino(
      pretty({
        sync: true,
        minimumLevel: appConfig.logLevel as Level,
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid',
      }),
    )
  }

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
