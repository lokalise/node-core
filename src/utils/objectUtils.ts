import dotProp from 'dot-prop'

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

export function copyWithoutEmpty<
  T extends Record<RecordKeyType, unknown>,
  TargetRecordType = Pick<
    T,
    {
      [Prop in keyof T]: T[Prop] extends null | undefined | '' ? never : Prop
    }[keyof T]
  >,
>(originalValue: T): TargetRecordType {
  return Object.keys(originalValue).reduce(
    (acc, key) => {
      if (
        originalValue[key] !== undefined &&
        originalValue[key] !== null &&
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (typeof originalValue[key] !== 'string' || originalValue[key].trim().length > 0)
      ) {
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
 * @param selector The key used for grouping the objects. Support nested keys.
 * @returns An object where the keys are unique values from the given selector and the values are the corresponding objects from the array.
 */
export function groupByPath<T extends object>(array: T[], selector: string): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = dotProp.get(item, selector)
      if (key === undefined || key === null) {
        return acc
      }
      const strKeyPath = key as string

      if (!acc[strKeyPath]) {
        acc[strKeyPath] = []
      }
      acc[strKeyPath].push(item)
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

  return Object.entries(object).reduce(
    (result, [key, value]) => {
      // @ts-ignore
      result[key] = convertDateFieldsToIsoStringAux(value)
      return result
    },
    {} as ExactlyLikeWithDateAsString<Input>,
  )
}

function convertDateFieldsToIsoStringAux<T>(item: T): DatesAsString<T> {
  if (item instanceof Date) {
    // @ts-ignore
    return item.toISOString()
  }

  if (item && typeof item === 'object') {
    // @ts-ignore
    return convertDateFieldsToIsoString(item)
  }

  // @ts-ignore
  return item
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

function transformKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1-$2') // transforms basic camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // transforms abbreviations
    .replace(/_/g, '-') // transforms snake_case
    .toLowerCase() // finally lowercase all
}

type TransformToKebabCaseInputType = Record<string, unknown> | null | undefined
type TransformToKebabCaseReturnType<Input, Output> = Input extends Record<string, unknown>
  ? Output
  : Input
/**
 * Transforms an object's keys from camelCase or snake_case to kebab-case.
 * @param object
 */
export function transformToKebabCase<
  Output extends Record<string, unknown>,
  Input extends TransformToKebabCaseInputType,
>(object: Input): TransformToKebabCaseReturnType<Input, Output>

export function transformToKebabCase<
  Output extends Record<string, unknown>,
  Input extends TransformToKebabCaseInputType,
>(object: Input[]): TransformToKebabCaseReturnType<Input, Output>[]

export function transformToKebabCase<Output, Input>(
  object: Input | Input[],
): TransformToKebabCaseReturnType<Input, Output> | TransformToKebabCaseReturnType<Input, Output>[] {
  if (Array.isArray(object)) {
    // @ts-ignore
    return object.map(transformToKebabCase)
  }
  if (typeof object !== 'object' || object === null || object === undefined) {
    return object as TransformToKebabCaseReturnType<Input, Output>
  }

  return Object.entries(object as Record<string, unknown>).reduce(
    (result, [key, value]) => {
      const transformedKey = transformKey(key)
      const transformedValue =
        value && typeof value === 'object'
          ? transformToKebabCase(value as TransformToKebabCaseInputType)
          : value

      // Avoiding destructuring by directly assigning the new key-value pair
      result[transformedKey] = transformedValue
      return result
    },
    {} as Record<string, unknown>,
  ) as TransformToKebabCaseReturnType<Input, Output>
}
