import { PublicNonRecoverableError } from './PublicNonRecoverableError'

describe('PublicNonRecoverableError', () => {
  it('sets http status code to 500 by default', () => {
    const error = new PublicNonRecoverableError({
      message: 'error',
      errorCode: 'PUBLIC_ERROR',
    })

    expect(error.httpStatusCode).toBe(500)
  })
})
