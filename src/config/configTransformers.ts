import type { EnvValueTransformer } from './configTypes'

/**
 * @deprecated Use `envase` instead.
 */
export const ensureClosingSlashTransformer: EnvValueTransformer<
  string | undefined | null,
  string
> = (value) => {
  if (!value) {
    return ''
  }

  const lastChar = value.at(-1)
  if (lastChar !== '/') {
    return `${value}/`
  }
  return value
}
