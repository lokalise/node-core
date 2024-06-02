import { F_OK } from 'node:constants'
import { createWriteStream, createReadStream, access } from 'node:fs'
import { unlink } from 'node:fs/promises'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream'

export type ReadableProvider = {
  createStream(): Readable
  destroy(): Promise<void>
}

export type PersistToFsOptions = {
  targetFile: string
  sourceReadable: Readable
}

export type FsReadableProviderOptions = {
  storageFile: string
}

export class FsReadableProvider implements ReadableProvider {
  public readonly storageFile: string
  constructor(options: FsReadableProviderOptions) {
    this.storageFile = options.storageFile
  }

  fileExists(): Promise<boolean> {
    return new Promise((resolve) => {
      access(this.storageFile, F_OK, (err) => {
        return resolve(!err)
      })
    })
  }

  async createStream(): Promise<Readable> {
    if (!(await this.fileExists())) {
      throw new Error(`File ${this.storageFile} was already deleted.`)
    }

    return createReadStream(this.storageFile)
  }

  destroy(): Promise<void> {
    return unlink(this.storageFile)
  }

  protected async persist(sourceReadable: Readable): Promise<void> {
    const writable = createWriteStream(this.storageFile)
    return new Promise((resolve, reject) => {
      pipeline(sourceReadable, writable, (err) => {
        if (err) {
          /* c8 ignore next 1 */
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public static async persistReadableToFs(
    options: PersistToFsOptions,
  ): Promise<FsReadableProvider> {
    const provider = new FsReadableProvider({
      storageFile: options.targetFile,
    })
    await provider.persist(options.sourceReadable)
    return provider
  }
}
