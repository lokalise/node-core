import { InternalError } from '../errors/InternalError'

type RecordKeyType = string | number | symbol

export function copyWithoutUndefined<
  T extends Record<RecordKeyType, unknown>,
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
    if (Object.hasOwn(params, key) && params[key] !== undefined) {
      return false
    }
  }
  return true
}

type KeysMatching<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]

/**
 * @param array The array of objects to be grouped.
 * @param selector The key used for grouping the objects.
 * @returns An object where the keys are unique values from the given selector and the values are the corresponding objects from the array.
 */
export function groupBy<
  T extends object,
  K extends KeysMatching<T, RecordKeyType | null | undefined>,
>(array: T[], selector: K): Record<RecordKeyType, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = item[selector] as RecordKeyType | null | undefined
      if (key === undefined || key === null) {
        return acc
      }
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<RecordKeyType, T[]>,
  )
}

/**
 * @param array The array of objects to be grouped.
 * @param selector The key used for grouping the objects.
 * @returns An object where the keys are unique values from the given selector and the value is the
 *  corresponding object from the array.
 * @throws InternalError If a duplicated value is found for the given selector.
 */
export function groupByUnique<
  T extends object,
  K extends KeysMatching<T, RecordKeyType | null | undefined>,
>(array: T[], selector: K): Record<RecordKeyType, T> {
  return array.reduce(
    (acc, item) => {
      const key = item[selector] as RecordKeyType | null | undefined
      if (key === undefined || key === null) {
        return acc
      }
      if (acc[key] !== undefined) {
        throw new InternalError({
          message: `Duplicated item for selector ${selector.toString()} with value ${key.toString()}`,
          errorCode: 'DUPLICATED_ITEM',
          details: { selector, value: key },
        })
      }
      acc[key] = item
      return acc
    },
    {} as Record<RecordKeyType, T>,
  )
}

type DatesAsString<T> = T extends Date ? string : ExactlyLikeWithDateAsString<T>

type ExactlyLikeWithDateAsString<T> = T extends object ? { [K in keyof T]: DatesAsString<T[K]> } : T

export function convertDateFieldsToIsoString<Input extends object>(
  object: Input,
): ExactlyLikeWithDateAsString<Input>
export function convertDateFieldsToIsoString<Input extends object>(
  object: Input[],
): ExactlyLikeWithDateAsString<Input>[]
export function convertDateFieldsToIsoString<Input extends object>(
  object: Input | Input[],
): ExactlyLikeWithDateAsString<Input> | ExactlyLikeWithDateAsString<Input>[] {
  if (Array.isArray(object)) {
    // @ts-ignore
    return object.map(convertDateFieldsToIsoStringAux)
  }

  return Object.entries(object).reduce((result, [key, value]) => {
    // @ts-ignore
    result[key] = convertDateFieldsToIsoStringAux(value)
    return result
  }, {} as ExactlyLikeWithDateAsString<Input>)
}

function convertDateFieldsToIsoStringAux<T>(item: T): DatesAsString<T> {
  if (item instanceof Date) {
    // @ts-ignore
    return item.toISOString()
  } else if (item && typeof item === 'object') {
    // @ts-ignore
    return convertDateFieldsToIsoString(item)
  } else {
    // @ts-ignore
    return item
  }
}

/**
 * Return a deep clone copy of an object.
 *
 * Please Note: This uses structuredClone, which has the limitations of these restricted Types: functions,
 * Error objects, WeakMap, WeakSet, DOM nodes, and certain other browser-specific objects like Window.
 */
export function deepClone<T extends object | undefined | null>(object: T): T {
  if (object === undefined || object === null) {
    return object
  }
  return structuredClone(object)
}

type TransformObjectKeys<T> = {
  [K in keyof T as K extends string ? TransformKey<K> : never]: T[K] extends object
    ? TransformObjectKeys<T[K]>
    : T[K]
}

type TransformKey<T extends string> = T extends `${infer F}${infer R}`
  ? F extends Capitalize<F>
    ? `-${Lowercase<F>}${TransformKey<R>}`
    : `${F}${TransformKey<R>}`
  : Lowercase<T>

/**
 * Transforms an object's keys from camelCase to kebab-case.
 * @param object
 * TODO: handle arrays
 * TODO: handle null and undefined
 * TODO: handle snake_case
 * TODO: handle abbreviations myHTTPKey -> my-http-key
 */
export function transformToKebabCase<T extends object>(object?: T | null): TransformObjectKeys<T> {
  const transformed: Record<string, unknown> = {}
  for (const key in object) {
    const value = object[key]
    const transformedKey = key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

    transformed[transformedKey] =
      typeof value === 'object' ? transformToKebabCase(value as object) : value
  }

  return transformed as TransformObjectKeys<T>
}
