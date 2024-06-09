import { describe, expect, it } from 'vitest'

import { InternalError } from './InternalError'
import { isEntityGoneError } from './errorTypeGuards'
import { EntityGoneError, EntityNotFoundError } from './publicErrors'

describe('errorTypeGuards', () => {
  describe('isEntityGoneError', () => {
    it('Returns true for EntityGoneError', () => {
      const error = new EntityGoneError({
        message: 'message',
      })

      expect(isEntityGoneError(error)).toBe(true)
    })

    it('Returns false for not a EntityGoneError', () => {
      const errors = [
        'whatever string',
        1,
        new Error('message'),
        new InternalError({
          message: 'message',
          errorCode: 'CODE',
        }),
        new EntityNotFoundError({ message: 'message' }),
      ]

      expect(errors.map(isEntityGoneError).every((e) => e === false)).toBe(true)
    })
  })
})
