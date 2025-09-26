import pino from 'pino'
import pinoTest from 'pino-test'
import { expect } from 'vitest'

import { resolveLogger, resolveLoggerConfiguration } from './loggerConfigResolver'

describe('loggerConfigResolver', () => {
  describe('resolveLoggerConfiguration', () => {
    it('resolves configuration', () => {
      const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'warn',
        nodeEnv: 'production',
      })

      expect(loggerConfig).toMatchInlineSnapshot(`
        {
          "formatters": {
            "level": [Function],
          },
          "level": "warn",
          "redact": undefined,
        }
      `)
    })

    it('does not crash during label resolution', () => {
      const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'warn',
        nodeEnv: 'production',
      })

      const logger = pino(loggerConfig)

      expect(() => {
        logger.warn('test')
      }).not.toThrow()
    })

    it('redacts logs via provided config', () =>
      new Promise((done) => {
        const loggerConfig = resolveLoggerConfiguration({
          logLevel: 'info',
          nodeEnv: 'production',
          redact: {
            paths: ['password'],
          },
        })

        const stream = pinoTest.sink()
        stream.on('data', (obj) => {
          expect(obj.password).toBe('[Redacted]')
          done(true)
        })

        const logger = pino(loggerConfig, stream)
        logger.info({ password: 'super password' }, 'Auth attempt.')
      }))
  })

  describe('resolveLogger', () => {
    it('does not crash during label resolution (prod)', () => {
      const logger = resolveLogger({
        logLevel: 'warn',
        nodeEnv: 'production',
      })

      expect(() => {
        logger.warn('test')
      }).not.toThrow()
    })

    it('does not crash during label resolution (dev)', () => {
      const logger = resolveLogger({
        logLevel: 'warn',
        nodeEnv: 'development',
      })

      expect(() => {
        logger.warn('test')
      }).not.toThrow()
    })
  })
})
