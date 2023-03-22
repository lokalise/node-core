# arrayUtils

`chunk<T>(array: T[], chunkSize: number): T[][]`

Splits `array` into an array of arrays, each sub-array being no larger than the provided `chunkSize`,
preserving original order of the elements.

`async callChunked<T>(chunkSize: number, array: T[], processFn: (arrayChunk: T[]) => void): Promise<void>`

Splits `array` by passed `chunkSize` and run callback asynchronously for every chunk in a sequential order.
