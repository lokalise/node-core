import type { ErrorDetails } from './InternalError'

export type PublicNonRecoverableErrorParams = {
  message: string
  errorCode: string
  details?: ErrorDetails
  httpStatusCode?: number
}

/**
 * This error is returned to the consumer of API
 */
export class PublicNonRecoverableError extends Error {
  public readonly details?: ErrorDetails
  public readonly errorCode: string
  public readonly httpStatusCode: number

  constructor(params: PublicNonRecoverableErrorParams) {
    super(params.message)
    this.name = 'PublicNonRecoverableError'
    this.details = params.details
    this.errorCode = params.errorCode
    this.httpStatusCode = params.httpStatusCode ?? 500
  }
}
