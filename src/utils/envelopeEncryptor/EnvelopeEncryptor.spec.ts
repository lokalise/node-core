import { randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { EnvelopeEncryptor, type EnvelopeEncryptorConfig } from './EnvelopeEncryptor'
import {
  EncryptionKeyNotConfiguredError,
  InvalidCiphertextError,
  InvalidEncryptionConfigError,
} from './envelopeEncryptorErrors'

const KEY_A = randomBytes(32)
const KEY_B = randomBytes(32)
const PEPPER = randomBytes(32)

const buildEncryptor = (overrides?: Partial<EnvelopeEncryptorConfig>): EnvelopeEncryptor => {
  const config: EnvelopeEncryptorConfig = {
    keys: new Map([
      ['kA', KEY_A],
      ['kB', KEY_B],
    ]),
    activeKeyId: 'kA',
    hashPepper: PEPPER,
    ...overrides,
  }
  return new EnvelopeEncryptor(config)
}

describe('EnvelopeEncryptor', () => {
  describe('encrypt / decrypt round-trip', () => {
    it('returns the same plaintext after a round-trip', () => {
      const enc = buildEncryptor()
      const plaintext = 'super-secret-token-12345'

      const envelope = enc.encrypt(plaintext)
      expect(envelope.startsWith('enc:v1:kA:')).toBe(true)
      expect(enc.decrypt(envelope)).toBe(plaintext)
    })

    it('produces different ciphertexts for the same plaintext (random IV)', () => {
      const enc = buildEncryptor()
      const a = enc.encrypt('same')
      const b = enc.encrypt('same')

      expect(a).not.toBe(b)
      expect(enc.decrypt(a)).toBe('same')
      expect(enc.decrypt(b)).toBe('same')
    })

    it('handles unicode and empty strings', () => {
      const enc = buildEncryptor()
      expect(enc.decrypt(enc.encrypt(''))).toBe('')
      expect(enc.decrypt(enc.encrypt('héllo 🚀 ünicode'))).toBe('héllo 🚀 ünicode')
    })
  })

  describe('multi-key / rotation', () => {
    it('decrypts an envelope encrypted with a non-active key', () => {
      const oldEnc = buildEncryptor({ activeKeyId: 'kB' })
      const envelope = oldEnc.encrypt('rotated-value')

      const newEnc = buildEncryptor({ activeKeyId: 'kA' })
      expect(newEnc.decrypt(envelope)).toBe('rotated-value')
    })

    it('throws EncryptionKeyNotConfiguredError from encrypt if the active key disappears (defensive)', () => {
      const keys = new Map([['kA', KEY_A]])
      const enc = new EnvelopeEncryptor({ keys, activeKeyId: 'kA', hashPepper: PEPPER })
      keys.delete('kA')
      expect(() => enc.encrypt('x')).toThrow(EncryptionKeyNotConfiguredError)
    })

    it('throws EncryptionKeyNotConfiguredError when the envelope key is missing', () => {
      const fullEnc = buildEncryptor()
      const envelope = fullEnc.encrypt('x')

      const limited = buildEncryptor({
        keys: new Map([['kB', KEY_B]]),
        activeKeyId: 'kB',
      })
      expect(() => limited.decrypt(envelope)).toThrow(EncryptionKeyNotConfiguredError)
      try {
        limited.decrypt(envelope)
      } catch (e) {
        expect((e as EncryptionKeyNotConfiguredError).keyId).toBe('kA')
        expect((e as EncryptionKeyNotConfiguredError).details).toEqual({ keyId: 'kA' })
      }
    })
  })

  describe('integrity / tampering', () => {
    it('throws InvalidCiphertextError on tampered payload', () => {
      const enc = buildEncryptor()
      const envelope = enc.encrypt('value')
      const tampered = envelope.slice(0, -2) + (envelope.endsWith('A') ? 'BB' : 'AA')

      expect(() => enc.decrypt(tampered)).toThrow(InvalidCiphertextError)
    })

    it('throws InvalidCiphertextError on malformed envelopes', () => {
      const enc = buildEncryptor()
      expect(() => enc.decrypt('enc:v1:kA')).toThrow(InvalidCiphertextError)
      expect(() => enc.decrypt('enc:v1:kA:')).toThrow(InvalidCiphertextError)
      expect(() => enc.decrypt('enc:v1::abc')).toThrow(InvalidCiphertextError)
      expect(() => enc.decrypt('enc:v1:kA:!!!short')).toThrow(InvalidCiphertextError)
    })

    it('throws InvalidCiphertextError on a payload shorter than IV + auth tag', () => {
      const enc = buildEncryptor()
      // valid base64url round-trip but payload only decodes to 3 bytes
      expect(() => enc.decrypt('enc:v1:kA:abcd')).toThrow(/shorter than the minimum length/)
    })

    it('throws InvalidCiphertextError when the envelope key id contains invalid chars', () => {
      const enc = buildEncryptor()
      // Build an envelope with an invalid key id segment but valid base64url payload.
      const fakePayload = randomBytes(28).toString('base64url')
      expect(() => enc.decrypt(`enc:v1:bad id:${fakePayload}`)).toThrow(InvalidCiphertextError)
    })
  })

  describe('plaintext fallback', () => {
    it('returns input unchanged if it is not an envelope', () => {
      const enc = buildEncryptor()
      expect(enc.decrypt('plain-token')).toBe('plain-token')
      expect(enc.decrypt('{"foo":"bar"}')).toBe('{"foo":"bar"}')
    })

    it('isEncrypted classifies values correctly', () => {
      const enc = buildEncryptor()
      expect(enc.isEncrypted('enc:v1:kA:abc')).toBe(true)
      expect(enc.isEncrypted('plaintext')).toBe(false)
      expect(enc.isEncrypted('')).toBe(false)
      expect(enc.isEncrypted('enc:v0:kA:abc')).toBe(false)
    })
  })

  describe('JSON helpers', () => {
    it('round-trips arbitrary JSON values', () => {
      const enc = buildEncryptor()
      const value = { token: 'abc', nested: { arr: [1, 2, 3], flag: true }, n: null }
      const envelope = enc.encryptJson(value)

      expect(enc.isEncrypted(envelope)).toBe(true)
      expect(enc.decryptJson(envelope)).toEqual(value)
    })

    it('decryptJson passes through already-parsed objects', () => {
      const enc = buildEncryptor()
      const value = { foo: 'bar' }
      expect(enc.decryptJson(value)).toBe(value)
    })

    it('decryptJson parses legacy plaintext JSON strings', () => {
      const enc = buildEncryptor()
      expect(enc.decryptJson<{ foo: string }>('{"foo":"bar"}')).toEqual({ foo: 'bar' })
    })

    it('decryptJson returns null for null input', () => {
      const enc = buildEncryptor()
      expect(enc.decryptJson(null)).toBeNull()
    })
  })

  describe('hash', () => {
    it('is deterministic for the same plaintext', () => {
      const enc = buildEncryptor()
      expect(enc.hash('value')).toBe(enc.hash('value'))
    })

    it('produces 64 hex chars', () => {
      const enc = buildEncryptor()
      expect(enc.hash('value')).toMatch(/^[0-9a-f]{64}$/)
    })

    it('changes when the pepper changes', () => {
      const a = buildEncryptor({ hashPepper: randomBytes(32) })
      const b = buildEncryptor({ hashPepper: randomBytes(32) })
      expect(a.hash('value')).not.toBe(b.hash('value'))
    })

    it('survives encryption-key rotation (same plaintext = same hash)', () => {
      const before = buildEncryptor({ activeKeyId: 'kA' })
      const after = buildEncryptor({ activeKeyId: 'kB' })
      expect(before.hash('value')).toBe(after.hash('value'))
    })
  })

  describe('configurable envelope prefix', () => {
    it('uses the configured envelope prefix', () => {
      const enc = buildEncryptor({ envelopePrefix: 'cte:enc:v1:' })
      const envelope = enc.encrypt('value')
      expect(envelope.startsWith('cte:enc:v1:kA:')).toBe(true)
      expect(enc.isEncrypted('cte:enc:v1:something')).toBe(true)
      expect(enc.isEncrypted('enc:v1:something')).toBe(false)
      expect(enc.decrypt(envelope)).toBe('value')
    })

    it('exposes the configured prefix via the getter', () => {
      const enc = buildEncryptor({ envelopePrefix: 'cte:enc:v1:' })
      expect(enc.envelopePrefix).toBe('cte:enc:v1:')
    })

    it('defaults the envelope prefix to enc:v1:', () => {
      const enc = buildEncryptor()
      expect(enc.envelopePrefix).toBe('enc:v1:')
    })
  })

  describe('construction-time validation', () => {
    it('rejects an empty keys map', () => {
      expect(
        () =>
          new EnvelopeEncryptor({
            keys: new Map(),
            activeKeyId: 'kA',
            hashPepper: PEPPER,
          }),
      ).toThrow(InvalidEncryptionConfigError)
    })

    it('rejects a wrong-length key', () => {
      expect(() =>
        buildEncryptor({
          keys: new Map([['kA', randomBytes(16)]]),
          activeKeyId: 'kA',
        }),
      ).toThrow(/32 bytes/)
    })

    it('rejects a missing active key id', () => {
      expect(() => buildEncryptor({ activeKeyId: 'missing' })).toThrow(
        /activeKeyId .* is not present/,
      )
    })

    it('rejects a too-short pepper', () => {
      expect(() => buildEncryptor({ hashPepper: randomBytes(16) })).toThrow(/at least 32 bytes/)
    })

    it('rejects an invalid key id', () => {
      expect(() =>
        buildEncryptor({
          keys: new Map([['bad id', KEY_A]]),
          activeKeyId: 'bad id',
        }),
      ).toThrow(/alphanumerics/)
    })

    it('rejects an empty envelope prefix when explicitly provided', () => {
      expect(() => buildEncryptor({ envelopePrefix: '' })).toThrow(/envelopePrefix/)
    })

    it('rejects a non-Buffer key', () => {
      expect(
        () =>
          new EnvelopeEncryptor({
            keys: new Map([['kA', 'not-a-buffer' as unknown as Buffer]]),
            activeKeyId: 'kA',
            hashPepper: PEPPER,
          }),
      ).toThrow(InvalidEncryptionConfigError)
    })

    it('rejects a non-Buffer pepper', () => {
      expect(
        () =>
          new EnvelopeEncryptor({
            keys: new Map([['kA', KEY_A]]),
            activeKeyId: 'kA',
            hashPepper: 'not-a-buffer' as unknown as Buffer,
          }),
      ).toThrow(InvalidEncryptionConfigError)
    })
  })
})
