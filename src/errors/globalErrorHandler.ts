import { types } from 'node:util'

import type { SerializedError } from 'pino'
import { levels, pino, stdSerializers } from 'pino'

import type { CommonLogger } from '../logging/commonLogger'
import { hasMessage } from '../utils/typeUtils'

type LogObject = {
  message: string
  'x-request-id'?: string
  error?: SerializedError
}

export const globalLogger: CommonLogger = pino({
  formatters: {
    level: (_label, numericLevel): { level: string } => {
      const level = levels.labels[numericLevel] || 'unknown'
      return { level }
    },
  },
})

export function resolveGlobalErrorLogObject(err: unknown, correlationId?: string): LogObject {
  if (types.isNativeError(err)) {
    return {
      message: err.message,
      error: stdSerializers.err(err),
      'x-request-id': correlationId,
    }
  }

  if (hasMessage(err)) {
    return {
      message: err.message,
      'x-request-id': correlationId,
    }
  }

  return {
    message: 'Unknown error',
    'x-request-id': correlationId,
  }
}

export function executeAndHandleGlobalErrors<T>(operation: () => T) {
  try {
    const result = operation()
    return result
  } catch (err) {
    const logObject = resolveGlobalErrorLogObject(err)
    globalLogger.error(logObject, logObject.message)
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
    globalLogger.error(logObject, logObject.message)
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

  let errorsHappened: boolean | undefined
  for (const entry of result) {
    if (entry.status === 'rejected') {
      const logObject = resolveGlobalErrorLogObject(entry.reason)
      globalLogger.error(logObject, logObject.message)
      errorsHappened = true
    }
  }

  if (stopOnError && errorsHappened) {
    process.exit(1)
  }

  return result
}
