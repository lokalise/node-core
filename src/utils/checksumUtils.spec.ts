import { Readable } from 'node:stream'

import {
  generateChecksumForBufferOrString,
  generateChecksumForObject,
  generateChecksumForReadable,
} from './checksumUtils'

const testObject = {
  someField: 123,
  someOtherField: 'ferfref',
  nestedField: {
    level2: {
      level3: {
        level4: {
          value: 'some string',
        },
      },
    },
  },
}

describe('checksumUtils', () => {
  describe('generateChecksumForBufferOrString', () => {
    it('generates checksum', () => {
      const checksum = generateChecksumForBufferOrString(Buffer.from('some test string value'))

      expect(checksum).toBe('bfd5bbd64f6b83abe1d7d3b06221eb3a')
    })
  })

  describe('generateChecksumForObject', () => {
    it('generates checksum', () => {
      const checksum = generateChecksumForObject(testObject)

      expect(checksum).toBe('9d15391c6fea84d122e0b22f7b9eb90f')
    })
  })

  describe('generateChecksumForReadable', () => {
    it('generates checksum', async () => {
      const readable = Readable.from(JSON.stringify(testObject))
      const checksum = await generateChecksumForReadable(readable)

      expect(checksum).toBe('9d15391c6fea84d122e0b22f7b9eb90f')
    })
  })
})
