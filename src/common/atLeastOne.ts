/**
 * @deprecated Use `AtLeastOne` from `@lokalise/universal-ts-utils/node` instead.
 */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
