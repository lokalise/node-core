import { arrayToRecord, callChunked, chunk, removeFalsy, removeNullish } from './arrayUtils'

describe('arrayUtils', () => {
  describe('chunk', () => {
    it('empty array returns empty array', () => {
      const result = chunk([], 5)
      expect(result).toEqual([])
    })

    it('0 size returns empty array', () => {
      const result = chunk([1, 2, 3], 0)
      expect(result).toEqual([])
    })

    it('returns entire array if chunk size equal to length', () => {
      const result = chunk([1, 2, 3], 3)
      expect(result).toEqual([[1, 2, 3]])
    })

    it('returns entire array if chunk size larger than length', () => {
      const result = chunk([1, 2, 3], 5)
      expect(result).toEqual([[1, 2, 3]])
    })

    it('returns empty array if negative length', () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], -1)
      expect(result).toEqual([])
    })

    it('returns chunked array', () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7], 5)
      expect(result).toEqual([
        [1, 2, 3, 4, 5],
        [6, 7],
      ])
    })
  })

  describe('callChunked', () => {
    it('should call function with chunked array', async () => {
      const array = [1, 2, 3, 4, 5]
      const myMock = vitest.fn()
      expect.assertions(3)
      myMock.mockReturnValueOnce([1, 2]).mockReturnValueOnce([3, 4]).mockReturnValue([5])
      await callChunked(2, array, async (arrayChunk) => {
        expect(arrayChunk).toStrictEqual(await myMock())
      })
    })
  })

  describe('removeNullish', () => {
    it('should remove only null and undefined', () => {
      const array = ['', false, null, 'valid', 1, undefined, 0]
      const result: (string | number | boolean)[] = removeNullish(array)
      expect(result).toEqual(['', false, 'valid', 1, 0])
    })
  })

  describe('removeFalsy', () => {
    it('should remove all falsy values', () => {
      const array = ['', false, null, 'valid', 1, undefined, 0]
      const result: (string | number | boolean)[] = removeFalsy(array)
      expect(result).toEqual(['valid', 1])
    })
  })

  describe('arrayToRecord', () => {
    it('emptyArray', () => {
      const array: { id: string }[] = []
      const result = arrayToRecord(array, 'id')
      expect(Object.keys(result)).length(0)
    })

    it('Record with array value', () => {
      const array: { value: string }[] = [
        { value: 'hello' },
        { value: 'my' },
        { value: 'friend' },
        { value: 'my' },
        { value: 'hello' },
      ]
      const result: Record<string, { value: string }[]> = arrayToRecord(array, 'value')
      expect(result).toMatchObject({
        hello: [{ value: 'hello' }, { value: 'hello' }],
        my: [{ value: 'my' }, { value: 'my' }],
        friend: [{ value: 'friend' }],
      })
    })

    it('Record with single value', () => {
      const array: { id: string }[] = [{ id: 'hello' }, { id: 'my' }, { id: 'friend' }]
      const result: Record<string, { id: string }> = arrayToRecord(array, 'id', false)
      expect(result).toMatchObject({
        hello: { id: 'hello' },
        my: { id: 'my' },
        friend: { id: 'friend' },
      })
    })
  })
})
