/**
 * Makes K keys optional in T.
 * Can be used to provide some defaults and merge input on top of it.
 *
 * @deprecated Use `MayOmit` from `@lokalise/universal-ts-utils/node` instead.
 */
export type MayOmit<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
