import type { ErrorDetails } from './types'

export type InternalErrorParams<T = ErrorDetails> = {
  message: string
  errorCode: string
  details?: T
  cause?: unknown
}

export class InternalError<T = ErrorDetails> extends Error {
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
