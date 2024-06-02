import { Readable } from 'node:stream'

import tmp from 'tmp'
import { expect } from 'vitest'

import { generateChecksumForReadable } from './checksumUtils'
import { FsReadableProvider } from './streamUtils'

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

describe('streamUtils', () => {
  describe('persistReadableToFs', () => {
    it('can create extra readables after persisting', async () => {
      const sourceReadable = Readable.from(JSON.stringify(testObject))
      const targetFile = tmp.tmpNameSync()

      const provider = await FsReadableProvider.persistReadableToFs({
        sourceReadable,
        targetFile: targetFile,
      })

      const newReadable = await provider.createStream()
      const newReadableChecksum = await generateChecksumForReadable(newReadable)
      expect(newReadableChecksum).toBe('9d15391c6fea84d122e0b22f7b9eb90f')

      const newReadable2 = await provider.createStream()
      const newReadableChecksum2 = await generateChecksumForReadable(newReadable2)
      expect(newReadableChecksum2).toBe('9d15391c6fea84d122e0b22f7b9eb90f')
    })
  })

  describe('destroy', () => {
    it('deletes the file', async () => {
      expect.assertions(3)
      const sourceReadable = Readable.from(JSON.stringify(testObject))
      const targetFile = tmp.tmpNameSync()

      const provider = await FsReadableProvider.persistReadableToFs({
        sourceReadable,
        targetFile: targetFile,
      })

      expect(await provider.fileExists()).toBe(true)
      await provider.destroy()
      expect(await provider.fileExists()).toBe(false)

      try {
        await provider.createStream()
      } catch (err) {
        expect((err as Error).message).toMatch(/was already deleted/)
      }
    })
  })
})
