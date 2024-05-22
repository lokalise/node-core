import { createHash } from 'node:crypto'

export enum HashDigest {
  HEX = 'hex',
  BASE64 = 'base64',
}

export enum HashAlgorithm {
  SHA256 = 'sha256',
  SHA512 = 'sha512',
}

export function generateHash(data: string, algorythm: HashAlgorithm, digest: HashDigest) {
  return createHash(algorythm).update(data).digest(digest)
}
