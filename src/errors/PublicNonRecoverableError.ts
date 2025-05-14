import { isNativeError } from 'node:util/types'
import type { BaseErrorParams, ErrorDetails } from './types'

type BasePublicErrorParams = BaseErrorParams & {
  httpStatusCode?: number
}

export type PublicNonRecoverableErrorParams<T extends ErrorDetails | undefined = ErrorDetails | undefined> = T extends undefined
  ? BasePublicErrorParams
  : BasePublicErrorParams & {
      details: T
    }

const PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL = Symbol.for('PUBLIC_NON_RECOVERABLE_ERROR_KEY')

/**
 * This error is returned to the consumer of API
 */
export class PublicNonRecoverableError<
  T extends ErrorDetails | undefined = ErrorDetails | undefined,
> extends Error {
  public readonly details: T
  public readonly errorCode: string
  public readonly httpStatusCode: number

  constructor(params: PublicNonRecoverableErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    // set the name as the class name for every class that extends PublicNonRecoverableError
    this.name = this.constructor.name
    // @ts-ignore
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
    ((PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL in error &&
      error[PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL] === true) ||
      error.name === 'PublicNonRecoverableError')
  )
}
