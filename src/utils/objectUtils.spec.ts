import {
  copyWithoutUndefined,
  groupBy,
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

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
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
  it('Correctly groups by string values', () => {
    const input: { name: string }[] = [
      {
        id: 1,
        name: 'a',
      },
      {
        id: 2,
        name: 'c',
      },
      {
        id: 3,
        name: 'b',
      },
      {
        id: 4,
        name: 'a',
      },
    ] as never[]

    const result: Record<string, { name: string }[]> = groupBy(input, 'name')

    expect(result).toMatchObject({
      a: [
        { id: 1, name: 'a' },
        { id: 4, name: 'a' },
      ],
      b: [{ id: 3, name: 'b' }],
      c: [{ id: 2, name: 'c' }],
    })
  })

  it('Correctly groups by number values', () => {
    const input: { count: number }[] = [
      {
        id: 1,
        count: 10,
      },
      {
        id: 2,
        count: 20,
      },
      {
        id: 3,
        count: 30,
      },
      {
        id: 4,
        count: 10,
      },
    ] as never[]

    const result: Record<number, { count: number }[]> = groupBy(input, 'count')

    expect(result).toMatchObject({
      10: [
        { id: 1, count: 10 },
        { id: 4, count: 10 },
      ],
      20: [{ id: 2, count: 20 }],
      30: [{ id: 3, count: 30 }],
    })
  })

  it('Correctly handles undefined', () => {
    const input: { name?: string }[] = [
      {
        id: 1,
        name: 'name',
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
      {
        id: 4,
        name: 'name',
      },
    ] as never[]

    const result: Record<string, { name: string }[]> = groupBy(input, 'name')

    expect(result).toMatchObject({
      name: [
        { id: 1, name: 'name' },
        { id: 4, name: 'name' },
      ],
    })
  })
})
