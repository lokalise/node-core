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

`export function groupBy<T extends object, K extends KeysMatching<T, RecordKeyType | null | undefined>>(array: T[], selector: K): Record<RecordKeyType, T[]> {`

The `groupBy` function takes an array of objects and a `selector`, groups the objects based on selected key and returns an object with unique keys from the selector and corresponding groups as arrays.

`export function groupByUnique<T extends object, K extends KeysMatching<T, RecordKeyType | null | undefined>>(array: T[], selector: K): Record<RecordKeyType, T>`

Similar to `groupBy`, but the value is a single element, in case of duplicated values for the same selector the method will throw a `InternalError`

`convertDateFieldsToIsoString<Input extends object>(object: Input | Input[],): ExactlyLikeWithDateAsString<Input> | ExactlyLikeWithDateAsString<Input>[]`

Transform an input object with `Date` members into an object with the corresponding `Date` members replaced by their ISO string representation. This transformation is done recursively, covering nested objects as well.