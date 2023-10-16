export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const length = array.length
  if (!length || chunkSize < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = new Array(Math.ceil(length / chunkSize))

  while (index < length) {
    result[resIndex++] = array.slice(index, (index += chunkSize))
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
}

export async function callChunked<Item>(
  chunkSize: number,
  array: readonly Item[],
  processFn: (arrayChunk: Item[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < array.length; i += chunkSize) {
    const arrayChunk = array.slice(i, i + chunkSize)
    await processFn(arrayChunk)
  }
}

export function removeNullish<T>(array: readonly (T | null | undefined)[]): T[] {
  return array.filter((e) => e !== undefined && e !== null) as T[]
}

export function removeFalsy<T>(array: readonly (T | null | undefined)[]): T[] {
  return array.filter((e) => e) as T[]
}
