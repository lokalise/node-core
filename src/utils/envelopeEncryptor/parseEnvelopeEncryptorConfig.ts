import type { ConfigScope } from '../../config/ConfigScope'
import type { EnvelopeEncryptorConfig } from './EnvelopeEncryptor'
import { InvalidEncryptionConfigError } from './envelopeEncryptorErrors'

const REQUIRED_KEY_BYTES = 32
const MIN_PEPPER_BYTES = 32
const DEFAULT_ENVELOPE_PREFIX = 'enc:v1:'
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]+$/

/**
 * Reads and validates {@link EnvelopeEncryptorConfig} from environment
 * variables via the supplied {@link ConfigScope}.
 *
 * Required env vars:
 * - `ENCRYPTION_KEYS` — comma-separated `keyId:base64Key` entries.
 *   Each base64 value must decode to exactly 32 bytes (AES-256).
 * - `ENCRYPTION_ACTIVE_KEY_ID` — id of the key to use for new encryptions.
 *   Must be present in `ENCRYPTION_KEYS`.
 * - `ENCRYPTION_HASH_PEPPER` — base64-encoded pepper, ≥ 32 bytes.
 *
 * Optional (default `enc:v1:`; do NOT change after data is written):
 * - `ENCRYPTION_ENVELOPE_PREFIX`
 *
 * @throws {InvalidEncryptionConfigError} on missing or malformed values.
 */
export function parseEnvelopeEncryptorConfig(configScope: ConfigScope): EnvelopeEncryptorConfig {
  const rawKeys = mandatory(configScope, 'ENCRYPTION_KEYS')
  const activeKeyId = mandatory(configScope, 'ENCRYPTION_ACTIVE_KEY_ID')
  const rawPepper = mandatory(configScope, 'ENCRYPTION_HASH_PEPPER')
  const envelopePrefix = configScope.getOptional(
    'ENCRYPTION_ENVELOPE_PREFIX',
    DEFAULT_ENVELOPE_PREFIX,
  )

  const keys = parseKeys(rawKeys)

  if (!keys.has(activeKeyId)) {
    throw new InvalidEncryptionConfigError(
      `ENCRYPTION_ACTIVE_KEY_ID "${activeKeyId}" is not present in ENCRYPTION_KEYS`,
    )
  }

  const hashPepper = decodeBase64(rawPepper, 'ENCRYPTION_HASH_PEPPER')
  if (hashPepper.length < MIN_PEPPER_BYTES) {
    throw new InvalidEncryptionConfigError(
      `ENCRYPTION_HASH_PEPPER must decode to at least ${MIN_PEPPER_BYTES} bytes, got ${hashPepper.length}`,
    )
  }

  return { keys, activeKeyId, hashPepper, envelopePrefix }
}

function mandatory(configScope: ConfigScope, name: string): string {
  try {
    return configScope.getMandatory(name)
  } catch {
    throw new InvalidEncryptionConfigError(`Missing mandatory configuration parameter: ${name}`)
  }
}

function parseKeys(raw: string): ReadonlyMap<string, Buffer> {
  const entries = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  if (entries.length === 0) {
    throw new InvalidEncryptionConfigError('ENCRYPTION_KEYS must contain at least one entry')
  }

  const map = new Map<string, Buffer>()
  for (const entry of entries) {
    const separator = entry.indexOf(':')
    if (separator <= 0 || separator === entry.length - 1) {
      throw new InvalidEncryptionConfigError(
        `Malformed ENCRYPTION_KEYS entry "${entry}". Expected "keyId:base64Key".`,
      )
    }
    const keyId = entry.slice(0, separator).trim()
    const base64 = entry.slice(separator + 1).trim()

    if (!KEY_ID_PATTERN.test(keyId)) {
      throw new InvalidEncryptionConfigError(
        `Encryption key id "${keyId}" must contain only alphanumerics, underscore, and hyphen`,
      )
    }
    if (map.has(keyId)) {
      throw new InvalidEncryptionConfigError(
        `Duplicate encryption key id "${keyId}" in ENCRYPTION_KEYS`,
      )
    }

    const decoded = decodeBase64(base64, `ENCRYPTION_KEYS[${keyId}]`)
    if (decoded.length !== REQUIRED_KEY_BYTES) {
      throw new InvalidEncryptionConfigError(
        `Encryption key "${keyId}" must decode to exactly ${REQUIRED_KEY_BYTES} bytes, got ${decoded.length}`,
      )
    }
    map.set(keyId, decoded)
  }

  return map
}

function decodeBase64(value: string, varName: string): Buffer {
  const buffer = Buffer.from(value, 'base64')
  if (buffer.toString('base64').replace(/=+$/, '') !== value.replace(/=+$/, '')) {
    throw new InvalidEncryptionConfigError(`${varName} is not valid base64`)
  }
  return buffer
}
