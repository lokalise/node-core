import type { Level, Logger, LoggerOptions } from 'pino'
import pino, { levels } from 'pino'
import pretty from 'pino-pretty'

/**
 * @deprecated Use `ResolveLoggerOptions` from `@lokalise/observability` instead. It has no `base`.
 */
export type AppLoggerConfig = {
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  nodeEnv: 'production' | 'development' | 'test'
  base?: Record<string, unknown>
  redact?: LoggerOptions['redact']
}

/**
 * @deprecated Will be removed without a replacement. Use `resolveLogger` from `@lokalise/observability` instead.
 */
export type MonorepoAppLoggerConfig = AppLoggerConfig & {
  targetFile?: string
  append?: boolean
}

/* c8 ignore next 8 */
/**
 * @deprecated Will be removed without a replacement. Use `resolveLogger` from `@lokalise/observability` instead.
 */
export function resolveMonorepoLogger(appConfig: MonorepoAppLoggerConfig): Logger {
  if (appConfig.nodeEnv !== 'development') {
    return resolveLogger(appConfig)
  }

  const configuration = resolveMonorepoLoggerConfiguration(appConfig)
  return pino(configuration)
}

// Note that transports do not work in vitest, likely because pino attempts to run them in a separate worker
/* c8 ignore next 25 */
/**
 * @deprecated Will be removed without a replacement. Use `resolveLogger` from `@lokalise/observability` instead.
 */
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

/**
 * @deprecated Use `resolveLogger` from `@lokalise/observability` instead. It takes the same options except `base`, and returns a `CommonLogger`.
 */
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

/**
 * @deprecated Will be removed without a replacement. Use `resolveLogger` from `@lokalise/observability` and pass the logger to Fastify as `loggerInstance`.
 */
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
