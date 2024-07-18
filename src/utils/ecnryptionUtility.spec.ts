import { EncryptionUtility } from './encryptionUtility'

const testSecret = 'myTotalySecretKey'
const testData = 'bacon'

/**
 * Tests adapted from: https://github.com/MauriceButler/cryptr
 */
describe('encryption utility', () => {
  it('works...', () => {
    const cryptr = new EncryptionUtility(testSecret)
    const encryptedString = cryptr.encrypt(testData)
    const decryptedString = cryptr.decrypt(encryptedString)

    expect(decryptedString).toBe(testData)
  })

  it('works with custom encoding', () => {
    const encodings: NodeJS.BufferEncoding[] = ['hex', 'base64', 'latin1']

    for (const encoding of encodings) {
      const cryptr = new EncryptionUtility(testSecret, { encoding })
      const encryptedString = cryptr.encrypt(testData)
      const decryptedString = cryptr.decrypt(encryptedString)

      expect(decryptedString).toBe(testData)
    }
  })

  it('custom encoding affects output length', () => {
    const cryptr = new EncryptionUtility(testSecret, { encoding: 'base64' })
    const cryptr2 = new EncryptionUtility(testSecret)
    const encryptedString = cryptr.encrypt(testData)
    const encryptedString2 = cryptr2.encrypt(testData)

    expect(encryptedString.length).toBeLessThan(encryptedString2.length)
  })

  it('works with custom pbkdf2Iterations', () => {
    const cryptr = new EncryptionUtility(testSecret, { pbkdf2Iterations: 10000 })
    const encryptedString = cryptr.encrypt(testData)
    const decryptedString = cryptr.decrypt(encryptedString)

    expect(decryptedString).toBe(testData)
  })

  it('custom pbkdf2Iterations affects speed', () => {
    const cryptr = new EncryptionUtility(testSecret, { pbkdf2Iterations: 1000 })
    const cryptr2 = new EncryptionUtility(testSecret)
    const customStart = performance.now()
    for (let index = 0; index < 10; index++) {
      const encryptedString = cryptr.encrypt(testData + index)
      cryptr.decrypt(encryptedString)
    }
    const customEnd = performance.now()

    const defaultStart = performance.now()
    for (let index = 0; index < 10; index++) {
      const encryptedString = cryptr2.encrypt(testData + index)
      cryptr2.decrypt(encryptedString)
    }
    const defaultEnd = performance.now()

    const customTime = customEnd - customStart
    const defaultTime = defaultEnd - defaultStart

    expect(customTime).toBeLessThan(defaultTime)
  })

  it('works with custom saltLength', () => {
    const cryptr = new EncryptionUtility(testSecret, { saltLength: 10 })
    const encryptedString = cryptr.encrypt(testData)
    const decryptedString = cryptr.decrypt(encryptedString)
    expect(decryptedString).toBe(testData)
  })

  it('custom saltLength affects output length', () => {
    const customSaltLength = 30
    const cryptr = new EncryptionUtility(testSecret, { saltLength: customSaltLength })
    const cryptr2 = new EncryptionUtility(testSecret)
    const encryptedString = cryptr.encrypt(testData)
    const encryptedString2 = cryptr2.encrypt(testData)

    expect(encryptedString2.length - encryptedString.length).toBe((64 - customSaltLength) * 2)
  })

  it('works with utf8 specific characters', () => {
    const testString = 'ßáÇÖÑ 🥓'
    const cryptr = new EncryptionUtility(testSecret)
    const encryptedString = cryptr.encrypt(testString)
    const decryptedString = cryptr.decrypt(encryptedString)

    expect(decryptedString).toBe(testString)
  })
})
