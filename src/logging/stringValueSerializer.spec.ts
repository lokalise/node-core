import { stringValueSerializer } from './stringValueSerializer'

describe('stringValueSerializer', () => {
  it('adds extra quotes around serialized value', () => {
    expect(stringValueSerializer({ foo: 'bar' })).toBe('"{"foo":"bar"}"')
    expect(stringValueSerializer('test')).toBe('""test""')
    expect(stringValueSerializer(null)).toBe('"null"')
    expect(stringValueSerializer(3)).toBe('"3"')
    expect(stringValueSerializer(true)).toBe('"true"')
    expect(stringValueSerializer(3.14)).toBe('"3.14"')
  })

  it('truncates long strings to max length', () => {
    const longString = 'a'.repeat(40000)
    const truncatedString = stringValueSerializer(longString)
    expect(truncatedString.length).toBeLessThanOrEqual(8100 + 4)
    expect(truncatedString).toMatch(/^""a{8100}""$/)
  })

  it('supports custom max length', () => {
    const longString = 'b'.repeat(40000)
    const truncatedString = stringValueSerializer(longString, 100)
    expect(truncatedString.length).toBeLessThanOrEqual(100 + 4)
    expect(truncatedString).toMatch(/^""b{100}""$/)
  })
})
