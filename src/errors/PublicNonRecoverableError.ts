import { isNativeError } from 'node:util/types'
import type { ErrorDetails } from './types'

export type PublicNonRecoverableErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  httpStatusCode?: number
  cause?: unknown
}

const PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL = Symbol.for('PUBLIC_NON_RECOVERABLE_ERROR_KEY')

/**
 * This error is returned to the consumer of API
 */
export class PublicNonRecoverableError<T = ErrorDetails> extends Error {
  public readonly details?: T
  public readonly errorCode: string
  public readonly httpStatusCode: number

  constructor(params: PublicNonRecoverableErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    // set the name as the class name for every class that extends PublicNonRecoverableError
    this.name = this.constructor.name
    this.details = params.details
    this.errorCode = params.errorCode
    this.httpStatusCode = params.httpStatusCode ?? 500
  }
}

Object.defineProperty(PublicNonRecoverableError.prototype, PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL, {
  value: true,
})

export function isPublicNonRecoverableError(error: unknown): error is PublicNonRecoverableError {
  return (
    isNativeError(error) &&
    // biome-ignore lint/suspicious/noExplicitAny: checking for existence of prop outside or Error interface
    ((error as any)[PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL] === true || error.name === 'PublicNonRecoverableError')
  )
}
