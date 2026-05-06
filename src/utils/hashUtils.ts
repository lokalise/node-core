import { createHash, createHmac } from 'node:crypto'

export enum HashEncoding {
  HEX = 'hex',
  BASE64 = 'base64',
}

export enum HashAlgorithm {
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

export function generateHash(
  algorithm: HashAlgorithm,
  data: string,
  encoding: HashEncoding = HashEncoding.HEX,
) {
  return createHash(algorithm).update(data).digest(encoding)
}

export function generateEncryptedHash(
  algorithm: HashAlgorithm,
  data: string,
  pepper: Buffer,
  encoding: HashEncoding = HashEncoding.HEX,
): string {
  return createHmac(algorithm, pepper).update(data, 'utf8').digest(encoding)
}
