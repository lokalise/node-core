# objectUtils

`copyWithoutUndefined<T extends Record<K, V>, K extends string | number | symbol, V>(
  originalValue: T,
): T`

Returns an object which contains same field as the `originalValue`, excluding the fields with the value of `undefined`.

`pick<T, K extends string | number | symbol>(
source: T,
propNames: readonly K[],
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>>`

Returns an object which contains fields specified in `propNames` with the same values as fields in `originalValue`.

`pickWithoutUndefined<T, K extends string | number | symbol>(
source: T,
propNames: readonly K[],
): Pick<T, Exclude<keyof T, Exclude<keyof T, K>>>`

Returns an object which contains fields specified in `propNames` with the same values as fields in `originalValue`, excluding the fields with the value of `undefined`.

`isEmptyObject(params: Record<string, any>): boolean`

Returns true if `params` has no own properties or only own properties with value `undefined`, false otherwise.

`groupBy<T>(inputArray: T[], propName: string): Record<string, T[]>`

Returns an object composed of keys generated from the values of `propName` field for the `inputArray` elements. The order of grouped values is determined by the order they occur in collection.
