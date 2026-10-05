/**
 * @deprecated Use `chunk` from `@lokalise/universal-ts-utils/node` instead.
 */
export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const length = array.length
  if (!length || chunkSize < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = new Array(Math.ceil(length / chunkSize))

  while (index < length) {
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    result[resIndex++] = array.slice(index, (index += chunkSize))
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
}

/**
 * @deprecated Use `callChunked` from `@lokalise/universal-ts-utils/node` instead. Its `processFn` must return `void` or `Promise<void>`.
 */
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
 *
 * @deprecated Use `removeNullish` from `@lokalise/universal-ts-utils/node` instead.
 */
export function removeNullish<const T>(array: readonly (T | null | undefined)[]): T[] {
  return array.filter((e) => e !== undefined && e !== null) as T[]
}

/**
 * Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined)
 *
 * @deprecated Use `removeFalsy` from `@lokalise/universal-ts-utils/node` instead.
 */
export function removeFalsy<const T>(
  array: readonly (T | null | undefined | 0 | '' | false)[],
): T[] {
  return array.filter((e) => e) as T[]
}

/**
 * Return a copy of the given array without duplicates.
 *
 * @deprecated Use `unique` from `@lokalise/universal-ts-utils/node` instead. It takes a mutable array, so spread a readonly one (`unique([...array])`).
 */
export function removeDuplicates<const T>(array: readonly T[]): T[] {
  return [...new Set(array)]
}
