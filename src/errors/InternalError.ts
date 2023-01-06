export type ErrorDetails = Record<string, unknown>

export type InternalErrorParams = {
  message: string
  errorCode: string
  details?: ErrorDetails
}

export class InternalError extends Error {
  public readonly details?: ErrorDetails
  public readonly errorCode: string

  constructor(params: InternalErrorParams) {
    super(params.message)
    this.name = 'InternalError'
    this.details = params.details
    this.errorCode = params.errorCode
  }
}
