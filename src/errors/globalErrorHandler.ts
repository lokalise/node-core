import type { SerializedError } from 'pino'
import pino, { levels, stdSerializers } from 'pino'

import type { CommonLogger } from '../logging/commonLogger'
import { hasMessage, isError } from '../utils/typeUtils'

type LogObject = {
  msg: string // this is the default pino message key
  'x-request-id'?: string
  error?: SerializedError
}

/**
 * @deprecated Use `globalLogger` from `@lokalise/observability` instead.
 */
export const globalLogger: CommonLogger = pino({
  formatters: {
    level: (_label, numericLevel): { level: string } => {
      const level = levels.labels[numericLevel] || 'unknown'
      return { level }
    },
  },
})

/**
 * @deprecated Log the error directly with `logger.error(err)` or `logger.error({ err })`. The logger from `resolveLogger` in `@lokalise/observability` serializes it with its causes.
 */
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

/**
 * @deprecated Use `runOrExit` from `@lokalise/observability` instead. It logs the error under `err`.
 */
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

/**
 * @deprecated Use `runOrExit` from `@lokalise/observability` instead. It takes async operations too. With `stopOnError: false`, catch and log the error instead.
 */
export async function executeAsyncAndHandleGlobalErrors<T>(
  operation: () => Promise<T>,
  stopOnError?: true,
): Promise<T>
/**
 * @deprecated Use `runOrExit` from `@lokalise/observability` instead. It takes async operations too. With `stopOnError: false`, catch and log the error instead.
 */
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

/**
 * @deprecated Use `runOrExit(() => Promise.all(promises))` from `@lokalise/observability` instead. It logs the first rejection, not each one.
 */
export async function executeSettleAllAndHandleGlobalErrors<T>(
  promises: Promise<T>[],
  stopOnError?: true,
): Promise<PromiseSettledResult<T>[]>
/**
 * @deprecated Use `runOrExit(() => Promise.all(promises))` from `@lokalise/observability` instead. It logs the first rejection, not each one.
 */
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
