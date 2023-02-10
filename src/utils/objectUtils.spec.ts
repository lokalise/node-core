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
    const input = [
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
    ]

    const result = groupBy(input, 'name')

    expect(result).toMatchSnapshot()
  })

  it('Correctly groups by number values', () => {
    const input = [
      {
        id: 1,
        count: 10,
      },
      {
        id: 2,
        count: 10,
      },
      {
        id: 3,
        count: 20,
      },
      {
        id: 4,
        count: 30,
      },
    ]

    const result = groupBy(input, 'count')

    expect(result).toMatchSnapshot()
  })

  it('Correctly handles undefined', () => {
    const input = [
      {
        id: 1,
        name: '45',
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
      {
        id: 4,
        name: '45',
      },
    ]

    const result = groupBy(input, 'name')

    expect(result).toMatchSnapshot()
  })
})
