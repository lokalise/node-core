import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'
import {
  EncryptionKeyNotConfiguredError,
  InvalidCiphertextError,
  InvalidEncryptionConfigError,
} from './envelopeEncryptorErrors'

const CIPHER = 'aes-256-gcm'
const HASH_DIGEST = 'sha256'
const IV_BYTES = 12
const AUTH_TAG_BYTES = 16
const REQUIRED_KEY_BYTES = 32
const MIN_PEPPER_BYTES = 32
const DEFAULT_ENVELOPE_PREFIX = 'enc:v1:'
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]+$/

/**
 * Configuration for {@link EnvelopeEncryptor}.
 *
 * Multiple keys may live at once to support zero-downtime key rotation:
 * decryption picks the key referenced by the envelope, while encryption
 * always uses {@link activeKeyId}.
 *
 * The {@link hashPepper} is independent of the encryption keys: rotating a
 * key does NOT invalidate hashes, since `hash = HMAC(pepper, plaintext)`.
 */
export type EnvelopeEncryptorConfig = {
  /** Map of `keyId -> 32-byte AES key`. Multiple keys may be configured to support rotation. */
  keys: ReadonlyMap<string, Buffer>
  /** Key id used for new encryptions. Must be a key in {@link keys}. */
  activeKeyId: string
  /** Pepper for HMAC lookup hashes. Must be ≥ 32 bytes. */
  hashPepper: Buffer
  /** Marker placed at the start of every envelope. Default: `enc:v1:`. */
  envelopePrefix?: string
}

/**
 * Symmetric envelope-encryption utility for at-rest encryption of database
 * fields.
 *
 * Algorithm: **AES-256-GCM** with a random 12-byte IV per encryption. The
 * authentication tag (16 bytes) is bundled with the IV and ciphertext so each
 * envelope is self-contained.
 *
 * Envelope format:
 *
 *     <envelopePrefix><keyId>:<base64url(iv || authTag || ciphertext)>
 *
 * The `envelopePrefix` defaults to `enc:v1:`. The version segment lets the
 * format evolve later. The prefix doubles as a cheap "is this row already
 * encrypted?" marker so callers can read partially-migrated tables without
 * branching on migration state.
 *
 * Lookup hashes (`hash()`) are `HMAC-SHA256(pepper, plaintext)` and are NOT
 * affected by encryption-key rotation.
 *
 * Unlike {@link EncryptionUtility}, this class does NOT derive a per-call key
 * via PBKDF2 — keys are pre-derived and held in memory, making it suitable
 * for hot request paths.
 */
export class EnvelopeEncryptor {
  private readonly keys: ReadonlyMap<string, Buffer>
  private readonly activeKeyId: string
  private readonly hashPepper: Buffer
  public readonly envelopePrefix: string

  constructor(config: EnvelopeEncryptorConfig) {
    const envelopePrefix = config.envelopePrefix ?? DEFAULT_ENVELOPE_PREFIX
    if (envelopePrefix.length === 0) {
      throw new InvalidEncryptionConfigError('envelopePrefix must not be empty')
    }

    if (!config.keys || config.keys.size === 0) {
      throw new InvalidEncryptionConfigError('keys must contain at least one entry')
    }

    for (const [keyId, key] of config.keys) {
      if (!KEY_ID_PATTERN.test(keyId)) {
        throw new InvalidEncryptionConfigError(
          `Encryption key id "${keyId}" must contain only alphanumerics, underscore, and hyphen`,
        )
      }
      if (!Buffer.isBuffer(key) || key.length !== REQUIRED_KEY_BYTES) {
        throw new InvalidEncryptionConfigError(
          `Encryption key "${keyId}" must be a Buffer of exactly ${REQUIRED_KEY_BYTES} bytes, got ${
            Buffer.isBuffer(key) ? key.length : typeof key
          }`,
        )
      }
    }

    if (!config.keys.has(config.activeKeyId)) {
      throw new InvalidEncryptionConfigError(
        `activeKeyId "${config.activeKeyId}" is not present in keys`,
      )
    }

    if (!Buffer.isBuffer(config.hashPepper) || config.hashPepper.length < MIN_PEPPER_BYTES) {
      throw new InvalidEncryptionConfigError(
        `hashPepper must be a Buffer of at least ${MIN_PEPPER_BYTES} bytes`,
      )
    }

    this.keys = config.keys
    this.activeKeyId = config.activeKeyId
    this.hashPepper = config.hashPepper
    this.envelopePrefix = envelopePrefix
  }

