import { createHash } from 'node:crypto'

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
