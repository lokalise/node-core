import { InternalError } from '../errors/InternalError'
import { PublicNonRecoverableError } from '../errors/PublicNonRecoverableError'

import {
  hasMessage,
  isInternalError,
  isObject,
  isPublicNonRecoverableError,
  isStandardizedError,
} from './typeUtils'

describe('typeUtils', () => {
  describe('isInternalError', () => {
    it('true for InternalError', () => {
      const error = new InternalError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isInternalError(error)).toBe(true)
    })

    it('false for PublicNonRecoverableError', () => {
      const error = new PublicNonRecoverableError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isInternalError(error)).toBe(false)
    })
  })

  describe('isPublicNonRecoverableError', () => {
    it('false for InternalError', () => {
      const error = new InternalError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isPublicNonRecoverableError(error)).toBe(false)
    })

    it('true for PublicNonRecoverableError', () => {
      const error = new PublicNonRecoverableError({
        message: 'dummy',
        errorCode: 'code',
      })

      expect(isPublicNonRecoverableError(error)).toBe(true)
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
