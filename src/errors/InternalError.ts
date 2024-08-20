import { isError } from '../utils/typeUtils'
import type { ErrorDetails } from './types'

export type InternalErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  cause?: unknown
}

const INTERNAL_ERROR_SYMBOL_KEY = 'INTERNAL_ERROR_KEY'

export class InternalError<T = ErrorDetails> extends Error {
  readonly [Symbol.for(INTERNAL_ERROR_SYMBOL_KEY)] = true
  public readonly details?: T
  public readonly errorCode: string

  constructor(params: InternalErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    this.name = 'InternalError'
    this.details = params.details
    this.errorCode = params.errorCode
  }
}

export function isInternalError(error: unknown): error is InternalError {
  return isError(error) && error[Symbol.for(INTERNAL_ERROR_SYMBOL_KEY)] === true
}
