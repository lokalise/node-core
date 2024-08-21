import { InternalError, isInternalError } from './InternalError'

describe('InternalError', () => {
  describe('isInternalError', () => {
    it('returns false for native Error', () => {
      const err = new Error('Unknown')

      expect(isInternalError(err)).toBe(false)
    })

    it('detects if error is internal', () => {
      const err = new InternalError({
        message: 'Unknown',
        errorCode: 'INTERNAL_ERROR',
      })

      expect(isInternalError(err)).toBe(true)
    })

    it('detects if error is public for extended error', () => {
      class ExtendedInternalError extends InternalError {
        constructor() {
          super({
            message: 'Unknown',
            errorCode: 'INTERNAL_ERROR',
          })
        }
      }
      const err = new ExtendedInternalError()

      expect(isInternalError(err)).toBe(true)
    })
  })
})
