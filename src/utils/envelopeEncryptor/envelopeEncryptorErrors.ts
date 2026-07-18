import { InternalError } from '../../errors/InternalError'

export class InvalidEncryptionConfigError extends InternalError {
  constructor(message: string) {
    super({
      message,
      errorCode: 'INVALID_ENCRYPTION_CONFIG',
    })
  }
}

export class EncryptionKeyNotConfiguredError extends InternalError<{ keyId: string }> {
  public readonly keyId: string

  constructor(keyId: string) {
    super({
      message: `Encryption key "${keyId}" is not configured. Cannot decrypt value.`,
      errorCode: 'ENCRYPTION_KEY_NOT_CONFIGURED',
      details: { keyId },
    })
    this.keyId = keyId
  }
}

export class InvalidCiphertextError extends InternalError {
  constructor(message: string) {
    super({
      message,
      errorCode: 'INVALID_CIPHERTEXT',
    })
  }
}

export class NonSerializableValueError extends InternalError {
  constructor() {
    super({
      message:
        'Value is not JSON-serializable (top-level undefined, function, or symbol). ' +
        'JSON.stringify returned undefined, which cannot be encrypted.',
      errorCode: 'NON_SERIALIZABLE_VALUE',
    })
  }
}
