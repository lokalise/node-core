export function copyWithoutUndefined<
  T extends Record<string | number | symbol, unknown>,
  TargetRecordType = Pick<
    T,
    {
      [Prop in keyof T]: T[Prop] extends null | undefined ? never : Prop
    }[keyof T]
  >,
>(originalValue: T): TargetRecordType {
  return Object.keys(originalValue).reduce(
    (acc, key) => {
      // @ts-ignore
      if (originalValue[key] !== undefined) {
        // @ts-ignore
        acc[key] = originalValue[key]
      }
      return acc
    },
    {} as Record<string, unknown>,
  ) as TargetRecordType
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
