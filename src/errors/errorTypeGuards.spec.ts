import { describe } from 'vitest'

import { InternalError } from './InternalError'
import { ResponseStatusError } from './ResponseStatusError'
import { isResponseStatusError } from './errorTypeGuards'

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
})
