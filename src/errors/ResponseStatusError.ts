import type { RequestResult } from 'undici-retry'

import { InternalError } from './InternalError'

export class ResponseStatusError extends InternalError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly response: RequestResult<any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(requestResult: RequestResult<any>, requestLabel = 'N/A') {
    super({
      message: `Response status code ${requestResult.statusCode}`,
      details: {
        requestLabel,
        response: {
          statusCode: requestResult.statusCode,
          body: requestResult.body,
        },
      },
      errorCode: 'REQUEST_ERROR',
    })
    this.response = requestResult
    this.name = 'ResponseStatusError'
  }
}
