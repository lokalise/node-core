import { describe, expect, expectTypeOf, it } from 'vitest'
import { type Either, failure, isFailure, isSuccess, success } from './either.js'

describe('either', () => {
  describe('success', () => {
    it('creates a Right with result', () => {
      const result = success('value')

      expect(result).toEqual({ result: 'value' })
      expect(isSuccess(result)).toBe(true)
      expect(isFailure(result)).toBe(false)
    })

    it('preserves string literal types', () => {
      const result = success('disconnect')

      expectTypeOf(result).toEqualTypeOf<{ error?: never; result: 'disconnect' }>()
      expectTypeOf(result.result).toEqualTypeOf<'disconnect'>()
    })

    it('preserves number literal types', () => {
      const result = success(42)

      expectTypeOf(result).toEqualTypeOf<{ error?: never; result: 42 }>()
      expectTypeOf(result.result).toEqualTypeOf<42>()
    })

    it('preserves union literal types', () => {
      const value = 'a' as 'a' | 'b'
      const result = success(value)

      expectTypeOf(result).toEqualTypeOf<{ error?: never; result: 'a' | 'b' }>()
      expectTypeOf(result.result).toEqualTypeOf<'a' | 'b'>()
    })

    it('preserves object types', () => {
      const result = success({ foo: 'bar' })

      expectTypeOf(result.result).toEqualTypeOf<{ readonly foo: 'bar' }>()
    })
  })

  describe('failure', () => {
    it('creates a Left with error', () => {
      const result = failure('error')

      expect(result).toEqual({ error: 'error' })
      expect(isFailure(result)).toBe(true)
      expect(isSuccess(result)).toBe(false)
    })

    it('preserves string literal types', () => {
      const result = failure('NOT_FOUND')

      expectTypeOf(result).toEqualTypeOf<{ error: 'NOT_FOUND'; result?: never }>()
      expectTypeOf(result.error).toEqualTypeOf<'NOT_FOUND'>()
    })

    it('preserves error code literal types', () => {
      const result = failure('VALIDATION_ERROR' as const)

      expectTypeOf(result.error).toEqualTypeOf<'VALIDATION_ERROR'>()
    })
  })

  describe('Either type', () => {
    it('works with type guards', () => {
      const either: Either<string, number> = success(42)

      if (isSuccess(either)) {
        expectTypeOf(either.result).toEqualTypeOf<number>()
      }

      const eitherFail: Either<string, number> = failure('error')

      if (isFailure(eitherFail)) {
        expectTypeOf(eitherFail.error).toEqualTypeOf<string>()
      }
    })
  })
})
