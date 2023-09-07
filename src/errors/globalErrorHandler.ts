import { types } from 'node:util'

import { pino, levels, stdSerializers } from 'pino'

import { hasMessage } from '../utils/typeUtils'

export const globalLogger = pino({
  formatters: {
    level: (label, numericLevel): { level: string } => {
      const level = levels.labels[numericLevel] || 'unknown'
      return { level }
    },
  },
})

export function resolveGlobalErrorLogObject(err: unknown, correlationID?: string) {
  if (types.isNativeError(err)) {
    return {
      ...stdSerializers.err(err),
      correlationID: correlationID,
    }
  }

  if (hasMessage(err)) {
    return correlationID ? `${err.message} (${correlationID})` : err.message
  }

  return 'Unknown global error'
}

export function executeAndHandleGlobalErrors<T>(operation: () => T) {
  try {
    const result = operation()
    return result
  } catch (err) {
    const logObject = resolveGlobalErrorLogObject(err)
    globalLogger.error(logObject)
    process.exit(1)
  }
}

export async function executeAsyncAndHandleGlobalErrors<T>(
  operation: () => Promise<T>,
  stopOnError = true,
) {
  try {
    const result = await operation()
    return result
  } catch (err) {
    const logObject = resolveGlobalErrorLogObject(err)
    globalLogger.error(logObject)
    if (stopOnError) {
      process.exit(1)
    }
  }
}
