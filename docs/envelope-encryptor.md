# EnvelopeEncryptor

`EnvelopeEncryptor` is a symmetric envelope-encryption utility for at-rest encryption of database fields, designed for hot request paths.

- **Cipher:** AES-256-GCM with a fresh random 96-bit IV per encryption.
- **Envelope:** `<envelopePrefix><keyId>:<base64url(iv || authTag || ciphertext)>` — defaults to `enc:v1:`. The prefix doubles as an "is this row already encrypted?" marker.
- **Multi-key:** keys are held by id in a `Map`; encryption uses `activeKeyId`, decryption picks the key referenced by the envelope. Supports zero-downtime key rotation.
- **Searchable lookups:** `hash()` returns `HMAC-SHA256(pepper, plaintext)` for populating `*_hash` columns. Independent of the encryption keys, so key rotation does not invalidate hashes.
- **AAD:** `encrypt`/`decrypt` accept optional Authenticated Additional Data to bind a ciphertext to its context (row id, tenant id, etc.).
- **Decrypt:** `decrypt()` of a non-envelope value throws `InvalidCiphertextError` rather than passing the value through, unless a configured `legacyDecryptors` entry can decrypt it.
- **Defensive construction:** key material is cloned at construction time, so callers may freely mutate (or zero-wipe) their own copies.

Unlike the deprecated `EncryptionUtility`, keys are pre-derived and held in memory rather than re-derived per call via PBKDF2, making this class suitable for hot paths.

## Configuration

```ts
import { randomBytes } from 'node:crypto'
import { EnvelopeEncryptor } from '@lokalise/node-core'

const enc = new EnvelopeEncryptor({
  keys: new Map([
    ['k1', randomBytes(32)], // any 32-byte AES-256 key
  ]),
  activeKeyId: 'k1',
  hashPepper: randomBytes(32), // ≥ 32 bytes
  // envelopePrefix: 'enc:v1:',     // optional; default shown
  // legacyDecryptors: [legacy],    // optional; see "Migrating from EncryptionUtility"
})
```

Keys, the active key id, and the pepper are validated at construction. Invalid input throws `InvalidEncryptionConfigError`.

### From environment variables

```ts
import { ConfigScope, EnvelopeEncryptor, parseEnvelopeEncryptorConfig } from '@lokalise/node-core'

const config = parseEnvelopeEncryptorConfig(new ConfigScope())
const enc = new EnvelopeEncryptor(config)
```

Required env vars:

- `ENCRYPTION_KEYS` — comma-separated `keyId:base64Key` entries; each base64 value must decode to exactly 32 bytes.
- `ENCRYPTION_ACTIVE_KEY_ID` — id of the key to use for new encryptions; must appear in `ENCRYPTION_KEYS`.
- `ENCRYPTION_HASH_PEPPER` — base64-encoded pepper, ≥ 32 bytes.

Optional:

- `ENCRYPTION_ENVELOPE_PREFIX` — defaults to `enc:v1:`. **Do not change after data has been written**, or existing rows become unreadable.

## Encrypting and decrypting

```ts
const envelope = enc.encrypt('super-secret-token')
// 'enc:v1:k1:<base64url payload>'

enc.decrypt(envelope)
// 'super-secret-token'
```

`isEncrypted(value)` is a cheap prefix check that never throws — useful for migration code that needs to branch on whether a row has already been encrypted.

```ts
enc.isEncrypted('enc:v1:k1:abc') // true
enc.isEncrypted('plain-token')   // false
```

## Authenticated Additional Data (AAD)

AAD is **not** stored in the envelope. The same value must be supplied at decrypt time or the GCM auth tag check will fail. Use it to bind a ciphertext to its context so an attacker with database write access cannot copy ciphertexts between rows:

```ts
const envelope = enc.encrypt(token, `user:${userId}`)
enc.decrypt(envelope, `user:${userId}`)        // → token
enc.decrypt(envelope, `user:${otherUserId}`)   // throws InvalidCiphertextError
enc.decrypt(envelope)                          // throws InvalidCiphertextError
```

A `Buffer` AAD is also accepted. An empty-string AAD is GCM-equivalent to no AAD.

## JSON helpers

`encryptJson` / `decryptJson` wrap `JSON.stringify` / `JSON.parse` around the round-trip. They forward `aad`.

```ts
const envelope = enc.encryptJson({ token: 'abc', scopes: ['read'] }, 'tenant:7')
enc.decryptJson<{ token: string; scopes: string[] }>(envelope, 'tenant:7')
```

`decryptJson` short-circuits on:

- `null` → returns `null`
- already-parsed objects (some ORMs hand back parsed JSON columns) → returned unchanged

`encryptJson` throws `NonSerializableValueError` when `JSON.stringify` would return `undefined` (top-level `undefined`, function, or symbol) — instead of leaking an opaque Node `TypeError` from the cipher.

## Searchable lookup hashes

Use `hash()` to populate an indexed column for exact-match lookups on encrypted fields:

```ts
await db.users.insert({
  email_encrypted: enc.encrypt(email),
  email_hash: enc.hash(email),
})

await db.users.findOne({ email_hash: enc.hash(searchInput) })
```

