import { assertType } from 'vitest'
import type { AtLeastOne } from './atLeastOne'

describe('AtLeastOne', () => {
  it('makes at least one key of an object required', () => {
    interface TestType {
      a: string
      b: number
    }

    const testCase1: AtLeastOne<TestType> = { a: 'a' }
    assertType<{ a: string; b?: number }>(testCase1)

    const testCase2: AtLeastOne<TestType> = { b: 1 }
    assertType<{ a?: string; b: number }>(testCase2)

    // @ts-expect-error wrong types
    const testCase3: AtLeastOne<TestType> = {}
    assertType(testCase3)
  })
})
