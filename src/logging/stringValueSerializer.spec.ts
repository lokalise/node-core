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

  it('handles BigInt types', () => {
    expect(stringValueSerializer(BigInt('12345678901234567890'))).toBe('"12345678901234567890"')
  })

  it('handles Symbol types', () => {
    const sym = Symbol('test')
    expect(stringValueSerializer(sym)).toBe('"Symbol(test)"')
  })

  it('handles undefined values', () => {
    expect(stringValueSerializer(undefined)).toBe('"undefined"')
  })

  it('handles function types', () => {
    const func = () => 'test'
    expect(stringValueSerializer(func)).toBe('"() => "test""')
  })

  it('handles circular references gracefully', () => {
    const circularObj: any = {}
    circularObj.self = circularObj
    expect(stringValueSerializer(circularObj)).toBe('"[object Object]"')
  })

  it('handles empty objects and arrays', () => {
    expect(stringValueSerializer({})).toBe('"{}"')
    expect(stringValueSerializer([])).toBe('"[]"')
  })
})
