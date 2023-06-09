import { pino } from 'pino'
import { expect } from 'vitest'

import { resolveLoggerConfiguration } from './loggerConfigResolver'

describe('loggerConfigResolver', () => {
  describe('resolveLoggerConfiguration', () => {
    it('resolves prod configuration', () => {
      const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'warn',
        nodeEnv: 'production',
      })

      expect(loggerConfig).toMatchSnapshot()
    })

    it('resolves dev configuration', () => {
      const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'debug',
        nodeEnv: 'development',
      })

      expect(loggerConfig).toMatchSnapshot()
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
  })
})
