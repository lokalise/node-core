import type { RequestResult } from 'undici-retry'

import { InternalError } from './InternalError'

export class ResponseStatusError extends InternalError {
  constructor(requestResult: RequestResult<unknown>) {
    super({
      message: `Response status code ${requestResult.statusCode}`,
      details: {
        response: requestResult,
      },
      errorCode: 'REQUEST_ERROR',
    })
  }
}
