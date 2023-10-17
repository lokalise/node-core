# arrayUtils

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



`removeNullish<const T>(array: readonly (T | null | undefined)[]): T[]`

Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined).
```typescript
const array = ['', false, null, 'valid', 1, undefined, 0]
console.log(removeNullish(array)) // result: ['valid', 1]
```