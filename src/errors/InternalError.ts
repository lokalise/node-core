import { isNativeError } from 'node:util/types'
import type { BaseErrorParams, ErrorDetails } from './types'

export type InternalErrorParams<T extends ErrorDetails | undefined = ErrorDetails | undefined> = T extends undefined
  ? BaseErrorParams
  : BaseErrorParams & {
      details: T
    }

const INTERNAL_ERROR_SYMBOL = Symbol.for('INTERNAL_ERROR_KEY')

export class InternalError<
  T extends ErrorDetails | undefined = ErrorDetails | undefined,
> extends Error {
  public readonly errorCode: string
  public readonly details: T

  constructor(params: InternalErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    // set the name as the class name for every class that extends InternalError
    this.name = this.constructor.name
    // @ts-ignore
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
    ((INTERNAL_ERROR_SYMBOL in error && error[INTERNAL_ERROR_SYMBOL] === true) ||
      error.name === 'InternalError')
  )
}
