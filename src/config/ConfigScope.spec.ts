import { expect } from 'vitest'
import { z } from 'zod'

import { ConfigScope } from './ConfigScope'
import { ensureClosingSlashTransformer } from './configTransformers'
import type { EnvValueValidator } from './configTypes'
import { createRangeValidator } from './configValidators'

const maybeEnsureClosingSlashTransformer = <T extends string | undefined | null>(value: T): T => {
  if (!value) {
    return undefined as T
  }

  const lastChar = value.at(-1)
  if (lastChar !== '/') {
    return `${value}/` as T
  }
  return value
}

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

  describe('getMandatoryValidatedInteger', () => {
    const validator = createRangeValidator(0, 15)
    it('accepts a valid integer', () => {
      process.env.value = '15'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getMandatoryValidatedInteger('value', validator)

      expect(resolvedValue).toBe(15)
    })

    it('throws an error on non-number', () => {
      process.env.value = 'abc'
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryValidatedInteger('value', validator)).toThrow(
        /must be a number/,
      )
    })

    it('throws an error on missing value', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryInteger('value')).toThrow(
        /Missing mandatory configuration parameter/,
      )
    })

    it('throws an error on invalid number', () => {
      process.env.value = '16'
      const configScope = new ConfigScope()

      expect(() => configScope.getMandatoryValidatedInteger('value', validator)).toThrow(
        /is invalid for parameter value/,
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

    it('uses default on empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullable('value', 'def')

      expect(resolvedValue).toBe('def')
    })
  })

  describe('getOptional', () => {
    it('accepts value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('val')
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('def')
    })

    // This case can happen when variable is in .env file, but is left empty.
    // Just like this:
    // VAR1=
    it('uses default value if set to empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('def')
    })

    it('returns false if set to false', () => {
      process.env.value = 'false'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('false')
    })

    it('returns 0 if set to 0', () => {
      process.env.value = '0'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('0')
    })

    it('returns undefined if set to undefined', () => {
      process.env.value = 'undefined'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('undefined')
    })

    // Side effect of how node.js handles assigning undefined to process.env
    it('returns undefined (string) if set to undefined (undefined)', () => {
      process.env.value = undefined
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('undefined')
    })

    it('returns null if set to null', () => {
      process.env.value = 'null'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptional('value', 'def')

      expect(resolvedValue).toBe('null')
    })
  })

  describe('getOptionalOneOf', () => {
    it('returns env value if it exists on the list', () => {
      process.env.value = 'g'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalOneOf('value', 'default', ['a', 'g', 'b'])

      expect(resolvedValue).toBe('g')
    })

    it('returns default if env value not exists and the default one exists on the list', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalOneOf('value', 'g', ['a', 'g', 'b'])

      expect(resolvedValue).toBe('g')
    })

    it('throws an error on env value item not from list', () => {
      process.env.value = 'c'
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalOneOf('value', 'default', ['a', 'g', 'b'])).toThrow(
        /Unsupported value/,
      )
    })

    it('throws an error if env value not exists and the default one not exists on the list', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalOneOf('value', 'default', ['a'])).toThrow(
        /Unsupported value/,
      )
    })
  })

  describe('getOptionalInteger', () => {
    it('accepts value', () => {
      process.env.value = '3'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalInteger('value', 1)

      expect(resolvedValue).toBe(3)
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalInteger('value', 1)

      expect(resolvedValue).toBe(1)
    })

    it('uses default value on empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalInteger('value', 3)
      expect(resolvedValue).toBe(3)
    })
  })

  describe('getOptionalValidatedInteger', () => {
    const validator: EnvValueValidator<number> = (val) => {
      return val > 2
    }

    it('accepts value', () => {
      process.env.value = '3'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalValidatedInteger('value', 4, validator)

      expect(resolvedValue).toBe(3)
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalValidatedInteger('value', 4, validator)

      expect(resolvedValue).toBe(4)
    })

    it('throws when real value fails validation', () => {
      process.env.value = '2'
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalValidatedInteger('value', 4, validator)).toThrow(
        /Value 2 is invalid for parameter value/,
      )
    })

    it('throws when default value fails validation', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      expect(() => configScope.getOptionalValidatedInteger('value', 2, validator)).toThrow(
        /Value 2 is invalid for parameter value/,
      )
    })
  })

  describe('getOptionalNullableInteger', () => {
    it('accepts value', () => {
      process.env.value = '3'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableInteger('value', 1)

      expect(resolvedValue).toBe(3)
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableInteger('value', 1)

      expect(resolvedValue).toBe(1)
    })

    it('uses default undefined value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableInteger('value', undefined)

      expect(resolvedValue).toBeUndefined()
    })

    it('uses default null value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableInteger('value', null)

      expect(resolvedValue).toBeNull()
    })
  })

  describe('getOptionalValidated', () => {
    const validator: EnvValueValidator<string | null | undefined> = (val) => {
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

    it('uses default value on empty string', () => {
      process.env.value = ''
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

    it('uses default value on empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalTransformed(
        'value',
        'def',
        ensureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('def/')
    })
  })

  describe('getOptionalNullableTransformed', () => {
    it('transforms value', () => {
      process.env.value = 'val'
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableTransformed(
        'value',
        'def/',
        maybeEnsureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('val/')
    })

    it('uses default value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableTransformed(
        'value',
        'def',
        maybeEnsureClosingSlashTransformer,
      )

      expect(resolvedValue).toBe('def/')
    })

    it('uses default undefined value if not set', () => {
      delete process.env.value
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableTransformed(
        'value',
        undefined,
        maybeEnsureClosingSlashTransformer,
      )

      expect(resolvedValue).toBeUndefined()
    })

    it('uses default value on empty string', () => {
      process.env.value = ''
      const configScope = new ConfigScope()

      const resolvedValue = configScope.getOptionalNullableTransformed(
        'value',
        'def',
        maybeEnsureClosingSlashTransformer,
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

  describe('getMandatoryJsonObject', () => {
    it('empty env value throws error', () => {
      const configScope = new ConfigScope()
      const schema = z.object({ a: z.string() })

      expect(() => configScope.getMandatoryJsonObject('emptyObjectValue', schema)).toThrow(
        /Missing mandatory configuration parameter/,
      )
    })

    it('env value not meeting schema throws error', () => {
      process.env.objectValue = JSON.stringify({ b: 1 })
      const configScope = new ConfigScope()

      const schema = z.object({ a: z.string() })
      expect(() => configScope.getMandatoryJsonObject('objectValue', schema)).toThrow(
        /Configuration parameter objectValue must be a valid JSON meeting the given schema, but was {"b":1}/,
      )
    })

    it('transform simple objects', () => {
      process.env.objectValue = JSON.stringify({ a: 'a', b: 1 })
      const configScope = new ConfigScope()

      const schema = z.object({
        a: z.string(),
        b: z.number(),
      })
      const result = configScope.getMandatoryJsonObject('objectValue', schema)

      expect(result).toEqual({ a: 'a', b: 1 })
    })

    it('transform array', () => {
      process.env.objectValue = JSON.stringify([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
      const configScope = new ConfigScope()

      const schema = z.array(
        z.object({
          a: z.string(),
          b: z.number(),
        }),
      )
      const result = configScope.getMandatoryJsonObject('objectValue', schema)

      expect(result).toEqual([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
    })
  })

  describe('getOptionalJsonObject', () => {
    it('empty env value returns default', () => {
      const configScope = new ConfigScope()
      const schema = z.object({ a: z.string() })

      const result = configScope.getOptionalJsonObject('emptyObjectValue', schema, { a: 'a' })
      expect(result).toEqual({ a: 'a' })
    })

    it('env value not meeting schema throws error', () => {
      process.env.objectValue = JSON.stringify({ b: 1 })
      const configScope = new ConfigScope()

      const schema = z.object({ a: z.string() })

      expect(() => configScope.getOptionalJsonObject('objectValue', schema, { a: 'a' })).toThrow(
        /Configuration parameter objectValue must be a valid JSON meeting the given schema, but was {"b":1}/,
      )
    })

    it('transform simple objects', () => {
      process.env.objectValue = JSON.stringify({ a: 'a', b: 1 })
      const configScope = new ConfigScope()

      const schema = z.object({
        a: z.string(),
        b: z.number(),
      })
      const result = configScope.getOptionalJsonObject('objectValue', schema, { a: 'fake', b: -1 })

      expect(result).toMatchObject({ a: 'a', b: 1 })
    })

    it('transform array', () => {
      process.env.objectValue = JSON.stringify([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
      const configScope = new ConfigScope()

      const schema = z.array(
        z.object({
          a: z.string(),
          b: z.number(),
        }),
      )
      const result = configScope.getOptionalJsonObject('objectValue', schema, [
        { a: 'fake', b: -1 },
      ])

      expect(result).toMatchObject([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
    })
  })

  describe('getOptionalNullableJsonObject', () => {
    it('empty env value returns default', () => {
      const configScope = new ConfigScope()
      const schema = z.object({ a: z.string() })

      const result = configScope.getOptionalNullableJsonObject(
        'emptyObjectValue',
        schema,
        undefined,
      )
      expect(result).toEqual(undefined)

      const result2 = configScope.getOptionalNullableJsonObject('emptyObjectValue', schema, null)
      expect(result2).toEqual(null)

      const result3 = configScope.getOptionalNullableJsonObject('emptyObjectValue', schema, {
        a: 'a',
      })
      expect(result3).toEqual({ a: 'a' })
    })

    it('env value not meeting schema returns default', () => {
      process.env.objectValue = JSON.stringify({ b: 1 })
      const configScope = new ConfigScope()
      const schema = z.object({ a: z.string() })

      expect(() =>
        configScope.getOptionalNullableJsonObject('objectValue', schema, { a: 'a' }),
      ).toThrow(
        /Configuration parameter objectValue must be a valid JSON meeting the given schema, but was {"b":1}/,
      )

      expect(() => configScope.getOptionalNullableJsonObject('objectValue', schema, null)).toThrow(
        /Configuration parameter objectValue must be a valid JSON meeting the given schema, but was {"b":1}/,
      )

      expect(() =>
        configScope.getOptionalNullableJsonObject('objectValue', schema, undefined),
      ).toThrow(
        /Configuration parameter objectValue must be a valid JSON meeting the given schema, but was {"b":1}/,
      )
    })

    it('transform simple objects', () => {
      process.env.objectValue = JSON.stringify({ a: 'a', b: 1 })
      const configScope = new ConfigScope()

      const schema = z.object({
        a: z.string(),
        b: z.number(),
      })
      const result = configScope.getOptionalNullableJsonObject('objectValue', schema, {
        a: 'fake',
        b: -1,
      })

      expect(result).toMatchObject({ a: 'a', b: 1 })
    })

    it('transform array', () => {
      process.env.objectValue = JSON.stringify([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
      const configScope = new ConfigScope()

      const schema = z.array(
        z.object({
          a: z.string(),
          b: z.number(),
        }),
      )
      const result = configScope.getOptionalNullableJsonObject('objectValue', schema, [
        { a: 'fake', b: -1 },
      ])

      expect(result).toMatchObject([
        { a: 'a1', b: 1 },
        { a: 'a2', b: 2 },
      ])
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
