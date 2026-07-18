import { randomBytes } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { ConfigScope } from '../../config/ConfigScope'
import { InvalidEncryptionConfigError } from './envelopeEncryptorErrors'
import { parseEnvelopeEncryptorConfig } from './parseEnvelopeEncryptorConfig'

const KEY_BASE64 = randomBytes(32).toString('base64')
const KEY_2_BASE64 = randomBytes(32).toString('base64')
const PEPPER_BASE64 = randomBytes(32).toString('base64')

const setEnv = (vars: Record<string, string | undefined>) => {
  const previous: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(vars)) {
    previous[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

describe('parseEnvelopeEncryptorConfig', () => {
  let restore: () => void = () => {}

  afterEach(() => {
    restore()
  })

  it('parses a single key', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `2026Q2:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: '2026Q2',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
      ENCRYPTION_ENVELOPE_PREFIX: undefined,
    })

    const config = parseEnvelopeEncryptorConfig(new ConfigScope())

    expect(config.activeKeyId).toBe('2026Q2')
    expect(config.keys.size).toBe(1)
    expect(config.keys.get('2026Q2')?.length).toBe(32)
    expect(config.hashPepper.length).toBe(32)
    expect(config.envelopePrefix).toBe('enc:v1:')
  })

  it('parses multiple keys (rotation scenario)', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `2026Q2:${KEY_BASE64}, 2025Q4:${KEY_2_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: '2026Q2',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    const config = parseEnvelopeEncryptorConfig(new ConfigScope())

    expect([...config.keys.keys()]).toEqual(['2026Q2', '2025Q4'])
  })

  it('throws when ENCRYPTION_KEYS is missing', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: undefined,
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(
      InvalidEncryptionConfigError,
    )
  })

  it('throws when ENCRYPTION_ACTIVE_KEY_ID is not in ENCRYPTION_KEYS', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `2026Q2:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'missing',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(
      InvalidEncryptionConfigError,
    )
  })

  it('throws when a key is not 32 bytes', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `tooShort:${randomBytes(16).toString('base64')}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'tooShort',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/32 bytes/)
  })

  it('throws on duplicate key ids', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `dup:${KEY_BASE64},dup:${KEY_2_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'dup',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/Duplicate/)
  })

  it('throws on entries with no colon', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: 'no-colon-here',
      ENCRYPTION_ACTIVE_KEY_ID: 'no-colon-here',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(
      InvalidEncryptionConfigError,
    )
  })

  it('throws on entries with empty base64', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: 'kA:',
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(
      InvalidEncryptionConfigError,
    )
  })

  it('throws on entries with invalid key id chars', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `bad id:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'bad id',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/alphanumerics/)
  })

  it('throws when ENCRYPTION_KEYS decodes to invalid base64', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: 'kA:not_valid_base64$$$',
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/not valid base64/)
  })

  it('throws when ENCRYPTION_KEYS contains only whitespace', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: '  , ',
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/at least one entry/)
  })

  it('throws on a too-short pepper', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `kA:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: randomBytes(16).toString('base64'),
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/at least 32 bytes/)
  })

  it('throws on an invalid base64 pepper', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `kA:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: 'not_valid_base64$$$',
    })

    expect(() => parseEnvelopeEncryptorConfig(new ConfigScope())).toThrow(/not valid base64/)
  })

  it('honours an override of the envelope prefix', () => {
    restore = setEnv({
      ENCRYPTION_KEYS: `kA:${KEY_BASE64}`,
      ENCRYPTION_ACTIVE_KEY_ID: 'kA',
      ENCRYPTION_HASH_PEPPER: PEPPER_BASE64,
      ENCRYPTION_ENVELOPE_PREFIX: 'cte:enc:v1:',
    })

    const config = parseEnvelopeEncryptorConfig(new ConfigScope())

    expect(config.envelopePrefix).toBe('cte:enc:v1:')
  })
})
