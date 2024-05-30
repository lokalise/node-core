import { resolveGlobalErrorLogObject } from './globalErrorHandler'

describe('globalErrorHandler', () => {
  describe('resolveGlobalErrorLogObject', () => {
    it('converts plain error to serializable object', () => {
      const error = new Error('text')

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toMatchObject({
        'x-request-id': undefined,
        error: {
          type: 'Error',
          stack: expect.any(String),
          message: 'text',
        },
        message: 'text',
      })
    })

    it('converts something with message to serializable object', () => {
      const error = {
        message: 'text',
      }

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toMatchInlineSnapshot(`
        {
          "message": "text",
          "x-request-id": undefined,
        }
      `)
    })

    it('converts something unexpected to fixed string', () => {
      const error = () => {}

      const resolvedError = resolveGlobalErrorLogObject(error)

      expect(resolvedError).toMatchInlineSnapshot(`
        {
          "message": "Unknown error",
          "x-request-id": undefined,
        }
      `)
    })
  })
})
