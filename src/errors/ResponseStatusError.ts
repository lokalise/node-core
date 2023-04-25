import type { RequestResult } from 'undici-retry'

import { InternalError } from './InternalError'

export type ResponseStatusErrorDetails = {
  response: RequestResult<unknown>
}

export class ResponseStatusError extends InternalError {
  public readonly response: RequestResult<unknown>

  constructor(requestResult: RequestResult<unknown>) {
    super({
      message: `Response status code ${requestResult.statusCode}`,
      details: {
        response: {
          statusCode: requestResult.statusCode,
          body: requestResult.body,
        },
      },
      errorCode: 'REQUEST_ERROR',
    })
    this.response = requestResult
  }
}
