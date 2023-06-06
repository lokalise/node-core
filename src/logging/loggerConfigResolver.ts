import type { LoggerOptions } from 'pino'

export type AppLoggerConfig = {
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  nodeEnv: 'production' | 'development' | 'test'
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
