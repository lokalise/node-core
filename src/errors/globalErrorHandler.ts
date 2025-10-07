import type { SerializedError } from 'pino'
import pino, { levels, stdSerializers } from 'pino'

import type { CommonLogger } from '../logging/commonLogger'
import { hasMessage, isError } from '../utils/typeUtils'

type LogObject = {
  msg: string // this is the default pino message key
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
  if (isError(err)) {
    return {
      msg: err.message,
      error: stdSerializers.err(err),
      'x-request-id': correlationId,
    }
  }

  if (hasMessage(err)) {
    return {
      msg: err.message,
      'x-request-id': correlationId,
    }
  }

  return {
    msg: 'Unknown error',
    'x-request-id': correlationId,
  }
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
  stopOnError?: true,
): Promise<T>
export async function executeAsyncAndHandleGlobalErrors<T>(
  operation: () => Promise<T>,
  stopOnError: false,
): Promise<T | undefined>
export async function executeAsyncAndHandleGlobalErrors<T>(
  operation: () => Promise<T>,
  stopOnError = true,
): Promise<T | undefined> {
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

export async function executeSettleAllAndHandleGlobalErrors<T>(
  promises: Promise<T>[],
  stopOnError?: true,
): Promise<PromiseSettledResult<T>[]>
export async function executeSettleAllAndHandleGlobalErrors<T>(
  promises: Promise<T>[],
  stopOnError: false,
): Promise<PromiseSettledResult<T>[] | undefined>
export async function executeSettleAllAndHandleGlobalErrors<T>(
  promises: Promise<T>[],
  stopOnError = true,
): Promise<PromiseSettledResult<T>[] | undefined> {
  const result = await Promise.allSettled(promises)

  let errorsHappened: boolean | undefined
  for (const entry of result) {
    if (entry.status === 'rejected') {
      const logObject = resolveGlobalErrorLogObject(entry.reason)
      globalLogger.error(logObject)
      errorsHappened = true
    }
  }

  if (stopOnError && errorsHappened) {
    process.exit(1)
  }

  if (!stopOnError && errorsHappened) {
    return undefined
  }

  return result
}
