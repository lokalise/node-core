import { expect } from 'vitest'

import { generateHash, HashAlgorithm, HashDigest } from './hashUtils'

describe('hashUtils', () => {
  describe('generateHash', function () {
    it('should generate a SHA-256 hash in hex format', function () {
      const data = 'test sha256'
      const hash = generateHash(data, HashAlgorithm.SHA256, HashDigest.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(64) // SHA-256 generates a 64-character hex string
    })

    it('should generate a SHA-256 hash in base64 format', function () {
      const data = 'test sha256 base64'
      const hash = generateHash(data, HashAlgorithm.SHA256, HashDigest.BASE64)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(44) // SHA-256 generates a 44-character base64 string
    })

    it('should generate a SHA-512 hash in hex format', function () {
      const data = 'test sha512'
      const hash = generateHash(data, HashAlgorithm.SHA512, HashDigest.HEX)
      expect(hash).toStrictEqual(expect.any(String))
      expect(hash.length).toStrictEqual(128) // SHA-512 generates a 128-character hex string
    })
  })
})
