import type { ErrorDetails } from './types';

export type PublicNonRecoverableErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  httpStatusCode?: number
  cause?: unknown
}

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
    this.name = 'PublicNonRecoverableError'
    this.details = params.details
    this.errorCode = params.errorCode
    this.httpStatusCode = params.httpStatusCode ?? 500
  }
}
