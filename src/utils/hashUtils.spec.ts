import { expect } from 'vitest'

import { HashAlgorithm, HashEncoding, generateEncryptedHash, generateHash } from './hashUtils'

describe('hashUtils', () => {
  describe('generateHash', () => {
    it('should generate a SHA-256 hash in hex format', () => {
      const data = 'test sha256'
      const hash = generateHash(HashAlgorithm.SHA256, data, HashEncoding.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(64) // SHA-256 generates a 64-character hex string
    })

    it('should generate a SHA-256 hash in base64 format', () => {
      const data = 'test sha256 base64'
      const hash = generateHash(HashAlgorithm.SHA256, data, HashEncoding.BASE64)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(44) // SHA-256 generates a 44-character base64 string
    })

    it('should generate a SHA-512 hash in hex format', () => {
      const data = 'test sha512'
      const hash = generateHash(HashAlgorithm.SHA512, data, HashEncoding.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(128) // SHA-512 generates a 128-character hex string
    })
  })

  describe('generateEncryptedHash', () => {
    const pepper = Buffer.from('super-secret-pepper-key')

    it('should generate a SHA-256 HMAC in hex format', () => {
      const data = 'test hmac sha256'
      const hash = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper, HashEncoding.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(64)
    })

    it('should generate a SHA-256 HMAC in base64 format', () => {
      const data = 'test hmac sha256 base64'
      const hash = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper, HashEncoding.BASE64)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(44)
    })

    it('should generate a SHA-512 HMAC in hex format', () => {
      const data = 'test hmac sha512'
      const hash = generateEncryptedHash(HashAlgorithm.SHA512, data, pepper, HashEncoding.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(128)
    })

    it('should generate a SHA-512 HMAC in base64 format', () => {
      const data = 'test hmac sha512 base64'
      const hash = generateEncryptedHash(HashAlgorithm.SHA512, data, pepper, HashEncoding.BASE64)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(88)
    })

    it('should default to hex encoding when encoding is not specified', () => {
      const data = 'test default encoding'
      const hash = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(64)
    })

    it('should produce deterministic output for the same input', () => {
      const data = 'deterministic test'
      const hash1 = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper)
      const hash2 = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper)
      expect(hash1).toStrictEqual(hash2)
    })

    it('should produce different output for different peppers', () => {
      const data = 'same data'
      const otherPepper = Buffer.from('different-pepper-key')
      const hash1 = generateEncryptedHash(HashAlgorithm.SHA256, data, pepper)
      const hash2 = generateEncryptedHash(HashAlgorithm.SHA256, data, otherPepper)
      expect(hash1).not.toStrictEqual(hash2)
    })

    it('should produce different output for different data', () => {
      const hash1 = generateEncryptedHash(HashAlgorithm.SHA256, 'data-one', pepper)
      const hash2 = generateEncryptedHash(HashAlgorithm.SHA256, 'data-two', pepper)
      expect(hash1).not.toStrictEqual(hash2)
    })
  })
})
