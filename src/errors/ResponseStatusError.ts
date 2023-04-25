import type { RequestResult } from 'undici-retry'

import { InternalError } from './InternalError'

export type ResponseStatusErrorDetails = {
  response: RequestResult<unknown>
}

export class ResponseStatusError extends InternalError<ResponseStatusErrorDetails> {
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
