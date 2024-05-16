import { describe } from 'vitest'

import { InternalError } from './InternalError'
import { ResponseStatusError } from './ResponseStatusError'
import { isEntityGoneError, isResponseStatusError } from './errorTypeGuards'
import { EntityGoneError, EntityNotFoundError } from './publicErrors'

describe('errorTypeGuards', () => {
  describe('isResponseStatusError', () => {
    it('Returns true for ResponseStatusError', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
      const error = new ResponseStatusError({} as any, 'label')

      expect(isResponseStatusError(error)).toBe(true)
    })

    it('Returns false for not a ResponseStatusError', () => {
      const error = new InternalError({
        message: 'message',
        errorCode: 'CODE',
      })

      expect(isResponseStatusError(error)).toBe(false)
    })
  })

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
