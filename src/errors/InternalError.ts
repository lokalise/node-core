import { isNativeError } from 'node:util/types'
import type { ErrorDetails } from './types'

export type InternalErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  cause?: unknown
}

const INTERNAL_ERROR_SYMBOL = Symbol.for('INTERNAL_ERROR_KEY')

export class InternalError<T = ErrorDetails> extends Error {
  public readonly details?: T
  public readonly errorCode: string

  constructor(params: InternalErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    // set the name as the class name for every class that extends InternalError
    this.name = this.constructor.name
    this.details = params.details
    this.errorCode = params.errorCode
  }
}

Object.defineProperty(InternalError.prototype, INTERNAL_ERROR_SYMBOL, {
  value: true,
})

export function isInternalError(error: unknown): error is InternalError {
  return (
    isNativeError(error) &&
    // biome-ignore lint/suspicious/noExplicitAny: checking for existence of prop outside or Error interface
    ((error as any)[INTERNAL_ERROR_SYMBOL] === true || error.name === 'InternalError')
  )
}
