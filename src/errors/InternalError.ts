import { isError } from '../utils/typeUtils'
import type { ErrorDetails } from './types'

export type InternalErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  cause?: unknown
}

const INTERNAL_ERROR_SYMBOL_KEY = 'INTERNAL_ERROR_KEY'
const internalErrorSymbol = Symbol.for(INTERNAL_ERROR_SYMBOL_KEY)

export class InternalError<T = ErrorDetails> extends Error {
  readonly [internalErrorSymbol] = true
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

export function isInternalError(error: unknown): error is InternalError {
  return (
    isError(error) &&
    // biome-ignore lint/suspicious/noExplicitAny: checking for existence of prop outside or Error interface
    ((error as any)[Symbol.for(INTERNAL_ERROR_SYMBOL_KEY)] === true ||
      error.name === 'InternalError')
  )
}
