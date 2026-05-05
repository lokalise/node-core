import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'
import {
  EncryptionKeyNotConfiguredError,
  InvalidCiphertextError,
  InvalidEncryptionConfigError,
  NonSerializableValueError,
} from './envelopeEncryptorErrors'

const CIPHER = 'aes-256-gcm'
const HASH_DIGEST = 'sha256'
const IV_BYTES = 12
const AUTH_TAG_BYTES = 16
const REQUIRED_KEY_BYTES = 32
const MIN_PEPPER_BYTES = 32
const DEFAULT_ENVELOPE_PREFIX = 'enc:v1:'
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]+$/

const toAadBuffer = (aad: string | Buffer): Buffer =>
  Buffer.isBuffer(aad) ? aad : Buffer.from(aad, 'utf8')

/**
 * Minimal duck-typed interface a legacy decryptor must satisfy.
 *
 * Designed so the deprecated `EncryptionUtility` matches without an explicit
 * import dependency from this module to that one.
 */
export type LegacyDecryptor = {
  decrypt(value: string): string
}

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
  /**
   * Optional fallback decryptors used when a value is NOT an envelope
   * (i.e. has no {@link envelopePrefix}). Tried in order; the first one whose
   * `decrypt` does not throw wins. If none succeed, the value is returned
   * as-is (the existing migration-mode passthrough).
   *
   * Intended for migrating away from the deprecated `EncryptionUtility`:
   * pass it here so existing rows keep being readable while new writes use
   * the envelope format.
   */
  legacyDecryptors?: ReadonlyArray<LegacyDecryptor>
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
 *
 * ### Authenticated Additional Data (AAD)
 *
 * `encrypt`/`decrypt` accept an optional `aad` argument that is fed to GCM as
 * additional authenticated data. AAD is NOT stored in the envelope — callers
 * must supply the same AAD at decrypt time or the auth tag check will fail.
 * Use it to bind a ciphertext to its context (e.g. `row_id`, `tenant_id`,
 * `column_name`) so an attacker with DB write access cannot move ciphertexts
 * between rows.
 *
 * ### Key rotation: when to rotate
 *
 * AES-GCM with random 96-bit IVs has a **soft limit of ~2³² encryptions per
 * key** before the probability of an IV collision (which catastrophically
 * breaks GCM's confidentiality and integrity guarantees) becomes
 * non-negligible — see NIST SP 800-57 Pt 1 §5.3 and SP 800-38D §8.3. Rotate
 * the active key well before that threshold for any high-volume use case
 * (also rotate on suspected compromise or per organisational cryptoperiod).
 * Rotation is zero-downtime: add a new key id, switch `activeKeyId`, keep the
 * old key in `keys` until rows have been re-encrypted.
 */
export class EnvelopeEncryptor {
  private readonly keys: ReadonlyMap<string, Buffer>
  private readonly activeKeyId: string
  private readonly hashPepper: Buffer
  private readonly legacyDecryptors: ReadonlyArray<LegacyDecryptor>
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

    // Clone caller-owned key material so post-construction mutation of the
    // input Map or Buffers cannot affect this instance, and so callers are
    // free to zero-wipe their own copies for memory hygiene.
    const clonedKeys = new Map<string, Buffer>()
    for (const [keyId, key] of config.keys) {
      clonedKeys.set(keyId, Buffer.from(key))
    }
    this.keys = clonedKeys
    this.activeKeyId = config.activeKeyId
    this.hashPepper = Buffer.from(config.hashPepper)
    this.envelopePrefix = envelopePrefix
    this.legacyDecryptors = config.legacyDecryptors ?? []
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
   *
   * @param plaintext UTF-8 plaintext to encrypt.
   * @param aad Optional Authenticated Additional Data. When provided, the same
   *   value MUST be supplied to {@link decrypt} or auth-tag verification will
   *   fail. AAD is NOT stored in the envelope. Use it to bind a ciphertext to
   *   its context (row id, tenant id, etc.).
   */
  encrypt(plaintext: string, aad?: string | Buffer): string {
    const keyId = this.activeKeyId
    const key = this.keys.get(keyId)
    if (!key) {
      throw new EncryptionKeyNotConfiguredError(keyId)
    }

    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv(CIPHER, key, iv)
    if (aad !== undefined) {
      cipher.setAAD(toAadBuffer(aad))
    }
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    const payload = Buffer.concat([iv, authTag, ciphertext]).toString('base64url')

    return `${this.envelopePrefix}${keyId}:${payload}`
  }

  /**
   * Decrypts an envelope and returns the original plaintext.
   *
   * If `value` is NOT an envelope, configured `legacyDecryptors` are tried in
   * order; the first one whose `decrypt` does not throw wins. If none are
   * configured or all throw, this method throws `InvalidCiphertextError` —
   * we deliberately do NOT silently return the input as plaintext, so that
   * unencrypted data lurking in a column meant to be encrypted surfaces as
   * an error rather than being passed through unnoticed.
   *
   * @param value Envelope string, or a legacy ciphertext when
   *   `legacyDecryptors` is configured.
   * @param aad Optional AAD. Must match the value passed to {@link encrypt}
   *   for envelopes; ignored on the legacy-decryptor path.
   *
   * @throws {EncryptionKeyNotConfiguredError} if the envelope references a key
   *   id that is not in the configured keys.
   * @throws {InvalidCiphertextError} on a malformed envelope, AES-GCM
   *   authentication failure, or a non-envelope value that no legacy
   *   decryptor can handle.
   */
  decrypt(value: string, aad?: string | Buffer): string {
    if (!this.isEncrypted(value)) {
      for (const legacy of this.legacyDecryptors) {
        try {
          return legacy.decrypt(value)
        } catch {
          // try the next one
        }
      }
      throw new InvalidCiphertextError(
        this.legacyDecryptors.length > 0
          ? 'Value is not an envelope and no legacy decryptor could decrypt it'
          : 'Value is not an envelope and no legacy decryptors are configured',
      )
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
      if (aad !== undefined) {
        decipher.setAAD(toAadBuffer(aad))
      }
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    } catch {
      throw new InvalidCiphertextError(
        'Failed to decrypt ciphertext (authentication tag mismatch or corrupted payload)',
      )
    }
  }

  /**
   * Encrypts a JSON-serializable value. Equivalent to
   * `encrypt(JSON.stringify(value), aad)`, but throws a clear
   * {@link NonSerializableValueError} when `JSON.stringify` returns `undefined`
   * — i.e. when `value` is a top-level `undefined`, function, or symbol —
   * instead of leaking a raw Node crypto `TypeError`.
   */
  encryptJson(value: unknown, aad?: string | Buffer): string {
    const serialized = JSON.stringify(value)
    if (serialized === undefined) {
      throw new NonSerializableValueError()
    }
    return this.encrypt(serialized, aad)
  }

  /**
   * Decrypts a JSON envelope and parses the result. Accepts:
   * - encrypted envelope strings → decrypt + parse
   * - already-parsed objects (some ORMs hand back parsed JSON columns) →
   *   returned unchanged
   * - `null` → returned as `null`
   *
   * Plaintext JSON strings are NOT accepted — pass them through `JSON.parse`
   * yourself if you need lenient migration handling. See {@link decrypt} for
   * the strict-decrypt rationale.
   */
  decryptJson<T = unknown>(value: string | object | null, aad?: string | Buffer): T {
    if (value === null) {
      return null as T
    }
    if (typeof value === 'object') {
      return value as T
    }
    const decrypted = this.decrypt(value, aad)
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
