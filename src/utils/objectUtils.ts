export function copyWithoutUndefined<SourceKeys extends string | number | symbol, SourceValues>(
  originalValue: Record<SourceKeys, SourceValues>,
): Record<SourceKeys, Exclude<SourceValues, undefined>> {
  const result = Object.keys(originalValue).reduce((acc, key) => {
    // @ts-ignore
    if (originalValue[key] !== undefined) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[key] = originalValue[key]
    }
    return acc
  }, {} as Record<string, unknown>) as Record<SourceKeys, Exclude<SourceValues, undefined>>

  return result
}

export function pick<T, K extends string | number | symbol>(
  source: T,
  propNames: readonly K[],
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>> {
  const result = {} as T
  let idx = 0
  while (idx < propNames.length) {
    // @ts-ignore
    if (propNames[idx] in source) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[propNames[idx]] = source[propNames[idx]]
    }
    idx += 1
  }
  return result
}

export function pickWithoutUndefined<T, K extends string | number | symbol>(
  source: T,
  propNames: readonly K[],
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>> {
  const result = {} as T
  let idx = 0
  while (idx < propNames.length) {
    // @ts-ignore
    if (propNames[idx] in source && source[propNames[idx]] !== undefined) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[propNames[idx]] = source[propNames[idx]]
    }
    idx += 1
  }
  return result
}

export function isEmptyObject(params: Record<string, unknown>): boolean {
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined) {
      return false
    }
  }
  return true
}

export function groupBy<T>(inputArray: T[], propName: string): Record<string, T[]> {
  return inputArray.reduce((result, entry) => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const key = entry[propName]

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (Object.hasOwnProperty.call(result, key)) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      result[key].push(entry)
    } else {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result[key] = [entry]
    }
    return result
  }, {})
}
