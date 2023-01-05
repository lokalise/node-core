import * as process from 'process'

import { ConfigScope } from './ConfigScope'
import { ensureClosingSlashTransformer } from './configTransformers'
import type { EnvValueValidator } from './configTypes'

describe('ConfigScope', () => {
  describe('getMandatoryInteger', () => {
    it('accepts an integer', () => {
      process.env.value = '123'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatoryInteger('value')

      expect(resolvedValue).toBe(123)
    })

    it('throws an error on non-number', () => {
      process.env.value = 'abc'
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryInteger('value')).toThrow(/must be a number/)
    })

    it('throws an error on missing value', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryInteger('value')).toThrow(
        /Missing mandatory configuration parameter/,
      )
    })
  })

  describe('getMandatory', () => {
    it('accepts an integer', () => {
      process.env.value = '123'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatory('value')

      expect(resolvedValue).toBe('123')
    })

    it('throws an error on missing value', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatory('value')).toThrow(
        /Missing mandatory configuration parameter/,
      )
    })
  })

  describe('getMandatoryOneOf', () => {
    it('accepts item from given list', () => {
      process.env.value = 'g'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatoryOneOf('value', ['a', 'g', 'b'])

      expect(resolvedValue).toBe('g')
    })

    it('throws an error on item not from list', () => {
      process.env.value = 'c'
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryOneOf('value', ['a', 'g', 'b'])).toThrow(
        /Unsupported value/,
      )
    })

    it('throws an error on missing value', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryOneOf('value', ['a'])).toThrow(
        /Missing mandatory configuration parameter/,
      )
    })
  })

  describe('getOptionalNullable', () => {
    it('accepts value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullable('value', 'def')

      expect(resolvedValue).toBe('val')
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullable('value', 'def')

      expect(resolvedValue).toBe('def')
    })

    it('keeps null if preferred', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullable('value', null)

      expect(resolvedValue).toBeNull()
    })
  })

  describe('getOptionalValidated', () => {
    const validator: EnvValueValidator = (val) => {
      return (val && val.length < 5) || false
    }

    it('accepts valid value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalValidated('value', 'def', validator)

      expect(resolvedValue).toBe('val')
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalValidated('value', 'def', validator)

      expect(resolvedValue).toBe('def')
    })

    it('throws an error if failing validation', () => {
      process.env.value = '12345678900'
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalValidated('value', 'a', validator)).toThrow(
        /is invalid for parameter/,
      )
    })
  })

  describe('getOptionalTransformed', () => {
    it('transforms value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalTransformed(
        'value',
        'def/',
        ensureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('val/')
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalTransformed(
        'value',
        'def',
        ensureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('def/')
    })
  })

  describe('getMandatoryTransformed', () => {
    it('transforms value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatoryTransformed(
        'value',
        ensureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('val/')
    })

    it('throws an error if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() =>
        configScope.getMandatoryTransformed('value', ensureClosingSlashTransformer),
      ).toThrow(/Missing mandatory configuration parameter/)
    })
  })

  describe('getOptionalBoolean', () => {
    it('accepts true', () => {
      process.env.value = 'true'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalBoolean('value', false)

      expect(resolvedValue).toBe(true)
    })

    it('accepts false', () => {
      process.env.value = 'false'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalBoolean('value', true)

      expect(resolvedValue).toBe(false)
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalBoolean('value', true)

      expect(resolvedValue).toBe(true)
    })

    it('uses default value if empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalBoolean('value', true)

      expect(resolvedValue).toBe(true)
    })

    it('throws an error if not a boolean', () => {
      process.env.value = '1'
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalBoolean('value', false)).toThrow(
        /Validated entity 1 is not one of: true,false/,
      )
    })
  })

  describe('updateEnv', () => {
    it('updates cached env', () => {
      process.env.value = '123'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatory('value')
      expect(resolvedValue).toBe('123')

      process.env.value = '456'
      const resolvedValue2 = configScope.getMandatory('value')
      expect(resolvedValue2).toBe('123')

      configScope.updateEnv()
      const resolvedValue3 = configScope.getMandatory('value')
      expect(resolvedValue3).toBe('456')
    })
  })

  describe('isProduction', () => {
    it('returns true if set to production', () => {
      process.env.NODE_ENV = 'production'
      const configScope = new ConfigScope()

      expect(configScope.isProduction()).toBe(true)
    })

    it('returns true if set to development', () => {
      process.env.NODE_ENV = 'development'
      const configScope = new ConfigScope()

      expect(configScope.isProduction()).toBe(false)
    })

    it('returns true if set to test', () => {
      process.env.NODE_ENV = 'test'
      const configScope = new ConfigScope()

      expect(configScope.isProduction()).toBe(false)
    })
  })

  describe('isDevelopment', () => {
    it('returns true if set to production', () => {
      process.env.NODE_ENV = 'production'
      const configScope = new ConfigScope()

      expect(configScope.isDevelopment()).toBe(false)
    })

    it('returns true if set to development', () => {
      process.env.NODE_ENV = 'development'
      const configScope = new ConfigScope()

      expect(configScope.isDevelopment()).toBe(true)
    })

    it('returns true if set to test', () => {
      process.env.NODE_ENV = 'test'
      const configScope = new ConfigScope()

      expect(configScope.isDevelopment()).toBe(true)
    })
  })

  describe('isTest', () => {
    it('returns true if set to production', () => {
      process.env.NODE_ENV = 'production'
      const configScope = new ConfigScope()

      expect(configScope.isTest()).toBe(false)
    })

    it('returns true if set to development', () => {
      process.env.NODE_ENV = 'development'
      const configScope = new ConfigScope()

      expect(configScope.isTest()).toBe(false)
    })

    it('returns true if set to test', () => {
      process.env.NODE_ENV = 'test'
      const configScope = new ConfigScope()

      expect(configScope.isTest()).toBe(true)
    })
  })
})
