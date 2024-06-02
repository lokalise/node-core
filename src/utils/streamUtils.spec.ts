import { Readable } from 'node:stream'

import tmp from 'tmp'
import { afterEach, expect } from 'vitest'

import { generateChecksumForReadable } from './checksumUtils'
import { FsReadableProvider, getReadableContentLength } from './streamUtils'

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
  describe('FsReadableProvider', () => {
    let provider: FsReadableProvider
    beforeEach(async () => {
      const sourceReadable = Readable.from(JSON.stringify(testObject))
      const targetFile = tmp.tmpNameSync()

      provider = await FsReadableProvider.persistReadableToFs({
        sourceReadable,
        targetFile: targetFile,
      })
    })

    afterEach(async () => {
      await provider.destroy()
    })

    describe('persistReadableToFs', () => {
      it('can create extra readables after persisting', async () => {
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
        expect.assertions(4)
        expect(await provider.fileExists()).toBe(true)
        await provider.destroy()
        expect(await provider.fileExists()).toBe(false)

        try {
          await provider.createStream()
        } catch (err) {
          expect((err as Error).message).toMatch(/was already deleted/)
        }

        try {
          await provider.getContentLength()
        } catch (err) {
          expect((err as Error).message).toMatch(/was already deleted/)
        }
      })
    })

    describe('getContentLength', () => {
      it('returns length of the persisted data', async () => {
        const fileContentLength = await provider.getContentLength()
        const newReadable = await provider.createStream()
        const readableLength = await getReadableContentLength(newReadable)

        expect(fileContentLength).toBe(115)
        expect(readableLength).toBe(115)
      })
    })
  })
})