`hash()` is `HMAC-SHA256(pepper, plaintext)` rendered as 64 lower-case hex chars. It is deterministic and independent of the active encryption key, so encryption-key rotation does not invalidate previously stored hashes.

> ### ⚠️ Do not use `hash()` for passwords
>
> `hash()` is a **fast** keyed hash. Storing user passwords with it would violate the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), which requires a slow, memory-hard algorithm (Argon2id, scrypt, bcrypt, or PBKDF2 with high iteration counts). On a GPU, HMAC-SHA256 can be evaluated billions of times per second — once the pepper leaks, any low-entropy input is recoverable. Use a dedicated password-hashing library instead.

### Threat model

The security of `hash()` rests entirely on the pepper. Anyone with the pepper can offline-enumerate any low-entropy field (emails, phone numbers, national IDs, etc.) and rebuild the plaintext-to-hash mapping. Anyone *without* the pepper cannot brute-force the hash even if they exfiltrate the database, since HMAC's keyed construction has no precomputed rainbow tables.

Treat the pepper accordingly:

- Store it in an HSM, KMS, or secrets manager — never alongside the encrypted data and never in plain environment variables on shared infrastructure.
- Rotate it on suspected compromise. Note that pepper rotation invalidates every previously stored hash; the current envelope format does not tag hashes with a pepper id, so rotation requires a one-off re-hash job over all affected rows.
- Keep it independent from `keys`. The class enforces this at the type level by accepting two separate parameters; rotating an encryption key does not (and should not) invalidate hashes.

### Determinism

The hash is deterministic by design — that is what makes the column indexable. As a consequence, two rows with the same plaintext produce the same hash, which leaks equality between rows. This is acceptable for the lookup-column use case but worth being explicit about: do not use `hash()` to store anything where equality leakage between records would itself be a problem.

## Key rotation

Multi-key support lets you rotate without downtime and without re-encrypting all data first.

1. Generate a new 32-byte key, give it a fresh id (e.g. `k2`).
2. Deploy with both keys configured and the new id as `activeKeyId`:
   ```ts
   new EnvelopeEncryptor({
     keys: new Map([['k1', oldKey], ['k2', newKey]]),
     activeKeyId: 'k2',
     hashPepper,
   })
   ```
3. New writes use `k2`. Reads still decrypt `k1`-tagged envelopes because both keys are present.
4. Run a background re-encryption job: read each row, `decrypt()` it, `encrypt()` it (which uses `k2`), write it back.
5. Once the job is complete, drop `k1` from the configuration.

### When to rotate

- On suspected compromise.
- After your organisational cryptoperiod (see NIST SP 800-57 Pt 1 §5.3).
- Before encrypting more than **~2³² messages with the same active key**. AES-GCM with random 96-bit IVs has a birthday-bound collision risk on IVs at that scale (NIST SP 800-38D §8.3); an IV collision catastrophically breaks GCM's confidentiality and integrity guarantees.

## Migrating from `EncryptionUtility`

`EncryptionUtility` is deprecated. Two-phase migration:

**Phase 1 — read-compat.** Configure `EnvelopeEncryptor` with the legacy utility as a fallback, switch all reads and writes to the new encryptor:

```ts
import { EncryptionUtility, EnvelopeEncryptor } from '@lokalise/node-core'

const legacy = new EncryptionUtility(process.env.LEGACY_SECRET!)
const enc = new EnvelopeEncryptor({
  keys, activeKeyId, hashPepper,
  legacyDecryptors: [legacy],
})

enc.decrypt(envelopeFromNewWrite) // decrypts as envelope
enc.decrypt(legacyCiphertext)     // falls through to legacy.decrypt(...)
```

`legacyDecryptors` is duck-typed as `{ decrypt(value: string): string }` — any object satisfying that interface works.

When `decrypt()` is called on a non-envelope value, each legacy decryptor is tried in order; the first one whose `decrypt` does not throw wins. AES-GCM's auth-tag check (used by `EncryptionUtility` too) makes false positives effectively impossible. If no legacy decryptor can handle the value, `InvalidCiphertextError` is thrown — there is no silent passthrough.

**Phase 2 — re-encrypt and drop legacy.** Run a one-off job that reads each row through the legacy-aware encryptor and writes it back. Once complete, remove `legacyDecryptors` from the configuration; from then on, every read of an unencrypted-looking value will throw, surfacing any leftover plaintext.

## Errors

All errors extend `InternalError` and carry an `errorCode`:

| Class                             | `errorCode`                     | Thrown when                                                                                               |
|-----------------------------------|---------------------------------|-----------------------------------------------------------------------------------------------------------|
| `InvalidEncryptionConfigError`    | `INVALID_ENCRYPTION_CONFIG`     | Constructor receives invalid keys, pepper, key id, or prefix.                                             |
| `EncryptionKeyNotConfiguredError` | `ENCRYPTION_KEY_NOT_CONFIGURED` | Decrypting an envelope whose key id is not in the configured keys. Has a `keyId` property.                |
| `InvalidCiphertextError`          | `INVALID_CIPHERTEXT`            | Malformed envelope, AES-GCM auth-tag mismatch, or non-envelope value that no legacy decryptor can handle. |
| `NonSerializableValueError`       | `NON_SERIALIZABLE_VALUE`        | `encryptJson` called with a value `JSON.stringify` cannot serialize.                                      |
