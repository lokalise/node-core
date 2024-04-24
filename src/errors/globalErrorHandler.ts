import { types } from 'node:util'

import type { SerializedError } from 'pino'
import { pino, levels, stdSerializers } from 'pino'

import type { CommonLogger } from '../logging/commonLogger'
import { hasMessage } from '../utils/typeUtils'

export const globalLogger: CommonLogger = pino({
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

  return 'Unknown error'
}

function logGlobalErrorLogObject(logObject: string | SerializedError) {
  if (typeof logObject === 'string') {
    globalLogger.error(`Global error: ${logObject}`)
  } else {
    globalLogger.error(logObject, logObject.message)
  }
}

export function executeAndHandleGlobalErrors<T>(operation: () => T) {
  try {
    const result = operation()
    return result
  } catch (err) {
    const logObject = resolveGlobalErrorLogObject(err)
    logGlobalErrorLogObject(logObject)
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
    logGlobalErrorLogObject(logObject)
    if (stopOnError) {
      process.exit(1)
    }
  }
}

export async function executeSettleAllAndHandleGlobalErrors(
  promises: Promise<unknown>[],
  stopOnError = true,
) {
  const result = await Promise.allSettled(promises)

  let errorsHappened
  for (const entry of result) {
    if (entry.status === 'rejected') {
      const logObject = resolveGlobalErrorLogObject(entry.reason)
      logGlobalErrorLogObject(logObject)
      errorsHappened = true
    }
  }

  if (stopOnError && errorsHappened) {
    process.exit(1)
  }

  return result
}
