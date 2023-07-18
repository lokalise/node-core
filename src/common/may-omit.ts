// makes K keys optional in T
// can be used to provide some defaults and merge input on top of it
export type MayOmit<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
