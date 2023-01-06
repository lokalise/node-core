import { ensureClosingSlashTransformer } from './configTransformers'

describe('configTransformers', () => {
  describe('ensureClosingSlashTransformer', () => {
    it('adds missing slash', () => {
      const resolveValue = ensureClosingSlashTransformer('main')

      expect(resolveValue).toBe('main/')
    })

    it('returns empty string for null', () => {
      const resolveValue = ensureClosingSlashTransformer(null)

      expect(resolveValue).toBe('')
    })

    it('returns empty string for undefined', () => {
      const resolveValue = ensureClosingSlashTransformer(undefined)

      expect(resolveValue).toBe('')
    })

    it('returns empty string for empty string', () => {
      const resolveValue = ensureClosingSlashTransformer('')

      expect(resolveValue).toBe('')
    })

    it('keeps existing slash', () => {
      const resolveValue = ensureClosingSlashTransformer('pre-1/')

      expect(resolveValue).toBe('pre-1/')
    })
  })
})
