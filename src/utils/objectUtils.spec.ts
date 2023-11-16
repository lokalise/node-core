import { expect, expectTypeOf } from 'vitest'

import {
  convertDateFieldsToIsoString,
  copyWithoutUndefined,
  groupBy,
  groupByUnique,
  isEmptyObject,
  pick,
  pickWithoutUndefined,
} from './objectUtils'

describe('objectUtils', () => {
  describe('copyWithoutUndefined', () => {
    it('Does nothing when there are no undefined fields', () => {
      const result = copyWithoutUndefined({
        a: 'a',
        b: '',
        c: ' ',
        d: null,
        e: {},
      })

      expect(result).toMatchSnapshot()
    })

    it('Removes undefined fields', () => {
      const result = copyWithoutUndefined({
        a: undefined,
        b: 'a',
        c: '',
        d: undefined,
        e: ' ',
        f: null,
        g: {
          someParam: 12,
        },
        h: undefined,
      })

      const varWithNarrowedType = result satisfies Record<
        string,
        string | Record<string, unknown> | null
      >
      const bValue: string = varWithNarrowedType.b
      const gValue: {
        someParam: number
      } = varWithNarrowedType.g

      expect(bValue).toBe('a')
      expect(gValue).toEqual({
        someParam: 12,
      })

      expect(result).toMatchSnapshot()
    })
  })

  describe('pick', () => {
    it('Picks specified fields', () => {
      const result = pick(
        {
          a: 'a',
          b: '',
          c: ' ',
          d: null,
          e: {},
        },
        ['a', 'c', 'e'],
      )
      expect(result).toStrictEqual({ a: 'a', c: ' ', e: {} })
    })

    it('Ignores missing fields', () => {
      const result = pick(
        {
          a: 'a',
          b: '',
          c: ' ',
          d: null,
          e: {},
        },
        ['a', 'f', 'g'],
      )

      expect(result).toStrictEqual({ a: 'a' })
    })

    it('Includes undefined fields', () => {
      const result = pick(
        {
          a: 'a',
          b: undefined,
          c: {},
        },
        ['a', 'b'],
      )

      expect(result).toStrictEqual({ a: 'a', b: undefined })
    })
  })

  describe('pickWithoutUndefined', () => {
    it('Picks specified fields', () => {
      const result = pickWithoutUndefined(
        {
          a: 'a',
          b: '',
          c: ' ',
          d: null,
          e: {},
        },
        ['a', 'c', 'e'],
      )

      expect(result).toMatchObject({ a: 'a', c: ' ', e: {} })
    })

    it('Ignores missing fields', () => {
      const result = pickWithoutUndefined(
        {
          a: 'a',
          b: '',
          c: ' ',
          d: null,
          e: {},
        },
        ['a', 'f', 'g'],
      )

      expect(result).toStrictEqual({ a: 'a' })
    })

    it('Skips undefined fields', () => {
      const result = pickWithoutUndefined(
        {
          a: 'a',
          b: undefined,
          c: {},
        },
        ['a', 'b'],
      )

      expect(result).toStrictEqual({ a: 'a' })
    })
  })

  describe('isEmptyObject', () => {
    it('Returns true for completely empty object', () => {
      const params = {}
      const result = isEmptyObject(params)
      expect(result).toBe(true)
    })

    it('Returns true for object with only undefined fields', () => {
      const params = { a: undefined }
      const result = isEmptyObject(params)
      expect(result).toBe(true)
    })

    it('Returns false for object with null', () => {
      const params = { a: null }
      const result = isEmptyObject(params)
      expect(result).toBe(false)
    })

    it('Returns false for non-empty object', () => {
      const params = { a: '' }
      const result = isEmptyObject(params)
      expect(result).toBe(false)
    })
  })

  describe('groupBy', () => {
    it('Empty array', () => {
      const array: { id: string }[] = []
      const result = groupBy(array, 'id')
      expect(Object.keys(result)).length(0)
    })

    type TestType = {
      id?: number | null
      name: string
      bool: boolean
      nested?: {
        code: number
      }
    }

    it('Correctly groups by string values', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'a',
          bool: true,
          nested: { code: 100 },
        },
        {
          id: 2,
          name: 'c',
          bool: true,
          nested: { code: 200 },
        },
        {
          id: 3,
          name: 'b',
          bool: true,
          nested: { code: 300 },
        },
        {
          id: 4,
          name: 'a',
          bool: true,
          nested: { code: 400 },
        },
      ]

      const result: Record<string, TestType[]> = groupBy(input, 'name')
      expect(result).toStrictEqual({
        a: [
          {
            id: 1,
            name: 'a',
            bool: true,
            nested: { code: 100 },
          },
          {
            id: 4,
            name: 'a',
            bool: true,
            nested: { code: 400 },
          },
        ],
        b: [
          {
            id: 3,
            name: 'b',
            bool: true,
            nested: { code: 300 },
          },
        ],
        c: [
          {
            id: 2,
            name: 'c',
            bool: true,
            nested: { code: 200 },
          },
        ],
      })
    })

    it('Correctly groups by number values', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'a',
          bool: true,
        },
        {
          id: 1,
          name: 'b',
          bool: false,
        },
        {
          id: 2,
          name: 'c',
          bool: false,
        },
        {
          id: 3,
          name: 'd',
          bool: false,
        },
      ]

      const result: Record<number, TestType[]> = groupBy(input, 'id')

      expect(result).toStrictEqual({
        1: [
          {
            id: 1,
            name: 'a',
            bool: true,
          },
          {
            id: 1,
            name: 'b',
            bool: false,
          },
        ],
        2: [
          {
            id: 2,
            name: 'c',
            bool: false,
          },
        ],
        3: [
          {
            id: 3,
            name: 'd',
            bool: false,
          },
        ],
      })
    })

    it('Correctly handles undefined and null', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'a',
          bool: true,
        },
        {
          name: 'c',
          bool: true,
        },
        {
          id: null,
          name: 'd',
          bool: true,
        },
        {
          id: 1,
          name: 'b',
          bool: true,
        },
      ]

      const result = groupBy(input, 'id')

      expect(result).toStrictEqual({
        1: [
          {
            id: 1,
            name: 'a',
            bool: true,
          },
          {
            id: 1,
            name: 'b',
            bool: true,
          },
        ],
      })
    })
  })

  describe('groupByUnique', () => {
    it('Empty array', () => {
      const array: { id: string }[] = []
      const result = groupByUnique(array, 'id')
      expect(Object.keys(result)).length(0)
    })

    type TestType = {
      id?: number | null
      name: string
      bool: boolean
      nested: {
        code: number
      }
    }

    it('Correctly groups by string values', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'a',
          bool: true,
          nested: { code: 100 },
        },
        {
          id: 2,
          name: 'b',
          bool: true,
          nested: { code: 200 },
        },
      ]

      const result: Record<string, TestType> = groupByUnique(input, 'name')
      expect(result).toStrictEqual({
        a: {
          id: 1,
          name: 'a',
          bool: true,
          nested: { code: 100 },
        },

        b: {
          id: 2,
          name: 'b',
          bool: true,
          nested: { code: 200 },
        },
      })
    })

    it('Correctly groups by number values', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'a',
          bool: true,
          nested: { code: 100 },
        },
        {
          id: 2,
          name: 'b',
          bool: true,
          nested: { code: 200 },
        },
      ]

      const result: Record<number, TestType> = groupByUnique(input, 'id')

      expect(result).toStrictEqual({
        1: {
          id: 1,
          name: 'a',
          bool: true,
          nested: { code: 100 },
        },
        2: {
          id: 2,
          name: 'b',
          bool: true,
          nested: { code: 200 },
        },
      })
    })

    it('Correctly handles undefined', () => {
      const input: TestType[] = [
        {
          id: 1,
          name: 'name',
          bool: true,
          nested: { code: 100 },
        },
        {
          name: 'invalid',
          bool: true,
          nested: { code: 100 },
        },
        {
          id: 3,
          name: 'name 2',
          bool: true,
          nested: { code: 100 },
        },
      ]

      const result = groupByUnique(input, 'id')

      expect(result).toStrictEqual({
        1: {
          id: 1,
          name: 'name',
          bool: true,
          nested: { code: 100 },
        },
        3: {
          id: 3,
          name: 'name 2',
          bool: true,
          nested: { code: 100 },
        },
      })
    })

    it('throws on duplicated value', () => {
      const input: { name: string }[] = [
        {
          id: 1,
          name: 'test',
        },
        {
          id: 2,
          name: 'work',
        },
        {
          id: 3,
          name: 'test',
        },
      ] as never[]

      expect(() => groupByUnique(input, 'name')).toThrowError(
        'Duplicated item for selector name with value test',
      )
    })
  })

  describe('convertDateFieldsToIsoString', () => {
    it('Empty object', () => {
      expect(convertDateFieldsToIsoString({})).toStrictEqual({})
    })

    type TestInputType = {
      id: number
      value: string
      date: Date
      code: number
      reason?: string | null
      other?: TestInputType
      array?: {
        id: number
        createdAt: Date
      }[]
    }

    type TestExpectedType = {
      id: number
      value: string
      date: string
      code: number
      other?: TestExpectedType
      array?: {
        id: number
        createdAt: string
      }[]
    }

    it('simple object', () => {
      const date = new Date()
      const input: TestInputType = {
        id: 1,
        date,
        value: 'test',
        reason: 'reason',
        code: 100,
      }

      const output: TestExpectedType = convertDateFieldsToIsoString(input)

      expect(output).toStrictEqual({
        id: 1,
        date: date.toISOString(),
        value: 'test',
        code: 100,
        reason: 'reason',
      })
      expectTypeOf(output).toMatchTypeOf<TestExpectedType>()
    })

    it('simple array', () => {
      const date1 = new Date()
      const date2 = new Date()
      const input: TestInputType[] = [
        {
          id: 1,
          date: date1,
          value: 'test',
          reason: 'reason',
          code: 100,
        },
        {
          id: 2,
          date: date2,
          value: 'test 2',
          reason: 'reason 2',
          code: 200,
        },
      ]

      const output: TestExpectedType[] = convertDateFieldsToIsoString(input)

      expect(output).toStrictEqual([
        {
          id: 1,
          date: date1.toISOString(),
          value: 'test',
          code: 100,
          reason: 'reason',
        },
        {
          id: 2,
          date: date2.toISOString(),
          value: 'test 2',
          code: 200,
          reason: 'reason 2',
        },
      ])
    })

    it('handles undefined and null', () => {
      const date = new Date()
      const input: TestInputType = {
        id: 1,
        date,
        value: 'test',
        code: 100,
        reason: null,
        other: undefined,
      }

      const output: TestExpectedType = convertDateFieldsToIsoString(input)

      expect(output).toStrictEqual({
        id: 1,
        date: date.toISOString(),
        value: 'test',
        code: 100,
        reason: null,
        other: undefined,
      })
    })

    it('properly handles all types of arrays', () => {
      const date = new Date()
      const input = {
        array1: [date, date],
        array2: [1, 2],
        array3: ['a', 'b'],
        array4: [
          { id: 1, value: 'value', date, code: 100 } satisfies TestInputType,
          { id: 2, value: 'value2', date, code: 200 } satisfies TestInputType,
        ],
        array5: [1, date, 'a', { id: 1, value: 'value', date, code: 100 } satisfies TestInputType],
      }

      type Expected = {
        array1: string[]
        array2: number[]
        array3: string[]
        array4: TestExpectedType[]
        array5: (number | string | TestExpectedType)[]
      }
      const output: Expected = convertDateFieldsToIsoString(input)

      expect(output).toStrictEqual({
        array1: [date.toISOString(), date.toISOString()],
        array2: [1, 2],
        array3: ['a', 'b'],
        array4: [
          { id: 1, value: 'value', date: date.toISOString(), code: 100 },
          { id: 2, value: 'value2', date: date.toISOString(), code: 200 },
        ],
        array5: [
          1,
          date.toISOString(),
          'a',
          { id: 1, value: 'value', date: date.toISOString(), code: 100 },
        ],
      })
    })

    it('nested objects and array', () => {
      const date1 = new Date()
      const date2 = new Date()
      date2.setFullYear(1990)
      const input: TestInputType = {
        id: 1,
        date: date1,
        value: 'test',
        code: 100,
        reason: 'reason',
        other: {
          id: 2,
          value: 'test 2',
          date: date2,
          code: 200,
          reason: null,
          other: undefined,
        },
        array: [
          {
            id: 1,
            createdAt: date1,
          },
          {
            id: 2,
            createdAt: date2,
          },
        ],
      }

      const output: TestExpectedType = convertDateFieldsToIsoString(input)

      expect(output).toMatchObject({
        id: 1,
        date: date1.toISOString(),
        value: 'test',
        code: 100,
        reason: 'reason',
        other: {
          id: 2,
          value: 'test 2',
          date: date2.toISOString(),
          code: 200,
          reason: null,
          other: undefined,
        },
        array: [
          {
            id: 1,
            createdAt: date1.toISOString(),
          },
          {
            id: 2,
            createdAt: date2.toISOString(),
          },
        ],
      })
    })
  })
})
