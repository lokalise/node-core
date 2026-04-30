import * as crypto from 'node:crypto'

const algorithm = 'aes-256-gcm'
const ivLength = 16
const tagLength = 16
const defaultEncoding = 'hex'
const defaultSaltLength = 64
const defaultPbkdf2Iterations = 100000

export type Options = {
  saltLength?: number
  pbkdf2Iterations?: number
  encoding?: NodeJS.BufferEncoding
}

/**
 * Type-scripted version of https://github.com/MauriceButler/cryptr.
 *
 * @deprecated Use {@link EnvelopeEncryptor} instead. `EncryptionUtility`
 * derives a per-call key via PBKDF2 (100k SHA-512 rounds), which is too slow
 * for hot request paths and at-rest DB encryption. It also lacks key-id
 * tagging (no zero-downtime rotation), lookup-hash support, and an
 * is-encrypted marker for migration-time detection. New code should use
 * `EnvelopeEncryptor` from `@lokalise/node-core`.
 */
export class EncryptionUtility {
  private readonly secret: string
  private readonly saltLength: number
  private readonly encryptedPosition: number
  private readonly tagPosition: number
  private readonly pbkdf2Iterations: number
  private readonly encoding: NodeJS.BufferEncoding

  constructor(secret: string, options?: Options) {
    this.secret = secret

    this.encoding = options?.encoding ?? defaultEncoding
    this.pbkdf2Iterations = options?.pbkdf2Iterations ?? defaultPbkdf2Iterations
    this.saltLength = options?.saltLength ?? defaultSaltLength

    this.tagPosition = this.saltLength + ivLength
    this.encryptedPosition = this.tagPosition + tagLength
  }

  private getKey(salt: Buffer) {
    return crypto.pbkdf2Sync(this.secret, salt, this.pbkdf2Iterations, 32, 'sha512')
  }

  public encrypt(value: string) {
    const iv = crypto.randomBytes(ivLength)
    const salt = crypto.randomBytes(this.saltLength)

    const key = this.getKey(salt)

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])

    const tag = cipher.getAuthTag()

    return Buffer.concat([salt, iv, tag, encrypted]).toString(this.encoding)
  }

  public decrypt(value: string) {
    const stringValue = Buffer.from(String(value), this.encoding)

    const salt = stringValue.subarray(0, this.saltLength)
    const iv = stringValue.subarray(this.saltLength, this.tagPosition)
    const tag = stringValue.subarray(this.tagPosition, this.encryptedPosition)
    const encrypted = stringValue.subarray(this.encryptedPosition)

    const key = this.getKey(salt)

    const decipher = crypto.createDecipheriv(algorithm, key, iv)

    decipher.setAuthTag(tag)

    return Buffer.concat([
      decipher.update(encrypted),
      Buffer.from(decipher.final('utf8')),
    ]).toString('utf8')
  }
}
