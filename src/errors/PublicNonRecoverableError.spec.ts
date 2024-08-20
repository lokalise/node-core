import { PublicNonRecoverableError, isPublicNonRecoverableError } from './PublicNonRecoverableError'

describe('PublicNonRecoverableError', () => {
  it('sets http status code to 500 by default', () => {
    const error = new PublicNonRecoverableError({
      message: 'Unknown',
      errorCode: 'PUBLIC_ERROR',
    })

    expect(error.httpStatusCode).toBe(500)
  })

  describe('isPublicNonRecoverableError', () => {
    it('returns false for native Error', () => {
      const err = new Error('Unknown')

      expect(isPublicNonRecoverableError(err)).toBe(false)
    })

    it('detects if error is public', () => {
      const err = new PublicNonRecoverableError({
        message: 'Unknown',
        errorCode: 'PUBLIC_ERROR',
      })

      expect(isPublicNonRecoverableError(err)).toBe(true)
    })

    it('detects if error is public for extended error', () => {
      class ExtendedPublicNonRecoverableError extends PublicNonRecoverableError {
        constructor() {
          super({
            message: 'Unknown',
            errorCode: 'PUBLIC_ERROR',
          })
          this.name = 'ExtendedPublicNonRecoverableError'
        }
      }
      const err = new ExtendedPublicNonRecoverableError()

      expect(isPublicNonRecoverableError(err)).toBe(true)
    })
  })
})
