import { InternalError } from '../errors/InternalError'
import { PublicNonRecoverableError } from '../errors/PublicNonRecoverableError'

import { hasMessage, isError, isObject, isStandardizedError } from './typeUtils'

describe('typeUtils', () => {
  describe('isError', () => {
    it('true for InternalError', () => {
      const error = new InternalError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isError(error)).toBe(true)
    })

    it('true for PublicNonRecoverableError', () => {
      const error = new PublicNonRecoverableError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isError(error)).toBe(true)
    })

    it('true for Error', () => {
      const error = new Error('bam')

      expect(isError(error)).toBe(true)
    })

    it('false for string', () => {
      const error = 'bam'

      expect(isError(error)).toBe(false)
    })

    it('false for a number', () => {
      const error = 43

      expect(isError(error)).toBe(false)
    })

    it('false for a plain object', () => {
      const error = {}

      expect(isError(error)).toBe(false)
    })
  })

  describe('hasMessage', () => {
    it('true for something with message', () => {
      const error = new InternalError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(hasMessage(error)).toBe(true)
    })

    it('false for something without message', () => {
      const error = {}

      expect(hasMessage(error)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('true for object', () => {
      const error = new InternalError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isObject(error)).toBe(true)
    })

    it('false for non-object', () => {
      const error = 'error'

      expect(isObject(error)).toBe(false)
    })

    it('false for null', () => {
      const error = null

      expect(isObject(error)).toBe(false)
    })
  })

  describe('isStandardizedError', () => {
    it('true for standardized error', () => {
      const error = {
        message: 'dummy',
        code: 'code',
      }

      expect(isStandardizedError(error)).toBe(true)
    })

    it('false for non standardized error', () => {
      const error = new Error()

      expect(isStandardizedError(error)).toBe(false)
    })
  })
})
