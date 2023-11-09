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

/**
 * Return a copy of the given array without null or undefined values
 */
export function removeNullish<const T>(array: readonly (T | null | undefined)[]): T[] {
  return array.filter((e) => e !== undefined && e !== null) as T[]
}

/**
 * Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined)
 */
export function removeFalsy<const T>(
  array: readonly (T | null | undefined | 0 | '' | false)[],
): T[] {
  return array.filter((e) => e) as T[]
}

export type RecordKeyType = string | number | symbol
export function keyArrayBy<T extends { [K in keyof T]: RecordKeyType }, K extends keyof T>(
  array: T[],
  selector: K,
  arrayValue?: true,
): Record<T[K], T[]>
export function keyArrayBy<T extends { [K in keyof T]: RecordKeyType }, K extends keyof T>(
  array: T[],
  selector: K,
  arrayValue: false,
): Record<T[K], T>
export function keyArrayBy<T extends { [K in keyof T]: RecordKeyType }, K extends keyof T>(
  array: T[],
  selector: K,
  arrayValue = true,
) {
  if (arrayValue) {
    return array.reduce(
      (acc, item) => {
        if (!acc[item[selector]]) {
          acc[item[selector]] = []
        }
        acc[item[selector]].push(item)
        return acc
      },
      {} as Record<T[K], T[]>,
    )
  } else {
    return array.reduce(
      (acc, item) => {
        acc[item[selector]] = item
        return acc
      },
      {} as Record<T[K], T>,
    )
  }
}
