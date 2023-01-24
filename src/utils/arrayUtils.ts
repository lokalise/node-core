function slice<T>(array: T[], start: number, end: number): T[] {
  let length = array.length

  end = end > length ? length : end
  length = (end - start) >>> 0
  start >>>= 0

  let index = -1
  const result = new Array(length)
  while (++index < length) {
    result[index] = array[index + start]
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
}

export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const length = array.length
  if (!length || chunkSize < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = new Array(Math.ceil(length / chunkSize))

  while (index < length) {
    result[resIndex++] = slice(array, index, (index += chunkSize))
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
}
