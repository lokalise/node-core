import { isError } from '../utils/typeUtils'
import type { ErrorDetails } from './types'

export type PublicNonRecoverableErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  httpStatusCode?: number
  cause?: unknown
}

const PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL_KEY = 'PUBLIC_NON_RECOVERABLE_ERROR_KEY'
const publicNonRecoverableErrorSymbol = Symbol.for(PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL_KEY)

/**
 * This error is returned to the consumer of API
 */
export class PublicNonRecoverableError<T = ErrorDetails> extends Error {
  readonly [publicNonRecoverableErrorSymbol] = true
  public readonly details?: T
  public readonly errorCode: string
  public readonly httpStatusCode: number

  constructor(params: PublicNonRecoverableErrorParams<T>) {
    super(params.message, {
      cause: params.cause,
    })
    this.name = 'PublicNonRecoverableError'
    this.details = params.details
    this.errorCode = params.errorCode
    this.httpStatusCode = params.httpStatusCode ?? 500
  }
}

export function isPublicNonRecoverableError(error: unknown): error is PublicNonRecoverableError {
  return isError(error) && (error as any)[Symbol.for(PUBLIC_NON_RECOVERABLE_ERROR_SYMBOL_KEY)] === true
}
