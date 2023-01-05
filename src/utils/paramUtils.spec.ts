import { ensureClosingSlash } from './paramUtils'

describe('paramUtils', () => {
  describe('ensureClosingSlash', () => {
    it('adds missing slash', () => {
      const resolveValue = ensureClosingSlash('main')

      expect(resolveValue).toBe('main/')
    })

    it('returns empty string for null', () => {
      const resolveValue = ensureClosingSlash(null)

      expect(resolveValue).toBe('')
    })

    it('returns empty string for undefined', () => {
      const resolveValue = ensureClosingSlash(undefined)

      expect(resolveValue).toBe('')
    })

    it('returns empty string for empty string', () => {
      const resolveValue = ensureClosingSlash('')

      expect(resolveValue).toBe('')
    })

    it('keeps existing slash', () => {
      const resolveValue = ensureClosingSlash('pre-1/')

      expect(resolveValue).toBe('pre-1/')
    })
  })
})
