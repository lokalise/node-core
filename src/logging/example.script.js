// Transport configuration doesn't work in vitest for whatever reason, so you can use this file for testing logging-related configuration

const { pino } = require('pino')

const { resolveMonorepoLoggerConfiguration } = require('../../dist/index')

const config = resolveMonorepoLoggerConfiguration({
  logLevel: 'debug',
  nodeEnv: 'development',
})

const logger = pino(config)
console.log('Start logging')
logger.debug('haha')
logger.info('haha')
logger.error(new Error('Some error'), 'Something crashed')
