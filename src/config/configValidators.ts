import type { EnvValueValidator } from './configTypes'

export const createRangeValidator = (
  greaterOrEqualThan: number,
  lessOrEqualThan: number,
): EnvValueValidator<number> => {
  return (value) => {
    return value >= greaterOrEqualThan && value <= lessOrEqualThan
  }
}
