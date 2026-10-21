import { createHash, createHmac } from 'node:crypto'

/**
 * @deprecated Use `HashEncoding` from `@lokalise/crypto` instead.
 */
export enum HashEncoding {
  HEX = 'hex',
  BASE64 = 'base64',
}

/**
 * @deprecated Use `HashAlgorithm` from `@lokalise/crypto` instead.
 */
export enum HashAlgorithm {
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

/**
 * @deprecated Use `calculateHash` from `@lokalise/crypto` instead. It takes the same arguments and returns the same hash.
 */
export function generateHash(
  algorithm: HashAlgorithm,
  data: string,
  encoding: HashEncoding = HashEncoding.HEX,
) {
  return createHash(algorithm).update(data).digest(encoding)
}

/**
 * @deprecated Use `calculateHmac` from `@lokalise/crypto` instead. It takes the same arguments and returns the same HMAC.
 */
export function generateHmac(
  algorithm: HashAlgorithm,
  data: string,
  pepper: Buffer,
  encoding: HashEncoding = HashEncoding.HEX,
): string {
  return createHmac(algorithm, pepper).update(data, 'utf8').digest(encoding)
}
