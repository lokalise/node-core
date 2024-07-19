import type { BinaryLike } from 'node:crypto'
import { createHash } from 'node:crypto'
import type { Readable } from 'node:stream'

const HASH_ALGORITHM = 'md5'

export function generateChecksumForBufferOrString(data: BinaryLike): string {
  return createHash(HASH_ALGORITHM).update(data).digest('hex')
}

export function generateChecksumForObject(object: object): string {
  const objectAsString = JSON.stringify(object)
  return generateChecksumForBufferOrString(objectAsString)
}

export function generateChecksumForReadable(readable: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hashCreator = createHash(HASH_ALGORITHM)
    readable.on('data', (data) => {
      if (Buffer.isBuffer(data)) {
        hashCreator.update(data)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        hashCreator.update(Buffer.from(data))
      }
    })

    readable.on('end', () => {
      const hash = hashCreator.digest('hex')
      resolve(hash)
    })
    readable.on('error', (err) => {
      /* c8 ignore next 1 */
      reject(err)
    })
  })
}
