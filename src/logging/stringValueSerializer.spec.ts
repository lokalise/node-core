import { stringValueSerializer } from './stringValueSerializer'

describe('stringValueSerializer', () => {
  it('adds extra quotes around serialized value', () => {
    expect(stringValueSerializer({ foo: 'bar' })).toBe('"{"foo":"bar"}"')
    expect(stringValueSerializer('test')).toBe('""test""')
    expect(stringValueSerializer(null)).toBe('"null"')
  })
})
