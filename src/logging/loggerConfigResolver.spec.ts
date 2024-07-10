import { pino } from 'pino'
import pinoTest from 'pino-test'
import { expect } from 'vitest'

import { resolveLoggerConfiguration } from './loggerConfigResolver'

describe('loggerConfigResolver', () => {
  describe('resolveLoggerConfiguration', () => {
    it('resolves prod configuration', () => {
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

    it('resolves dev configuration', () => {
      const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'debug',
        nodeEnv: 'development',
      })

      expect(loggerConfig).toMatchObject({
        levels: {
          labels: {
            '10': 'trace',
            '20': 'debug',
            '30': 'info',
            '40': 'warn',
            '50': 'error',
            '60': 'fatal',
          },
          values: {
            debug: 20,
            error: 50,
            fatal: 60,
            info: 30,
            trace: 10,
            warn: 40,
          },
        },
      })
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
          console.log(obj)
          expect(obj.password).toBe('[Redacted]')
          done(true)
        })

        const logger = pino(loggerConfig, stream)
        logger.info({ password: 'super password' }, 'Auth attempt.')
      }))
  })
})
