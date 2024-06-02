import { F_OK } from 'node:constants'
import { createWriteStream, createReadStream, access } from 'node:fs'
import { stat, unlink } from 'node:fs/promises'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream'

export type ReadableProvider = {
  /**
   * Guarantees to provide a new stream every time this is called, before `destroy` is invoked.
   */
  createStream(): Promise<Readable>

  /**
   * Returns size of the persisted content
   */
  getContentLength(): Promise<number>

  /**
   * Remove the persisted value. No new streams can be created after this is called
   */
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

  async getContentLength(): Promise<number> {
    if (!(await this.fileExists())) {
      throw new Error(`File ${this.storageFile} was already deleted.`)
    }
    const stats = await stat(this.storageFile)
    return stats.size
  }

  async createStream(): Promise<Readable> {
    if (!(await this.fileExists())) {
      throw new Error(`File ${this.storageFile} was already deleted.`)
    }

    return createReadStream(this.storageFile)
  }

  async destroy(): Promise<void> {
    if (!(await this.fileExists())) {
      // nothing to do here
      return
    }

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

export function getReadableContentLength(readable: Readable): Promise<number> {
  return new Promise((resolve, reject) => {
    let size = 0
    readable.on('data', (chunk) => {
      if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
        size += Buffer.byteLength(chunk)
      }
    })
    readable.on('end', () => {
      resolve(size)
    })
    readable.on('error', (error) => {
      /* c8 ignore next 1 */
      reject(error)
    })
  })
}
