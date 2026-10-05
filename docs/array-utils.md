# arrayUtils

> [!WARNING]
> These utilities are deprecated in favour of [`@lokalise/universal-ts-utils`](https://www.npmjs.com/package/@lokalise/universal-ts-utils) and will be removed in a future major version. Each function has an export with the same name there, except `removeDuplicates`, which is replaced by `unique`.
>
> Differences to watch for:
>
> - `callChunked`: `processFn` must return `void` or `Promise<void>`.
> - `unique`: takes a mutable array, so spread a readonly one (`unique([...array])`).

`chunk<T>(array: T[], chunkSize: number): T[][]`

Splits `array` into an array of arrays, each sub-array being no larger than the provided `chunkSize`,
preserving original order of the elements.

```typescript
async function callChunked<Item>(
  chunkSize: number,
  array: readonly Item[],
  processFn: (arrayChunk: Item[]) => Promise<unknown>,
): Promise<void>
```

Splits `array` by passed `chunkSize` and run callback asynchronously for every chunk in a sequential order.

`removeNullish<const T>(array: readonly (T | null | undefined)[]): T[]`

Returns a copy of the given array without null or undefined values.

```typescript
const array = ['', false, null, 'valid', 1, undefined, 0]
console.log(removeNullish(array)) // result: ['', false, 'valid', 1, 0]
```

`removeFalsy<const T>(array: readonly (T | null | undefined)[]): T[]`

Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined).

```typescript
const array = ['', false, null, 'valid', 1, undefined, 0]
console.log(removeFalsy(array)) // result: ['valid', 1]
```

`removeDuplicates<const T>(array: readonly T[]): T[]`

Return a copy of the given array without duplicates.
Objects are deduplicated by reference (not deep equality)

```typescript
const array = [0, 0, 1, 'a', 'a', 'b']
console.log(removeDuplicates(array)) // result: [0, 1, 'a', 'b']
```