  /**
   * Returns `true` if the value uses the configured envelope prefix. Pure
   * prefix check; cheap; never throws.
   */
  isEncrypted(value: string): boolean {
    return value.startsWith(this.envelopePrefix)
  }

  /**
   * Encrypts `plaintext` with the active key. A fresh random IV is generated
   * per call, so encrypting the same input twice produces different envelopes.
   */
  encrypt(plaintext: string): string {
    const keyId = this.activeKeyId
    const key = this.keys.get(keyId)
    if (!key) {
      throw new EncryptionKeyNotConfiguredError(keyId)
    }

    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv(CIPHER, key, iv)
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    const payload = Buffer.concat([iv, authTag, ciphertext]).toString('base64url')

    return `${this.envelopePrefix}${keyId}:${payload}`
  }

  /**
   * Decrypts an envelope and returns the original plaintext.
   *
   * If `value` is NOT an envelope (no envelope prefix) it is returned as-is —
   * a migration-mode pass-through that lets callers read pre-encryption rows
   * without branching on migration state.
   *
   * @throws {EncryptionKeyNotConfiguredError} if the envelope references a key
   *   id that is not in the configured keys.
   * @throws {InvalidCiphertextError} on a malformed envelope or AES-GCM
   *   authentication failure.
   */
  decrypt(value: string): string {
    if (!this.isEncrypted(value)) {
      return value
    }

    const { keyId, payload } = this.parseEnvelope(value)
    const key = this.keys.get(keyId)
    if (!key) {
      throw new EncryptionKeyNotConfiguredError(keyId)
    }

    if (payload.length < IV_BYTES + AUTH_TAG_BYTES) {
      throw new InvalidCiphertextError('Ciphertext payload is shorter than the minimum length')
    }

    const iv = payload.subarray(0, IV_BYTES)
    const authTag = payload.subarray(IV_BYTES, IV_BYTES + AUTH_TAG_BYTES)
    const ciphertext = payload.subarray(IV_BYTES + AUTH_TAG_BYTES)

    try {
      const decipher = createDecipheriv(CIPHER, key, iv)
      decipher.setAuthTag(authTag)
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    } catch {
      throw new InvalidCiphertextError(
        'Failed to decrypt ciphertext (authentication tag mismatch or corrupted payload)',
      )
    }
  }

  /** Encrypts a JSON-serializable value. Equivalent to `encrypt(JSON.stringify(value))`. */
  encryptJson(value: unknown): string {
    return this.encrypt(JSON.stringify(value))
  }

  /**
   * Decrypts a JSON envelope and parses the result. Accepts:
   * - encrypted envelope strings → decrypt + parse
   * - plain JSON strings (legacy plaintext rows) → parse as-is
   * - already-parsed objects (some ORMs hand back parsed JSON columns) →
   *   returned unchanged
   * - `null` → returned as `null`
   */
  decryptJson<T = unknown>(value: string | object | null): T {
    if (value === null) {
      return null as T
    }
    if (typeof value === 'object') {
      return value as T
    }
    const decrypted = this.decrypt(value)
    return JSON.parse(decrypted) as T
  }

  /**
   * Returns `HMAC-SHA256(pepper, plaintext)` as lower-case hex (64 chars).
   *
   * Deterministic. Independent of {@link EnvelopeEncryptorConfig.activeKeyId}.
   * Used by callers to populate `*_hash` columns indexed for exact-match
   * lookups on encrypted fields.
   */
  hash(plaintext: string): string {
    return createHmac(HASH_DIGEST, this.hashPepper).update(plaintext, 'utf8').digest('hex')
  }

  private parseEnvelope(value: string): { keyId: string; payload: Buffer } {
    const body = value.slice(this.envelopePrefix.length)
    const separator = body.indexOf(':')
    if (separator <= 0 || separator === body.length - 1) {
      throw new InvalidCiphertextError('Malformed encryption envelope (missing key id or payload)')
    }

    const keyId = body.slice(0, separator)
    const base64 = body.slice(separator + 1)
    if (!KEY_ID_PATTERN.test(keyId)) {
      throw new InvalidCiphertextError(`Malformed encryption envelope (invalid key id "${keyId}")`)
    }

    const payload = Buffer.from(base64, 'base64url')
    // Node's base64url decoder is permissive — round-trip to detect garbage
    // (e.g. `!!!short` from the malformed-envelope tests).
    if (payload.toString('base64url') !== base64) {
      throw new InvalidCiphertextError('Encryption envelope payload is not valid base64url')
    }
    return { keyId, payload }
  }
}
