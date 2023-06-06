import { resolveGlobalErrorLogObject } from './globalErrorHandler'

describe('globalErrorHandler', () => {
  describe('resolveGlobalErrorLogObject', () => {
    it('converts plain error to serializable object', () => {
      const error = new Error('text')

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toMatchObject({
        correlationID: undefined,
        message: 'text',
        type: 'Error',
        stack: expect.any(String),
      })
    })

    it('converts something with message to serializable object', () => {
      const error = {
        message: 'text',
      }

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toBe('text')
    })

    it('converts something unexpected to fixed string', () => {
      const error = () => {}

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toBe('Unknown global error')
    })
  })
})
