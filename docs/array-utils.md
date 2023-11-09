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



`removeFalsy<const T>(array: readonly (T | null | undefined)[]): T[]`

Return a copy of the given array without falsy values (eg: false, 0, '', null, undefined).
```typescript
const array = ['', false, null, 'valid', 1, undefined, 0]
console.log(removeFalsy(array)) // result: ['valid', 1]
```



`keyArrayBy<T extends { [K in keyof T]: RecordKeyType }, K extends keyof T>(array: T[], selector: K, arrayValue: boolean = true): Record<T[K], T | T[]>`

Creates a Record composed of keys from `selector`. 
The corresponding value of each key is:
- If `arrayValue` is `true` an array of all elements with the same `selector`.
- else the last element found for each key.